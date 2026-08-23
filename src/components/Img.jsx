import { useState } from 'react'

/**
 * Renders the real photograph when the file exists in /public/images,
 * and a tinted placeholder carrying the caption when it does not.
 * This is why the project runs before you have any licensed imagery.
 */
export default function Img({ src, alt = '', label, className = '', warm = false, style, round, rounded }) {
  const [failed, setFailed] = useState(!src)
  const cls = ['img', warm ? 'warm' : '', round ? 'round' : '', rounded ? 'rounded' : '', className]
    .filter(Boolean).join(' ')
  return (
    <span className={cls} style={style} role={alt ? 'img' : undefined} aria-label={alt || undefined}>
      {!failed && <img src={src} alt={alt} onError={() => setFailed(true)} loading="lazy" />}
      {failed && <span className="fallback">{label ?? alt ?? ''}</span>}
    </span>
  )
}
