import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { audioService } from '../services/audioService.js'
import { useAudio } from '../lib/audio.jsx'
import { useApp } from '../lib/store.jsx'
import { hasPlayableAudio } from '../services/audioStorage.js'
import { isSafeWebUrl } from '../services/contentValidation.js'
import { uiText } from '../lib/format.js'

export default function AudioDetail({ slug }) {
  const { go, lang } = useApp()
  const copy = uiText(lang).audioDetail
  const { play, favorites, toggleFavorite } = useAudio()
  const item = audioService.getBySlug(slug)
  if (!item) return <><AppBar title={copy.content} /><div className='empty' role='status'>{copy.notFound}</div></>
  const sourceReady = isSafeWebUrl(item.source.pageUrl)
  const playable = hasPlayableAudio(item)
  return <><AppBar title={copy.title} /><div className='scroll has-mini audio-detail'>
    <Img src={item.image} alt={item.title} label={item.title} rounded className='audio-detail__art' />
    <h2 className='h1'>{item.title}</h2><p className='tc'>{item.teacher || (item.category === 'chanting' ? item.collection : copy.unknown)}</p><p className='tm'>{copy.categories[item.category]} · {copy.languages[item.language]}</p>
    <div className='audio-detail__actions'><button className='btn btn-primary' disabled={!playable} onClick={() => { if (play(item.id, audioService.getPlayable())) go('player', item.id) }}><Icon name='play' size={17} fill /> {playable ? copy.play : copy.unavailable}</button><button className='btn btn-ghost' aria-pressed={favorites.has(item.id)} onClick={() => toggleFavorite(item.id)}><Icon name='bookmark' size={17} fill={favorites.has(item.id)} /> {favorites.has(item.id) ? copy.saved : copy.save}</button></div>
    <div className='divider' /><div className='sec'>{copy.description}</div><p className='audio-detail__copy'>{item.description || copy.descriptionPending}</p>
    {item.teacherId && <><div className='sec'>{copy.teacher}</div><button className='card row' onClick={() => go('teacher', item.teacherId)}><span className='method-icon'><Icon name='user' size={18} /></span><span className='grow tl'>{item.teacher || copy.unknown}</span><Icon name='chev' size={17} /></button></>}
    <div className='source-card'><span className='tm'>{copy.source}</span><strong>{copy.sourceLabel}: {item.source.name}</strong><p>{item.attribution}</p>{sourceReady ? <a href={item.source.pageUrl} target='_blank' rel='noopener noreferrer'>{copy.original} →</a> : <span className='tc'>{copy.sourcePending}</span>}</div>
  </div></>
}
