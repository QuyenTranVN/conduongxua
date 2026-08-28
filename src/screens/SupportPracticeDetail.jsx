import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import { SupportPracticeStepList, SupportPracticeVisual } from '../components/support/SupportPractice.jsx'
import { supportPracticeService } from '../services/supportPracticeService.js'
import { useApp } from '../lib/store.jsx'
import { uiText } from '../lib/format.js'

export default function SupportPracticeDetail({ id }) {
  const { go, lang } = useApp()
  const copy = uiText(lang).support
  const practice = supportPracticeService.getById(id)
  if (!supportPracticeService.isPlayable(practice)) return <><AppBar title={copy.title} /><div className='scroll has-mini'><div className='empty' role='status'>{copy.unavailable}</div></div></>
  const progress = supportPracticeService.getProgress(id)
  const canContinue = progress && !progress.completed && progress.progressSeconds > 0
  const mode = practice.contentType === 'visual_guided' ? copy.visual : practice.contentType === 'audio_guided' ? copy.audio : copy.mixed
  return <><AppBar title={copy.title} /><div className='scroll has-mini support-detail'>
    <div className='support-detail__hero'><SupportPracticeVisual icon={practice.heroIcon} imageUrl={practice.heroImageUrl} /><h1 className='h1'>{practice.titleVi}</h1><p>{practice.subtitleVi}</p><div className='support-meta'><span><Icon name='clock' size={16} /> {Math.round(practice.durationSeconds / 60)} {lang === 'en' ? 'min' : 'phút'}</span><span><Icon name='lotus' size={16} /> {mode}</span></div></div>
    <div className='sec'>{copy.plan}</div><SupportPracticeStepList steps={practice.steps} lang={lang} />
    <button className='btn btn-primary btn-block support-start' onClick={() => go('support-player', practice.id)}><Icon name='play' size={17} fill /> {canContinue ? copy.continue : copy.start}</button>
    {canContinue && <p className='support-resume-note'>{copy.continueFrom} {Math.floor(progress.progressSeconds / 60)}.</p>}
  </div></>
}
