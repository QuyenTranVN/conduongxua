const ABSOLUTE_URL = /^(?:https?:|blob:|data:)/i
const AUDIO_PREFIX = /^audio(?:\/|$)/i

const trimSlashes = (value = '') => String(value).trim().replace(/^\/+|\/+$/g, '')

export function getStoredAudioPath(itemOrPath) {
  if (typeof itemOrPath === 'string') return itemOrPath.trim()
  if (!itemOrPath || typeof itemOrPath !== 'object') return ''
  return String(itemOrPath.audioPath || itemOrPath.audioUrl || '').trim()
}

export function hasPlayableAudio(itemOrPath) {
  const path = getStoredAudioPath(itemOrPath)
  return Boolean(path && path !== 'TO_BE_ADDED' && !/^javascript:/i.test(path))
}

export function resolveAudioUrl(itemOrPath, configuredBase = '') {
  const storedPath = getStoredAudioPath(itemOrPath)
  if (!hasPlayableAudio(storedPath)) return ''
  if (ABSOLUTE_URL.test(storedPath)) return storedPath

  const normalizedPath = trimSlashes(storedPath).replace(AUDIO_PREFIX, '')
  if (!normalizedPath) return ''

  const base = String(configuredBase || '').trim()
  if (base) return `${base.replace(/\/+$/g, '')}/${normalizedPath}`
  return `/audio/${normalizedPath}`
}

export function getAudioUrl(itemOrPath) {
  return resolveAudioUrl(itemOrPath, import.meta.env.VITE_AUDIO_CDN_URL || '')
}
