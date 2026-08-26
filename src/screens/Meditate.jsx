/** @format */

import { useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { QuickPracticeDurationSelector, QuickPracticeSheet } from '../components/meditation/QuickPractice.jsx'
import { SupportPracticeCard } from '../components/support/SupportPractice.jsx'
import { QUICK, TEACHERS } from '../data/content.js'
import { supportPracticeService } from '../services/supportPracticeService.js'
import { uiText } from '../lib/format.js'
import { meditationService } from '../services/meditationService.js'
import { useApp } from '../lib/store.jsx'
import { useMeditationAudio } from '../lib/meditationAudio.jsx'
import { playBell } from '../lib/bell.js'

export default function Meditate() {
  const { go, lang } = useApp()
  const guidedAudio = useMeditationAudio()
  const copy = uiText(lang)
  const [quickMinutes, setQuickMinutes] = useState(null)
  const storedRecent = meditationService.getContinuePractice()
  const recent = guidedAudio.session
    ? { meditationSessionId: guidedAudio.session.id, progressSeconds: guidedAudio.currentTime, durationSeconds: guidedAudio.duration || guidedAudio.session.durationSeconds, completed: guidedAudio.currentTime >= (guidedAudio.duration || guidedAudio.session.durationSeconds) }
    : storedRecent
  const recentSession = recent ? meditationService.getSession(recent.meditationSessionId) : null
  const supportPractices = supportPracticeService.getVisible()
  const teachersWithAudio = TEACHERS.map((teacher) => ({
    teacher,
    sessions: meditationService.getSessionsByTeacher(teacher.id).filter((session) => Boolean(session.audioUrl)),
  })).filter(({ sessions }) => sessions.length > 0).slice(0, 4)
  const startSession = (session) => {
    if (!session) return
    setQuickMinutes(null)
    go('session', JSON.stringify({ sessionId: session.id, minutes: Math.round(session.durationSeconds / 60), restart: true, bells: { beginning: true, interval: false, ending: true } }))
  }
  const openContinuePractice = () => go('session', JSON.stringify({ sessionId: recentSession.id, minutes: recentSession.durationSeconds / 60, bells: { beginning: false, interval: false, ending: true } }))
  const toggleContinuePractice = () => {
    if (guidedAudio.sessionId === recentSession.id) {
      guidedAudio.toggle()
      return
    }
    if (!recentSession.audioUrl) playBell(.42)
    guidedAudio.startSession(recentSession)
  }

  return (
    <>
      <AppBar title={copy.nav.meditate} right={<button className='iconbtn' aria-label='Tùy chỉnh buổi thiền' onClick={() => go('create')}><Icon name='sliders' /></button>} />
      <div className='scroll has-mini meditation-home'>
        <section>
          <div className='sec meditation-section-title'><span><small>THỰC HÀNH NGAY</small>Bạn có bao nhiêu thời gian?</span></div>
          <QuickPracticeDurationSelector durations={QUICK} onSelect={setQuickMinutes} />
        </section>

        {recent && recentSession && !recent.completed && <section><div className='sec'>Tiếp tục thực hành</div><div className='card continue-practice'><button className='continue-practice__main grow' onClick={openContinuePractice} aria-label={`Mở lại ${recentSession.titleVi}`}><div className='tm'>{meditationService.getMethod(recentSession.methodId)?.name}</div><div className='h3'>{recentSession.titleVi}</div><div className='practice-progress'><span style={{ width: `${Math.min(100, ((recent.progressSeconds ?? recent.durationCompleted) / recentSession.durationSeconds) * 100)}%` }} /></div><div className='tc'>{Math.floor((recent.progressSeconds ?? recent.durationCompleted) / 60)} / {Math.floor(recentSession.durationSeconds / 60)} phút · Chạm để mở trình phát</div></button><button className='continue-practice__toggle' onClick={toggleContinuePractice} aria-label={guidedAudio.sessionId === recentSession.id && guidedAudio.playing ? 'Tạm dừng bài thiền' : 'Tiếp tục phát bài thiền'} aria-pressed={guidedAudio.sessionId === recentSession.id && guidedAudio.playing}><Icon name={guidedAudio.sessionId === recentSession.id && guidedAudio.playing ? 'pause' : 'play'} size={17} fill={!(guidedAudio.sessionId === recentSession.id && guidedAudio.playing)} /><span>{guidedAudio.sessionId === recentSession.id && guidedAudio.playing ? 'Tạm dừng' : 'Tiếp tục'}</span></button></div></section>}

        {teachersWithAudio.length > 0 && <section><div className='sec'>Thiền cùng các vị thầy</div><div className='card'>{teachersWithAudio.map(({ teacher, sessions }) => <button key={teacher.id} className='row' onClick={() => go('teacher', teacher.id)}><Img src={teacher.img} label={teacher.name} round style={{ width: 42, height: 42 }} /><span className='grow'><span className='tl' style={{ display: 'block' }}>{teacher.name}</span><span className='tc'>{sessions.length} bài thiền</span></span><Icon name='chev' size={18} style={{ color: 'var(--text-3)' }} /></button>)}</div><button className='btn btn-ghost btn-block' style={{ marginTop: 10 }} onClick={() => go('teachers')}>Xem tất cả các vị thầy</button></section>}

        {supportPractices.length > 0 && <section><div className='sec'>Thực hành hỗ trợ</div><div className='grid2'>{supportPractices.map((practice) => <SupportPracticeCard key={practice.id} practice={practice} onOpen={() => go('support', practice.id)} />)}</div></section>}
      </div>
      <QuickPracticeSheet minutes={quickMinutes} onClose={() => setQuickMinutes(null)} onStart={startSession} lang={lang} />
    </>
  )
}
