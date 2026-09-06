import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { meditationService } from '../services/meditationService.js'
import { playBell, playBellSequence, stopBellSequence } from './bell.js'
import { useAudio } from './audio.jsx'
import { getAudioUrl, hasPlayableAudio } from '../services/audioStorage.js'
import { useApp } from './store.jsx'
import { uiText } from './format.js'

const MeditationAudioContext = createContext(null)

export function MeditationAudioProvider({ children }) {
  const { lang } = useApp()
  const errors = uiText(lang).errors
  const listeningAudio = useAudio()
  const audioRef = useRef(null)
  const endBellTimer = useRef(null)
  const suppressPauseSave = useRef(false)
  const startedAt = useRef(null)
  const lastSaved = useRef(-1)
  const lastTickAt = useRef(Date.now())
  const [sessionId, setSessionId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const session = meditationService.getSession(sessionId)
  const usesAudioClock = session?.guidanceType === 'guided' && hasPlayableAudio(session)

  const save = useCallback((completed, time, total) => {
    if (!sessionId || !total) return
    const progress = { sessionId, meditationSessionId: sessionId, startedAt: startedAt.current || new Date().toISOString(), progressSeconds: completed ? total : time, durationSeconds: total, durationCompleted: completed ? total : time, completed }
    completed ? meditationService.completeSession(progress) : meditationService.saveProgress(progress)
  }, [sessionId])

  const startSession = useCallback((nextSession, { restart = false } = {}) => {
    if (!nextSession) return
    if (nextSession.guidanceType === 'guided' && !hasPlayableAudio(nextSession)) {
      setPlaying(false)
      setError(errors.meditationUnavailable)
      return false
    }
    if (endBellTimer.current) {
      window.clearTimeout(endBellTimer.current)
      endBellTimer.current = null
    }
    listeningAudio.pause()
    suppressPauseSave.current = restart && nextSession.id === sessionId
    audioRef.current?.pause()
    setError('')
    if (restart || nextSession.id !== sessionId) {
      const saved = meditationService.getContinuePractice()
      const resumesSavedSession = !restart && (saved?.meditationSessionId === nextSession.id || saved?.sessionId === nextSession.id)
      const resumeAt = resumesSavedSession ? (saved.progressSeconds ?? saved.durationCompleted ?? 0) : 0
      if (restart) meditationService.discardPractice(nextSession.id)
      meditationService.discardOtherIncompletePractices(nextSession.id)
      startedAt.current = resumesSavedSession ? (saved.startedAt || new Date().toISOString()) : new Date().toISOString()
      setSessionId(nextSession.id)
      setCurrentTime(resumeAt)
      setDuration(nextSession.durationSeconds)
      lastSaved.current = -1
      lastTickAt.current = Date.now()
      if (restart && nextSession.id === sessionId && audioRef.current && nextSession.guidanceType === 'guided' && hasPlayableAudio(nextSession)) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => { setPlaying(false); setError(errors.meditationPlay) })
      }
    }
    setPlaying(true)
    return true
  }, [sessionId, listeningAudio, errors])
  const stopSession = useCallback(() => {
    if (!sessionId) return
    if (endBellTimer.current) {
      window.clearTimeout(endBellTimer.current)
      endBellTimer.current = null
    }
    stopBellSequence()
    suppressPauseSave.current = true
    audioRef.current?.pause()
    meditationService.discardPractice(sessionId)
    setPlaying(false)
    setSessionId(null)
    setCurrentTime(0)
    setDuration(0)
    setError('')
    startedAt.current = null
    lastSaved.current = -1
    lastTickAt.current = Date.now()
  }, [sessionId])
  const toggle = useCallback(() => {
    if (!sessionId) return
    const total = duration || session?.durationSeconds || 0
    if (!playing && total > 0 && currentTime >= total) {
      if (endBellTimer.current) {
        window.clearTimeout(endBellTimer.current)
        endBellTimer.current = null
      }
      if (audioRef.current && usesAudioClock) audioRef.current.currentTime = 0
      startedAt.current = new Date().toISOString()
      lastSaved.current = -1
      lastTickAt.current = Date.now()
      setCurrentTime(0)
      setPlaying(true)
      if (!usesAudioClock) playBellSequence(3, .55)
      return
    }
    if (!playing && session && !usesAudioClock) playBell(.42)
    setPlaying((value) => {
      if (!value) lastTickAt.current = Date.now()
      return !value
    })
  }, [sessionId, session, playing, currentTime, duration, usesAudioClock])
  const seekTo = useCallback((seconds) => {
    const el = audioRef.current
    if (!el) return
    if (!Number.isFinite(Number(seconds))) return
    const next = Math.max(0, Math.min(Number(seconds), duration || Number(seconds)))
    try { el.currentTime = next; setCurrentTime(next) } catch { setError(errors.meditationSeek) }
  }, [duration, errors.meditationSeek])
  const seek = useCallback((delta) => seekTo(currentTime + delta), [currentTime, seekTo])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !usesAudioClock) return
    const url = getAudioUrl(session)
    if (!url) { setPlaying(false); setError(errors.meditationUnavailable); return }
    if (el.dataset.id !== session.id) {
      el.dataset.id = session.id
      el.src = url
      el.load()
    }
    if (playing) el.play().catch(() => { setPlaying(false); setError(errors.meditationPlay) })
    else el.pause()
  }, [session, playing, errors, usesAudioClock])

  useEffect(() => {
    if (!playing || !session || usesAudioClock) return
    lastTickAt.current = Date.now()
    const timer = window.setInterval(() => {
      setCurrentTime((value) => {
        const now = Date.now()
        const elapsedSeconds = Math.max(0, (now - lastTickAt.current) / 1000)
        lastTickAt.current = now
        const next = Math.min(value + elapsedSeconds, duration || session.durationSeconds)
        const wholeSecond = Math.floor(next)
        if (wholeSecond > 0 && wholeSecond % 5 === 0 && wholeSecond !== lastSaved.current) {
          lastSaved.current = wholeSecond
          save(false, next, duration || session.durationSeconds)
        }
        if (next >= (duration || session.durationSeconds)) {
          window.clearInterval(timer)
          setPlaying(false)
          save(true, next, duration || session.durationSeconds)
          playBellSequence(3, .6)
        }
        return next
      })
    }, 250)
    return () => window.clearInterval(timer)
  }, [playing, session, duration, save, usesAudioClock])

  useEffect(() => {
    const preserveProgress = () => {
      if (!sessionId) return
      const el = audioRef.current
      const time = usesAudioClock && el ? el.currentTime : currentTime
      const total = usesAudioClock && el ? (el.duration || duration) : duration
      save(false, time, total)
      if (document.visibilityState === 'visible') lastTickAt.current = Date.now()
    }
    document.addEventListener('visibilitychange', preserveProgress)
    window.addEventListener('pagehide', preserveProgress)
    return () => {
      document.removeEventListener('visibilitychange', preserveProgress)
      window.removeEventListener('pagehide', preserveProgress)
    }
  }, [sessionId, currentTime, duration, save, usesAudioClock])

  useEffect(() => () => {
    if (endBellTimer.current) window.clearTimeout(endBellTimer.current)
  }, [])

  const value = useMemo(() => ({ session, sessionId, playing, currentTime, duration, error, startSession, stopSession, toggle, seek, seekTo }), [session, sessionId, playing, currentTime, duration, error, startSession, stopSession, toggle, seek, seekTo])
  return <MeditationAudioContext.Provider value={value}>{children}<audio ref={audioRef} preload='metadata' onLoadedMetadata={(event) => { const el = event.currentTarget; setDuration(el.duration || session?.durationSeconds || 0); if (currentTime > 0) el.currentTime = currentTime }} onTimeUpdate={(event) => { const el = event.currentTarget; const second = Math.floor(el.currentTime); setCurrentTime(el.currentTime); if (second > 0 && second % 5 === 0 && second !== lastSaved.current) { lastSaved.current = second; save(false, el.currentTime, el.duration) } }} onPause={(event) => { if (suppressPauseSave.current) { suppressPauseSave.current = false; return } save(false, event.currentTarget.currentTime, event.currentTarget.duration) }} onEnded={(event) => { setCurrentTime(event.currentTarget.duration); setPlaying(false); save(true, event.currentTarget.duration, event.currentTarget.duration); endBellTimer.current = window.setTimeout(() => { playBellSequence(3, .6); endBellTimer.current = null }, 10000) }} onError={() => { setPlaying(false); setError(errors.meditationPlay) }} /></MeditationAudioContext.Provider>
}

export const useMeditationAudio = () => {
  const value = useContext(MeditationAudioContext)
  if (!value) throw new Error('useMeditationAudio must be used inside MeditationAudioProvider')
  return value
}
