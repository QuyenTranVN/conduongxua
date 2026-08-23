import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const dryRun = process.argv.includes('--dry-run')
const manifestPath = resolve(process.cwd(), 'content/audio-import.json')
const uploadBase = process.env.AUDIO_STORAGE_UPLOAD_URL?.replace(/\/$/, '')
const publicBase = process.env.AUDIO_CDN_URL?.replace(/\/$/, '')
const uploadToken = process.env.AUDIO_STORAGE_TOKEN
const allowedRoots = ['teachers/', 'suttas/', 'meditation/', 'chanting/']

const safeDestination = (value) => {
  if (typeof value !== 'string' || value.includes('..') || value.startsWith('/') || !allowedRoots.some((root) => value.startsWith(root))) throw new Error(`Đường dẫn lưu trữ không hợp lệ: ${value}`)
  if (!/^[a-z0-9/_-]+\.(mp3|m4a|ogg|wav)$/i.test(value)) throw new Error(`Tên tệp không an toàn: ${value}`)
  return value
}
const safeUrl = (value, label) => {
  if (!value || value === 'TO_BE_ADDED') throw new Error(`${label} chưa được bổ sung`)
  const url = new URL(value)
  if (url.protocol !== 'https:') throw new Error(`${label} phải dùng HTTPS`)
  return url
}
const looksLikeAudio = (bytes, contentType) => {
  const typeOkay = /^audio\//i.test(contentType || '') || /application\/octet-stream/i.test(contentType || '')
  const head = bytes.subarray(0, 12)
  const text = new TextDecoder('latin1').decode(head)
  const signatureOkay = text.startsWith('ID3') || head[0] === 0xff || text.startsWith('OggS') || text.startsWith('RIFF') || text.includes('ftyp')
  return typeOkay && signatureOkay
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
if (!Array.isArray(manifest)) throw new Error('Manifest phải là một mảng JSON')
const ids = new Set()

for (const entry of manifest) {
  try {
    if (!entry.id || ids.has(entry.id)) throw new Error('ID bị thiếu hoặc trùng lặp')
    ids.add(entry.id)
    const destination = safeDestination(entry.destination)
    const sourcePage = safeUrl(entry.sourcePage, 'sourcePage')
    const sourceAudio = safeUrl(entry.sourceAudio, 'sourceAudio')
    if (dryRun) { console.log(`[DRY RUN] ${entry.id}: ${sourceAudio.hostname} → ${destination}`); continue }
    if (!uploadBase || !uploadToken) throw new Error('Thiếu AUDIO_STORAGE_UPLOAD_URL hoặc AUDIO_STORAGE_TOKEN')
    if (publicBase) {
      const exists = await fetch(`${publicBase}/${destination}`, { method: 'HEAD' })
      if (exists.ok) throw new Error('Tệp đích đã tồn tại; không ghi đè')
    }
    const response = await fetch(sourceAudio, { redirect: 'follow', headers: { Accept: 'audio/*' } })
    if (!response.ok) throw new Error(`Tải xuống thất bại: HTTP ${response.status}`)
    const contentType = response.headers.get('content-type') || ''
    const bytes = new Uint8Array(await response.arrayBuffer())
    if (!looksLikeAudio(bytes, contentType)) throw new Error(`Phản hồi không phải audio hợp lệ (${contentType || 'không có MIME'})`)
    const target = `${uploadBase}/${destination.split('/').map(encodeURIComponent).join('/')}`
    const upload = await fetch(target, { method: 'PUT', headers: { Authorization: `Bearer ${uploadToken}`, 'Content-Type': contentType.startsWith('audio/') ? contentType : 'audio/mpeg', 'If-None-Match': '*', 'X-Source-Page': sourcePage.toString() }, body: bytes })
    if (!upload.ok) throw new Error(`Tải lên thất bại: HTTP ${upload.status}`)
    console.log(`[OK] ${entry.id} → ${destination}`)
  } catch (error) {
    console.error(`[FAILED] ${entry.id || 'unknown'}: ${error.message}`)
    process.exitCode = 1
  }
}
