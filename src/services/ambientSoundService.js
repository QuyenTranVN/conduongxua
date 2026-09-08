import { readLocalJson, writeLocalJson } from './localStorageService.js'
import { getAudioUrl } from './audioStorage.js'

const PREFERENCE_KEY = 'con-duong-xua:silent-ambience'
const VALID_SOUNDS = new Set(['none', 'rain', 'stream', 'forest', 'white_noise'])
const DEFAULTS = { lastSilentDuration: 1800, lastBackgroundSound: 'none', lastBackgroundVolume: 0.25 }
export const FILE_SOUND_URLS = {
  rain: '/audio/Meditation/White%20Noise/mixkit-light-rain-loop-1253.wav',
  stream: '/audio/Meditation/White%20Noise/mixkit-thunderstorm-and-clear-rain-2397.wav',
  forest: '/audio/Meditation/White%20Noise/mixkit-campfire-night-wind-1736.wav',
}

export const AMBIENT_SOUNDS = [
  { id: 'none', nameVi: 'Không âm thanh', nameEn: 'No sound' },
  { id: 'rain', nameVi: 'Mưa nhẹ', nameEn: 'Light rain' },
  { id: 'stream', icon: 'rain', nameVi: 'Mưa giông', nameEn: 'Thunderstorm' },
  { id: 'forest', nameVi: 'Gió đêm & lửa trại', nameEn: 'Night wind & campfire' },
  { id: 'white_noise', nameVi: 'White noise', nameEn: 'White noise' },
]

const clampVolume = (value) => Math.min(1, Math.max(0, Number(value) || 0))

export const ambientSoundPreferences = {
  get() {
    const saved = readLocalJson(PREFERENCE_KEY, DEFAULTS)
    return {
      lastSilentDuration: Number.isFinite(saved?.lastSilentDuration) ? saved.lastSilentDuration : DEFAULTS.lastSilentDuration,
      lastBackgroundSound: VALID_SOUNDS.has(saved?.lastBackgroundSound) ? saved.lastBackgroundSound : DEFAULTS.lastBackgroundSound,
      lastBackgroundVolume: clampVolume(saved?.lastBackgroundVolume ?? DEFAULTS.lastBackgroundVolume),
    }
  },
  save(values) {
    const current = this.get()
    return writeLocalJson(PREFERENCE_KEY, {
      lastSilentDuration: Number.isFinite(values?.lastSilentDuration) ? values.lastSilentDuration : current.lastSilentDuration,
      lastBackgroundSound: VALID_SOUNDS.has(values?.lastBackgroundSound) ? values.lastBackgroundSound : current.lastBackgroundSound,
      lastBackgroundVolume: clampVolume(values?.lastBackgroundVolume ?? current.lastBackgroundVolume),
    })
  },
}

let context = null
let buffer = null
let source = null
let filter = null
let gain = null
let activeSound = 'none'
let targetVolume = DEFAULTS.lastBackgroundVolume
let startedAt = 0
let pausedOffset = 0
let operationId = 0
const fileBufferCache = new Map()

const getContext = () => (context ||= new (window.AudioContext || window.webkitAudioContext)())
const seededRandom = (seed) => () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}

function createNoiseBuffer(ac, sound) {
  const seconds = 12
  const result = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate)
  const data = result.getChannelData(0)
  const random = seededRandom({ rain: 17, stream: 29, forest: 43, white_noise: 61 }[sound] || 1)
  let brown = 0
  for (let index = 0; index < data.length; index += 1) {
    const white = random() * 2 - 1
    brown = Math.max(-1, Math.min(1, brown * .985 + white * .045))
    if (sound === 'white_noise') data[index] = white * .42
    else if (sound === 'rain') data[index] = white * (.22 + random() * .18)
    else if (sound === 'stream') data[index] = (brown * .72 + white * .08) * (0.82 + Math.sin(index / ac.sampleRate * Math.PI * .7) * .12)
    else data[index] = brown * .46 + white * .025
  }
  const blendSamples = Math.floor(ac.sampleRate * .12)
  for (let index = 0; index < blendSamples; index += 1) {
    const mix = index / blendSamples
    const tailIndex = data.length - blendSamples + index
    data[tailIndex] = data[tailIndex] * (1 - mix) + data[index] * mix
  }
  return result
}

