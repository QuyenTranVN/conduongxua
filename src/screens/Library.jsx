/** @format */

import { useState } from 'react'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { LIBRARY_SHELVES, LIBRARY_TABS, TALKS, teacherById } from '../data/content.js'
import { uiText } from '../lib/format.js'
import { useApp } from '../lib/store.jsx'
import { useAudio } from '../lib/audio.jsx'
import { audioService } from '../services/audioService.js'

export default function Library() {
  const { go, bookmarks, downloads, lang } = useApp()
  const { play } = useAudio()
  const copy = uiText(lang)
  const [tab, setTab] = useState('All')
  const filtered =
    tab === 'All'
      ? TALKS
      : tab === 'Talks'
        ? TALKS.filter((t) => t.kind === 'talk')
        : tab === 'Videos'
          ? TALKS.filter((t) => t.kind === 'video')
          : []

  const counts = { bookmarks: bookmarks.size, downloads: downloads.size }

  return (
    <>
      <AppBar
        align='left'
        title={copy.nav.library}
        right={
          <button className='iconbtn' aria-label={copy.common.search}>
            <Icon name='search' />
          </button>
        }
      />
      <div className='scroll has-mini'>
        <div className='seg'>
          {LIBRARY_TABS.map((t) => (
            <button key={t} aria-pressed={tab === t} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        <div className='card' style={{ marginTop: 16 }}>
          {LIBRARY_SHELVES.map((s) => (
            <button key={s.id} className='row'>
              <span style={{ color: 'var(--text-2)' }}>
                <Icon name={s.icon} size={20} />
              </span>
              <span className='grow'>
                <span className='tl' style={{ display: 'block' }}>
                  {s.label}
                </span>
                <span className='tc'>{counts[s.id] != null ? `${counts[s.id]} items` : s.sub}</span>
              </span>
              <Icon name='chev' size={18} style={{ color: 'var(--text-3)' }} />
            </button>
          ))}
        </div>

        <div className='sec'>{tab}</div>
        {filtered.length === 0 ? (
          <div className='empty'>
            Nothing here yet. Suttas, articles and books arrive once the sources are licensed.
          </div>
        ) : (
          <div className='card'>
            {filtered.map((t) => {
              const te = teacherById(t.teacher)
              const audioItem = audioService.getById(t.id)
              return (
                <button
                  key={t.id}
                  className='row'
                  onClick={() =>
                    audioItem ? (play(t.id), go('player', t.id)) : go('talk', t.id)
                  }
                >
                  <Img src={t.img} label={t.title} rounded style={{ width: 48, height: 48 }} />
                  <span className='grow'>
                    <span className='tl tr' style={{ display: 'block' }}>
                      {t.title}
                    </span>
                    <span className='tc'>
                      {te?.name} · {t.minutes} min
                    </span>
                  </span>
                  <Icon
                    name={audioItem ? 'play' : 'film'}
                    size={18}
                    style={{ color: 'var(--accent)' }}
                    fill={Boolean(audioItem)}
                  />
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
