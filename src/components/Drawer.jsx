/** @format */

import { useEffect, useState } from 'react'
import { USER } from '../data/content.js'
import { uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import Icon from './Icon.jsx'
import Img from './Img.jsx'

const LINKS = [
  ['lotus', 'Daily Practice'],
  ['bookmark', 'Bookmarks'],
  ['clock', 'History'],
  ['download', 'Downloads'],
  ['list', 'Playlists'],
  ['note', 'Notes'],
]

export default function Drawer() {
  const { drawer, setDrawer, theme, setTheme, lang, setLang } = useApp()
  const [on, setOn] = useState(false)
  const nextLang = lang === 'vi' ? 'en' : 'vi'
  const copy = uiText(lang)
  useEffect(() => {
    if (!drawer) return setOn(false)
    const id = requestAnimationFrame(() => setOn(true))
    const esc = (e) => e.key === 'Escape' && setDrawer(false)
    window.addEventListener('keydown', esc)
    return () => {
      cancelAnimationFrame(id)
      window.removeEventListener('keydown', esc)
    }
  }, [drawer, setDrawer])
  if (!drawer) return null
  return (
    <>
      <div className={`scrim ${on ? 'on' : ''}`} onClick={() => setDrawer(false)} />
      <aside
        className={`drawer ${on ? 'on' : ''}`}
        role='dialog'
        aria-modal='true'
        aria-label='Your profile'
      >
        <div className='streak'>
          <Img
            src='/images/teachers/user.jpg'
            label='You'
            round
            style={{ width: 46, height: 46 }}
          />
          <div>
            <div className='h3'>{USER.name}</div>
            <div className='tc'>
              {USER.rank} · {USER.streakDays} days
            </div>
          </div>
        </div>
        <div style={{ marginTop: 26 }}>
          {LINKS.map(([icon, label]) => (
            <button
              key={label}
              className='row'
              style={{ padding: '12px 0' }}
              onClick={() => setDrawer(false)}
            >
              <Icon name={icon} size={20} />
              <span className='grow tl'>{label}</span>
            </button>
          ))}
        </div>
        <div className='divider' />
        <button className='row' style={{ padding: '12px 0' }}>
          <Icon name='gear' size={20} />
          <span className='grow tl'>Settings</span>
        </button>
        <button className='row' style={{ padding: '12px 0' }} onClick={() => setLang(nextLang)}>
          <Icon name='globe' size={20} />
          <span className='grow tl'>{copy.drawer.language}</span>
          <span className='tc'>{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
        </button>
        <div className='row' style={{ padding: '12px 0' }}>
          <Icon name='moon' size={20} />
          <span className='grow tl'>{copy.drawer.darkMode}</span>
          <button
            className='switch'
            aria-pressed={theme === 'dark'}
            aria-label='Dark mode'
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
        </div>
        <svg
          className='lotus'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='0.7'
        >
          <path d='M12 4c2 2.6 3.1 4.8 3.1 7 0 2.5-1.4 4.6-3.1 6-1.7-1.4-3.1-3.5-3.1-6C8.9 8.8 10 6.6 12 4M12 17c-2.7 1.7-6.2 1.5-8.3-.8 1.3-2.4 3.8-3.6 6.3-3.1M12 17c2.7 1.7 6.2 1.5 8.3-.8-1.3-2.4-3.8-3.6-6.3-3.1' />
        </svg>
      </aside>
    </>
  )
}
