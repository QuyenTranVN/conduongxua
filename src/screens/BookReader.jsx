import { useEffect, useRef, useState } from 'react'
import * as pdfjs from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { AppBar } from '../components/Chrome.jsx'
import Icon from '../components/Icon.jsx'
import { BOOKS } from '../data/books.js'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker

const progressKey = (id) => `con-duong-xua:book-progress:${id}`

export default function BookReader({ id }) {
  const book = BOOKS.find((item) => item.id === id)
  const canvasRef = useRef(null)
  const pageWrapRef = useRef(null)
  const [document, setDocument] = useState(null)
  const [pageNumber, setPageNumber] = useState(() => {
    try { return Math.max(1, Number(localStorage.getItem(progressKey(id))) || 1) } catch { return 1 }
  })
  const [zoom, setZoom] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [renderWidth, setRenderWidth] = useState(0)

  useEffect(() => {
    if (!book) return
    let cancelled = false
    let loadedDocument = null
    const task = pdfjs.getDocument(book.fileUrl)
    task.promise.then((pdf) => {
      if (cancelled) { pdf.destroy(); return }
      loadedDocument = pdf
      setDocument(pdf)
      setPageNumber((value) => Math.min(value, pdf.numPages))
      setLoading(false)
    }).catch((reason) => {
      if (!cancelled) {
        console.error('Unable to open PDF', reason)
        setError('Hiện chưa thể mở cuốn sách này.')
        setLoading(false)
      }
    })
    return () => { cancelled = true; loadedDocument?.destroy() }
  }, [book])

  useEffect(() => {
    const element = pageWrapRef.current
    if (!element) return
    const update = () => setRenderWidth(element.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!document || !canvasRef.current || !renderWidth) return
    let renderTask
    let cancelled = false
    document.getPage(pageNumber).then((page) => {
      if (cancelled) return
      const base = page.getViewport({ scale: 1 })
      const scale = Math.max(.5, ((renderWidth - 24) / base.width) * zoom)
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.floor(viewport.width * ratio)
      canvas.height = Math.floor(viewport.height * ratio)
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      renderTask = page.render({ canvasContext: canvas.getContext('2d'), viewport, transform: ratio === 1 ? null : [ratio, 0, 0, ratio, 0, 0] })
      return renderTask.promise
    }).catch((reason) => { if (!cancelled && reason?.name !== 'RenderingCancelledException') setError('Không thể hiển thị trang này.') })
    try { localStorage.setItem(progressKey(id), String(pageNumber)) } catch { /* reading still works */ }
    return () => { cancelled = true; renderTask?.cancel() }
  }, [document, pageNumber, zoom, renderWidth, id])

  if (!book) return <><AppBar title='Sách' /><div className='empty'>Không tìm thấy cuốn sách này.</div></>
  const total = document?.numPages || 0
  const changePage = (next) => {
    setPageNumber(Math.max(1, Math.min(total || 1, next)))
    pageWrapRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return <><AppBar title={book.title} /><div className='book-reader'>
    <div className='book-reader__toolbar'>
      <span className='book-reader__author'>{book.author}</span>
      <span className='grow' />
      <button onClick={() => setZoom((value) => Math.max(.75, value - .25))} disabled={zoom <= .75} aria-label='Thu nhỏ'>−</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button onClick={() => setZoom((value) => Math.min(2, value + .25))} disabled={zoom >= 2} aria-label='Phóng to'>+</button>
    </div>
    <div className='book-reader__page' ref={pageWrapRef}>
      {loading && <div className='book-reader__state'>Đang mở sách…</div>}
      {error && <div className='book-reader__state'>{error}</div>}
      {!error && <canvas ref={canvasRef} aria-label={`Trang ${pageNumber} của ${total}`} />}
    </div>
    <div className='book-reader__navigation'>
      <button onClick={() => changePage(pageNumber - 1)} disabled={pageNumber <= 1}><Icon name='back' size={20} /> <span>Trang trước</span></button>
      <strong>{pageNumber} / {total || '—'}</strong>
      <button onClick={() => changePage(pageNumber + 1)} disabled={!total || pageNumber >= total}><span>Trang sau</span> <Icon name='chev' size={20} /></button>
    </div>
  </div></>
}
