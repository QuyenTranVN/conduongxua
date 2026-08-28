/** @format */

import { useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { LIBRARY_SHELVES, TALKS, teacherById } from '../data/content.js'
import { BOOKS } from '../data/books.js'
import { uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { useAudio } from '../lib/audio.jsx'
import { audioService } from '../services/audioService.js'

const TABS = [
  { id: 'all', vi: 'Tất cả', en: 'All' },
  { id: 'talks', vi: 'Pháp thoại', en: 'Talks' },
  { id: 'books', vi: 'Sách', en: 'Books' },
]

function BookItem({ book, onOpen }) {
  return <button className='row library-book' onClick={onOpen}>
    <span className='library-book__cover'><Icon name='book' size={23} /></span>
    <span className='grow'>
      <span className='tl tr' style={{ display: 'block' }}>{book.title}</span>
      {book.subtitle && <span className='tc tr' style={{ display: 'block' }}>{book.subtitle}</span>}
      <span className='tm' style={{ display: 'block', marginTop: 5 }}>{book.author} · {book.language}</span>
      <span className='tc' style={{ display: 'block', marginTop: 2 }}>{book.contributor}</span>
    </span>
    <Icon name='chev' size={17} style={{ color: 'var(--green-700)' }} />
  </button>
}

export default function Library() {
  const { go, bookmarks, downloads, lang } = useApp()
  const { play } = useAudio()
  const copy = uiText(lang)
  const [tab, setTab] = useState('all')
  const talks = TALKS.filter((item) => item.kind === 'talk')
  const showTalks = tab === 'all' || tab === 'talks'
  const showBooks = tab === 'all' || tab === 'books'
  const counts = { bookmarks: bookmarks.size, downloads: downloads.size }

  return <>
    <AppBar align='left' title={copy.nav.library} right={<button className='iconbtn' aria-label={copy.common.search}><Icon name='search' /></button>} />
    <div className='scroll has-mini library-page buddhist-page-background'>
      <div className='seg'>{TABS.map((item) => <button key={item.id} aria-pressed={tab === item.id} onClick={() => setTab(item.id)}>{lang === 'en' ? item.en : item.vi}</button>)}</div>

      <div className='card' style={{ marginTop: 16 }}>{LIBRARY_SHELVES.map((shelf) => <button key={shelf.id} className='row'><span style={{ color: 'var(--text-2)' }}><Icon name={shelf.icon} size={20} /></span><span className='grow'><span className='tl' style={{ display: 'block' }}>{shelf.label}</span><span className='tc'>{counts[shelf.id] != null ? `${counts[shelf.id]} mục` : shelf.sub}</span></span><Icon name='chev' size={18} style={{ color: 'var(--text-3)' }} /></button>)}</div>

      {showBooks && <section><div className='sec'>{lang === 'en' ? 'Books' : 'Sách'}</div><div className='card library-books'>{BOOKS.map((book) => <BookItem key={book.id} book={book} onOpen={() => go('book', book.id)} />)}</div></section>}

      {showTalks && <section><div className='sec'>{lang === 'en' ? 'Dhamma talks' : 'Pháp thoại'}</div><div className='card'>{talks.map((talk) => {
        const teacher = teacherById(talk.teacher)
        const audioItem = audioService.getById(talk.id)
        return <button key={talk.id} className='row' onClick={() => audioItem ? (play(talk.id), go('player', talk.id)) : go('talk', talk.id)}><Img src={talk.img} label={talk.title} rounded style={{ width: 48, height: 48 }} /><span className='grow'><span className='tl tr' style={{ display: 'block' }}>{talk.title}</span><span className='tc'>{teacher?.name} · {talk.minutes} phút</span></span><Icon name={audioItem ? 'play' : 'ear'} size={18} style={{ color: 'var(--accent)' }} fill={Boolean(audioItem)} /></button>
      })}</div></section>}
    </div>
  </>
}
