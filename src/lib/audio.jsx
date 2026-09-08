import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { audioService } from '../services/audioService.js'
import { getAudioUrl, hasPlayableAudio } from '../services/audioStorage.js'
import { useApp } from './store.jsx'
import { uiText } from './format.js'
import { audioProgressService } from '../services/audioProgressService.js'
import { playbackOwnership } from '../services/playbackOwnership.js'
import { usePlaybackRegistration } from './playbackOwnership.jsx'

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
  const runtime = useRef({ id: null, playing: false, request: 0 })
  const lastPersistedSecond = useRef(-1)
  const loadTimer = useRef(null)
  const restartIdRef = useRef(null)
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

  const saveElement = useCallback(() => {
    const el = elementRef.current
    // Use the loaded element's ID, never the next track's React state.
    if (el?.dataset.id && el.readyState >= 1) audioProgressService.save(el.dataset.id, el.currentTime, el.duration)
  }, [])
  const interrupt = useCallback(() => {
    runtime.current.playing = false
    runtime.current.request += 1
    window.clearTimeout(loadTimer.current)
    saveElement()
    elementRef.current?.pause()
    setPlaying(false)
  }, [saveElement])
  usePlaybackRegistration('listening', interrupt)
  const pause = useCallback(() => {
    interrupt()
    playbackOwnership.release('listening')
  }, [interrupt])

  const play = useCallback((id, nextQueue, restart = false) => {
    const item = audioService.getById(id)
    const el = elementRef.current
    if (!item || !hasPlayableAudio(item) || !el) {
      setError(errors.audioUnavailable)
      return false
    }
    const lease = playbackOwnership.acquire('listening')
    const changed = el.dataset.id !== id
    if (changed || restart) interrupt()
    if (Array.isArray(nextQueue)) {
      setQueue(nextQueue.map((entry) => typeof entry === 'string' ? audioService.getById(entry) : entry).filter(hasPlayableAudio).map((entry) => entry.id))
    }
    runtime.current.id = id
    runtime.current.playing = true
    const request = ++runtime.current.request
    restartIdRef.current = restart ? id : null
    setError('')
    setCurrentId(id)
    setPlaying(true)
    if (changed) {
      el.dataset.id = id
      el.src = getAudioUrl(item)
      el.load()
      setCurrentTime(0)
      setDuration(item.duration || 0)
      lastPersistedSecond.current = -1
    } else if (restart || el.ended) {
      try { el.currentTime = 0; setCurrentTime(0); restartIdRef.current = null } catch { /* reset once metadata loads */ }
    }
    el.playbackRate = rate
    const stillCurrent = () => playbackOwnership.isCurrent(lease) && runtime.current.request === request && runtime.current.playing
    window.clearTimeout(loadTimer.current)
    loadTimer.current = window.setTimeout(() => {
      if (stillCurrent() && el.readyState < 2) { pause(); setError(errors.audioTimeout) }
    }, 15000)
    el.play().catch(() => {
      // Aborted requests from a previous track/mode must not pause the new owner.
      if (stillCurrent()) { pause(); setError(errors.audioPlay) }
    })
    return true
  }, [errors, interrupt, pause, rate])
  const playFromStart = useCallback((id, nextQueue) => play(id, nextQueue, true), [play])
  const toggle = useCallback(() => {
    if (!runtime.current.id) return
    if (runtime.current.playing && playbackOwnership.owns('listening')) pause()
    else play(runtime.current.id)
  }, [play, pause])
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
  const seek = useCallback((delta) => seekTo((elementRef.current?.currentTime || 0) + delta), [seekTo])
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
  useEffect(() => { if (elementRef.current) elementRef.current.playbackRate = rate }, [rate])

  useEffect(() => {
    if (currentItem && playbackOwnership.owns('listening') && 'mediaSession' in navigator && typeof MediaMetadata !== 'undefined') {
      navigator.mediaSession.metadata = new MediaMetadata({ title: currentItem.title, artist: currentItem.teacher || 'Con Đường Xưa', artwork: currentItem.image ? [{ src: currentItem.image }] : [] })
    }
    const handlers = { play: () => play(runtime.current.id), pause, seekbackward: () => seek(-15), seekforward: () => seek(15), previoustrack: previous, nexttrack: next }
    return playbackOwnership.setMediaActions('listening', handlers)
  }, [currentItem, play, pause, seek, previous, next])

  useEffect(() => {
    document.addEventListener('visibilitychange', saveElement)
    window.addEventListener('pagehide', saveElement)
    return () => {
      document.removeEventListener('visibilitychange', saveElement)
      window.removeEventListener('pagehide', saveElement)
    }
  }, [saveElement])
  const getProgress = useCallback((id) => audioProgressService.get(id), [])
  const continueItems = useMemo(() => audioProgressService.getUnfinished(audioService.getPlayable()), [currentTime, playing, currentId])
  const value = useMemo(() => ({ currentItem, currentId, queue, playing, currentTime, duration, rate, error, favorites, play, playFromStart, pause, toggle, seek, seekTo, next, previous, setPlaybackRate, toggleFavorite, getProgress, continueItems, speeds: SPEEDS }), [currentItem, currentId, queue, playing, currentTime, duration, rate, error, favorites, play, playFromStart, pause, toggle, seek, seekTo, next, previous, setPlaybackRate, toggleFavorite, getProgress, continueItems])

  return <AudioContext.Provider value={value}>{children}<audio ref={elementRef} preload='metadata'
    onPlay={() => { if (!playbackOwnership.owns('listening') || !runtime.current.playing) elementRef.current?.pause() }}
    onCanPlay={() => window.clearTimeout(loadTimer.current)}
    onLoadedMetadata={(event) => {
      const el = event.currentTarget
      if (el.readyState < 1) return
      const total = Number.isFinite(el.duration) ? el.duration : (currentItem?.duration || 0)
      setDuration(total)
      const shouldRestart = restartIdRef.current === el.dataset.id
      restartIdRef.current = null
      const saved = !shouldRestart && getProgress(el.dataset.id)
      const restored = saved && !saved.completed ? Math.max(0, Math.min(saved.currentTime, total || saved.duration)) : 0
      try { el.currentTime = restored; setCurrentTime(restored) } catch { setCurrentTime(0) }
    }}
    onTimeUpdate={(event) => {
      const el = event.currentTarget
      const second = Math.floor(el.currentTime)
      setCurrentTime(el.currentTime)
      if (runtime.current.playing && second % 5 === 0 && second !== lastPersistedSecond.current) { lastPersistedSecond.current = second; saveElement() }
    }}
    onPause={(event) => { if (event.currentTarget.paused && !event.currentTarget.ended && runtime.current.playing) pause() }}
    onEnded={(event) => {
      if (!playbackOwnership.owns('listening') || !runtime.current.playing || !event.currentTarget.ended) return
      saveElement()
      pause()
      next()
    }}
    onError={() => { if (runtime.current.playing && elementRef.current?.error) { pause(); setError(errors.audioLoad) } }} />
  </AudioContext.Provider>
}

export const useAudio = () => {
  const value = useContext(AudioContext)
  if (!value) throw new Error('useAudio must be used inside AudioProvider')
  return value
}
