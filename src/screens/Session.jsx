import { useEffect, useRef } from 'react'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import Scrubber from '../components/Scrubber.jsx'
import { useApp } from '../lib/store.jsx'
import { playBell, playBellSequence } from '../lib/bell.js'
import { teacherById } from '../data/content.js'
import { GUIDANCE_LABELS, MEDITATION_AUDIO_CREDIT } from '../data/meditation.js'
import { meditationService } from '../services/meditationService.js'
import { useMeditationAudio } from '../lib/meditationAudio.jsx'

const R = 104
const C = 2 * Math.PI * R

function parse(param) {
  try {
    const value = JSON.parse(param)
    if (value && typeof value === 'object') return value
  } catch {
    // Legacy quick-practice values are handled below.
  }
  const minutes = Number(param) || 10
  const session = meditationService.getRecommendedSession({ duration: minutes, previousMethod: 'anapanasati' })
  return { minutes, sessionId: session?.id, restart: true, bells: { beginning: true, interval: false, ending: true } }
}

export default function Session({ param }) {
  const { back } = useApp()
  const guidedAudio = useMeditationAudio()
  const cfg = useRef(parse(param)).current
  const session = meditationService.getSession(cfg.sessionId) || meditationService.getRecommendedSession({ duration: cfg.minutes || 10 })
  const method = meditationService.getMethod(session.methodId)
  const teacher = teacherById(session.teacherId)
  const audioCredit = MEDITATION_AUDIO_CREDIT[session.audioCredit]
  const total = Math.round((cfg.minutes || session.durationSeconds / 60) * 60)
  const started = useRef(false)
  const activated = useRef(false)
  const isGuided = session.guidanceType === 'guided'
  const isActiveSession = guidedAudio.sessionId === session.id
  const shownLeft = isActiveSession ? Math.max(0, total - guidedAudio.currentTime) : total
  const elapsed = total - shownLeft
  const effectiveRunning = isActiveSession ? guidedAudio.playing : true

  useEffect(() => {
    if (started.current) return
    started.current = true
    if (!isGuided && cfg.bells?.beginning) playBellSequence(3, 0.55)
  }, [cfg, isGuided])

  useEffect(() => {
    if (activated.current) return
    activated.current = true
    if (cfg.restart || guidedAudio.sessionId !== session.id) guidedAudio.startSession(session, { restart: Boolean(cfg.restart) })
  }, [session, cfg, guidedAudio.sessionId, guidedAudio.startSession])

  const close = () => back()
  const stop = () => { guidedAudio.stopSession(); back() }
  const seekGuidedTo = (seconds) => {
    if (!isGuided) return
    guidedAudio.seekTo(seconds)
  }
  const seekGuided = (delta) => seekGuidedTo(elapsed + delta)
  const wholeSecondsLeft = Math.max(0, Math.ceil(shownLeft))
  const mm = String(Math.floor(wholeSecondsLeft / 60)).padStart(2, '0')
  const ss = String(wholeSecondsLeft % 60).padStart(2, '0')
  const offset = C * (shownLeft / total)

  return (
    <div className={`dark-screen meditation-player meditation-player--clear ${isGuided ? 'meditation-player--guided' : ''}`}>
      <Img src='/images/scenes/session.jpg' label='' className='bgimg' />
      <div className='veil' />
      <div className='inner'>
        <div className='player-top'><button className='iconbtn' onClick={close} aria-label='Đóng buổi thiền'><Icon name='down' /></button><span className='grow' /><span className='player-mode'>{GUIDANCE_LABELS[session.guidanceType]}</span></div>
        <div className='meditation-player__identity'>
          <div className='tm'>{method.name}</div>
          <h2 className='h1'>{session.titleVi}</h2>
          {isGuided && (teacher || session.teacherName) && <div className='guided-teacher'>{teacher?.img && <Img src={teacher.img} label={teacher.name} round style={{ width: 30, height: 30 }} />}<span className='tc'>{teacher?.name || session.teacherName}</span></div>}
        </div>
        <div className={`ringwrap ${isGuided ? 'ringwrap--guided' : ''}`} style={{ width: 240, height: 240 }}>
          <svg width='240' height='240' viewBox='0 0 240 240' aria-hidden='true'><circle className='ring-track' cx='120' cy='120' r={R} fill='none' strokeWidth='5' /><circle className='ring-fill' cx='120' cy='120' r={R} fill='none' strokeWidth='5' strokeLinecap='round' transform='rotate(-90 120 120)' strokeDasharray={C} strokeDashoffset={C - offset} /></svg>
          <div className='readout' role='timer'><div className='t'>{mm}:{ss}</div></div>
        </div>
        <div className='player-guidance'>
          {shownLeft === 0 ? <p>Buổi thiền đã hoàn thành.</p> : isGuided ? <><p>{method.cueVi}</p><span className='tm'>{guidedAudio.error || (guidedAudio.playing ? 'Đang phát hướng dẫn' : 'Đang tạm dừng')}</span></> : <p>Không có lời hướng dẫn. Chỉ có chuông bắt đầu và kết thúc.</p>}
        </div>
        {isGuided && <div className='guided-seek'><Scrubber pos={elapsed} total={total} onSeek={seekGuidedTo} /></div>}
        <div className='grow' />
        {isGuided ? <div className='transport guided-transport'><button onClick={() => seekGuided(-15)} aria-label='Lùi 15 giây'><Icon name='back15' size={25} /></button><button className='primary' onClick={guidedAudio.toggle} aria-label={effectiveRunning ? 'Tạm dừng' : 'Tiếp tục'}><Icon name={effectiveRunning ? 'pause' : 'play'} size={28} fill={!effectiveRunning} /></button><button onClick={() => seekGuided(15)} aria-label='Tiến 15 giây'><Icon name='fwd15' size={25} /></button></div> : <div className='transport'><button onClick={() => playBell(0.5)} aria-label='Thỉnh chuông'><Icon name='bell' size={24} /></button><button className='primary' onClick={guidedAudio.toggle} aria-label={effectiveRunning ? 'Tạm dừng' : 'Tiếp tục'}><Icon name={effectiveRunning ? 'pause' : 'play'} size={28} fill={!effectiveRunning} /></button><button onClick={stop} aria-label='Dừng và kết thúc buổi thiền'><Icon name='stop' size={22} /></button></div>}
        {audioCredit && <p className='meditation-audio-credit'>Âm thanh được chia sẻ với sự cho phép của <a href={audioCredit.url} target='_blank' rel='noreferrer'>{audioCredit.name}</a>.</p>}
        {isGuided && session.transcript && <button className='player-transcript'><Icon name='transcript' size={18} /> Bản chép lời</button>}
      </div>
    </div>
  )
}
