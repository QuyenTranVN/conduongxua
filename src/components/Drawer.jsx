/** @format */

import { useEffect, useState } from 'react'
import { uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { clearAppLocalData } from '../services/localStorageService.js'
import Icon from './Icon.jsx'

export default function Drawer() {
  const { drawer, setDrawer, theme, setTheme, lang, setLang, go } = useApp()
  const [on, setOn] = useState(false)
  const nextLang = lang === 'vi' ? 'en' : 'vi'
  const copy = uiText(lang)
  const labels = lang === 'vi'
    ? { settings: 'Cài đặt', about: 'Giới thiệu', contact: 'Liên hệ', privacy: 'Quyền riêng tư', clear: 'Xóa dữ liệu trên thiết bị', confirm: 'Xóa tiến trình, nội dung đã lưu và các tùy chọn trên thiết bị này?' }
    : { settings: 'Settings', about: 'About', contact: 'Contact', privacy: 'Privacy', clear: 'Clear local data', confirm: 'Clear progress, saved content, and preferences on this device?' }
  const open = (route) => { setDrawer(false); go(route) }
  const clearData = () => {
    if (!window.confirm(labels.confirm)) return
    clearAppLocalData()
    window.location.reload()
  }
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
        aria-label={labels.settings}
      >
        <div className='h2' style={{ marginBottom: 18 }}>{labels.settings}</div>
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
        <div className='divider' />
        <button className='row' style={{ padding: '12px 0' }} onClick={() => open('about')}><Icon name='note' size={20} /><span className='grow tl'>{labels.about}</span><Icon name='chev' size={17} /></button>
        <button className='row' style={{ padding: '12px 0' }} onClick={() => open('contact')}><Icon name='mail' size={20} /><span className='grow tl'>{labels.contact}</span><Icon name='chev' size={17} /></button>
        <button className='row' style={{ padding: '12px 0' }} onClick={() => open('privacy')}><Icon name='note' size={20} /><span className='grow tl'>{labels.privacy}</span><Icon name='chev' size={17} /></button>
        <div className='divider' />
        <button className='row' style={{ padding: '12px 0' }} onClick={clearData}><Icon name='close' size={20} /><span className='grow tl'>{labels.clear}</span></button>
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
