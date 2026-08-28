import Icon from '../Icon.jsx'

export function SupportPracticeCard({ practice, onOpen }) {
  return <button className='card supporting-practice' onClick={onOpen}><span className='method-icon'><Icon name={practice.heroIcon} size={19} /></span><span className='tl'>{practice.titleVi}</span><span className='tc'>{practice.subtitleVi}</span></button>
}

export function SupportPracticeVisual({ icon, imageUrl, compact = false }) {
  return <div className={`support-visual${compact ? ' support-visual--compact' : ''}`}>{imageUrl ? <img src={imageUrl} alt='' /> : <><span className='support-visual__halo' /><Icon name={icon || 'lotus'} size={compact ? 54 : 72} /></>}</div>
}

export function SupportPracticeStepList({ steps, lang = 'vi' }) {
  return <div className='card support-step-list'>{steps.map((step, index) => <div className='support-step-row' key={step.id}><span className='support-step-number'>{index + 1}</span><span className='grow'><strong>{step.titleVi}</strong><span>{step.descriptionVi}</span></span><small>{Math.round(step.durationSeconds / 60)} {lang === 'en' ? 'min' : 'phút'}</small></div>)}</div>
}
