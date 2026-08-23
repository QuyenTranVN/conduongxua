/** @format */

import { AppBar } from '../components/Chrome.jsx'
import Footer from '../components/Footer.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { DAILY_PRACTICE, TALKS, teacherById } from '../data/content.js'
import { meditationService } from '../services/meditationService.js'
import { greeting, uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { useAudio } from '../lib/audio.jsx'
import { audioService } from '../services/audioService.js'

function MeditationBanner({ lang, onStart }) {
  const copy =
    lang === 'vi'
      ? {
          title: 'Trở về con đường giác ngộ<br />của Đức Phật Thích Ca Mâu Ni',
          subtitle: 'Nghe pháp · Thiền tập · Học Phật<br />Sống chánh niệm mỗi ngày',
          cta: 'Bắt đầu hôm nay',
          aria: 'A monk sitting in meditation in a forest temple',
        }
      : {
          title: 'Return to the path of awakening<br />of the Buddha Shakyamuni',
          subtitle: 'Teachings · Meditation · Learning<br />Practice mindfulness every day',
          cta: 'Start today',
          aria: 'A monk sitting in meditation in a forest temple',
        }

  return (
    <div className='hero-banner' role='img' aria-label={copy.aria}>
      <div className='hero-banner__content'>
        <h3 dangerouslySetInnerHTML={{ __html: copy.title }} />
        <p dangerouslySetInnerHTML={{ __html: copy.subtitle }} />
        <button
          className='hero-banner__cta'
          onClick={onStart}
        >
          {copy.cta}
        </button>
      </div>
    </div>
  )
}

export default function Home() {
  const { go, switchTab, lang } = useApp()
  const { play, currentItem, getProgress } = useAudio()
  const copy = uiText(lang)
  const cont = currentItem || audioService.getAll()[0]
  const contProgress = getProgress(cont.id)
  const rec = TALKS[4]
  const recTeacher = teacherById(rec.teacher)
  const talkTitle = (talk) => copy.listen.talkTitles[talk.id] || talk.title
  const featuredMeditations = [
    { ...meditationService.getMethod('anapanasati'), image: '/images/scenes/forest.jpg', duration: 10 },
    { ...meditationService.getMethod('metta'), image: '/images/scenes/session.jpg', duration: 15 },
    { ...meditationService.getMethod('body'), image: '/images/scenes/tree.jpg', duration: 30 },
  ]

  return (
    <>
      <AppBar
        align='left'
        title={<span />}
        right={
          <button className='iconbtn' aria-label='Notifications'>
            <Icon name='bell' />
          </button>
        }
      />
      <div className='scroll has-mini home-page'>
        <main className='home-page__inner'>
          <section className='home-intro'>
            <h2 className='h1'>
              {greeting(lang)} <span aria-hidden='true'>🌙</span>
            </h2>
            <p
              className='tc'
              style={{ marginTop: 4, fontSize: 14 }}
              dangerouslySetInnerHTML={{ __html: copy.home.prompt }}
            />
          </section>

          <MeditationBanner lang={lang} onStart={() => switchTab('meditate')} />

          <button
            className='btn btn-primary btn-block home-start'
            onClick={() => switchTab('meditate')}
          >
            <Icon name='lotus' size={19} /> {copy.home.startMeditation}
          </button>

          <section className='home-meditations' aria-labelledby='home-meditations-title'>
            <div className='sec' id='home-meditations-title'>
              {lang === 'vi' ? 'Thiền tập' : 'Meditation'}
              <button className='more' onClick={() => switchTab('meditate')}>
                {lang === 'vi' ? 'Xem tất cả' : 'See all'}
              </button>
            </div>
            <div className='home-meditations__grid'>
              {featuredMeditations.map((meditation) => (
                <button
                  className='meditation-card'
                  key={meditation.id}
                  onClick={() => go('method', meditation.id)}
                >
                  <Img
                    src={meditation.image}
                    alt={meditation.nameVi}
                    label={meditation.nameVi}
                    className='meditation-card__image'
                  />
                  <span className='meditation-card__shade' />
                  <span className='meditation-card__content'>
                    <span className='meditation-card__title'>
                      {lang === 'vi' ? meditation.nameVi : meditation.name}
                    </span>
                    <span className='meditation-card__meta'>
                      {meditation.duration} {copy.meditate.minute}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className='home-content-grid'>
            <section>
              <div className='sec'>{copy.home.continueListening}</div>
              <button
                className='card row'
                onClick={() => {
                  play(cont.id)
                  go('player', cont.id)
                }}
              >
                <Img src={cont.image} label={cont.title} rounded style={{ width: 56, height: 56 }} />
                <div className='grow'>
                  <div className='tc'>{cont.teacher}</div>
                  <div className='tl tr'>{cont.title}</div>
                  <div className='tm' style={{ marginTop: 6 }}>
                    {contProgress ? `${Math.floor(contProgress.currentTime / 60)} phút đã nghe` : 'Sẵn sàng để nghe'}
                  </div>
                </div>
                <span
                  className='btn btn-primary'
                  style={{ width: 42, height: 42, minHeight: 42, padding: 0, borderRadius: 999 }}
                >
                  <Icon name='play' size={18} fill />
                </span>
              </button>
            </section>

            <section>
              <div className='sec'>{copy.home.recommended}</div>
              <button className='card row' onClick={() => go('talk', rec.id)}>
                <Img src={rec.img} label={talkTitle(rec)} rounded warm style={{ width: 56, height: 56 }} />
                <div className='grow'>
                  <div className='tc'>{recTeacher?.name}</div>
                  <div className='tl tr'>
                    {talkTitle(rec)}
                  </div>
                  <div
                    className='tm'
                    style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}
                  >
                    <Icon name='film' size={13} /> {copy.home.watch} · {rec.minutes}{' '}
                    {copy.meditate.minute}
                  </div>
                </div>
              </button>
            </section>
          </div>

          <section>
            <div className='sec'>{copy.home.todaysPractice}</div>
            <div className='card'>
              {DAILY_PRACTICE.map((step) => (
                <button
                  key={step.n}
                  className='row'
                  onClick={() =>
                    step.kind === 'talk'
                      ? (play(step.talkId), go('player', step.talkId))
                      : go('session', String(step.minutes))
                  }
                >
                  <span
                    style={{ color: 'var(--gold)', display: 'grid', placeItems: 'center', width: 22 }}
                  >
                    <Icon name='clock' size={18} />
                  </span>
                  <span className='tl' style={{ flex: '0 0 54px' }}>
                    {step.kind === 'talk' ? 11 : step.minutes} {copy.meditate.minute}
                  </span>
                  <span className='grow tc' style={{ color: 'var(--text)' }}>
                    {step.n === 1 || step.n === 2
                      ? copy.home.breathingMeditation
                      : step.n === 3
                        ? copy.home.dhammaTalk
                        : step.n === 4
                          ? copy.home.quietReflection
                          : step.title}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <Footer />
        </main>
      </div>
    </>
  )
}
