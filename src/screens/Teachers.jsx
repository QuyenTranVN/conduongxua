/** @format */

import { useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { LINEAGES, teacherById, TEACHERS } from '../data/content.js'
import { uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { GUIDANCE_LABELS } from '../data/meditation.js'
import { meditationService } from '../services/meditationService.js'
import { audioService } from '../services/audioService.js'
import { useAudio } from '../lib/audio.jsx'

export function Teachers() {
  const { go, lang } = useApp()
  const copy = uiText(lang)
  const [lin, setLin] = useState('all')
  const list =
    lin === 'all'
      ? TEACHERS
      : TEACHERS.filter((t) =>
          lin === 'other' ? !['chah', 'forest'].includes(t.lineage) : t.lineage === lin,
        )

  return (
    <>
      <AppBar
        align='left'
        title={copy.nav.teachers}
        right={
          <button className='iconbtn' aria-label={copy.common.search}>
            <Icon name='search' />
          </button>
        }
      />
      <div className='scroll has-mini'>
        <div className='seg' style={{ marginBottom: 4 }}>
          {LINEAGES.map((l) => (
            <button key={l.id} aria-pressed={lin === l.id} onClick={() => setLin(l.id)}>
              {l.label}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <div className='empty'>No teachers in this lineage yet.</div>
        ) : (
          <div className='card' style={{ marginTop: 12 }}>
            {list.map((t) => (
              <button key={t.id} className='row' onClick={() => go('teacher', t.id)}>
                <Img src={t.img} label={t.name} round style={{ width: 46, height: 46 }} />
                <span className='grow'>
                  <span className='tl tr' style={{ display: 'block' }}>
                    {t.name}
                  </span>
                  <span className='tc' style={{ display: 'block' }}>
                    {t.talks} bài pháp · {t.meditations} bài thiền
                  </span>
                </span>
                <Icon name='chev' size={18} style={{ color: 'var(--text-3)' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export function TeacherDetail({ id }) {
  const { go, lang } = useApp()
  const { play } = useAudio()
  const t = teacherById(id)
  const meditations = meditationService.getSessionsByTeacher(id)
  const audioItems = audioService.getByTeacher(id)
  const [section, setSection] = useState('about')
  const labels = lang === 'vi'
    ? { about: 'Giới thiệu', meditate: 'Thiền', listen: 'Nghe', watch: 'Xem', books: 'Sách' }
    : { about: 'About', meditate: 'Meditate', listen: 'Listen', watch: 'Watch', books: 'Books' }
  const startMeditation = (session) => go('session', JSON.stringify({ sessionId: session.id, minutes: session.durationSeconds / 60, restart: true, bells: { beginning: true, interval: false, ending: true } }))
  return (
    <>
      <AppBar title={t.name} />
      <div className='scroll has-mini'>
        <div style={{ display: 'grid', justifyItems: 'center', marginTop: 8 }}>
          <Img src={t.img} label={t.name} round style={{ width: 104, height: 104 }} />
          <h2 className='h1' style={{ marginTop: 14, fontSize: 24, textAlign: 'center' }}>
            {t.name}
          </h2>
          <div className='tc'>Truyền thống rừng Thái · Dòng truyền thừa Ajahn Chah</div>
          <div className='tc'>{t.years}</div>
          <div className='chips' style={{ marginTop: 12, justifyContent: 'center' }}>
            <span className='pill'>{audioItems.length} bài nghe</span>
            <span className='pill'>{meditations.length} bài thiền</span>
          </div>
        </div>
        <div className='tabs teacher-tabs' style={{ marginTop: 20 }} role='tablist'>
          {Object.entries(labels).map(([value, label]) => <button key={value} role='tab' aria-selected={section === value} onClick={() => setSection(value)}>{label}</button>)}
        </div>
        {section === 'about' && <p style={{ fontFamily: 'var(--f-display)', fontSize: 16, lineHeight: 1.65, marginTop: 20 }}>{t.bio}</p>}
        {section === 'meditate' && <><div className='sec'>Các buổi thiền</div>{meditations.length > 0 ? <div className='card'>{meditations.map((session) => <button key={session.id} className='row' onClick={() => startMeditation(session)}><span className='method-icon'><Icon name='lotus' size={17} /></span><span className='grow'><span className='tl' style={{ display: 'block' }}>{session.titleVi}</span><span className='tc'>{GUIDANCE_LABELS[session.guidanceType]} · {session.durationSeconds / 60} phút</span></span><Icon name='play' size={18} fill /></button>)}</div> : <div className='empty'>Chưa có buổi thiền từ vị thầy này.</div>}</>}
        {section === 'listen' && <><div className='sec'>Nội dung nghe</div>
            {audioItems.length > 0 ?
            <div className='card'>
              {audioItems.map((x) => (
                <button
                  key={x.id}
                  className='row'
                  onClick={() => {
                    play(x.id)
                  }}
                >
                  <Img src={x.image} label={x.title} rounded style={{ width: 48, height: 48 }} />
                  <span className='grow'>
                    <span className='tl tr' style={{ display: 'block' }}>
                      {x.title}
                    </span>
                    <span className='tc'>{x.duration ? `${Math.round(x.duration / 60)} phút` : 'Thời lượng đang cập nhật'}</span>
                  </span>
                  <Icon name='play' size={18} style={{ color: 'var(--accent)' }} fill />
                </button>
              ))}
            </div> : <div className='empty'>Chưa có bản ghi âm đã duyệt từ vị thầy này.</div>}
          </>}
        {section === 'watch' && <div className='empty'>Video từ vị thầy sẽ xuất hiện tại đây.</div>}
        {section === 'books' && <div className='empty'>Sách và tài liệu sẽ xuất hiện tại đây.</div>}
      </div>
    </>
  )
}
