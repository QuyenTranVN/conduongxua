import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { audioService } from '../services/audioService.js'
import { useAudio } from '../lib/audio.jsx'
import { useApp } from '../lib/store.jsx'

const CATEGORY_LABELS = { dhamma: 'Pháp thoại', sutta: 'Kinh', meditation: 'Thiền', chanting: 'Tụng kinh', audiobook: 'Sách nói' }
const LANGUAGE_LABELS = { vi: 'Tiếng Việt', pali: 'Pāli', en: 'English' }

export default function AudioDetail({ slug }) {
  const { go } = useApp()
  const { play, favorites, toggleFavorite } = useAudio()
  const item = audioService.getBySlug(slug)
  if (!item) return <><AppBar title='Nội dung' /><div className='empty'>Không tìm thấy nội dung này.</div></>
  const sourceReady = item.source.pageUrl && item.source.pageUrl !== 'TO_BE_ADDED'
  return <><AppBar title='Chi tiết' /><div className='scroll has-mini audio-detail'>
    <Img src={item.image} alt={item.title} label={item.title} rounded className='audio-detail__art' />
    <h2 className='h1'>{item.title}</h2><p className='tc'>{item.teacher || 'Chưa cập nhật'}</p><p className='tm'>{CATEGORY_LABELS[item.category]} · {LANGUAGE_LABELS[item.language]}</p>
    <div className='audio-detail__actions'><button className='btn btn-primary' onClick={() => { play(item.id, audioService.getAll()); go('player', item.id) }}><Icon name='play' size={17} fill /> Phát</button><button className='btn btn-ghost' aria-pressed={favorites.has(item.id)} onClick={() => toggleFavorite(item.id)}><Icon name='bookmark' size={17} fill={favorites.has(item.id)} /> {favorites.has(item.id) ? 'Đã lưu' : 'Lưu'}</button></div>
    <div className='divider' /><div className='sec'>Mô tả</div><p className='audio-detail__copy'>{item.description || 'Mô tả đang được biên tập và xác minh.'}</p>
    <div className='sec'>Về vị thầy</div><button className='card row' onClick={() => item.teacherId && go('teacher', item.teacherId)}><span className='method-icon'><Icon name='user' size={18} /></span><span className='grow tl'>{item.teacher || 'Đang cập nhật'}</span><Icon name='chev' size={17} /></button>
    <div className='source-card'><span className='tm'>NGUỒN</span><strong>Nguồn: {item.source.name}</strong><p>{item.attribution}</p>{sourceReady ? <a href={item.source.pageUrl} target='_blank' rel='noreferrer'>Xem nội dung gốc →</a> : <span className='tc'>Liên kết nguồn đang được bổ sung.</span>}</div>
  </div></>
}
