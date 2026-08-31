import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import { AppBar } from '../components/Chrome.jsx'
import { useApp } from '../lib/store.jsx'
import { uiText } from '../lib/format.js'
import { meditationService } from '../services/meditationService.js'

const DURATIONS = [8, 15, 30, 60, 90, 120]
export default function CreateMeditation({ id }) {
  const { go, lang } = useApp()
  const copy = uiText(lang).meditate
  const method = meditationService.getMethod(id) || meditationService.getMethod('anapanasati')
  const [minutes, setMinutes] = useState(15)
  const [guidance, setGuidance] = useState('guided')
  const [bells, setBells] = useState({ beginning: true, interval: false, ending: true })

  const Row = ({ on, onClick, children }) => (
    <button className="opt" onClick={onClick} role="radio" aria-checked={on}>
      <span className="radio" data-on={on} /><span className="grow tl">{children}</span>
    </button>
  )

  return (
    <>
      <AppBar title={copy.create} />
      <div className="scroll">
        <div className="sec">{copy.duration}</div>
        <div className="card" role="radiogroup" aria-label={copy.duration}>
          {DURATIONS.map(d => (
            <Row key={d} on={minutes === d} onClick={() => setMinutes(d)}>
              {d} {copy.minute}
            </Row>
          ))}
        </div>

        <div className="sec">{copy.guidance}</div>
        <div className="card" role="radiogroup" aria-label={copy.guidance}>
          {[['guided', copy.guided], ['silent', copy.silent]].map(([k, label]) => (
            <Row key={k} on={guidance === k} onClick={() => setGuidance(k)}>{label}</Row>
          ))}
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          {[['beginning', copy.beginningBell], ['interval', copy.intervalBell], ['ending', copy.endingBell]]
            .map(([k, label]) => (
              <div className="opt" key={k}>
                <span className="grow tl">{label}</span>
                <button className="switch" aria-pressed={bells[k]} aria-label={label}
                  onClick={() => setBells(b => ({ ...b, [k]: !b[k] }))} />
              </div>
            ))}
        </div>

        <button className="btn btn-primary btn-block" style={{ marginTop: 24 }}
          onClick={() => {
            const session = meditationService.getRecommendedSession({
              duration: minutes,
              previousMethod: method.id,
              preferredGuidance: guidance,
            })
            go('session', JSON.stringify({ minutes, sessionId: session.id, restart: true, bells, guidance: session.guidanceType }))
          }}>
          {copy.beginPractice}
        </button>
      </div>
    </>
  )
}
