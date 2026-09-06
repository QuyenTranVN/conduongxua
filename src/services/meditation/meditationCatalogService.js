import { apiGet } from '../api/apiClient.js'

const ICON_BY_SLUG = {
  anapanasati: 'breath',
  metta: 'heart',
  kayagatasati: 'body',
  'walking-meditation': 'walk',
}

let methodsPromise
const methodPromises = new Map()
const sessionListPromises = new Map()
const sessionPromises = new Map()

export const meditationCatalogService = {
  async getMethods({ signal, force = false } = {}) {
    if (!methodsPromise || force || signal) {
      const request = apiGet('/v1/meditation/methods', { signal })
        .then(({ data }) => data.map(toUiMethod))
      if (!signal) methodsPromise = request.catch((error) => {
        methodsPromise = undefined
        throw error
      })
      else return request
    }
    return methodsPromise
  },

  async getMethod(slug, { signal, force = false } = {}) {
    const key = String(slug)
    if (!methodPromises.has(key) || force || signal) {
      const request = apiGet(`/v1/meditation/methods/${encodeURIComponent(key)}`, { signal })
        .then(({ data }) => toUiMethod(data))
      if (signal) return request
      methodPromises.set(key, request.catch((error) => {
        methodPromises.delete(key)
        throw error
      }))
    }
    return methodPromises.get(key)
  },

  async getSessions({ method, signal, force = false } = {}) {
    const key = method || 'all'
    if (!sessionListPromises.has(key) || force || signal) {
      const query = method ? `?method=${encodeURIComponent(method)}` : ''
      const request = apiGet(`/v1/meditation/sessions${query}`, { signal })
        .then(({ data }) => data.map((session) => toUiSession(session, method)))
      if (signal) return request
      sessionListPromises.set(key, request.catch((error) => {
        sessionListPromises.delete(key)
        throw error
      }))
    }
    return sessionListPromises.get(key)
  },

  async getSession(slug, { signal, force = false } = {}) {
    const key = String(slug)
    if (!sessionPromises.has(key) || force || signal) {
      const request = apiGet(`/v1/meditation/sessions/${encodeURIComponent(key)}`, { signal })
        .then(({ data }) => toUiSession(data))
      if (signal) return request
      sessionPromises.set(key, request.catch((error) => {
        sessionPromises.delete(key)
        throw error
      }))
    }
    return sessionPromises.get(key)
  },
}

function toUiMethod(method) {
  return {
    id: method.slug,
    apiId: method.id,
    slug: method.slug,
    name: method.namePali || method.nameEn || method.nameVi,
    nameVi: method.nameVi,
    nameEn: method.nameEn,
    descriptionVi: method.descriptionVi,
    aboutVi: method.descriptionVi,
    canonicalSource: method.canonicalSource,
    availableSessionCount: method.availableSessionCount,
    icon: ICON_BY_SLUG[method.slug] || 'lotus',
  }
}

function toUiSession(session, methodSlug) {
  return {
    id: session.id,
    slug: session.slug,
    methodId: methodSlug || session.methodId,
    apiMethodId: session.methodId,
    teacherId: session.teacherId,
    sourceId: session.sourceId,
    titleVi: session.titleVi,
    titleEn: session.titleEn,
    descriptionVi: session.descriptionVi,
    descriptionEn: session.descriptionEn,
    durationSeconds: session.durationSeconds,
    guidanceType: session.guidanceType,
    language: session.language,
    audioUrl: session.audioUrl,
    introAudioUrl: session.introAudioUrl,
    closingAudioUrl: session.closingAudioUrl,
    intervalPrompts: session.intervalPrompts,
    transcriptVi: session.transcriptVi,
    transcriptEn: session.transcriptEn,
    isApiContent: true,
  }
}
