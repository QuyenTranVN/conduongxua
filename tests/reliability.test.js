import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolveAudioUrl, hasPlayableAudio } from '../src/services/audioStorage.js'
import { audioProgressService } from '../src/services/audioProgressService.js'
import { clearAppLocalData } from '../src/services/localStorageService.js'
import { settingsService } from '../src/services/settingsService.js'
import { meditationService } from '../src/services/meditationService.js'
import { audioService } from '../src/services/audioService.js'
import { isSafeWebUrl, validateContentRecords } from '../src/services/contentValidation.js'
import { UI_TEXT } from '../src/lib/format.js'
import { ambientSoundPreferences } from '../src/services/ambientSoundService.js'

function installStorage() {
  const data = new Map()
  globalThis.localStorage = {
    get length() { return data.size },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  }
}

test.beforeEach(installStorage)

test('audio resolver supports local, CDN, absolute, and missing paths', () => {
  assert.equal(resolveAudioUrl('/audio/Meditation/test.mp3'), '/audio/Meditation/test.mp3')
  assert.equal(resolveAudioUrl('Meditation/test.mp3', 'https://cdn.example/audio/'), 'https://cdn.example/audio/Meditation/test.mp3')
  assert.equal(resolveAudioUrl('https://media.example/test.mp3', 'https://cdn.example/audio'), 'https://media.example/test.mp3')
  assert.equal(resolveAudioUrl(''), '')
  assert.equal(hasPlayableAudio({ audioPath: '' }), false)
  assert.equal(hasPlayableAudio({ audioUrl: '/audio/test.mp3' }), true)
})

test('audio progress clamps, completes, and excludes finished items', () => {
  assert.equal(audioProgressService.save('talk-1', 25, 100), true)
  assert.equal(audioProgressService.get('talk-1').currentTime, 25)
  assert.equal(audioProgressService.getUnfinished([{ id: 'talk-1' }]).length, 1)
  audioProgressService.save('talk-1', 99, 100)
  assert.equal(audioProgressService.get('talk-1').completed, true)
  assert.equal(audioProgressService.getUnfinished([{ id: 'talk-1' }]).length, 0)
  localStorage.setItem('con-duong-xua:audio-progress', '{bad json')
  assert.equal(audioProgressService.get('talk-1'), null)
})

test('meditation continuation rejects corruption and completed records', () => {
  localStorage.setItem('con-duong-xua:practice-history', '{bad json')
  assert.equal(meditationService.getContinuePractice(), null)
  meditationService.saveProgress({ sessionId: 'silent-8', progressSeconds: 90, durationSeconds: 480, completed: false })
  assert.equal(meditationService.getContinuePractice()?.sessionId, 'silent-8')
  meditationService.completeSession({ sessionId: 'silent-8', progressSeconds: 480, durationSeconds: 480 })
  assert.equal(meditationService.getContinuePractice(), null)
})

test('silent meditation recommendation preserves the selected duration', () => {
  for (const duration of [8, 15, 30, 45, 60, 120]) {
    const session = meditationService.getRecommendedMeditation({ duration, guidanceType: 'silent', preferredMethod: 'anapanasati' })
    assert.equal(session.durationSeconds, duration * 60)
  }
})

test('silent ambience preferences default safely and persist valid choices', () => {
  assert.deepEqual(ambientSoundPreferences.get(), { lastSilentDuration: 1800, lastBackgroundSound: 'none', lastBackgroundVolume: 0.25 })
  ambientSoundPreferences.save({ lastSilentDuration: 2700, lastBackgroundSound: 'forest', lastBackgroundVolume: 0.32 })
  assert.deepEqual(ambientSoundPreferences.get(), { lastSilentDuration: 2700, lastBackgroundSound: 'forest', lastBackgroundVolume: 0.32 })
  ambientSoundPreferences.save({ lastBackgroundSound: 'invalid', lastBackgroundVolume: 4 })
  assert.equal(ambientSoundPreferences.get().lastBackgroundSound, 'forest')
  assert.equal(ambientSoundPreferences.get().lastBackgroundVolume, 1)
})

