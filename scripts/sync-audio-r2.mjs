// Node 22+: validate first; pass --upload and --wrangler=/path/to/wrangler.js to upload.
import { AUDIO_ITEMS } from '../src/data/audio.ts'
import { FILE_SOUND_URLS } from '../src/services/ambientSoundService.js'
import { open, stat } from 'node:fs/promises'
import { resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const upload = process.argv.includes('--upload')
const wrangler = process.argv.find(arg => arg.startsWith('--wrangler='))?.slice(11)
const base = process.env.AUDIO_CDN_URL?.replace(/\/+$/, '')
const bucket = process.env.AUDIO_R2_BUCKET || 'con-duong-xua-media'
const paths = [...new Set([...AUDIO_ITEMS.map(item => item.audioPath), ...Object.values(FILE_SOUND_URLS)]
  .map(path => decodeURI(path).replace(/^\/?audio\//, '')))]
const types = { '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.wav': 'audio/wav' }

// Validate every local recording before making any remote changes.
const files = []
for (const path of paths) {
  if (path.includes('..') || path.includes('\\') || path.startsWith('/') || !types[extname(path)]) throw new Error(`Invalid audio path: ${path}`)
  const file = resolve(root, 'public/audio', path)
  const size = (await stat(file)).size
  const handle = await open(file, 'r')
  const head = Buffer.alloc(32)
  try { await handle.read(head, 0, head.length, 0) } finally { await handle.close() }
  const signature = head.toString('latin1')
  if (size < 1024 || !(signature.startsWith('ID3') || head[0] === 0xff || signature.startsWith('RIFF') || signature.includes('ftyp'))) {
    throw new Error(`Not a recording (possibly a Git LFS pointer): ${path}`)
  }
  files.push({ path, file, size })
}
console.log(`Validated ${files.length} recordings (${(files.reduce((sum, file) => sum + file.size, 0) / 1e9).toFixed(2)} GB).`)
if (!upload) {
  files.forEach(({ path }) => console.log(`${bucket}/audio/${path}`))
  console.log('Dry run only. To upload, set AUDIO_CDN_URL and pass --upload --wrangler=/path/to/wrangler.js.')
} else {
  if (!base || !wrangler) throw new Error('AUDIO_CDN_URL and --wrangler are required.')
  if (new URL(base).protocol !== 'https:') throw new Error('AUDIO_CDN_URL must use HTTPS.')
  for (const { path, file, size } of files) {
    const url = `${base}/${path.split('/').map(encodeURIComponent).join('/')}`
    const existing = await fetch(url, { method: 'HEAD' })
    if (existing.ok) {
      if (Number(existing.headers.get('content-length')) !== size || !existing.headers.get('content-type')?.startsWith('audio/')) {
        throw new Error(`Existing object differs; refusing to overwrite: ${path}`)
      }
      console.log(`Already present: ${path}`)
      continue
    }
    if (existing.status !== 404) throw new Error(`Cannot check ${path}: HTTP ${existing.status}`)
    const result = spawnSync(process.execPath, [resolve(wrangler), 'r2', 'object', 'put', `${bucket}/audio/${path}`, '--file', file, '--content-type', types[extname(path)], '--remote'], { stdio: 'inherit', cwd: root })
    if (result.error || result.status !== 0) throw result.error || new Error(`Upload failed: ${path}`)
    const check = await fetch(`${url}?verify=${Date.now()}`, { method: 'HEAD' })
    if (!check.ok || Number(check.headers.get('content-length')) !== size) throw new Error(`Upload verification failed: ${path}`)
    console.log(`Verified: ${path}`)
  }
}
