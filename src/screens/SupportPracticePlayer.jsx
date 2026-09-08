import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { SupportPracticeVisual } from '../components/support/SupportPractice.jsx'
import { supportPracticeService } from '../services/supportPracticeService.js'
import { useApp } from '../lib/store.jsx'
import { playBell, stopBellSequence } from '../lib/bell.js'
import { uiText } from '../lib/format.js'

import { playbackOwnership } from '../services/playbackOwnership.js'
import { usePlaybackRegistration } from '../lib/playbackOwnership.jsx'

export default function SupportPracticePlayer({ id }) {
  const { back, lang } = useApp()
  const copy = uiText(lang).support
  const practice = supportPracticeService.getById(id)
  const saved = supportPracticeService.getProgress(id)
  const [elapsed, setElapsed] = useState(() => saved && !saved.completed ? saved.progressSeconds : 0)
  const [playing, setPlaying] = useState(false)
  const startedAt = useRef(saved?.startedAt || new Date().toISOString())
  const previousStep = useRef(0)
  const lastSavedSecond = useRef(-1)
  const completionTimer = useRef(null)
  const active = useMemo(() => supportPracticeService.getActiveStep(practice, elapsed), [practice, elapsed])
  const durationSeconds = practice?.durationSeconds || 0

  const runtime = useRef({ elapsed, playing: false })
  const saveProgress = useCallback(() => {
    if (!practice) return
    supportPracticeService.saveProgress({ practiceId: practice.id, startedAt: startedAt.current, progressSeconds: runtime.current.elapsed, completed: runtime.current.elapsed >= practice.durationSeconds })
  }, [practice])
  const interrupt = useCallback(() => {
    runtime.current.playing = false
    saveProgress()
    window.clearTimeout(completionTimer.current)
    stopBellSequence()
    setPlaying(false)
  }, [saveProgress])
  usePlaybackRegistration('supportPractice', interrupt)
  const resume = useCallback(() => {
    if (!supportPracticeService.isPlayable(practice) || runtime.current.elapsed >= durationSeconds) return
    playbackOwnership.acquire('supportPractice')
    runtime.current.playing = true
    setPlaying(true)
  }, [practice, durationSeconds])
  useEffect(() => playbackOwnership.setMediaActions('supportPractice', { play: resume, pause: () => playbackOwnership.pause('supportPractice') }), [resume])
  const toggle = () => {
    if (runtime.current.playing) playbackOwnership.pause('supportPractice')
    else resume()
  }
  useEffect(() => {
    resume()
    return () => {
      saveProgress()
      playbackOwnership.pause('supportPractice')
    }
  }, [resume, saveProgress])
  useEffect(() => {
    if (!playing || !durationSeconds) return
    const timer = window.setInterval(() => {
      if (!runtime.current.playing || !playbackOwnership.owns('supportPractice')) return
      runtime.current.elapsed = Math.min(durationSeconds, Math.floor(runtime.current.elapsed) + 1)
      setElapsed(runtime.current.elapsed)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [playing, durationSeconds])

  useEffect(() => {
    if (!practice || !runtime.current.playing || !playbackOwnership.owns('supportPractice')) return
    if (active && active.index !== previousStep.current) { previousStep.current = active.index; playBell(.25) }
    if (elapsed >= practice.durationSeconds) {
      runtime.current.playing = false
      setPlaying(false)
      supportPracticeService.completePractice(practice.id, practice.durationSeconds, startedAt.current)
      playBell(.4)
      const lease = playbackOwnership.getSnapshot()
      completionTimer.current = window.setTimeout(() => { if (playbackOwnership.isCurrent(lease)) playbackOwnership.release('supportPractice') }, 6000)
    } else {
      const second = Math.floor(elapsed)
      if (second > 0 && second % 5 === 0 && second !== lastSavedSecond.current) { lastSavedSecond.current = second; saveProgress() }
    }
  }, [elapsed, active, practice, saveProgress])

  useEffect(() => {
    document.addEventListener('visibilitychange', saveProgress)
    window.addEventListener('pagehide', saveProgress)
    return () => {
      document.removeEventListener('visibilitychange', saveProgress)
      window.removeEventListener('pagehide', saveProgress)
    }
  }, [saveProgress])

  if (!supportPracticeService.isPlayable(practice) || !active) return <div className='dark-screen'><div className='inner'><button className='iconbtn' onClick={back} aria-label={copy.close}><Icon name='down' /></button><div className='empty' role='status'>{copy.unavailable}</div></div></div>
  const remaining = Math.max(0, practice.durationSeconds - elapsed)
  const wholeSecondsRemaining = Math.ceil(remaining)
  const mm = String(Math.floor(wholeSecondsRemaining / 60))
  const ss = String(wholeSecondsRemaining % 60).padStart(2, '0')
  const stepRemaining = Math.max(0, active.endSeconds - elapsed)
  const jump = (index) => { const seconds = practice.steps.slice(0, index).reduce((sum, step) => sum + step.durationSeconds, 0); runtime.current.elapsed = seconds; setElapsed(seconds) }
  const close = () => { saveProgress(); playbackOwnership.pause('supportPractice'); back() }

  return <div className='dark-screen support-player'><div className='support-player__inner'>
    <div className='player-top'><button className='iconbtn' onClick={close} aria-label={copy.close}><Icon name='down' /></button><span className='grow' /><span className='player-mode'>{copy.mode}</span></div>
    <div className='support-player__title'><span className='tm'>{active.index + 1} / {practice.steps.length}</span><h1 className='h2'>{practice.titleVi}</h1></div>
    <div className='support-player__timer' role='timer' aria-label={`${mm}:${ss}`}><span>{mm}:</span><span key={wholeSecondsRemaining} className='support-player__seconds'>{ss}</span></div>
    <SupportPracticeVisual compact icon={active.step.icon} imageUrl={active.step.imageUrl} />
    <div className='support-player__instruction'><h2 className='h1'>{active.step.titleVi}</h2><p>{active.step.descriptionVi}</p><span>{Math.ceil(stepRemaining / 60)} {copy.remaining}</span></div>
    <div className='support-player__progress'><span style={{ width: `${(elapsed / practice.durationSeconds) * 100}%` }} /></div>
    <div className='support-player__controls'><button onClick={() => jump(Math.max(0, active.index - 1))} disabled={active.index === 0} aria-label={copy.previous}><Icon name='back' size={22} /></button><button className='primary' onClick={toggle} aria-label={playing ? copy.pause : copy.resume} aria-pressed={playing}><Icon name={playing ? 'pause' : 'play'} size={27} fill={!playing} /></button><button onClick={() => jump(Math.min(practice.steps.length - 1, active.index + 1))} disabled={active.index === practice.steps.length - 1} aria-label={copy.next}><Icon name='chev' size={22} /></button></div>
  </div></div>
}
