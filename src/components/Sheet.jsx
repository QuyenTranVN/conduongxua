import { useEffect, useState } from 'react'

export default function Sheet({ open, onClose, children }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!open) return setOn(false)
    const id = requestAnimationFrame(() => setOn(true))
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => { cancelAnimationFrame(id); window.removeEventListener('keydown', esc) }
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className={`scrim ${on ? 'on' : ''}`} onClick={onClose} />
      <div className={`sheet ${on ? 'on' : ''}`} role="dialog" aria-modal="true">
        <div className="grip" />
        {children}
      </div>
    </>
  )
}
