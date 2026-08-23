import { clock } from '../lib/format.js'

export default function Scrubber({ pos, total, onSeek }) {
  const pct = total ? Math.min(100, (pos / total) * 100) : 0
  const handle = e => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    onSeek(Math.max(0, Math.min(1, x)) * total)
  }
  return (
    <div>
      <div className="scrub" onClick={handle} role="slider"
        aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.floor(pos)}
        aria-label="Playback position" tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'ArrowRight') onSeek(Math.min(total, pos + 15))
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, pos - 15))
        }}>
        <div className="track">
          <div className="fill" style={{ width: `${pct}%` }} />
          <div className="knob" style={{ left: `${pct}%` }} />
        </div>
      </div>
      <div className="times"><span>{clock(pos)}</span><span>{clock(total)}</span></div>
    </div>
  )
}
