import { useEffect, useMemo, useState } from 'react'
import Icon from '../Icon.jsx'
import Sheet from '../Sheet.jsx'
import { GUIDANCE_DESCRIPTIONS, GUIDANCE_DESCRIPTIONS_EN, GUIDANCE_LABELS, GUIDANCE_LABELS_EN } from '../../data/meditation.js'
import { meditationService } from '../../services/meditationService.js'
import { uiText } from '../../lib/format.js'
import { AMBIENT_SOUNDS, ambientAudio, ambientSoundPreferences } from '../../services/ambientSoundService.js'
import { playBellSequence } from '../../lib/bell.js'

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

export function QuickPracticeSheet({ minutes, onClose, onStart, lang = 'vi', preferredMethod, apiSessions = null }) {
  const copy = uiText(lang).meditate
  const [guidanceType, setGuidanceType] = useState(() => meditationService.getPreferredGuidance())
  const [backgroundSound, setBackgroundSound] = useState(() => ambientSoundPreferences.get().lastBackgroundSound)
  const [backgroundVolume, setBackgroundVolume] = useState(() => ambientSoundPreferences.get().lastBackgroundVolume)
  const previousPractice = meditationService.getRecentPractice()
  const previousSession = previousPractice ? meditationService.getSession(previousPractice.meditationSessionId) : null
  const recommendation = useMemo(() => {
    if (guidanceType === 'guided') {
      const target = (minutes || 10) * 60
      const realSession = (apiSessions || [])
        .filter((session) => session.guidanceType === 'guided')
        .map((session) => ({ session, difference: Math.abs(session.durationSeconds - target) }))
        .filter(({ difference }) => difference <= 60)
        .sort((left, right) => left.difference - right.difference)[0]?.session
      if (realSession) return realSession
      // When API sessions were explicitly supplied, do not replace missing
      // production content with an unrelated local guided recording.
      if (Array.isArray(apiSessions)) return null
    }
    return meditationService.getRecommendedMeditation({
      duration: minutes || 10,
      guidanceType,
      preferredMethod: preferredMethod || previousSession?.methodId || 'anapanasati',
      previousPractice: previousSession,
    })
  }, [minutes, guidanceType, previousSession?.id, preferredMethod, apiSessions])
  const selectGuidance = (type) => { setGuidanceType(type); meditationService.savePreferredGuidance(type) }
  useEffect(() => {
    if (!minutes) return
    const saved = ambientSoundPreferences.get()
    setBackgroundSound(saved.lastBackgroundSound)
    setBackgroundVolume(saved.lastBackgroundVolume)
  }, [minutes])
  const start = () => {
    if (guidanceType === 'silent') ambientSoundPreferences.save({ lastSilentDuration: minutes * 60, lastBackgroundSound: backgroundSound, lastBackgroundVolume: backgroundVolume })
    if (guidanceType === 'silent') {
      if (backgroundSound !== 'none') ambientAudio.unlock()
      playBellSequence(3, .55)
    }
    onStart(recommendation, guidanceType === 'silent' ? { backgroundSound, backgroundVolume, startDelaySeconds: 8, beginningBellHandled: true } : undefined)
  }

  return <Sheet open={Boolean(minutes)} onClose={onClose} label={copy.practiceChoice} className='quick-practice-sheet'>
    <div className='quick-practice-sheet__content'>
      <h3 className='h2'>{copy.practiceChoice}</h3>
      <p className='tc' style={{ marginTop: 4 }}>{minutes} {copy.minute} · {copy.recommendationHint}</p>
      <div className='quick-guidance' role='radiogroup' aria-label={lang === 'en' ? 'Choose guidance type' : 'Chọn hình thức hướng dẫn'}>{['guided', 'silent'].map((type) => <GuidanceTypeCard key={type} type={type} selected={guidanceType === type} onSelect={selectGuidance} lang={lang} />)}</div>
      <div className={`ambient-setup ${guidanceType === 'silent' ? '' : 'ambient-setup--placeholder'}`.trim()} aria-hidden={guidanceType !== 'silent'}>
        <div className='ambient-setup__label'>{copy.backgroundSound}</div>
        <div className='ambient-options' role={guidanceType === 'silent' ? 'radiogroup' : undefined} aria-label={guidanceType === 'silent' ? copy.backgroundSound : undefined}>{AMBIENT_SOUNDS.map((sound) => <button key={sound.id} tabIndex={guidanceType === 'silent' ? 0 : -1} aria-pressed={backgroundSound === sound.id} onClick={() => setBackgroundSound(sound.id)} aria-label={`${copy.chooseBackground} ${lang === 'en' ? sound.nameEn : sound.nameVi}`}><Icon name={sound.icon || (sound.id === 'none' ? 'close' : sound.id === 'white_noise' ? 'sliders' : sound.id)} size={17} /><span>{lang === 'en' ? sound.nameEn : sound.nameVi}</span></button>)}</div>
        <div className='ambient-volume-slot' aria-hidden={backgroundSound === 'none'}>
          <label className='ambient-volume' hidden={backgroundSound === 'none'}><span><strong>{copy.backgroundVolume}</strong><span>{Math.round(backgroundVolume * 100)}%</span></span><input tabIndex={guidanceType === 'silent' ? 0 : -1} type='range' min='0' max='100' step='1' value={Math.round(backgroundVolume * 100)} onChange={(event) => setBackgroundVolume(Number(event.target.value) / 100)} aria-label={`${copy.backgroundVolume} ${Math.round(backgroundVolume * 100)} ${copy.percent}`} /></label>
        </div>
      </div>
      <RecommendedMeditationCard session={recommendation} lang={lang} />
    </div>
    <div className='quick-practice-sheet__actions'>
      <button className='btn btn-primary btn-block' onClick={start} disabled={!recommendation}><Icon name='play' size={17} fill /> {copy.start}</button>
      <button className='btn btn-ghost btn-block' onClick={onClose}>{copy.later}</button>
    </div>
  </Sheet>
}
