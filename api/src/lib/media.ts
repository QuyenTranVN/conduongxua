import { requireMediaBaseUrl, type Bindings } from '../config/env'

export const MEDIA_KEY_PREFIXES = {
  meditationAudio: 'audio/meditation/',
  dhammaAudio: 'audio/dhamma/',
  supportAudio: 'audio/support/',
  teacherImages: 'images/teachers/',
  supportImages: 'images/support/',
  placeImages: 'images/places/',
} as const

/**
 * Converts a stable R2 object key into its public/custom-domain media URL.
 * This helper performs URL construction only; it neither reads R2 nor signs URLs.
 */
export function getPublicMediaUrl(objectKey: string, env: Bindings): string {
  const baseUrl = requireMediaBaseUrl(env)
  const normalizedKey = normalizeMediaObjectKey(objectKey)
  const encodedKey = normalizedKey.split('/').map(encodeURIComponent).join('/')

  return `${baseUrl}/${encodedKey}`
}

type PublicAudioLocation = {
  audioKey?: string | null
  audioUrl?: string | null
}

/**
 * Resolves a normal public streaming URL for V1. A stable R2 key is preferred;
 * a stored public URL is used only when no key is available.
 */
export function resolvePublicAudioUrl(
  media: PublicAudioLocation,
  env: Bindings,
): string | null {
  if (media.audioKey?.trim() && env.MEDIA_BASE_URL?.trim()) {
    return getPublicMediaUrl(media.audioKey, env)
  }

  const audioUrl = media.audioUrl?.trim()

  if (!audioUrl) {
    if (media.audioKey?.trim()) {
      return getPublicMediaUrl(media.audioKey, env)
    }

    return null
  }

  return validatePublicAudioUrl(audioUrl)
}

export function normalizeMediaObjectKey(objectKey: string): string {
  const key = objectKey.trim().replace(/^\/+|\/+$/g, '')

  if (!key) {
    throw new Error('R2 media object key is required')
  }

  if (key.includes('\\')) {
    throw new Error('R2 media object key must use forward slashes')
  }

  const segments = key.split('/')

  if (segments.some((segment) => !segment || segment === '.' || segment === '..')) {
    throw new Error('R2 media object key contains an invalid path segment')
  }

  return segments.join('/')
}

function validatePublicAudioUrl(value: string): string {
  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('Public audio URL must be a valid absolute URL')
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('Public audio URL must use HTTP or HTTPS')
  }

  if (url.username || url.password) {
    throw new Error('Public audio URL must not contain credentials')
  }

  return url.toString()
}
