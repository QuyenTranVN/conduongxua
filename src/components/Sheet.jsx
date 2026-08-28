import { useEffect, useRef, useState } from 'react'

export default function Sheet({ open, onClose, children, label = 'Options' }) {
  const [on, setOn] = useState(false)
  const dialogRef = useRef(null)
  const returnFocus = useRef(null)
  useEffect(() => {
    if (!open) return setOn(false)
    returnFocus.current = document.activeElement
    const id = requestAnimationFrame(() => setOn(true))
    const esc = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    const focusId = requestAnimationFrame(() => dialogRef.current?.querySelector('button, input, [tabindex]')?.focus())
    return () => { cancelAnimationFrame(id); cancelAnimationFrame(focusId); window.removeEventListener('keydown', esc); returnFocus.current?.focus?.() }
  }, [open, onClose])
  if (!open) return null
  return (
    <>
      <div className={`scrim ${on ? 'on' : ''}`} onClick={onClose} />
      <div ref={dialogRef} className={`sheet ${on ? 'on' : ''}`} role="dialog" aria-modal="true" aria-label={label}>
        <div className="grip" />
        {children}
      </div>
    </>
  )
}
