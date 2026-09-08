import { MEDITATION_METHODS, MEDITATION_SESSIONS } from '../data/meditation.js'
import { hasPlayableAudio } from './audioStorage.js'
import { readLocalJson, writeLocalJson, readLocalEnum, writeLocalValue } from './localStorageService.js'
import { meditationCatalogService } from './meditation/meditationCatalogService.js'

const HISTORY_KEY = 'con-duong-xua:practice-history'
const GUIDANCE_KEY = 'con-duong-xua:preferred-guidance'
const apiMethods = new Map()
const apiSessions = new Map()
const isAvailableSession = (session) => session.guidanceType !== 'guided' || hasPlayableAudio(session)
const customSilentSession = (id) => {
  const match = /^custom-silent:([a-z0-9-]+):(\d+)$/.exec(String(id || ''))
  if (!match) return null
  const durationSeconds = Number(match[2])
  if (!MEDITATION_METHODS.some((method) => method.id === match[1]) || durationSeconds < 60 || durationSeconds > 7200) return null
  return { id, titleVi: 'Thiền im lặng', methodId: match[1], durationSeconds, guidanceType: 'silent', language: 'vi', level: 'custom' }
}
const findSession = (id) => apiSessions.get(id) || MEDITATION_SESSIONS.find((session) => session.id === id) || customSilentSession(id) || readSavedSession(id)
const rememberMethod = (method) => {
  apiMethods.set(method.id, method)
  apiMethods.set(method.slug, method)
  if (method.apiId) apiMethods.set(method.apiId, method)
  return method
}
const rememberSession = (session) => {
  const method = apiMethods.get(session.apiMethodId) || apiMethods.get(session.methodId)
  const normalized = method ? { ...session, methodId: method.slug } : session
  apiSessions.set(normalized.id, normalized)
  apiSessions.set(normalized.slug, normalized)
  return normalized
}
const readHistory = () => {
  const value = readLocalJson(HISTORY_KEY, [])
  return Array.isArray(value) ? value.filter((item) => item && typeof item === 'object') : []
}
const recordSessionId = (record) => record?.sessionId || record?.meditationSessionId || record?.id
const SESSION_FIELDS = ['id', 'slug', 'methodId', 'apiMethodId', 'teacherId', 'teacherName', 'sourceId', 'titleVi', 'titleEn', 'descriptionVi', 'descriptionEn', 'durationSeconds', 'guidanceType', 'language', 'audioUrl', 'audioPath', 'audioCredit', 'isApiContent']
const sessionSnapshot = (session) => Object.fromEntries(SESSION_FIELDS.filter((key) => typeof session[key] === 'string' || (key === 'durationSeconds' && typeof session[key] === 'number') || (key === 'isApiContent' && typeof session[key] === 'boolean')).map((key) => [key, session[key]]))
function readSavedSession(id) {
  if (typeof id !== 'string' || !id) return null
  const snapshot = readHistory().find((record) => recordSessionId(record) === id)?.sessionSnapshot
  if (!snapshot || snapshot.id !== id || typeof snapshot.titleVi !== 'string' || !Number.isFinite(snapshot.durationSeconds) || snapshot.durationSeconds <= 0 || snapshot.guidanceType !== 'guided') return null
  const path = snapshot.audioUrl || snapshot.audioPath
  // Only durable local/CDN URLs can restore a catalog session after refresh.
  if (typeof path !== 'string' || !(/^(https?:\/\/|\/audio\/)/i.test(path))) return null
  try { if (!['http:', 'https:'].includes(new URL(path, 'https://local.invalid').protocol)) return null } catch { return null }
  return sessionSnapshot(snapshot)
}
const normalizeProgress = (record) => {
  const sessionId = recordSessionId(record)
  const session = findSession(sessionId)
  if (!session || !isAvailableSession(session)) return null
  const duration = Number(record.durationSeconds || session.durationSeconds)
  const progress = Number(record.progressSeconds ?? record.durationCompleted ?? 0)
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(progress)) return null
  const safeProgress = Math.max(0, Math.min(progress, duration))
  const selectedDuration = Number(record.selectedDurationSeconds || session.durationSeconds)
  return { ...record, guidanceType: session.guidanceType, paused: record.paused === true, selectedDurationSeconds: Number.isFinite(selectedDuration) && selectedDuration > 0 ? selectedDuration : session.durationSeconds, sessionId, meditationSessionId: sessionId, progressSeconds: safeProgress, durationCompleted: safeProgress, durationSeconds: duration, completed: Boolean(record.completed) || safeProgress >= duration }
}

