/** @format */

import { useApp } from '../lib/store.jsx'
import Icon from './Icon.jsx'

export default function Footer() {
  const { lang, setLang, switchTab, go } = useApp()
  const year = new Date().getFullYear()

  const copy =
    lang === 'en'
      ? {
          brandTitle: 'Con Đường Xưa',
          brandSubtitle: 'Original Buddhist Path',
          description: 'A calm place for reflection, learning, and daily practice.',
          practice: 'Practice',
          about: 'About',
          links: {
            meditation: 'Meditation',
            teachings: 'Teachings',
            library: 'Library',
            about: 'About us',
            contact: 'Contact',
            privacy: 'Privacy',
          },
          footerNote: `© ${year} Con Đường Xưa`,
          languageLabel: 'Language',
          vi: 'Tiếng Việt',
          en: 'English',
        }
      : {
          brandTitle: 'Con Đường Xưa',
          brandSubtitle: 'Đạo Phật Nguyên Thủy',
          description: 'Nơi để tĩnh tâm, học Pháp và thực hành mỗi ngày.',
          practice: 'Thực hành',
          about: 'Về chúng tôi',
          links: {
            meditation: 'Thiền tập',
            teachings: 'Nghe Pháp',
            library: 'Thư viện',
            about: 'Giới thiệu',
            contact: 'Liên hệ',
            privacy: 'Riêng tư',
          },
          footerNote: `© ${year} Con Đường Xưa`,
          languageLabel: 'Ngôn ngữ',
          vi: 'Tiếng Việt',
          en: 'English',
        }

  return (
    <footer className='site-footer'>
      <div className='footer-inner'>
        <div className='footer-top'>
          <div className='footer-brand'>
            <div className='footer-logo'>
              <div className='footer-logo-mark'>☸</div>
              <div className='footer-brand-copy'>
                <div className='footer-brand-name'>{copy.brandTitle}</div>
                <div className='footer-brand-subtitle'>{copy.brandSubtitle}</div>
              </div>
            </div>
            <p className='footer-description'>{copy.description}</p>
          </div>

          <div className='footer-column'>
            <h4>{copy.practice}</h4>
            <button type='button' className='footer-link' onClick={() => switchTab('meditate')}>
              <Icon name='heart' size={13} />
              {copy.links.meditation}
            </button>
            <button type='button' className='footer-link' onClick={() => switchTab('listen')}>
              <Icon name='ear' size={13} />
              {copy.links.teachings}
            </button>
            <button type='button' className='footer-link' onClick={() => switchTab('library')}>
              <Icon name='book' size={13} />
              {copy.links.library}
            </button>
          </div>

          <div className='footer-column'>
            <h4>{copy.about}</h4>
            <button type='button' className='footer-link' onClick={() => go('about')}>
              {copy.links.about}
            </button>
            <a href='#' className='footer-link'>
              {copy.links.contact}
            </a>
            <a href='#' className='footer-link'>
              {copy.links.privacy}
            </a>
          </div>
        </div>

        <div className='footer-divider' />

        <div className='footer-bottom'>
          <div>{copy.footerNote}</div>
          <div className='footer-bottom-links' aria-label={copy.languageLabel}>
            <button type='button' aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>
              {copy.vi}
            </button>
            <span>·</span>
            <button type='button' aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
              {copy.en}
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
