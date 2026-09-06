import { useEffect, useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import { QuickPracticeDurationSelector, QuickPracticeSheet } from '../components/meditation/QuickPractice.jsx'
import { meditationService } from '../services/meditationService.js'
import { useApp } from '../lib/store.jsx'
import { uiText } from '../lib/format.js'

export default function MeditationMethod({ id }) {
  const { go, lang } = useApp()
  const [method, setMethod] = useState(null)
  const [sessions, setSessions] = useState(null)
  const [error, setError] = useState('')
  const copy = uiText(lang).meditate
  const [filter, setFilter] = useState('all')
  const [quickMinutes, setQuickMinutes] = useState(null)
  useEffect(() => {
    let active = true
    Promise.all([
      meditationService.loadMethod(id),
      meditationService.loadSessions({ method: id }),
    ])
      .then(([loadedMethod, loadedSessions]) => {
        if (!active) return
        setMethod(loadedMethod)
        setSessions(loadedSessions)
      })
      .catch(() => { if (active) setError(lang === 'vi' ? 'Không thể tải phương pháp thiền.' : 'Unable to load meditation methods.') })
    return () => { active = false }
  }, [id])
  if ((!method || !sessions) && !error) return <><AppBar title={copy.meditation} /><div className='empty' role='status'>{lang === 'vi' ? 'Đang tải phương pháp thiền…' : 'Loading meditation methods…'}</div></>
  if (error) return <><AppBar title={copy.meditation} /><div className='empty' role='alert'>{error}</div></>
  if (!method) return <><AppBar title={copy.meditation} /><div className='empty' role='status'>{copy.unavailableMethod}</div></>
  const shown = filter === 'all' ? sessions : sessions.filter((session) => session.guidanceType === filter)
  const start = (session) => {
    if (!session) return
    setQuickMinutes(null)
    go('session', JSON.stringify({ sessionId: session.id, minutes: session.durationSeconds / 60, restart: true, bells: { beginning: true, interval: false, ending: true } }))
  }

  return <><AppBar title={method.name} /><div className='scroll has-mini method-detail'>
    <div className='method-hero'><span className='method-icon method-icon--large'><Icon name={method.icon} size={26} /></span><h2 className='h1'>{method.nameVi}</h2>{method.name !== method.nameVi && <div className='tc'>{method.name}</div>}{method.aboutVi && <p>{method.aboutVi}</p>}{method.suitableVi && <div className='method-suitable'><Icon name='user' size={17} /><span><strong>Phù hợp với ai?</strong>{method.suitableVi}</span></div>}</div>
    <div className='sec'>{copy.quick}</div><QuickPracticeDurationSelector durations={[8, 15, 30, 60, 90, 120]} onSelect={setQuickMinutes} lang={lang} />
    <div className='sec'>{copy.sessions}</div><div className='seg method-filters'>{[['all', copy.all], ['guided', copy.guided], ['silent', copy.silent]].map(([value, label]) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{label}</button>)}</div>
    <div className='card' style={{ marginTop: 10 }}>{shown.length ? shown.map((session) => <button className='row session-row' key={session.id} onClick={() => start(session)}><span className='session-row__play'><Icon name='play' size={15} fill /></span><span className='grow'><span className='tl' style={{ display: 'block' }}>{session.titleVi}</span><span className='tc'>{session.guidanceType === 'guided' ? copy.guided : copy.silent}</span></span><span className='tm'>{Math.round(session.durationSeconds / 60)} {copy.minute}</span></button>) : <div className='empty'>{lang === 'vi' ? 'Không có buổi thiền phù hợp.' : 'No matching sessions.'}</div>}</div>
  </div><QuickPracticeSheet minutes={quickMinutes} onClose={() => setQuickMinutes(null)} onStart={start} lang={lang} preferredMethod={method.id} apiSessions={sessions} /></>
}