test('settings persist valid values and app clearing is scoped', () => {
  settingsService.saveLanguage('en')
  settingsService.saveTheme('dark')
  localStorage.setItem('outside-app', 'keep')
  assert.equal(settingsService.getLanguage(), 'en')
  assert.equal(settingsService.getTheme(), 'dark')
  clearAppLocalData()
  assert.equal(settingsService.getLanguage(), 'vi')
  assert.equal(settingsService.getTheme(), 'light')
  assert.equal(localStorage.getItem('outside-app'), 'keep')
})

test('recommendations and teacher audio contain only playable valid records', () => {
  assert.ok(audioService.getFeatured().every(hasPlayableAudio))
  assert.ok(audioService.getByTeacher('chah').every((item) => item.teacherId === 'chah' && hasPlayableAudio(item)))
  const recommended = audioService.getPlayable().filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index)
  assert.equal(recommended.length, audioService.getPlayable().length)
})

test('runtime validation rejects duplicate IDs, bad teacher references, and unsafe links', () => {
  const base = { id: 'a', slug: 'a', title: 'A', category: 'dhamma', language: 'vi', audioPath: 'a.mp3', source: { name: 'Source', pageUrl: 'https://example.com' } }
  const result = validateContentRecords({ audioItems: [base, base, { ...base, id: 'b', slug: 'b', teacherId: 'missing' }], teachers: [], sessions: [], methods: [] })
  assert.equal(result.validAudio.length, 1)
  assert.ok(result.issues.some((issue) => issue.type === 'duplicate-audio-id'))
  assert.ok(result.issues.some((issue) => issue.type === 'missing-audio-teacher'))
  assert.equal(isSafeWebUrl('javascript:alert(1)'), false)
  assert.equal(isSafeWebUrl('https://example.com'), true)
})

test('active translation groups exist in Vietnamese and English', () => {
  for (const group of ['audioBrowse', 'audioDetail', 'player', 'teachersPage', 'support', 'errors']) {
    assert.deepEqual(Object.keys(UI_TEXT.vi[group]).sort(), Object.keys(UI_TEXT.en[group]).sort())
  }
})

test('Settings drawer contains no account or profile identity UI', async () => {
  const source = await readFile(new URL('../src/components/Drawer.jsx', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /\b(profile|account|login|register|sign in|guest|streak|USER)\b/i)
  assert.match(source, /Cài đặt/)
  assert.match(source, /Settings/)
})

test('ambient playback fetches and decodes the shared audio path', async () => {
  const { ambientAudio } = await import('../src/services/ambientSoundService.js')
  const originalWindow = globalThis.window
  const originalFetch = globalThis.fetch
  const requested = []
  let decoded = false
  let started = false
  const node = () => ({ connect() { return this }, disconnect() {}, stop() {}, start() { started = true } })
  class FakeAudioContext {
    currentTime = 0
    destination = {}
    async resume() {}
    async decodeAudioData(bytes) { decoded = bytes.byteLength === 4; return { duration: 12 } }
    createBufferSource() { return node() }
    createBiquadFilter() { return { ...node(), frequency: { value: 0 } } }
    createGain() { return { ...node(), gain: { setValueAtTime() {}, linearRampToValueAtTime() {} } } }
  }
  globalThis.window = { AudioContext: FakeAudioContext }
  globalThis.fetch = async (url) => {
    requested.push(url)
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(4) }
  }
  try {
    for (const sound of ['rain', 'stream', 'forest']) {
      assert.equal(await ambientAudio.start(sound), true)
      ambientAudio.stop(0)
    }
    assert.equal(requested.length, 3)
    assert.ok(requested.every(url => url.startsWith('/audio/Meditation/White%20Noise/')))
    assert.ok(decoded && started)
  } finally {
    ambientAudio.stop(0)
    globalThis.window = originalWindow
    globalThis.fetch = originalFetch
  }
})
