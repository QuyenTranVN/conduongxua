import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { meditationService } from '../services/meditationService.js'
import { playBell, playBellSequence, stopBellSequence } from './bell.js'
import { getAudioUrl, hasPlayableAudio } from '../services/audioStorage.js'
import { useApp } from './store.jsx'
import { uiText } from './format.js'
import { ambientAudio } from '../services/ambientSoundService.js'
import { playbackOwnership } from '../services/playbackOwnership.js'
import { usePlaybackRegistration } from './playbackOwnership.jsx'

const MeditationAudioContext = createContext(null)
const modeFor = (session) => session?.guidanceType === 'guided' ? 'guidedMeditation' : 'silentMeditation'

export function MeditationAudioProvider({ children }) {
  const { lang } = useApp()
  const errors = uiText(lang).errors
  const audioRef = useRef(null)
  const runtime = useRef({ session: null, time: 0, total: 0, playing: false, startedAt: null, tickAt: 0, request: 0, lease: null, ambience: { backgroundSound: 'none', backgroundVolume: .25 } })
  const endBellTimer = useRef(null)
  const lastSaved = useRef(-1)
  const ambienceFadeStarted = useRef(false)
  const [sessionId, setSessionId] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const session = meditationService.getSession(sessionId)

  const save = useCallback((completed = false) => {
    const r = runtime.current
    if (!r.session || !r.total) return
    const progress = { sessionId: r.session.id, meditationSessionId: r.session.id, startedAt: r.startedAt, progressSeconds: r.time, durationSeconds: r.total, durationCompleted: r.time, completed, paused: !r.playing, selectedDurationSeconds: r.session.durationSeconds, ambience: r.ambience }
    completed ? meditationService.completeSession(progress) : meditationService.saveProgress(progress)
  }, [])
  const captureTime = useCallback(() => {
    const r = runtime.current
    const el = audioRef.current
    if (r.session?.guidanceType === 'guided') {
      if (el?.dataset.id === r.session.id && el.readyState >= 1) {
        r.time = el.currentTime
        if (Number.isFinite(el.duration)) r.total = el.duration
      }
    } else if (r.playing) {
      r.time = Math.min(r.total, r.time + Math.max(0, Date.now() - r.tickAt) / 1000)
      r.tickAt = Date.now()
    }
    setCurrentTime(r.time)
  }, [])
  const interrupt = useCallback(() => {
    captureTime()
    const r = runtime.current
    r.playing = false
    r.request += 1
    save(r.time >= r.total && r.total > 0)
    audioRef.current?.pause()
    window.clearTimeout(endBellTimer.current)
    endBellTimer.current = null
    stopBellSequence()
    ambientAudio.pause()
    setPlaying(false)
  }, [captureTime, save])
  usePlaybackRegistration('guidedMeditation', interrupt)
  usePlaybackRegistration('silentMeditation', interrupt)
  const pause = useCallback(() => {
    const r = runtime.current
    if (!r.session) return
    if (playbackOwnership.owns(modeFor(r.session))) playbackOwnership.pause(modeFor(r.session))
    else {
      // Closing an already paused/seeking practice must save too, without
      // interrupting Nghe or any other owner.
      captureTime()
      r.playing = false
      r.request += 1
      audioRef.current?.pause()
      setPlaying(false)
      save(r.time >= r.total && r.total > 0)
    }
  }, [captureTime, save])

  const playMedia = useCallback(() => {
    const r = runtime.current
    const el = audioRef.current
    const lease = r.lease
    const request = ++r.request
    if (!el || !r.session || !playbackOwnership.isCurrent(lease)) return
    if (el.dataset.id !== r.session.id) {
      el.dataset.id = r.session.id
      el.src = getAudioUrl(r.session)
      el.load()
    } else if (el.readyState >= 1) {
      try { el.currentTime = r.time } catch { /* metadata will restore progress */ }
    }
    el.play().catch(() => {
      if (playbackOwnership.isCurrent(lease) && runtime.current.request === request && runtime.current.playing) {
        pause()
        setError(errors.meditationPlay)
      }
    })
  }, [errors.meditationPlay, pause])

  const startSession = useCallback((nextSession, { restart = false, ambience, beginningBell = false, autoplay = true } = {}) => {
    if (!nextSession) return false
    if (nextSession.guidanceType === 'guided' && !hasPlayableAudio(nextSession)) {
      setError(errors.meditationUnavailable)
      return false
    }
    const r = runtime.current
    if (r.session && playbackOwnership.owns(modeFor(r.session))) interrupt()
    const lease = autoplay ? playbackOwnership.acquire(modeFor(nextSession)) : null
    const saved = meditationService.getPracticeProgress(nextSession.id)
    const sameSession = r.session?.id === nextSession.id
    const resumesSaved = !restart && saved && !saved.completed
    const resumeAt = restart ? 0 : sameSession ? r.time : resumesSaved ? saved.progressSeconds : 0
    if (restart) meditationService.discardPractice(nextSession.id)
    ambientAudio.stop(0)
    r.session = nextSession
    r.time = resumeAt
    r.total = resumesSaved ? saved.durationSeconds : nextSession.durationSeconds
    r.startedAt = !restart && sameSession ? r.startedAt : resumesSaved ? saved.startedAt : new Date().toISOString()
    r.ambience = nextSession.guidanceType === 'silent'
      ? { backgroundSound: ambience?.backgroundSound ?? (sameSession && !restart ? r.ambience.backgroundSound : saved?.ambience?.backgroundSound) ?? 'none', backgroundVolume: ambience?.backgroundVolume ?? (sameSession && !restart ? r.ambience.backgroundVolume : saved?.ambience?.backgroundVolume) ?? .25 }
      : { backgroundSound: 'none', backgroundVolume: .25 }
    r.playing = autoplay
    r.lease = lease
    r.tickAt = Date.now()
    ambienceFadeStarted.current = false
    lastSaved.current = -1
    setSessionId(nextSession.id)
    setCurrentTime(r.time)
    setDuration(r.total)
    setPlaying(autoplay)
    setError('')
    if (!autoplay) return true
    if (nextSession.guidanceType === 'guided') playMedia()
    else {
      if (beginningBell) playBellSequence(3, .55)
      if (r.ambience.backgroundSound !== 'none') ambientAudio.start(r.ambience.backgroundSound, r.ambience.backgroundVolume, 3, ambience?.startDelaySeconds || 0)
    }
    return true
  }, [errors.meditationUnavailable, interrupt, playMedia])

  const stopSession = useCallback(() => {
    const r = runtime.current
    if (!r.session) return
    const mode = modeFor(r.session)
    if (playbackOwnership.owns(mode)) { interrupt(); ambientAudio.stop(0); playbackOwnership.release(mode) }
    meditationService.discardPractice(r.session.id)
    r.playing = false
    r.session = null
    r.time = 0
    r.total = 0
    setPlaying(false)
    setSessionId(null)
    setCurrentTime(0)
    setDuration(0)
    setError('')
  }, [interrupt])
  const resume = useCallback(() => {
    const r = runtime.current
    if (!r.session) return
    if (r.time >= r.total) {
      startSession(r.session, { restart: true, ambience: r.ambience, beginningBell: r.session.guidanceType === 'silent' })
      return
    }
    r.lease = playbackOwnership.acquire(modeFor(r.session))
    r.playing = true
    r.tickAt = Date.now()
    setPlaying(true)
    setError('')
    if (r.session.guidanceType === 'guided') playMedia()
    else if (r.ambience.backgroundSound !== 'none') {
      const lease = r.lease
      ambientAudio.resume().then((resumed) => {
        if (!resumed && playbackOwnership.isCurrent(lease) && runtime.current.playing) ambientAudio.start(r.ambience.backgroundSound, r.ambience.backgroundVolume, .8)
      }).catch(() => { /* the timer remains available */ })
    }
  }, [playMedia, startSession])
  const toggle = useCallback(() => {
    if (runtime.current.playing) pause()
    else resume()
  }, [pause, resume])
  const ringBell = useCallback(() => {
    const r = runtime.current
    if (!r.session) return
    if (!playbackOwnership.owns(modeFor(r.session))) r.lease = playbackOwnership.acquire(modeFor(r.session))
    playBell(.5)
  }, [])
  const seekTo = useCallback((seconds) => {
    const el = audioRef.current
    const r = runtime.current
    if (!el || r.session?.guidanceType !== 'guided' || !Number.isFinite(Number(seconds))) return
    try {
      r.time = Math.max(0, Math.min(Number(seconds), r.total || Number(seconds)))
      el.currentTime = r.time
      setCurrentTime(r.time)
    } catch { setError(errors.meditationSeek) }
  }, [errors.meditationSeek])
  const seek = useCallback((delta) => seekTo(runtime.current.time + delta), [seekTo])

  const scheduleEndBells = useCallback((delay) => {
    const lease = runtime.current.lease
    window.clearTimeout(endBellTimer.current)
    endBellTimer.current = window.setTimeout(() => {
      if (!playbackOwnership.isCurrent(lease)) return
      playBellSequence(3, .6)
      endBellTimer.current = window.setTimeout(() => {
        if (playbackOwnership.isCurrent(lease)) playbackOwnership.release(lease.mode)
        endBellTimer.current = null
      }, 12000)
    }, delay)
  }, [])
  useEffect(() => {
    if (!playing || session?.guidanceType !== 'silent') return
    const timer = window.setInterval(() => {
      const r = runtime.current
      if (!r.playing || !playbackOwnership.isCurrent(r.lease)) return
      captureTime()
      const second = Math.floor(r.time)
      if (second > 0 && second % 5 === 0 && second !== lastSaved.current) { lastSaved.current = second; save() }
      if (r.total - r.time <= 2.5 && !ambienceFadeStarted.current) { ambienceFadeStarted.current = true; ambientAudio.stop(2.4) }
      if (r.time >= r.total) {
        r.playing = false
        setPlaying(false)
        save(true)
        scheduleEndBells(150)
      }
    }, 250)
    return () => window.clearInterval(timer)
  }, [playing, session, captureTime, save, scheduleEndBells])

  useEffect(() => {
    const preserveProgress = () => {
      const r = runtime.current
      if (!r.session) return
      captureTime()
      save(r.time >= r.total)
      if (!r.playing || !playbackOwnership.isCurrent(r.lease) || r.session.guidanceType !== 'silent') return
      if (document.visibilityState === 'hidden') ambientAudio.pause()
      else { r.tickAt = Date.now(); ambientAudio.resume() }
    }
    document.addEventListener('visibilitychange', preserveProgress)
    window.addEventListener('pagehide', preserveProgress)
    return () => {
      document.removeEventListener('visibilitychange', preserveProgress)
      window.removeEventListener('pagehide', preserveProgress)
    }
  }, [captureTime, save])

  useEffect(() => {
    const actions = { play: resume, pause, seekbackward: () => seek(-15), seekforward: () => seek(15) }
    const cleanGuided = playbackOwnership.setMediaActions('guidedMeditation', actions)
    const cleanSilent = playbackOwnership.setMediaActions('silentMeditation', { play: resume, pause })
    return () => { cleanGuided(); cleanSilent() }
  }, [resume, pause, seek])

  const value = useMemo(() => ({ session, sessionId, playing, currentTime, duration, error, startSession, stopSession, pause, resume, toggle, seek, seekTo, ringBell }), [session, sessionId, playing, currentTime, duration, error, startSession, stopSession, pause, resume, toggle, seek, seekTo, ringBell])
  return <MeditationAudioContext.Provider value={value}>{children}<audio ref={audioRef} preload='metadata'
    onPlay={() => { const r = runtime.current; if (!r.playing || !playbackOwnership.isCurrent(r.lease) || r.session?.guidanceType !== 'guided') audioRef.current?.pause() }}
    onLoadedMetadata={(event) => {
      const r = runtime.current
      const el = event.currentTarget
      if (r.session?.guidanceType !== 'guided' || el.dataset.id !== r.session.id || el.readyState < 1) return
      r.total = Number.isFinite(el.duration) ? el.duration : r.session.durationSeconds
      setDuration(r.total)
      try { el.currentTime = Math.min(r.time, r.total) } catch { /* a later seek can retry */ }
    }}
    onTimeUpdate={(event) => {
      const r = runtime.current
      if (r.session?.guidanceType !== 'guided' || event.currentTarget.dataset.id !== r.session.id || event.currentTarget.readyState < 1) return
      r.time = event.currentTarget.currentTime
      setCurrentTime(r.time)
      const second = Math.floor(r.time)
      if (r.playing && second > 0 && second % 5 === 0 && second !== lastSaved.current) { lastSaved.current = second; save() }
    }}
    onPause={(event) => { if (runtime.current.playing && runtime.current.session?.guidanceType === 'guided' && event.currentTarget.paused && !event.currentTarget.ended) pause() }}
    onEnded={(event) => {
      const r = runtime.current
      if (!r.playing || !playbackOwnership.isCurrent(r.lease) || r.session?.guidanceType !== 'guided' || !event.currentTarget.ended) return
      r.time = event.currentTarget.duration
      r.playing = false
      setCurrentTime(r.time)
      setPlaying(false)
      save(true)
      scheduleEndBells(10000)
    }}
    onError={() => { if (runtime.current.playing && runtime.current.session?.guidanceType === 'guided' && audioRef.current?.error) { pause(); setError(errors.meditationPlay) } }} />
  </MeditationAudioContext.Provider>
}

export const useMeditationAudio = () => {
  const value = useContext(MeditationAudioContext)
  if (!value) throw new Error('useMeditationAudio must be used inside MeditationAudioProvider')
  return value
}
