import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { meditationService } from '../services/meditationService.js'
import { playBell, playBellSequence, stopBellSequence } from './bell.js'
import { useAudio } from './audio.jsx'

const MeditationAudioContext = createContext(null)

export function MeditationAudioProvider({ children }) {
  const listeningAudio = useAudio()
  const audioRef = useRef(null)
  const endBellTimer = useRef(null)
  const suppressPauseSave = useRef(false)
  const startedAt = useRef(null)
  const lastSaved = useRef(-1)
  const [sessionId, setSessionId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const session = meditationService.getSession(sessionId)

  const save = useCallback((completed = false, time = currentTime, total = duration) => {
    if (!sessionId || !total) return
    const progress = { sessionId, meditationSessionId: sessionId, startedAt: startedAt.current || new Date().toISOString(), progressSeconds: completed ? total : time, durationSeconds: total, durationCompleted: completed ? total : time, completed }
    completed ? meditationService.completeSession(progress) : meditationService.saveProgress(progress)
  }, [sessionId, currentTime, duration])

  const startSession = useCallback((nextSession, { restart = false } = {}) => {
    if (!nextSession) return
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
      if (restart && nextSession.id === sessionId && audioRef.current && nextSession.audioUrl) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(() => { setPlaying(false); setError('Hiện chưa thể phát bài hướng dẫn này.') })
      }
    }
    setPlaying(true)
  }, [sessionId, listeningAudio])
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
  }, [sessionId])
  const toggle = useCallback(() => {
    if (!sessionId) return
    const total = duration || session?.durationSeconds || 0
    if (!playing && total > 0 && currentTime >= total) {
      if (endBellTimer.current) {
        window.clearTimeout(endBellTimer.current)
        endBellTimer.current = null
      }
      if (audioRef.current && session?.audioUrl) audioRef.current.currentTime = 0
      startedAt.current = new Date().toISOString()
      lastSaved.current = -1
      setCurrentTime(0)
      setPlaying(true)
      if (!session?.audioUrl) playBellSequence(3, .55)
      return
    }
    if (!playing && session && !session.audioUrl) playBell(.42)
    setPlaying((value) => !value)
  }, [sessionId, session, playing, currentTime, duration])
  const seekTo = useCallback((seconds) => {
    const el = audioRef.current
    if (!el) return
    const next = Math.max(0, Math.min(seconds, duration || seconds))
    el.currentTime = next
    setCurrentTime(next)
  }, [duration])
  const seek = useCallback((delta) => seekTo(currentTime + delta), [currentTime, seekTo])

  useEffect(() => {
    const el = audioRef.current
    if (!el || !session?.audioUrl) return
    if (el.dataset.id !== session.id) {
      el.dataset.id = session.id
      el.src = session.audioUrl
      el.load()
    }
    if (playing) el.play().catch(() => { setPlaying(false); setError('Hiện chưa thể phát bài hướng dẫn này.') })
    else el.pause()
  }, [session, playing])

  useEffect(() => {
    if (!playing || !session || session.audioUrl) return
    const timer = window.setInterval(() => {
      setCurrentTime((value) => {
        const next = Math.min(value + 1, duration || session.durationSeconds)
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
    }, 1000)
    return () => window.clearInterval(timer)
  }, [playing, session, duration, save])

  useEffect(() => () => {
    if (endBellTimer.current) window.clearTimeout(endBellTimer.current)
  }, [])

  const value = useMemo(() => ({ session, sessionId, playing, currentTime, duration, error, startSession, stopSession, toggle, seek, seekTo }), [session, sessionId, playing, currentTime, duration, error, startSession, stopSession, toggle, seek, seekTo])
  return <MeditationAudioContext.Provider value={value}>{children}<audio ref={audioRef} preload='metadata' onLoadedMetadata={(event) => { const el = event.currentTarget; setDuration(el.duration || session?.durationSeconds || 0); if (currentTime > 0) el.currentTime = currentTime }} onTimeUpdate={(event) => { const el = event.currentTarget; const second = Math.floor(el.currentTime); setCurrentTime(el.currentTime); if (second > 0 && second % 5 === 0 && second !== lastSaved.current) { lastSaved.current = second; save(false, el.currentTime, el.duration) } }} onPause={(event) => { if (suppressPauseSave.current) { suppressPauseSave.current = false; return } save(false, event.currentTarget.currentTime, event.currentTarget.duration) }} onEnded={(event) => { setCurrentTime(event.currentTarget.duration); setPlaying(false); save(true, event.currentTarget.duration, event.currentTarget.duration); endBellTimer.current = window.setTimeout(() => { playBellSequence(3, .6); endBellTimer.current = null }, 10000) }} onError={() => { setPlaying(false); setError('Hiện chưa thể phát bài hướng dẫn này.') }} /></MeditationAudioContext.Provider>
}

export const useMeditationAudio = () => {
  const value = useContext(MeditationAudioContext)
  if (!value) throw new Error('useMeditationAudio must be used inside MeditationAudioProvider')
  return value
}
