/** @format */

import { uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { useAudio } from '../lib/audio.jsx'
import Icon from './Icon.jsx'
import Img from './Img.jsx'

export function AppBar({ title, left, right, align = 'center' }) {
  const { stack, back, setDrawer, lang } = useApp()
  const deep = stack.length > 0
  const copy = uiText(lang)
  return (
    <header className={`appbar ${align === 'left' ? 'left' : ''}`}>
      {left ??
        (deep ? (
          <button className='iconbtn' onClick={back} aria-label={lang === 'vi' ? 'Quay lại' : 'Back'}>
            <Icon name='back' />
          </button>
        ) : (
          <button className='iconbtn' onClick={() => setDrawer(true)} aria-label={lang === 'vi' ? 'Cài đặt' : 'Settings'}>
            <Icon name='gear' />
          </button>
        ))}
      <h1>{title}</h1>
      {right ?? <span className='iconbtn spacer' />}
    </header>
  )
}

const TABS = [
  { id: 'home', icon: 'home' },
  { id: 'meditate', icon: 'lotus' },
  { id: 'listen', icon: 'ear' },
  { id: 'teachers', icon: 'user' },
]

export function TabBar() {
  const { tab, switchTab, lang } = useApp()
  const copy = uiText(lang)
  const labels = {
    home: copy.nav.home,
    meditate: copy.nav.meditate,
    listen: copy.nav.listen,
    teachers: copy.nav.teachers,
  }
  return (
    <nav className='tabbar' aria-label={lang === 'vi' ? 'Điều hướng chính' : 'Main navigation'}>
      {TABS.map((t) => (
        <button
          key={t.id}
          onClick={() => switchTab(t.id)}
          aria-current={tab === t.id ? 'page' : undefined}
        >
          <Icon name={t.icon} size={22} />
          <span>{labels[t.id]}</span>
        </button>
      ))}
    </nav>
  )
}

export function MiniPlayer() {
  const { go, route, lang } = useApp()
  const { currentItem, playing, toggle, currentTime, duration, seek } = useAudio()
  if (!currentItem || route.name === 'player') return null
  const copy = uiText(lang).listen
  return (
    <div className='mini'>
      <div className='bar' style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
      <Img src={currentItem.image} label={currentItem.title} rounded style={{ width: 42, height: 42 }} />
      <button className='grow' onClick={() => go('player', currentItem.id)} style={{ minWidth: 0 }}>
        <div className='tl tr'>{currentItem.title}</div>
        <div className='tc tr'>{currentItem.teacher}</div>
      </button>
      <button className='mini-skip' onClick={() => seek(-15)} aria-label='Lùi 15 giây'><Icon name='back15' size={19} /></button>
      <button className='iconbtn' onClick={toggle} aria-label={playing ? copy.pause : copy.resumePlay}>
        <Icon name={playing ? 'pause' : 'play'} fill={!playing} />
      </button>
      <button className='mini-skip' onClick={() => seek(15)} aria-label='Tiến 15 giây'><Icon name='fwd15' size={19} /></button>
    </div>
  )
}
