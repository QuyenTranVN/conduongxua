import { useMemo, useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { audioService } from '../services/audioService.js'
import { useAudio } from '../lib/audio.jsx'
import { useApp } from '../lib/store.jsx'
import { clock, uiText } from '../lib/format.js'

const CATEGORIES = ['all', 'dhamma', 'sutta', 'meditation', 'chanting', 'audiobook']

function AudioRow({ item, onPlay, onDetail, progress, isPlaying, copy }) {
  return <div className='audio-row'>
    <button className='audio-row__main' onClick={() => onPlay(item)} aria-label={`${isPlaying ? copy.pause : copy.play} ${item.title}`} aria-pressed={isPlaying}>
      <Img src={item.image} label={item.title} rounded style={{ width: 52, height: 52 }} />
      <span className='grow'><span className='tl tr' style={{ display: 'block' }}>{item.title}</span><span className='tc' style={{ display: 'block' }}>{item.teacher || copy.unknownTeacher}</span><span className='tm' style={{ display: 'block', marginTop: 2 }}>{progress ? `${clock(progress.currentTime)} / ${clock(progress.duration)}` : item.duration ? `${Math.round(item.duration / 60)} min` : copy.durationPending}</span></span>
      <span className='audio-row__play' aria-hidden='true'><Icon name={isPlaying ? 'pause' : 'play'} size={16} fill={!isPlaying} /></span>
    </button>
    <button className='audio-row__detail' onClick={() => onDetail(item)} aria-label={`${copy.details}: ${item.title}`}><Icon name='more' size={18} /></button>
  </div>
}

export default function Listen() {
  const { go, lang } = useApp()
  const copy = uiText(lang).audioBrowse
  const { play, toggle, currentId, playing, continueItems, getProgress, error } = useAudio()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const items = useMemo(() => audioService.search(query, { language: 'vi', category: category === 'all' ? undefined : category }), [query, category])
  const featured = audioService.getFeatured()
  const teachers = [...new Map(audioService.getAll().filter((item) => item.teacherId).map((item) => [item.teacherId, item.teacher])).entries()]
  const start = (item) => play(item.id, items)
  const toggleItem = (item) => currentId === item.id ? toggle() : start(item)

  return <><AppBar align='left' title={copy.title} right={<span className='iconbtn spacer' />} /><div className='scroll has-mini listen-page buddhist-page-background'>
    <label className='audio-search'><Icon name='search' size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} aria-label={copy.searchLabel} /></label>
    {error && <div className='audio-error' role='status' aria-live='polite'>{error}</div>}

    {continueItems.length > 0 && <section><div className='sec'>{copy.continue}</div><div className='card'>{continueItems.slice(0, 2).map(({ item, progress }) => <AudioRow copy={copy} key={item.id} item={item} progress={progress} isPlaying={currentId === item.id && playing} onPlay={toggleItem} onDetail={(audio) => go('audio', audio.slug)} />)}</div></section>}

    <section><div className='sec'>{copy.explore}</div><div className='chips scrollx'>{CATEGORIES.map((value) => <button className='chip' key={value} aria-pressed={category === value} onClick={() => setCategory(value)}>{copy.categories[value]}</button>)}</div><div className={`card audio-list ${items.length > 6 ? 'audio-list--scroll' : ''}`}>{items.length ? items.map((item) => <AudioRow copy={copy} key={item.id} item={item} progress={getProgress(item.id)} isPlaying={currentId === item.id && playing} onPlay={toggleItem} onDetail={(audio) => go('audio', audio.slug)} />) : <div className='empty'>{copy.empty}</div>}</div></section>

    {featured.length > 0 && !query && category === 'all' && <section><div className='sec'>{copy.recommended}</div><div className='listen-featured'>{featured.map((item) => <button className='card' key={item.id} onClick={() => start(item)}><Img src={item.image} alt='' label={item.title} rounded /><span className='tl'>{item.title}</span><span className='tc'>{item.teacher}</span></button>)}</div></section>}

    {teachers.length > 0 && <section><div className='sec'>{copy.byTeacher}</div><div className='card'>{teachers.map(([id, name]) => <button className='row' key={id} onClick={() => go('teacher', id)}><span className='method-icon'><Icon name='user' size={17} /></span><span className='grow tl'>{name}</span><span className='tc'>{audioService.getByTeacher(id).length} {copy.items}</span><Icon name='chev' size={17} /></button>)}</div></section>}
  </div></>
}
