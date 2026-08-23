import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { audioService } from '../services/audioService.js'
import { getAudioUrl } from '../services/audioStorage.js'

const AudioContext = createContext(null)
const PROGRESS_KEY = 'con-duong-xua:audio-progress'
const FAVORITES_KEY = 'con-duong-xua:audio-favorites'
const SPEEDS = [0.75, 1, 1.25, 1.5, 2]

const readJson = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)) } catch { return fallback } }

export function AudioProvider({ children }) {
  const elementRef = useRef(null)
  const lastPersistedSecond = useRef(-1)
  const [currentId, setCurrentId] = useState(null)
  const [queue, setQueue] = useState([])
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rate, setRate] = useState(1)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState(() => new Set(readJson(FAVORITES_KEY, [])))
  const currentItem = audioService.getById(currentId)

  const play = useCallback((id, nextQueue) => {
    if (!audioService.getById(id)) { setError('Hiện chưa thể phát nội dung này. Vui lòng thử lại sau.'); return }
    if (Array.isArray(nextQueue)) setQueue(nextQueue.map((item) => typeof item === 'string' ? item : item.id))
    setError(''); setCurrentId(id); setPlaying(true)
  }, [])
  const pause = useCallback(() => setPlaying(false), [])
  const toggle = useCallback(() => currentId && setPlaying((value) => !value), [currentId])
  const seekTo = useCallback((value) => { const el = elementRef.current; if (!el) return; el.currentTime = Math.max(0, Math.min(value, el.duration || value)); setCurrentTime(el.currentTime) }, [])
  const seek = useCallback((delta) => seekTo(currentTime + delta), [currentTime, seekTo])
  const moveQueue = useCallback((direction) => {
    if (!currentId || !queue.length) return
    const index = queue.indexOf(currentId)
    const nextId = queue[index + direction]
    if (nextId) play(nextId)
  }, [currentId, queue, play])
  const next = useCallback(() => moveQueue(1), [moveQueue])
  const previous = useCallback(() => moveQueue(-1), [moveQueue])
  const setPlaybackRate = useCallback((value) => setRate(SPEEDS.includes(value) ? value : 1), [])
  const toggleFavorite = useCallback((id) => setFavorites((previousSet) => { const nextSet = new Set(previousSet); nextSet.has(id) ? nextSet.delete(id) : nextSet.add(id); localStorage.setItem(FAVORITES_KEY, JSON.stringify([...nextSet])); return nextSet }), [])

  useEffect(() => {
    const el = elementRef.current
    if (!el || !currentItem) return
    const url = getAudioUrl(currentItem.audioPath)
    if (!url) { setError('Chưa cấu hình máy chủ âm thanh.'); setPlaying(false); return }
    if (el.dataset.id !== currentItem.id) {
      el.dataset.id = currentItem.id; el.src = url; el.load(); setCurrentTime(0); setDuration(currentItem.duration || 0)
    }
    el.playbackRate = rate
    if (playing) el.play().catch(() => { setPlaying(false); setError('Hiện chưa thể phát nội dung này. Vui lòng thử lại sau.') })
    else el.pause()
  }, [currentItem, playing, rate])

  useEffect(() => {
    if (!currentItem || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return
    navigator.mediaSession.metadata = new MediaMetadata({ title: currentItem.title, artist: currentItem.teacher || 'Con Đường Xưa', artwork: currentItem.image ? [{ src: currentItem.image }] : [] })
    const handlers = { play: () => setPlaying(true), pause: () => setPlaying(false), seekbackward: () => seek(-15), seekforward: () => seek(15), previoustrack: previous, nexttrack: next }
    Object.entries(handlers).forEach(([action, handler]) => { try { navigator.mediaSession.setActionHandler(action, handler) } catch { /* unsupported action */ } })
  }, [currentItem, seek, previous, next])

  const persistProgress = useCallback((time, total) => {
    if (!currentItem || !total) return
    const all = readJson(PROGRESS_KEY, {})
    all[currentItem.id] = { audioId: currentItem.id, currentTime: time, duration: total, updatedAt: new Date().toISOString(), completed: time / total >= .93 }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all))
  }, [currentItem])
  const getProgress = useCallback((id) => readJson(PROGRESS_KEY, {})[id] || null, [])
  const continueItems = useMemo(() => audioService.getAll().map((item) => ({ item, progress: getProgress(item.id) })).filter(({ progress }) => progress && progress.currentTime > 0 && !progress.completed).sort((a, b) => b.progress.updatedAt.localeCompare(a.progress.updatedAt)), [currentTime, getProgress])

  const value = useMemo(() => ({ currentItem, currentId, queue, playing, currentTime, duration, rate, error, favorites, play, pause, toggle, seek, seekTo, next, previous, setPlaybackRate, toggleFavorite, getProgress, continueItems, speeds: SPEEDS }), [currentItem, currentId, queue, playing, currentTime, duration, rate, error, favorites, play, pause, toggle, seek, seekTo, next, previous, setPlaybackRate, toggleFavorite, getProgress, continueItems])

  return <AudioContext.Provider value={value}>{children}<audio ref={elementRef} preload='metadata' onLoadedMetadata={(event) => { const el = event.currentTarget; setDuration(el.duration || currentItem?.duration || 0); const saved = currentItem && getProgress(currentItem.id); if (saved && !saved.completed) { el.currentTime = saved.currentTime; setCurrentTime(saved.currentTime) } }} onTimeUpdate={(event) => { const el = event.currentTarget; const second = Math.floor(el.currentTime); setCurrentTime(el.currentTime); if (second % 5 === 0 && second !== lastPersistedSecond.current) { lastPersistedSecond.current = second; persistProgress(el.currentTime, el.duration) } }} onPause={(event) => persistProgress(event.currentTarget.currentTime, event.currentTarget.duration)} onEnded={() => { persistProgress(duration, duration); setPlaying(false); next() }} onError={() => { setPlaying(false); setError('Hiện chưa thể phát nội dung này. Vui lòng thử lại sau.') }} /></AudioContext.Provider>
}

export const useAudio = () => {
  const value = useContext(AudioContext)
  if (!value) throw new Error('useAudio must be used inside AudioProvider')
  return value
}