async function loadSoundBuffer(ac, sound) {
  const path = FILE_SOUND_URLS[sound]
  const url = path ? getAudioUrl(path) : ''
  if (!url) return createNoiseBuffer(ac, sound)
  if (!fileBufferCache.has(sound)) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`Unable to load ambient sound: ${sound}`)
    fileBufferCache.set(sound, await ac.decodeAudioData(await response.arrayBuffer()))
  }
  return fileBufferCache.get(sound)
}

function connectSource(offset = 0) {
  if (!context || !buffer || !gain) return
  source = context.createBufferSource()
  source.buffer = buffer
  source.loop = true
  filter = context.createBiquadFilter()
  if (FILE_SOUND_URLS[activeSound]) { filter.type = 'allpass'; filter.frequency.value = 1000 }
  else if (activeSound === 'rain') { filter.type = 'highpass'; filter.frequency.value = 700 }
  else if (activeSound === 'stream') { filter.type = 'lowpass'; filter.frequency.value = 1900 }
  else if (activeSound === 'forest') { filter.type = 'lowpass'; filter.frequency.value = 950 }
  else { filter.type = 'allpass'; filter.frequency.value = 1000 }
  source.connect(filter).connect(gain)
  source.start(0, offset % buffer.duration)
  startedAt = context.currentTime
}

function stopSource() {
  try { source?.stop() } catch { /* source may already be stopped */ }
  try { source?.disconnect() } catch { /* optional cleanup */ }
  try { filter?.disconnect() } catch { /* optional cleanup */ }
  source = null
  filter = null
}

export const ambientAudio = {
  async unlock() {
    try { await getContext().resume(); return context.state === 'running' } catch { return false }
  },
  async start(sound, volume = DEFAULTS.lastBackgroundVolume, fadeSeconds = 3, delaySeconds = 0) {
    this.stop(0)
    if (!VALID_SOUNDS.has(sound) || sound === 'none') return false
    const currentOperation = operationId
    const ac = getContext()
    try {
      await ac.resume()
      const nextBuffer = await loadSoundBuffer(ac, sound)
      if (currentOperation !== operationId) return false
      activeSound = sound
      targetVolume = clampVolume(volume)
      pausedOffset = 0
      buffer = nextBuffer
      gain = ac.createGain()
      gain.connect(ac.destination)
      const fadeStart = ac.currentTime + Math.max(0, delaySeconds)
      gain.gain.setValueAtTime(0, ac.currentTime)
      gain.gain.setValueAtTime(0, fadeStart)
      gain.gain.linearRampToValueAtTime(targetVolume, fadeStart + fadeSeconds)
      connectSource(0)
      return true
    } catch {
      return false
    }
  },
  pause() {
    if (!context || !source || !buffer) return
    pausedOffset = (pausedOffset + context.currentTime - startedAt) % buffer.duration
    stopSource()
  },
  async resume(fadeSeconds = .8) {
    if (!context || !buffer || source || activeSound === 'none') return
    await context.resume()
    const now = context.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(targetVolume, now + fadeSeconds)
    connectSource(pausedOffset)
  },
  setVolume(volume) {
    targetVolume = clampVolume(volume)
    if (!context || !gain) return
    const now = context.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setTargetAtTime(targetVolume, now, .05)
  },
  stop(fadeSeconds = 0) {
    operationId += 1
    if (!context || !gain) {
      stopSource(); buffer = null; activeSound = 'none'; pausedOffset = 0
      return
    }
    if (fadeSeconds > 0 && source) {
      const oldSource = source
      const oldFilter = filter
      const oldGain = gain
      const now = context.currentTime
      oldGain.gain.cancelScheduledValues(now)
      oldGain.gain.setValueAtTime(oldGain.gain.value, now)
      oldGain.gain.linearRampToValueAtTime(0, now + fadeSeconds)
      source = null
      filter = null
      gain = null
      buffer = null
      activeSound = 'none'
      pausedOffset = 0
      window.setTimeout(() => {
        try { oldSource.stop() } catch { /* source may already be stopped */ }
        try { oldSource.disconnect() } catch { /* optional cleanup */ }
        try { oldFilter.disconnect() } catch { /* optional cleanup */ }
        try { oldGain.disconnect() } catch { /* optional cleanup */ }
      }, fadeSeconds * 1000 + 80)
    } else {
      const oldGain = gain
      stopSource()
      try { oldGain.disconnect() } catch { /* optional cleanup */ }
      gain = null
      buffer = null
      activeSound = 'none'
      pausedOffset = 0
    }
  },
}