export const meditationService = {
  getMethods: () => MEDITATION_METHODS,
  getMethod: (id) => apiMethods.get(id) || MEDITATION_METHODS.find((method) => method.id === id),
  getSessions: () => MEDITATION_SESSIONS.filter(isAvailableSession),
  getSession: (id) => findSession(id),
  getSessionsByMethod: (methodId) => MEDITATION_SESSIONS.filter((session) => session.methodId === methodId && isAvailableSession(session)),
  getSessionsByTeacher: (teacherId) => MEDITATION_SESSIONS.filter((session) => session.teacherId === teacherId && isAvailableSession(session)),
  getMeditationsByDuration(duration, toleranceMinutes = 2) {
    const target = duration * 60
    return MEDITATION_SESSIONS.filter((session) => isAvailableSession(session) && Math.abs(session.durationSeconds - target) <= toleranceMinutes * 60)
  },
  getMeditationsByGuidanceType(guidanceType) {
    return MEDITATION_SESSIONS.filter((session) => session.guidanceType === guidanceType && isAvailableSession(session))
  },
  async loadMethods(options) {
    const methods = await meditationCatalogService.getMethods(options)
    return methods.map(rememberMethod)
  },
  async loadMethod(slug, options) {
    return rememberMethod(await meditationCatalogService.getMethod(slug, options))
  },
  async loadSessions({ method, ...options } = {}) {
    const sessions = await meditationCatalogService.getSessions({ method, ...options })
    return sessions.map(rememberSession)
  },
  async loadSession(slug, options) {
    return rememberSession(await meditationCatalogService.getSession(slug, options))
  },
  getRecommendedMeditation({ duration, guidanceType, preferredMethod, previousPractice }) {
    const target = duration * 60
    if (guidanceType === 'silent') {
      const methodId = MEDITATION_METHODS.some((method) => method.id === preferredMethod) ? preferredMethod : 'silent'
      return customSilentSession(`custom-silent:${methodId}:${Math.max(60, Math.min(7200, Math.round(target)))}`)
    }
    const available = MEDITATION_SESSIONS.filter(isAvailableSession)
    const exactMode = available.filter((session) => session.guidanceType === guidanceType)
    const exactDuration = exactMode.filter((session) => session.durationSeconds === target)
    const pool = exactDuration.length ? exactDuration : exactMode.length ? exactMode : available
    const previousMethod = previousPractice?.methodId
    return [...pool].map((session) => ({ session, score: Math.abs(session.durationSeconds - target) / 60 - (session.methodId === preferredMethod ? 3 : 0) - (session.methodId === previousMethod ? 2 : 0) })).sort((a, b) => a.score - b.score)[0]?.session
  },
  getRecommendedSession({ duration, previousMethod, preferredGuidance }) {
    return this.getRecommendedMeditation({ duration, guidanceType: preferredGuidance || 'guided', preferredMethod: previousMethod })
  },
  getPracticeProgress(sessionId) { return readHistory().filter((record) => recordSessionId(record) === sessionId).map(normalizeProgress).find(Boolean) || null },
  getRecentPractice() { return readHistory().map(normalizeProgress).find(Boolean) || null },
  getContinuePractice() {
    return readHistory().map(normalizeProgress).find((item) => item && item.updatedAt && !item.completed && (item.progressSeconds > 0 || item.paused === true) && item.progressSeconds < item.durationSeconds) || null
  },
  getPreferredGuidance() { return readLocalEnum(GUIDANCE_KEY, ['guided', 'silent'], 'guided') },
  savePreferredGuidance(guidanceType) { writeLocalValue(GUIDANCE_KEY, guidanceType === 'silent' ? 'silent' : 'guided') },
  saveProgress(progress) { this.savePracticeSession(progress) },
  discardPractice(sessionId) {
    writeLocalJson(HISTORY_KEY, readHistory().filter((item) => recordSessionId(item) !== sessionId))
  },
  discardOtherIncompletePractices(activeSessionId) {
    writeLocalJson(HISTORY_KEY, readHistory().filter((item) => item.completed || recordSessionId(item) === activeSessionId))
  },
  completeSession(progress) { this.savePracticeSession({ ...progress, completed: true, completedAt: new Date().toISOString() }) },
  savePracticeSession(practice) {
    const normalized = normalizeProgress(practice)
    if (!normalized) return false
    const timestampedPractice = { ...normalized, sessionSnapshot: sessionSnapshot(findSession(normalized.sessionId)), updatedAt: new Date().toISOString() }
    return writeLocalJson(HISTORY_KEY, [timestampedPractice, ...readHistory().filter((item) => recordSessionId(item) !== normalized.sessionId)].slice(0, 20))
  },
}
