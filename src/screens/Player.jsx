import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import Scrubber from '../components/Scrubber.jsx'
import { useAudio } from '../lib/audio.jsx'
import { useApp } from '../lib/store.jsx'
import { audioService } from '../services/audioService.js'
import { isSafeWebUrl } from '../services/contentValidation.js'
import { uiText } from '../lib/format.js'

export default function Player({ id }) {
  const { back, go, lang } = useApp()
  const copy = uiText(lang).player
  const audio = useAudio()
  const item = audioService.getById(id)
  if (!item) return <div className='dark-screen'><div className='inner'><button className='iconbtn' onClick={back} aria-label={copy.close}><Icon name='down' /></button><div className='empty' role='status'>{copy.missing}</div></div></div>
  const sourceReady = isSafeWebUrl(item.source.pageUrl)
  const cycleRate = () => { const index = audio.speeds.indexOf(audio.rate); audio.setPlaybackRate(audio.speeds[(index + 1) % audio.speeds.length]) }
  return <div className='dark-screen'><Img src={item.image} label='' className='bgimg' /><div className='veil' /><div className='inner'>
    <div className='player-top'><button className='iconbtn' onClick={back} aria-label={copy.close}><Icon name='down' /></button><span className='grow' /><button className='iconbtn' onClick={() => go('audio', item.slug)} aria-label={copy.details}><Icon name='more' /></button></div>
    <div className='grow player-art'><Img src={item.image} label={item.title} warm style={{ width: 210, height: 210, borderRadius: 18 }} /></div>
    <h2 className='h1 center' style={{ fontSize: 24 }}>{item.title}</h2><div className='tc center'>{item.teacher}</div>
    {audio.error && <p className='player-error' role='status' aria-live='assertive'>{audio.error}</p>}
    <div style={{ marginTop: 22 }}><Scrubber pos={audio.currentTime} total={audio.duration || item.duration || 0} onSeek={audio.seekTo} label={copy.speed === 'Playback speed' ? 'Playback position' : 'Vị trí phát'} /></div>
    <div className='transport player-transport'><button onClick={audio.previous} aria-label={copy.previous} disabled={!audio.queue.length || audio.queue.indexOf(item.id) <= 0}><Icon name='back' size={21} /></button><button onClick={() => audio.seek(-15)} aria-label={copy.back15}><Icon name='back15' size={24} /></button><button className='primary' onClick={() => audio.currentId === item.id ? audio.toggle() : audio.play(item.id, audioService.getPlayable())} aria-label={audio.currentId === item.id && audio.playing ? copy.pause : copy.play} aria-pressed={audio.currentId === item.id && audio.playing}><Icon name={audio.currentId === item.id && audio.playing ? 'pause' : 'play'} size={28} fill={!(audio.currentId === item.id && audio.playing)} /></button><button onClick={() => audio.seek(15)} aria-label={copy.forward15}><Icon name='fwd15' size={24} /></button><button onClick={audio.next} aria-label={copy.next} disabled={!audio.queue.length || audio.queue.indexOf(item.id) >= audio.queue.length - 1}><Icon name='chev' size={21} /></button></div>
    <div className='player-meta-actions'><button onClick={cycleRate} aria-label={copy.speed}>{audio.rate}×</button><button onClick={() => go('audio', item.slug)}><Icon name='note' size={18} /> {copy.information}</button></div>
    <div className='player-source'>{copy.source}: {item.source.name}{sourceReady && <> · <a href={item.source.pageUrl} target='_blank' rel='noopener noreferrer'>{copy.original}</a></>}</div>
  </div></div>
}
