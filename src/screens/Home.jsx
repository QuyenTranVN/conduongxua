/** @format */
import { useEffect, useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Footer from '../components/Footer.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { greeting, uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { useAudio } from '../lib/audio.jsx'
import { audioService } from '../services/audioService.js'
import { meditationService } from '../services/meditationService.js'
import { teachersService } from '../services/teachers/teachersService.js'

function MeditationBanner({ lang, onStart }) {
  const copy = lang === 'vi'
    ? { title: 'Trở về con đường giác ngộ<br />của Đức Phật Thích Ca Mâu Ni', subtitle: 'Nghe pháp · Thiền tập · Học Phật<br />Sống chánh niệm mỗi ngày', cta: 'Bắt đầu hôm nay', aria: 'Một vị sư ngồi thiền trong ngôi chùa giữa rừng' }
    : { title: 'Return to the path of awakening<br />of the Buddha Shakyamuni', subtitle: 'Teachings · Meditation · Learning<br />Practice mindfulness every day', cta: 'Start today', aria: 'A monk sitting in meditation in a forest temple' }
  return <div className='hero-banner' role='img' aria-label={copy.aria}><div className='hero-banner__content'>
    <h3 dangerouslySetInnerHTML={{ __html: copy.title }} /><p dangerouslySetInnerHTML={{ __html: copy.subtitle }} />
    <button className='hero-banner__cta' onClick={onStart}>{copy.cta}</button>
  </div></div>
}

export default function Home() {
  const { go, switchTab, lang } = useApp()
  const { play, continueItems } = useAudio()
  const copy = uiText(lang)
  const [teachers, setTeachers] = useState(null)
  const [teachersError, setTeachersError] = useState(false)
  useEffect(() => {
    let active = true
    teachersService.getTeachers()
      .then((items) => { if (active) setTeachers(items) })
      .catch(() => { if (active) setTeachersError(true) })
    return () => { active = false }
  }, [])
  const hour = new Date().getHours()
  const continuePractice = meditationService.getContinuePractice()
  const practiceSessionId = continuePractice?.sessionId || continuePractice?.meditationSessionId || continuePractice?.id
  const practiceSession = practiceSessionId ? meditationService.getSession(practiceSessionId) : null
  const practiceMethod = practiceSession ? meditationService.getMethod(practiceSession.methodId) : null
  const practiceElapsed = continuePractice?.progressSeconds ?? continuePractice?.durationCompleted ?? 0
  const practiceDuration = continuePractice?.durationSeconds || practiceSession?.durationSeconds || 0
  const continueAudio = continueItems[0]
  const playableAudio = audioService.getPlayable()
  const recommendedAudio = playableAudio.find((item) => item.id !== continueAudio?.item.id) || playableAudio[0]
  const dailySession = meditationService.getRecommendedSession({ duration: 10, previousMethod: meditationService.getRecentPractice()?.methodId, preferredGuidance: meditationService.getPreferredGuidance() })
  const openSession = (session, restart) => session && go('session', JSON.stringify({ sessionId: session.id, minutes: session.durationSeconds / 60, restart, bells: { beginning: restart, interval: false, ending: true } }))
  const openAudio = (item) => { if (play(item.id, playableAudio)) go('player', item.id) }
  const remainingMinutes = continueAudio ? Math.max(1, Math.ceil(((continueAudio.progress.duration || continueAudio.item.duration) - continueAudio.progress.currentTime) / 60)) : 0

  return <><AppBar align='left' title={<span />} right={<span className='iconbtn spacer' />} />
    <div className='scroll has-mini home-page buddhist-page-background'><main className='home-page__inner'>
      <section className='home-intro'><h2 className='h1'>{greeting(lang)} <span aria-hidden='true'>{hour >= 5 && hour < 18 ? '☀️' : '🌙'}</span></h2>
        <p className='tc' style={{ marginTop: 4, fontSize: 14 }} dangerouslySetInnerHTML={{ __html: copy.home.prompt }} /></section>
      <MeditationBanner lang={lang} onStart={() => openSession(dailySession, true)} />
      <button className='btn btn-primary btn-block home-start' onClick={() => switchTab('meditate')}><Icon name='lotus' size={19} /> {copy.home.startMeditation}</button>

      {practiceSession && practiceElapsed > 0 && practiceElapsed < practiceDuration && <section className='home-action-section'>
        <div className='sec'>{copy.home.continuePractice}</div>
        <button className='card row home-action-card' onClick={() => openSession(practiceSession, false)}>
          <span className='method-icon'><Icon name={practiceMethod?.icon || 'lotus'} size={20} /></span>
          <span className='grow'><span className='tl'>{lang === 'vi' ? (practiceMethod?.nameVi || practiceSession.titleVi) : (practiceMethod?.name || practiceSession.titleVi)}</span>
            <span className='tm'>{Math.floor(practiceElapsed / 60)} / {Math.round(practiceDuration / 60)} {copy.meditate.minute}</span></span>
          <span className='home-card-action'>{copy.home.continueAction} →</span>
        </button>
      </section>}

      {continueAudio && <section className='home-action-section'><div className='sec'>{copy.home.continueListening}</div>
        <button className='card row home-action-card' onClick={() => openAudio(continueAudio.item)}><Img src={continueAudio.item.image} label={continueAudio.item.title} rounded style={{ width: 56, height: 56 }} />
          <span className='grow'><span className='tc'>{continueAudio.item.teacher}</span><span className='tl tr'>{continueAudio.item.title}</span><span className='tm'>{remainingMinutes} {copy.home.remaining}</span></span><span className='home-play'><Icon name='play' size={17} fill /></span></button>
      </section>}

      {recommendedAudio && <section className='home-action-section'><div className='sec'>{copy.home.recommended}</div>
        <button className='card row home-action-card' onClick={() => openAudio(recommendedAudio)}><Img src={recommendedAudio.image} label={recommendedAudio.title} rounded warm style={{ width: 56, height: 56 }} />
          <span className='grow'><span className='tc'>{recommendedAudio.teacher}</span><span className='tl tr'>{recommendedAudio.title}</span><span className='tm'>{copy.home.dhammaTalk} · {Math.round(recommendedAudio.duration / 60)} {copy.meditate.minute}</span></span><span className='home-play'><Icon name='play' size={17} fill /></span></button>
      </section>}

      <section className='home-teachers'><div className='sec'>{copy.home.teachers}<button className='more' onClick={() => switchTab('teachers')}>{copy.home.seeAll} →</button></div>
        {!teachers && !teachersError ? <div className='empty' role='status'>{lang === 'vi' ? 'Đang tải…' : 'Loading…'}</div>
          : teachersError ? <div className='empty' role='alert'>{lang === 'vi' ? 'Không thể tải các vị thầy.' : 'Unable to load teachers.'}</div>
          : teachers?.length ? <div className='home-teachers__list'>{teachers.slice(0, 3).map((teacher) => <button key={teacher.id} onClick={() => go('teacher', teacher.slug)}><Img src={teacher.img} label={teacher.name} round /><span>{teacher.name}</span></button>)}</div>
          : <div className='empty'>{lang === 'vi' ? 'Chưa có vị thầy nào.' : 'No teachers are available.'}</div>}
      </section>
      <Footer />
    </main></div>
  </>
}
