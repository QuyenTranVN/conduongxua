import { useEffect, useRef, useState } from 'react'

export default function Sheet({ open, onClose, children, label = 'Options', className = '' }) {
  const [on, setOn] = useState(false)
  const dialogRef = useRef(null)
  const returnFocus = useRef(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  useEffect(() => {
    if (!open) return setOn(false)
    returnFocus.current = document.activeElement
    let focusId
    const id = requestAnimationFrame(() => {
      setOn(true)
      focusId = requestAnimationFrame(() => {
        dialogRef.current?.querySelector('button, input, [tabindex]')?.focus({ preventScroll: true })
      })
    })
    const esc = e => e.key === 'Escape' && onCloseRef.current()
    window.addEventListener('keydown', esc)
    return () => { cancelAnimationFrame(id); cancelAnimationFrame(focusId); window.removeEventListener('keydown', esc); returnFocus.current?.focus?.() }
  }, [open])
  if (!open) return null
  return (
    <>
      <div className={`scrim ${on ? 'on' : ''}`} onClick={onClose} />
      <div ref={dialogRef} className={`sheet ${className} ${on ? 'on' : ''}`.trim()} role="dialog" aria-modal="true" aria-label={label}>
        <div className="grip" />
        {children}
      </div>
    </>
  )
}
