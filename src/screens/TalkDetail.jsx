import { useState } from 'react'
import Icon from '../components/Icon.jsx'
import Img from '../components/Img.jsx'
import { AppBar } from '../components/Chrome.jsx'
import { useApp } from '../lib/store.jsx'
import { talkById, teacherById, TALKS } from '../data/content.js'
import { useAudio } from '../lib/audio.jsx'
import { audioService } from '../services/audioService.js'

const TABS = ['About', 'Transcript', 'Topics']

export default function TalkDetail({ id }) {
  const { go, bookmarks, toggleBookmark } = useApp()
  const { play } = useAudio()
  const talk = talkById(id)
  const teacher = teacherById(talk.teacher)
  const [tab, setTab] = useState('About')
  const related = TALKS.filter(t => t.id !== id && t.topics.some(x => talk.topics.includes(x))).slice(0, 4)
  const marked = bookmarks.has(talk.id)
  const playable = audioService.getById(talk.id)

  return (
    <>
      <AppBar title={talk.kind === 'video' ? 'Watch' : 'Talk'} />
      <div className="scroll flush has-mini">
        <div style={{ position: 'relative' }}>
          <Img src={talk.img} label={talk.title} warm style={{ width: '100%', height: 218, display: 'block' }} />
          {playable && <button onClick={() => { play(talk.id); go('player', talk.id) }}
            aria-label="Play"
            style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
            <span style={{ width: 62, height: 62, borderRadius: 999, background: 'rgba(255,255,255,.92)',
              color: 'var(--green-900)', display: 'grid', placeItems: 'center' }}>
              <Icon name="play" size={24} fill />
            </span>
          </button>}
        </div>

        <div style={{ padding: '0 var(--s5)' }}>
          <h2 className="h1" style={{ fontSize: 23, marginTop: 18 }}>{talk.title}</h2>
          <div className="tc" style={{ marginTop: 3 }}>{teacher?.name}</div>
          <div className="tm" style={{ marginTop: 2 }}>{talk.minutes} minutes · English</div>

          <div className="chips" style={{ marginTop: 14 }}>
            <button className="chip" aria-pressed={marked} onClick={() => toggleBookmark(talk.id)}>
              <Icon name="bookmark" size={14} fill={marked} /> {marked ? 'Saved' : 'Save'}
            </button>
            <button className="chip"><Icon name="list" size={14} /> Playlist</button>
            <button className="chip"><Icon name="share" size={14} /> Share</button>
          </div>

          <div className="tabs" style={{ marginTop: 18 }} role="tablist">
            {TABS.map(t => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}>{t}</button>
            ))}
          </div>

          {tab === 'About' && <p style={{ marginTop: 16, lineHeight: 1.65, fontSize: 15 }}>{talk.about}</p>}
          {tab === 'Transcript' && (
            <div className="empty" style={{ padding: '32px 0' }}>
              No transcript for this talk yet. Transcripts are added as they are produced.
            </div>
          )}
          {tab === 'Topics' && (
            <div className="chips" style={{ marginTop: 16 }}>
              {talk.topics.map(t => <span key={t} className="pill">{t}</span>)}
            </div>
          )}

          {talk.licence === 'link' && (
            <p className="hero-note">
              Source: {talk.source}. Link-only content opens at the source — no background playback
              and no offline download until permission is granted.
            </p>
          )}

          {related.length > 0 && (
            <>
              <div className="sec">Related teachings</div>
              <div className="grid2">
                {related.map(r => (
                  <button key={r.id} onClick={() => go('talk', r.id)} style={{ textAlign: 'left' }}>
                    <Img src={r.img} label={r.title} rounded warm style={{ width: '100%', height: 92 }} />
                    <div className="tc" style={{ marginTop: 6, color: 'var(--text)' }}>{r.title}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          <div style={{ height: 24 }} />
        </div>
      </div>
    </>
  )
}
