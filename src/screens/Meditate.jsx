/** @format */

import { useEffect, useState } from 'react'
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
import { hasPlayableAudio } from '../services/audioStorage.js'

export default function Meditate() {
  const { go, lang } = useApp()
  const guidedAudio = useMeditationAudio()
  const copy = uiText(lang)
  const [quickMinutes, setQuickMinutes] = useState(null)
  const [apiSessions, setApiSessions] = useState([])
  useEffect(() => {
    let active = true
    meditationService.loadSessions()
      .then((sessions) => { if (active) setApiSessions(sessions) })
      .catch(() => { if (active) setApiSessions([]) })
    return () => { active = false }
  }, [])
  const storedRecent = meditationService.getContinuePractice()
  const recent = guidedAudio.session
    ? { meditationSessionId: guidedAudio.session.id, progressSeconds: guidedAudio.currentTime, durationSeconds: guidedAudio.duration || guidedAudio.session.durationSeconds, completed: guidedAudio.currentTime >= (guidedAudio.duration || guidedAudio.session.durationSeconds) }
    : storedRecent
  const recentSession = recent ? meditationService.getSession(recent.meditationSessionId) : null
  const supportPractices = supportPracticeService.getVisible()
  const teachersWithAudio = TEACHERS.map((teacher) => ({
    teacher,
    sessions: meditationService.getSessionsByTeacher(teacher.id).filter(hasPlayableAudio),
  })).filter(({ sessions }) => sessions.length > 0).slice(0, 4)
  const startSession = (session, ambience) => {
    if (!session) return
    setQuickMinutes(null)
    go('session', JSON.stringify({ sessionId: session.id, minutes: session.durationSeconds / 60, restart: true, bells: { beginning: !ambience?.beginningBellHandled, interval: false, ending: true }, ambience }))
  }
  const openContinuePractice = () => go('session', JSON.stringify({ sessionId: recentSession.id, minutes: (recent.selectedDurationSeconds || recentSession.durationSeconds) / 60, autoplay: false, bells: { beginning: false, interval: false, ending: true } }))
  const toggleContinuePractice = () => {
    if (guidedAudio.sessionId === recentSession.id) {
      guidedAudio.toggle()
      return
    }
    if (guidedAudio.startSession(recentSession) && !recentSession.audioUrl) playBell(.42)
  }

  return (
    <>
      <AppBar title={copy.nav.meditate} />
      <div className='scroll has-mini meditation-home buddhist-page-background'>
        <section>
          <div className='sec meditation-section-title'><span><small>{copy.meditate.practiceNow}</small>{copy.meditate.timeQuestion}</span></div>
          <QuickPracticeDurationSelector durations={QUICK} onSelect={setQuickMinutes} lang={lang} />
        </section>

        {recent && recentSession && !recent.completed && <section><div className='sec'>{copy.meditate.continuePractice}</div><div className='card continue-practice'><button className='continue-practice__main grow' onClick={openContinuePractice} aria-label={`${copy.meditate.continueAction}: ${recentSession.titleVi}`}><div className='tm'>{meditationService.getMethod(recentSession.methodId)?.name}</div><div className='h3'>{recentSession.titleVi}</div><div className='practice-progress'><span style={{ width: `${Math.min(100, ((recent.progressSeconds ?? recent.durationCompleted) / recentSession.durationSeconds) * 100)}%` }} /></div><div className='tc'>{Math.floor((recent.progressSeconds ?? recent.durationCompleted) / 60)} / {Math.floor(recentSession.durationSeconds / 60)} {copy.meditate.minute} · {copy.meditate.tapToOpen}</div></button><button className='continue-practice__toggle' onClick={toggleContinuePractice} aria-label={guidedAudio.sessionId === recentSession.id && guidedAudio.playing ? copy.meditate.pauseAction : copy.meditate.continueAction} aria-pressed={guidedAudio.sessionId === recentSession.id && guidedAudio.playing}><Icon name={guidedAudio.sessionId === recentSession.id && guidedAudio.playing ? 'pause' : 'play'} size={17} fill={!(guidedAudio.sessionId === recentSession.id && guidedAudio.playing)} /><span>{guidedAudio.sessionId === recentSession.id && guidedAudio.playing ? copy.meditate.pauseAction : copy.meditate.continueAction}</span></button></div></section>}

        {teachersWithAudio.length > 0 && <section><div className='sec'>{copy.meditate.withTeachers}</div><div className='card'>{teachersWithAudio.map(({ teacher, sessions }) => <button key={teacher.id} className='row' onClick={() => go('teacher', teacher.id)}><Img src={teacher.img} label={teacher.name} round style={{ width: 42, height: 42 }} /><span className='grow'><span className='tl' style={{ display: 'block' }}>{teacher.name}</span><span className='tc'>{sessions.length} {uiText(lang).teachersPage.meditationCount}</span></span><Icon name='chev' size={18} style={{ color: 'var(--text-3)' }} /></button>)}</div><button className='btn btn-ghost btn-block' style={{ marginTop: 10 }} onClick={() => go('teachers')}>{copy.meditate.viewAllTeachers}</button></section>}

        {supportPractices.length > 0 && <section><div className='sec'>{copy.meditate.supportPractices}</div><div className='grid2'>{supportPractices.map((practice) => <SupportPracticeCard key={practice.id} practice={practice} onOpen={() => go('support', practice.id)} />)}</div></section>}
      </div>
      <QuickPracticeSheet minutes={quickMinutes} onClose={() => setQuickMinutes(null)} onStart={startSession} lang={lang} apiSessions={apiSessions} />
    </>
  )
}
