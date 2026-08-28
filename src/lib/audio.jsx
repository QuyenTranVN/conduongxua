import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { audioService } from '../services/audioService.js'
import { getAudioUrl, hasPlayableAudio } from '../services/audioStorage.js'
import { useApp } from './store.jsx'
import { uiText } from './format.js'
import { audioProgressService } from '../services/audioProgressService.js'

const AudioContext = createContext(null)
const FAVORITES_KEY = 'con-duong-xua:audio-favorites'
const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

const readJson = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback))
    return value && typeof value === typeof fallback ? value : fallback
  } catch { return fallback }
}

export function AudioProvider({ children }) {
  const { lang } = useApp()
  const errors = uiText(lang).errors
  const elementRef = useRef(null)
  const lastPersistedSecond = useRef(-1)
  const loadTimer = useRef(null)
  const [currentId, setCurrentId] = useState(null)
  const [queue, setQueue] = useState([])
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState(() => {
    const saved = readJson(FAVORITES_KEY, [])
    return new Set(Array.isArray(saved) ? saved.filter((id) => typeof id === 'string') : [])
  })
  const currentItem = audioService.getById(currentId)

  const play = useCallback((id, nextQueue) => {
    const item = audioService.getById(id)
    if (!item || !hasPlayableAudio(item)) {
      setPlaying(false)
      setError(errors.audioUnavailable)
      return false
    }
    if (Array.isArray(nextQueue)) {
      setQueue(nextQueue.map((entry) => typeof entry === 'string' ? audioService.getById(entry) : entry).filter(hasPlayableAudio).map((entry) => entry.id))
    }
    setError('')
    setCurrentId(id)
    setPlaying(true)
    return true
  }, [errors.audioUnavailable])
  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => {
    if (!currentId) return
    setError('')
    setPlaying((value) => !value)
  }, [currentId])
  const seekTo = useCallback((value) => {
    const el = elementRef.current
    if (!el || !Number.isFinite(Number(value))) return
    try {
      const total = Number.isFinite(el.duration) ? el.duration : duration
      const nextTime = Math.max(0, Math.min(Number(value), total || Number(value)))
      el.currentTime = nextTime
      setCurrentTime(nextTime)
    } catch { setError(errors.audioSeek) }
  }, [duration, errors.audioSeek])
  const seek = useCallback((delta) => seekTo(currentTime + delta), [currentTime, seekTo])
  const moveQueue = useCallback((direction) => {
    if (!currentId || !queue.length) return
    const nextId = queue[queue.indexOf(currentId) + direction]
    if (nextId) play(nextId, queue)
  }, [currentId, queue, play])
  const next = useCallback(() => moveQueue(1), [moveQueue])
  const previous = useCallback(() => moveQueue(-1), [moveQueue])
  const setPlaybackRate = useCallback((value) => setRate(SPEEDS.includes(value) ? value : 1), [])
  const toggleFavorite = useCallback((id) => setFavorites((previousSet) => {
    const nextSet = new Set(previousSet)
    nextSet.has(id) ? nextSet.delete(id) : nextSet.add(id)
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify([...nextSet])) } catch { /* optional preference */ }
    return nextSet
  }), [])

  useEffect(() => {
    const el = elementRef.current
    if (!el || !currentItem) return
    const url = getAudioUrl(currentItem)
    if (!url) { setError(errors.audioUnavailable); setPlaying(false); return }
    if (el.dataset.id !== currentItem.id) {
      el.dataset.id = currentItem.id
      el.src = url
      el.load()
      setCurrentTime(0)
      setDuration(currentItem.duration || 0)
      lastPersistedSecond.current = -1
    }
    el.playbackRate = rate
    if (playing) {
      window.clearTimeout(loadTimer.current)
      loadTimer.current = window.setTimeout(() => {
        if (el.readyState < 2) { el.pause(); setPlaying(false); setError(errors.audioTimeout) }
      }, 15000)
      el.play().catch(() => { window.clearTimeout(loadTimer.current); setPlaying(false); setError(errors.audioPlay) })
    } else el.pause()
    return () => window.clearTimeout(loadTimer.current)
  }, [currentItem, playing, rate, errors])

  useEffect(() => {
    if (!currentItem || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return
    navigator.mediaSession.metadata = new MediaMetadata({ title: currentItem.title, artist: currentItem.teacher || 'Con Đường Xưa', artwork: currentItem.image ? [{ src: currentItem.image }] : [] })
    const handlers = { play: () => setPlaying(true), pause: () => setPlaying(false), seekbackward: () => seek(-15), seekforward: () => seek(15), previoustrack: previous, nexttrack: next }
    Object.entries(handlers).forEach(([action, handler]) => { try { navigator.mediaSession.setActionHandler(action, handler) } catch { /* unsupported action */ } })
  }, [currentItem, seek, previous, next])

  const persistProgress = useCallback((time, total) => {
    if (currentItem) audioProgressService.save(currentItem.id, time, total)
  }, [currentItem])
  useEffect(() => {
    const preserveProgress = () => {
      const el = elementRef.current
      if (el && currentItem) persistProgress(el.currentTime, el.duration)
    }
    document.addEventListener('visibilitychange', preserveProgress)
    window.addEventListener('pagehide', preserveProgress)
    return () => {
      document.removeEventListener('visibilitychange', preserveProgress)
      window.removeEventListener('pagehide', preserveProgress)
    }
  }, [currentItem, persistProgress])
  const getProgress = useCallback((id) => audioProgressService.get(id), [])
  const continueItems = useMemo(() => audioProgressService.getUnfinished(audioService.getPlayable()), [currentTime])

  const value = useMemo(() => ({ currentItem, currentId, queue, playing, currentTime, duration, rate, error, favorites, play, pause, toggle, seek, seekTo, next, previous, setPlaybackRate, toggleFavorite, getProgress, continueItems, speeds: SPEEDS }), [currentItem, currentId, queue, playing, currentTime, duration, rate, error, favorites, play, pause, toggle, seek, seekTo, next, previous, setPlaybackRate, toggleFavorite, getProgress, continueItems])

  return <AudioContext.Provider value={value}>{children}<audio ref={elementRef} preload='metadata'
    onCanPlay={() => window.clearTimeout(loadTimer.current)}
    onLoadedMetadata={(event) => {
      const el = event.currentTarget
      window.clearTimeout(loadTimer.current)
      const total = Number.isFinite(el.duration) ? el.duration : (currentItem?.duration || 0)
      setDuration(total)
      const saved = currentItem && getProgress(currentItem.id)
      if (saved && !saved.completed) {
        const restored = Math.max(0, Math.min(saved.currentTime, total || saved.duration))
        try { el.currentTime = restored; setCurrentTime(restored) } catch { setCurrentTime(0) }
      }
    }}
    onTimeUpdate={(event) => {
      const el = event.currentTarget
      const second = Math.floor(el.currentTime)
      setCurrentTime(el.currentTime)
      if (second % 5 === 0 && second !== lastPersistedSecond.current) { lastPersistedSecond.current = second; persistProgress(el.currentTime, el.duration) }
    }}
    onPause={(event) => persistProgress(event.currentTarget.currentTime, event.currentTarget.duration)}
    onEnded={(event) => { persistProgress(event.currentTarget.duration, event.currentTarget.duration); setPlaying(false); next() }}
    onError={() => { window.clearTimeout(loadTimer.current); setPlaying(false); setError(errors.audioLoad) }} />
  </AudioContext.Provider>
}

export const useAudio = () => {
  const value = useContext(AudioContext)
  if (!value) throw new Error('useAudio must be used inside AudioProvider')
  return value
}
