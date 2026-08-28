import { useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import { QuickPracticeDurationSelector, QuickPracticeSheet } from '../components/meditation/QuickPractice.jsx'
import { teacherById } from '../data/content.js'
import { meditationService } from '../services/meditationService.js'
import { useApp } from '../lib/store.jsx'
import { uiText } from '../lib/format.js'

export default function MeditationMethod({ id }) {
  const { go, lang } = useApp()
  const method = meditationService.getMethod(id)
  const copy = uiText(lang).meditate
  const sessions = meditationService.getSessionsByMethod(id)
  const [filter, setFilter] = useState('all')
  const [quickMinutes, setQuickMinutes] = useState(null)
  if (!method) return <><AppBar title={copy.meditation} /><div className='empty' role='status'>{copy.unavailableMethod}</div></>
  const shown = filter === 'all' ? sessions : sessions.filter((session) => session.guidanceType === filter)
  const start = (session) => {
    if (!session) return
    setQuickMinutes(null)
    go('session', JSON.stringify({ sessionId: session.id, minutes: session.durationSeconds / 60, restart: true, bells: { beginning: true, interval: false, ending: true } }))
  }

  return <><AppBar title={method.name} /><div className='scroll has-mini method-detail'>
    <div className='method-hero'><span className='method-icon method-icon--large'><Icon name={method.icon} size={26} /></span><h2 className='h1'>{method.nameVi}</h2><div className='tc'>{method.name}</div><p>{method.aboutVi}</p><div className='method-suitable'><Icon name='user' size={17} /><span><strong>Phù hợp với ai?</strong>{method.suitableVi}</span></div></div>
    <div className='sec'>{copy.quick}</div><QuickPracticeDurationSelector durations={[8, 15, 30, 60, 90, 120]} onSelect={setQuickMinutes} lang={lang} />
    <div className='sec'>{copy.sessions}</div><div className='seg method-filters'>{[['all', copy.all], ['guided', copy.guided], ['silent', copy.silent]].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
    <div className='card' style={{ marginTop: 10 }}>{shown.map((session) => { const teacher = teacherById(session.teacherId); return <button className='row session-row' key={session.id} onClick={() => start(session)}><span className='session-row__play'><Icon name='play' size={15} fill /></span><span className='grow'><span className='tl' style={{ display: 'block' }}>{session.titleVi}</span><span className='tc'>{teacher?.name || session.teacherName || copy.selfPractice} · {session.guidanceType === 'guided' ? copy.guided : copy.silent}</span></span><span className='tm'>{session.durationSeconds / 60} {copy.minute}</span></button> })}</div>
  </div><QuickPracticeSheet minutes={quickMinutes} onClose={() => setQuickMinutes(null)} onStart={start} lang={lang} preferredMethod={method.id} /></>
}
