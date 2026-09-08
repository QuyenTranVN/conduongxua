import { useEffect, useRef } from 'react'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import Scrubber from '../components/Scrubber.jsx'
import { useApp } from '../lib/store.jsx'

import { teacherById } from '../data/content.js'
import { GUIDANCE_LABELS, GUIDANCE_LABELS_EN, MEDITATION_AUDIO_CREDIT } from '../data/meditation.js'
import { meditationService } from '../services/meditationService.js'
import { useMeditationAudio } from '../lib/meditationAudio.jsx'
import { uiText } from '../lib/format.js'

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
  const { back, lang } = useApp()
  const guidedAudio = useMeditationAudio()
  const copy = uiText(lang).meditate
  const cfg = useRef(parse(param)).current
  const session = meditationService.getSession(cfg.sessionId) || meditationService.getRecommendedSession({ duration: cfg.minutes || 10 })
  const method = meditationService.getMethod(session.methodId)
  const teacher = teacherById(session.teacherId)
  const audioCredit = MEDITATION_AUDIO_CREDIT[session.audioCredit]
  const total = Math.round((cfg.minutes || session.durationSeconds / 60) * 60)
  const activated = useRef(false)
  const isGuided = session.guidanceType === 'guided'
  const isActiveSession = guidedAudio.sessionId === session.id
  const shownTime = guidedAudio.currentTime
  const shownLeft = isActiveSession ? Math.max(0, total - shownTime) : total
  const elapsed = total - shownLeft
  const effectiveRunning = isActiveSession && guidedAudio.playing
  const completed = shownLeft <= 0
  const completionCopy = lang === 'en'
    ? { title: 'Practice complete', body: `You just spent ${Math.round(total / 60)} minutes practicing.`, wish: 'May this practice support peace and wisdom.', done: 'Done' }
    : { title: 'Hoàn thành', body: `Bạn vừa dành ${Math.round(total / 60)} phút để thực hành.`, wish: 'Nguyện cho sự thực hành này đưa đến bình an và trí tuệ.', done: copy.done }
  const guidanceLabels = lang === 'en' ? GUIDANCE_LABELS_EN : GUIDANCE_LABELS

  useEffect(() => {
    if (activated.current) return
    activated.current = true
    if (cfg.restart || guidedAudio.sessionId !== session.id) guidedAudio.startSession(session, { restart: Boolean(cfg.restart), ambience: cfg.ambience, beginningBell: !isGuided && cfg.bells?.beginning, autoplay: cfg.autoplay !== false })
  }, [session, cfg, isGuided, guidedAudio.sessionId, guidedAudio.startSession])

  const close = () => {
    guidedAudio.pause()
    back()
  }
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
        <div className='player-top'><button className='iconbtn' onClick={close} aria-label={copy.closeSession}><Icon name='down' /></button><span className='grow' /><span className='player-mode'>{guidanceLabels[session.guidanceType]}</span></div>
        <div className='meditation-player__identity'>
          <div className='tm'>{method?.name || method?.nameVi || ''}</div>
          <h2 className='h1'>{session.titleVi}</h2>
          {isGuided && (teacher || session.teacherName) && <div className='guided-teacher'>{teacher?.img && <Img src={teacher.img} label={teacher.name} round style={{ width: 30, height: 30 }} />}<span className='tc'>{teacher?.name || session.teacherName}</span></div>}
        </div>
        <div className={`ringwrap ${isGuided ? 'ringwrap--guided' : ''}`} style={{ width: 240, height: 240 }}>
          <svg width='240' height='240' viewBox='0 0 240 240' aria-hidden='true'><circle className='ring-track' cx='120' cy='120' r={R} fill='none' strokeWidth='5' /><circle className='ring-fill' cx='120' cy='120' r={R} fill='none' strokeWidth='5' strokeLinecap='round' transform='rotate(-90 120 120)' strokeDasharray={C} strokeDashoffset={C - offset} /></svg>
          <div className='readout' role='timer'><div className='t'>{mm}:{ss}</div></div>
        </div>
        <div className='player-guidance'>
          {completed ? <><h2 className='h2'>{completionCopy.title}</h2><p>{completionCopy.body}</p><span className='tm'>{completionCopy.wish}</span></> : isGuided ? <>{(method?.cueVi || method?.nameVi || method?.name) && <p>{lang === 'vi' ? (method?.cueVi || method?.nameVi || method?.name) : (method?.nameEn || method?.name || method?.nameVi)}</p>}<span className='tm' role='status'>{guidedAudio.error || (guidedAudio.playing ? copy.guidedPlaying : copy.guidedPaused)}</span></> : <p>{copy.noGuidance}</p>}
        </div>
        {isGuided && <div className='guided-seek'><Scrubber pos={elapsed} total={total} onSeek={seekGuidedTo} label={lang === 'en' ? 'Meditation position' : 'Vị trí bài thiền'} /></div>}
        <div className='grow' />
        {completed ? <button className='btn btn-primary btn-block' onClick={close}>{completionCopy.done}</button> : isGuided ? <div className='transport guided-transport'><button onClick={() => seekGuided(-15)} aria-label={uiText(lang).player.back15}><Icon name='back15' size={25} /></button><button className='primary' onClick={guidedAudio.toggle} aria-label={effectiveRunning ? copy.pause : copy.resume} aria-pressed={effectiveRunning}><Icon name={effectiveRunning ? 'pause' : 'play'} size={28} fill={!effectiveRunning} /></button><button onClick={() => seekGuided(15)} aria-label={uiText(lang).player.forward15}><Icon name='fwd15' size={25} /></button></div> : <div className='transport'><button onClick={guidedAudio.ringBell} aria-label={copy.ringBell}><Icon name='bell' size={24} /></button><button className='primary' onClick={guidedAudio.toggle} aria-label={effectiveRunning ? copy.pause : copy.resume} aria-pressed={effectiveRunning}><Icon name={effectiveRunning ? 'pause' : 'play'} size={28} fill={!effectiveRunning} /></button><button onClick={stop} aria-label={copy.endSession}><Icon name='stop' size={22} /></button></div>}
        {audioCredit && <p className='meditation-audio-credit'>{copy.audioCredit} <a href={audioCredit.url} target='_blank' rel='noopener noreferrer'>{audioCredit.name}</a>.</p>}
        {isGuided && session.transcript && <button className='player-transcript'><Icon name='transcript' size={18} /> Bản chép lời</button>}
      </div>
    </div>
  )
}
