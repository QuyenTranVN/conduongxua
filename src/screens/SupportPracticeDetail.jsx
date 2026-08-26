import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import { SupportPracticeStepList, SupportPracticeVisual } from '../components/support/SupportPractice.jsx'
import { supportPracticeService } from '../services/supportPracticeService.js'
import { useApp } from '../lib/store.jsx'

export default function SupportPracticeDetail({ id }) {
  const { go } = useApp()
  const practice = supportPracticeService.getById(id)
  if (!supportPracticeService.isPlayable(practice)) return <><AppBar title='Thực hành hỗ trợ' /><div className='scroll has-mini'><div className='empty'>Nội dung này hiện chưa khả dụng.<br />Vui lòng quay lại sau.</div></div></>
  const progress = supportPracticeService.getProgress(id)
  const canContinue = progress && !progress.completed && progress.progressSeconds > 0
  const mode = practice.contentType === 'visual_guided' ? 'Hướng dẫn trực quan' : practice.contentType === 'audio_guided' ? 'Có hướng dẫn' : 'Hướng dẫn kết hợp'
  return <><AppBar title='Thực hành hỗ trợ' /><div className='scroll has-mini support-detail'>
    <div className='support-detail__hero'><SupportPracticeVisual icon={practice.heroIcon} imageUrl={practice.heroImageUrl} /><h1 className='h1'>{practice.titleVi}</h1><p>{practice.subtitleVi}</p><div className='support-meta'><span><Icon name='clock' size={16} /> {Math.round(practice.durationSeconds / 60)} phút</span><span><Icon name='lotus' size={16} /> {mode}</span></div></div>
    <div className='sec'>Bạn sẽ thực hành</div><SupportPracticeStepList steps={practice.steps} />
    <button className='btn btn-primary btn-block support-start' onClick={() => go('support-player', practice.id)}><Icon name='play' size={17} fill /> {canContinue ? 'Tiếp tục' : 'Bắt đầu'}</button>
    {canContinue && <p className='support-resume-note'>Tiếp tục từ phút {Math.floor(progress.progressSeconds / 60)}.</p>}
  </div></>
}
