import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon.jsx'
import { SupportPracticeVisual } from '../components/support/SupportPractice.jsx'
import { supportPracticeService } from '../services/supportPracticeService.js'
import { useApp } from '../lib/store.jsx'
import { playBell } from '../lib/bell.js'

export default function SupportPracticePlayer({ id }) {
  const { back } = useApp()
  const practice = supportPracticeService.getById(id)
  const saved = supportPracticeService.getProgress(id)
  const [elapsed, setElapsed] = useState(() => saved && !saved.completed ? saved.progressSeconds : 0)
  const [playing, setPlaying] = useState(true)
  const startedAt = useRef(saved?.startedAt || new Date().toISOString())
  const previousStep = useRef(0)
  const active = useMemo(() => supportPracticeService.getActiveStep(practice, elapsed), [practice, elapsed])

  useEffect(() => {
    if (!playing || !practice || elapsed >= practice.durationSeconds) return
    const timer = window.setInterval(() => setElapsed((value) => Math.min(practice.durationSeconds, value + 1)), 1000)
    return () => window.clearInterval(timer)
  }, [playing, practice, elapsed >= practice?.durationSeconds])

  useEffect(() => {
    if (!practice) return
    if (active && active.index !== previousStep.current) { previousStep.current = active.index; playBell(.25) }
    if (elapsed >= practice.durationSeconds) { setPlaying(false); supportPracticeService.completePractice(practice.id, practice.durationSeconds, startedAt.current); playBell(.4) }
    else if (elapsed > 0 && elapsed % 5 === 0) supportPracticeService.saveProgress({ practiceId: practice.id, startedAt: startedAt.current, progressSeconds: elapsed, completed: false })
  }, [elapsed, active, practice])

  if (!supportPracticeService.isPlayable(practice) || !active) return null
  const remaining = Math.max(0, practice.durationSeconds - elapsed)
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0')
  const ss = String(remaining % 60).padStart(2, '0')
  const stepRemaining = Math.max(0, active.endSeconds - elapsed)
  const jump = (index) => { const seconds = practice.steps.slice(0, index).reduce((sum, step) => sum + step.durationSeconds, 0); setElapsed(seconds) }
  const close = () => { if (elapsed < practice.durationSeconds) supportPracticeService.saveProgress({ practiceId: practice.id, startedAt: startedAt.current, progressSeconds: elapsed, completed: false }); back() }

  return <div className='dark-screen support-player'><div className='support-player__inner'>
    <div className='player-top'><button className='iconbtn' onClick={close} aria-label='Đóng'><Icon name='down' /></button><span className='grow' /><span className='player-mode'>Thực hành hỗ trợ</span></div>
    <div className='support-player__title'><span className='tm'>{active.index + 1} / {practice.steps.length}</span><h1 className='h2'>{practice.titleVi}</h1></div>
    <div className='support-player__timer' role='timer'>{mm}:{ss}</div>
    <SupportPracticeVisual compact icon={active.step.icon} imageUrl={active.step.imageUrl} />
    <div className='support-player__instruction'><h2 className='h1'>{active.step.titleVi}</h2><p>{active.step.descriptionVi}</p><span>{Math.ceil(stepRemaining / 60)} phút còn lại trong bước này</span></div>
    <div className='support-player__progress'><span style={{ width: `${(elapsed / practice.durationSeconds) * 100}%` }} /></div>
    <div className='support-player__controls'><button onClick={() => jump(Math.max(0, active.index - 1))} disabled={active.index === 0} aria-label='Bước trước'><Icon name='back' size={22} /></button><button className='primary' onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Tạm dừng' : 'Tiếp tục'}><Icon name={playing ? 'pause' : 'play'} size={27} fill={!playing} /></button><button onClick={() => jump(Math.min(practice.steps.length - 1, active.index + 1))} disabled={active.index === practice.steps.length - 1} aria-label='Bước tiếp theo'><Icon name='chev' size={22} /></button></div>
  </div></div>
}
