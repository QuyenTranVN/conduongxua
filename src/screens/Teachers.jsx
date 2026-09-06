/** @format */

import { useEffect, useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { LINEAGES } from '../data/content.js'
import { uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { GUIDANCE_LABELS } from '../data/meditation.js'
import { meditationService } from '../services/meditationService.js'
import { audioService } from '../services/audioService.js'
import { useAudio } from '../lib/audio.jsx'
import { teachersService } from '../services/teachers/teachersService.js'

export function Teachers() {
  const { go, lang } = useApp()
  const copy = uiText(lang)
  const teacherCopy = copy.teachersPage
  const [lin, setLin] = useState('all')
  const [teachers, setTeachers] = useState(null)
  const [error, setError] = useState('')
  const loadTeachers = (force = false) => {
    setError('')
    setTeachers(null)
    teachersService.getTeachers({ force })
      .then(setTeachers)
      .catch(() => setError(lang === 'vi' ? 'Không thể tải danh sách các vị thầy.' : 'Unable to load teachers.'))
  }
  useEffect(() => { loadTeachers() }, [])
  const list =
    lin === 'all'
      ? (teachers || [])
      : (teachers || []).filter((t) =>
          lin === 'other' ? !['chah', 'forest'].includes(t.lineage) : t.lineage === lin,
        )

  return (
    <>
      <AppBar
        align='left'
        title={copy.nav.teachers}
        right={<span className='iconbtn spacer' />}
      />
      <div className='scroll has-mini buddhist-page-background'>
        <div className='seg' style={{ marginBottom: 4 }}>
          {LINEAGES.map((l) => (
            <button key={l.id} aria-pressed={lin === l.id} onClick={() => setLin(l.id)}>
              {lang === 'vi' ? ({ all: 'Tất cả', chah: 'Dòng Ajahn Chah', forest: 'Truyền thống rừng Thái', other: 'Khác' }[l.id] || l.label) : l.label}
            </button>
          ))}
        </div>
        {!teachers && !error ? (
          <div className='empty' role='status'>{lang === 'vi' ? 'Đang tải các vị thầy…' : 'Loading teachers…'}</div>
        ) : error ? (
          <div className='empty' role='alert'>{error}<br /><button className='btn btn-ghost' onClick={() => loadTeachers(true)}>{lang === 'vi' ? 'Thử lại' : 'Try again'}</button></div>
        ) : list.length === 0 ? (
          <div className='empty'>{teacherCopy.emptyLineage}</div>
        ) : (
          <div className='card' style={{ marginTop: 12 }}>
            {list.map((t) => {
              const localId = t.legacyId || t.id
              const talks = audioService.getByTeacher(localId).length
              const meditations = meditationService.getSessionsByTeacher(localId).length
              return <button key={t.id} className='row' onClick={() => go('teacher', t.id)}>
                <Img src={t.img} label={t.name} round style={{ width: 46, height: 46 }} />
                <span className='grow'>
                  <span className='tl tr' style={{ display: 'block' }}>
                    {t.name}
                  </span>
                  <span className='tc' style={{ display: 'block' }}>
                    {talks} {teacherCopy.listeningCount} · {meditations} {teacherCopy.meditationCount}
                  </span>
                </span>
                <Icon name='chev' size={18} style={{ color: 'var(--text-3)' }} />
              </button>
            })}
          </div>
        )}
      </div>
    </>
  )
}

export function TeacherDetail({ id }) {
  const { go, lang } = useApp()
  const { play } = useAudio()
  const [t, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const localId = t?.legacyId || t?.id
  const meditations = localId ? meditationService.getSessionsByTeacher(localId) : []
  const audioItems = localId ? audioService.getByTeacher(localId) : []
  const [section, setSection] = useState('about')
  const copy = uiText(lang).teachersPage
  const labels = lang === 'vi'
    ? { about: copy.about, meditate: copy.meditate, listen: copy.listen }
    : { about: copy.about, meditate: copy.meditate, listen: copy.listen }
  const visibleSections = ['about', ...(meditations.length ? ['meditate'] : []), ...(audioItems.length ? ['listen'] : [])]
  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    teachersService.getTeacher(id)
      .then((teacher) => { if (active) setTeacher(teacher) })
      .catch(() => { if (active) setError(lang === 'vi' ? 'Không thể tải thông tin vị thầy này.' : 'Unable to load this teacher.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])
  useEffect(() => {
    if (!visibleSections.includes(section)) setSection('about')
  }, [id, section, meditations.length, audioItems.length])
  if (loading) return <><AppBar title={lang === 'vi' ? 'Các vị thầy' : 'Teachers'} /><div className='empty' role='status'>{lang === 'vi' ? 'Đang tải thông tin…' : 'Loading teacher…'}</div></>
  if (error) return <><AppBar title={lang === 'vi' ? 'Các vị thầy' : 'Teachers'} /><div className='empty' role='alert'>{error}</div></>
  if (!t) return <><AppBar title={lang === 'vi' ? 'Các vị thầy' : 'Teachers'} /><div className='empty' role='status'>{lang === 'vi' ? 'Không tìm thấy thông tin vị thầy này.' : 'This teacher could not be found.'}</div></>
  const startMeditation = (session) => go('session', JSON.stringify({ sessionId: session.id, minutes: session.durationSeconds / 60, restart: true, bells: { beginning: true, interval: false, ending: true } }))
  return (
    <>
      <AppBar title={t.name} />
      <div className='scroll has-mini buddhist-page-background'>
        <div style={{ display: 'grid', justifyItems: 'center', marginTop: 8 }}>
          <Img src={t.img} label={t.name} round style={{ width: 104, height: 104 }} />
          <h2 className='h1' style={{ marginTop: 14, fontSize: 24, textAlign: 'center' }}>
            {t.name}
          </h2>
          {t.lineage && <div className='tc'>{copy.tradition}{t.lineage === 'chah' ? ` · ${copy.lineage}` : ''}</div>}
          <div className='tc'>{t.years}</div>
          <div className='chips' style={{ marginTop: 12, justifyContent: 'center' }}>
            <span className='pill'>{audioItems.length} {copy.listeningCount}</span>
            <span className='pill'>{meditations.length} {copy.meditationCount}</span>
          </div>
        </div>
        <div className='tabs teacher-tabs' style={{ marginTop: 20 }} role='tablist'>
          {visibleSections.map((value) => <button key={value} role='tab' aria-selected={section === value} onClick={() => setSection(value)}>{labels[value]}</button>)}
        </div>
        {section === 'about' && <p style={{ fontFamily: 'var(--f-display)', fontSize: 16, lineHeight: 1.65, marginTop: 20 }}>{t.bio}</p>}
        {section === 'meditate' && <><div className='sec'>{copy.sessions}</div>{meditations.length > 0 ? <div className='card'>{meditations.map((session) => <button key={session.id} className='row' onClick={() => startMeditation(session)}><span className='method-icon'><Icon name='lotus' size={17} /></span><span className='grow'><span className='tl' style={{ display: 'block' }}>{session.titleVi}</span><span className='tc'>{GUIDANCE_LABELS[session.guidanceType]} · {session.durationSeconds / 60} {lang === 'vi' ? 'phút' : 'min'}</span></span><Icon name='play' size={18} fill /></button>)}</div> : <div className='empty'>{copy.noMeditation}</div>}</>}
        {section === 'listen' && <><div className='sec'>{copy.listening}</div>
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
                    <span className='tc'>{x.duration ? `${Math.round(x.duration / 60)} ${lang === 'vi' ? 'phút' : 'min'}` : uiText(lang).audioBrowse.durationPending}</span>
                  </span>
                  <Icon name='play' size={18} style={{ color: 'var(--accent)' }} fill />
                </button>
              ))}
            </div> : <div className='empty'>{copy.noAudio}</div>}
          </>}
      </div>
    </>
  )
}
