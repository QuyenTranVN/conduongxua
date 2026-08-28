import { useMemo, useState } from 'react'
import Icon from '../Icon.jsx'
import Sheet from '../Sheet.jsx'
import { GUIDANCE_DESCRIPTIONS, GUIDANCE_DESCRIPTIONS_EN, GUIDANCE_LABELS, GUIDANCE_LABELS_EN } from '../../data/meditation.js'
import { meditationService } from '../../services/meditationService.js'
import { uiText } from '../../lib/format.js'

export function QuickPracticeDurationSelector({ durations, onSelect, lang = 'vi' }) {
  const unit = lang === 'en' ? 'min' : 'phút'
  return <div className='duration-grid'>{durations.map((minutes) => <button key={minutes} onClick={() => onSelect(minutes)} aria-label={`${minutes} ${unit}`}><strong>{minutes}</strong><span>{unit}</span></button>)}</div>
}

export function GuidanceTypeCard({ type, selected, onSelect, lang = 'vi' }) {
  const labels = lang === 'en' ? GUIDANCE_LABELS_EN : GUIDANCE_LABELS
  const descriptions = lang === 'en' ? GUIDANCE_DESCRIPTIONS_EN : GUIDANCE_DESCRIPTIONS
  const icon = type === 'guided' ? 'ear' : 'lotus'
  return <button className='quick-guidance__option' aria-pressed={selected} aria-label={`${labels[type]}. ${descriptions[type]}`} onClick={() => onSelect(type)}><span className='guidance-check' aria-hidden='true'>{selected ? '✓' : ''}</span><Icon name={icon} size={21} /><strong>{labels[type]}</strong><span>{descriptions[type]}</span></button>
}

export function RecommendedMeditationCard({ session, lang = 'vi' }) {
  if (!session) return null
  const method = meditationService.getMethod(session.methodId)
  const copy = uiText(lang).meditate
  return <div className='recommendation-card'><span className='tm'>{copy.recommendation}</span><strong>{session.titleVi}</strong><span className='tc'>{method?.name} · {Math.round(session.durationSeconds / 60)} {copy.minute}</span></div>
}

export function QuickPracticeSheet({ minutes, onClose, onStart, lang = 'vi', preferredMethod }) {
  const copy = uiText(lang).meditate
  const [guidanceType, setGuidanceType] = useState(() => meditationService.getPreferredGuidance())
  const previousPractice = meditationService.getRecentPractice()
  const previousSession = previousPractice ? meditationService.getSession(previousPractice.meditationSessionId) : null
  const recommendation = useMemo(() => meditationService.getRecommendedMeditation({
    duration: minutes || 10,
    guidanceType,
    preferredMethod: preferredMethod || previousSession?.methodId || 'anapanasati',
    previousPractice: previousSession,
  }), [minutes, guidanceType, previousSession?.id, preferredMethod])
  const selectGuidance = (type) => { setGuidanceType(type); meditationService.savePreferredGuidance(type) }

  return <Sheet open={Boolean(minutes)} onClose={onClose} label={copy.practiceChoice}>
    <h3 className='h2'>{copy.practiceChoice}</h3>
    <p className='tc' style={{ marginTop: 4 }}>{minutes} {copy.minute} · {copy.recommendationHint}</p>
    <div className='quick-guidance' role='radiogroup' aria-label={lang === 'en' ? 'Choose guidance type' : 'Chọn hình thức hướng dẫn'}>{['guided', 'silent'].map((type) => <GuidanceTypeCard key={type} type={type} selected={guidanceType === type} onSelect={selectGuidance} lang={lang} />)}</div>
    <RecommendedMeditationCard session={recommendation} lang={lang} />
    <button className='btn btn-primary btn-block' onClick={() => onStart(recommendation)} disabled={!recommendation}><Icon name='play' size={17} fill /> {copy.start}</button>
    <button className='btn btn-ghost btn-block' style={{ marginTop: 8 }} onClick={onClose}>{copy.later}</button>
  </Sheet>
}
