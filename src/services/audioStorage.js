const trimSlashes = (value = '') => value.replace(/^\/+|\/+$/g, '')

export function getAudioUrl(audioPath) {
  if (!audioPath) return ''
  const cdnUrl = trimSlashes(import.meta.env.VITE_AUDIO_CDN_URL || '')
  if (cdnUrl) return `${cdnUrl}/${trimSlashes(audioPath)}`
  return `/audio/${trimSlashes(audioPath)}`
}
