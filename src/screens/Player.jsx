import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import Scrubber from '../components/Scrubber.jsx'
import { useAudio } from '../lib/audio.jsx'
import { useApp } from '../lib/store.jsx'
import { audioService } from '../services/audioService.js'

export default function Player({ id }) {
  const { back, go } = useApp()
  const audio = useAudio()
  const item = audioService.getById(id)
  if (!item) return <div className='dark-screen'><div className='inner'><button className='iconbtn' onClick={back}><Icon name='down' /></button><div className='empty'>Không tìm thấy nội dung âm thanh.</div></div></div>
  const marked = audio.favorites.has(item.id)
  const sourceReady = item.source.pageUrl !== 'TO_BE_ADDED'
  const cycleRate = () => { const index = audio.speeds.indexOf(audio.rate); audio.setPlaybackRate(audio.speeds[(index + 1) % audio.speeds.length]) }
  return <div className='dark-screen'><Img src={item.image} label='' className='bgimg' /><div className='veil' /><div className='inner'>
    <div className='player-top'><button className='iconbtn' onClick={back} aria-label='Đóng trình phát'><Icon name='down' /></button><span className='grow' /><button className='iconbtn' onClick={() => audio.toggleFavorite(item.id)} aria-label={marked ? 'Bỏ lưu' : 'Lưu'} aria-pressed={marked}><Icon name='heart' fill={marked} /></button><button className='iconbtn' onClick={() => go('audio', item.slug)} aria-label='Xem chi tiết'><Icon name='more' /></button></div>
    <div className='grow player-art'><Img src={item.image} label={item.title} warm style={{ width: 210, height: 210, borderRadius: 18 }} /></div>
    <h2 className='h1 center' style={{ fontSize: 24 }}>{item.title}</h2><div className='tc center'>{item.teacher}</div>
    {audio.error && <p className='player-error' role='status'>{audio.error}</p>}
    <div style={{ marginTop: 22 }}><Scrubber pos={audio.currentTime} total={audio.duration || item.duration || 0} onSeek={audio.seekTo} /></div>
    <div className='transport player-transport'><button onClick={audio.previous} aria-label='Bài trước'><Icon name='back' size={21} /></button><button onClick={() => audio.seek(-15)} aria-label='Lùi 15 giây'><Icon name='back15' size={24} /></button><button className='primary' onClick={() => audio.currentId === item.id ? audio.toggle() : audio.play(item.id, audioService.getAll())} aria-label={audio.playing ? 'Tạm dừng' : 'Phát'}><Icon name={audio.currentId === item.id && audio.playing ? 'pause' : 'play'} size={28} fill /></button><button onClick={() => audio.seek(15)} aria-label='Tiến 15 giây'><Icon name='fwd15' size={24} /></button><button onClick={audio.next} aria-label='Bài tiếp theo'><Icon name='chev' size={21} /></button></div>
    <div className='player-meta-actions'><button onClick={cycleRate} aria-label='Tốc độ phát'>{audio.rate}×</button><button onClick={() => audio.toggleFavorite(item.id)}><Icon name='bookmark' size={18} /> {marked ? 'Đã lưu' : 'Lưu'}</button><button onClick={() => go('audio', item.slug)}><Icon name='note' size={18} /> Thông tin</button></div>
    <div className='player-source'>Nguồn: {item.source.name}{sourceReady && <> · <a href={item.source.pageUrl} target='_blank' rel='noreferrer'>Nội dung gốc</a></>}</div>
  </div></div>
}
