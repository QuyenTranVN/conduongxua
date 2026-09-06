import { useMemo, useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { audioService } from '../services/audioService.js'
import { useAudio } from '../lib/audio.jsx'
import { useApp } from '../lib/store.jsx'
import { clock, uiText } from '../lib/format.js'

const CATEGORIES = ['all', 'dhamma', 'meditation', 'chanting', 'audiobook']

function ProgressBar({ current = 0, total = 0 }) {
  const value = total > 0 ? Math.min(100, Math.max(0, (current / total) * 100)) : 0
  return <div className='listen-progress' aria-hidden='true'><span style={{ width: `${value}%` }} /></div>
}

function AudioRow({ item, onPlay, onDetail, progress, isPlaying, copy, compact = false }) {
  const subtitle = item.teacher || (item.category === 'chanting' ? item.collection : copy.unknownTeacher)
  const total = progress?.duration || item.duration || 0
  return <div className={`audio-row${isPlaying ? ' is-playing' : ''}${compact ? ' is-compact' : ''}`}>
    <button className={`audio-row__play${isPlaying ? ' is-playing' : ''}`} onClick={() => onPlay(item)} aria-label={`${isPlaying ? copy.pause : copy.play} ${item.title}`} aria-pressed={isPlaying}>
      <Icon name={isPlaying ? 'pause' : 'play'} size={isPlaying ? 18 : 16} fill={!isPlaying} />
    </button>
    <button className='audio-row__content' onClick={() => onDetail(item)} aria-label={`${copy.openDetails}: ${item.title}`}>
      {!compact && <Img src={item.image} label={item.title} rounded className='audio-row__image' />}
      <span className='grow audio-row__copy'><span className='tl tr'>{item.title}</span><span className='tc tr'>{subtitle}</span><span className='tm'>{progress ? `${clock(progress.currentTime)} / ${clock(total)}` : total ? clock(total) : copy.durationPending}</span>{progress && <ProgressBar current={progress.currentTime} total={total} />}</span>
      <Icon name='chev' size={16} className='audio-row__chevron' />
    </button>
  </div>
}

function ContinueCard({ item, progress, isPlaying, onPlay, onDetail, copy }) {
  const total = progress.duration || item.duration || 0
  return <div className='continue-card card'>
    <button className='continue-card__content' onClick={() => onDetail(item)} aria-label={`${copy.openDetails}: ${item.title}`}>
      <Img src={item.image} label={item.title} rounded className='continue-card__image' />
      <span className='grow'><strong className='tr'>{item.title}</strong><span className='tc tr'>{item.teacher || item.collection || copy.unknownTeacher}</span><span className='tm'>{clock(progress.currentTime)} / {clock(total)}</span><ProgressBar current={progress.currentTime} total={total} /></span>
    </button>
    <button className='btn btn-primary continue-card__action' onClick={() => onPlay(item)} aria-label={`${isPlaying ? copy.pause : copy.continueAction} ${item.title}`}><Icon name={isPlaying ? 'pause' : 'play'} size={17} fill={!isPlaying} /> {isPlaying ? copy.pause : copy.continueAction}</button>
  </div>
}

function PlaylistSection({ id, title, description, icon, items, copy, expanded, onToggle, onStart, onPlayItem, onDetail, currentId, playing, getProgress }) {
  const totalDuration = items.reduce((total, item) => total + (item.duration || 0), 0)
  return <article className={`listen-playlist card${expanded ? ' is-expanded' : ''}`}>
    <div className='listen-playlist__summary'>
      <span className='listen-playlist__art'><Icon name={icon} size={23} /></span>
      <span className='grow'><strong>{title}</strong><span className='tc'>{description}</span><span className='tm'>{items.length} {copy.items} · {clock(totalDuration)}</span></span>
    </div>
    <div className='listen-playlist__actions'>
      <button className='btn btn-primary listen-playlist__start' onClick={() => onStart(items[0], items)} aria-label={`${copy.playAll}: ${title}`}><Icon name='play' size={16} fill /><span>{copy.playAll}</span></button>
      <button className='btn btn-ghost listen-playlist__toggle' aria-expanded={expanded} aria-controls={`playlist-${id}`} onClick={onToggle}><span>{expanded ? copy.collapsePlaylist : copy.viewPlaylist}</span><Icon name='down' size={16} className={expanded ? 'is-open' : ''} /></button>
    </div>
    {expanded && <div id={`playlist-${id}`} className='listen-playlist__tracks'>{items.map((item) => <AudioRow compact copy={copy} key={item.id} item={item} progress={getProgress(item.id)} isPlaying={currentId === item.id && playing} onPlay={(audio) => onPlayItem(audio, items)} onDetail={onDetail} />)}</div>}
  </article>
}

export default function Listen() {
  const { go, lang } = useApp()
  const copy = uiText(lang).audioBrowse
  const { play, playFromStart, toggle, currentId, playing, continueItems, getProgress, error } = useAudio()
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [activePlaylist, setActivePlaylist] = useState(null)
  const chantingItems = useMemo(() => audioService.getByCategory('chanting'), [])
  const suttaItems = useMemo(() => audioService.getByCategory('sutta'), [])
  const goenkaItems = useMemo(() => audioService.getAll().filter((item) => item.collection === 'Tứ Niệm Xứ Giảng Giải'), [])
  const collections = useMemo(() => [
    { id: 'chanting', category: 'chanting', title: copy.playlist, description: copy.playlistDescription, icon: 'bell', items: chantingItems },
    { id: 'suttas', category: 'dhamma', title: copy.suttaPlaylist, description: copy.suttaPlaylistDescription, icon: 'book', items: suttaItems },
    { id: 'goenka', category: 'dhamma', title: copy.goenkaPlaylist, description: copy.goenkaPlaylistDescription, icon: 'list', items: goenkaItems },
  ], [copy, chantingItems, suttaItems, goenkaItems])
  const visibleCollections = !query ? collections.filter((collection) => category === 'all' || collection.category === category) : []
  const collectionIds = useMemo(() => new Set(collections.flatMap((collection) => collection.items.map((item) => item.id))), [collections])
  const matchingItems = useMemo(() => {
    const matches = audioService.search(query, { category: category === 'all' ? undefined : category })
    const matchingSuttas = category === 'dhamma' ? audioService.search(query, { category: 'sutta' }) : []
    const withSuttaTeachings = category === 'dhamma' ? [...matches, ...matchingSuttas.filter((item) => !matches.some((match) => match.id === item.id))] : matches
    return query ? withSuttaTeachings : withSuttaTeachings.filter((item) => !collectionIds.has(item.id))
  }, [query, category, collectionIds])
  const continueItem = continueItems[0]
  const start = (item, queue = matchingItems) => play(item.id, queue)
  const startFromBeginning = (item, queue) => playFromStart(item.id, queue)
  const toggleItem = (item, queue = matchingItems) => currentId === item.id ? toggle() : start(item, queue)
  const openDetail = (audio) => go('audio', audio.slug)
  const changeCategory = (value) => {
    setCategory(value)
    setActivePlaylist(value === 'chanting' ? 'chanting' : null)
  }

  return <><AppBar align='left' title={copy.title} right={<span className='iconbtn spacer' />} /><main className='scroll has-mini listen-page buddhist-page-background'>
    <p className='listen-page__intro'>{copy.subtitle}</p>
    <label className='audio-search'><Icon name='search' size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} aria-label={copy.searchLabel} /></label>
    {error && <div className='audio-error' role='status' aria-live='polite'><span>{error}</span>{currentId && <button onClick={() => play(currentId)}>{copy.retry}</button>}</div>}

    {continueItem && <section className='listen-section'><h2 className='sec'>{copy.continue}</h2><ContinueCard item={continueItem.item} progress={continueItem.progress} isPlaying={currentId === continueItem.item.id && playing} onPlay={toggleItem} onDetail={openDetail} copy={copy} /></section>}

    <nav className='listen-categories' aria-label={copy.categoriesLabel}>{CATEGORIES.map((value) => <button className='chip' key={value} aria-pressed={category === value} onClick={() => changeCategory(value)}>{copy.categories[value]}</button>)}</nav>

    {visibleCollections.length > 0 && <section className='listen-section'><h2 className='sec'>{copy.collections}</h2><div className='listen-collections'>{visibleCollections.map((collection) => <PlaylistSection key={collection.id} {...collection} copy={copy} expanded={activePlaylist === collection.id} onToggle={() => setActivePlaylist((current) => current === collection.id ? null : collection.id)} onStart={startFromBeginning} onPlayItem={toggleItem} onDetail={openDetail} currentId={currentId} playing={playing} getProgress={getProgress} />)}</div></section>}

    <section className='listen-section'><h2 className='sec'>{category === 'all' ? copy.allAudio : copy.categories[category]}</h2>
      <div className={`card audio-list${matchingItems.length > 7 ? ' audio-list--scroll' : ''}`}>{matchingItems.length ? matchingItems.map((item) => <AudioRow copy={copy} key={item.id} item={item} progress={getProgress(item.id)} isPlaying={currentId === item.id && playing} onPlay={toggleItem} onDetail={openDetail} />) : <div className='listen-empty'><strong>{copy.empty}</strong><span>{copy.emptyHint}</span></div>}</div>
    </section>
  </main></>
}
