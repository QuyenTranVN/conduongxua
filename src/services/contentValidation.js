import { AUDIO_ITEMS } from '../data/audio.ts'
import { MEDITATION_METHODS, MEDITATION_SESSIONS } from '../data/meditation.js'
import { TEACHERS } from '../data/content.js'
import { hasPlayableAudio } from './audioStorage.js'

const AUDIO_CATEGORIES = new Set(['dhamma', 'sutta', 'meditation', 'chanting', 'audiobook'])
const AUDIO_LANGUAGES = new Set(['vi', 'pali', 'en'])

export function isSafeWebUrl(value) {
  if (!value || value === 'TO_BE_ADDED') return false
  try { return ['http:', 'https:'].includes(new URL(value).protocol) } catch { return false }
}

export function validateContentRecords({ audioItems = AUDIO_ITEMS, teachers = TEACHERS, sessions = MEDITATION_SESSIONS, methods = MEDITATION_METHODS } = {}) {
  const issues = []
  const teacherIds = new Set()
  teachers.forEach((teacher) => {
    if (!teacher?.id || !teacher?.name || teacherIds.has(teacher.id)) issues.push({ type: teacherIds.has(teacher?.id) ? 'duplicate-teacher-id' : 'invalid-teacher', id: teacher?.id || null })
    else teacherIds.add(teacher.id)
  })
  const methodIds = new Set()
  methods.forEach((method) => {
    if (!method?.id || !method?.name || methodIds.has(method.id)) issues.push({ type: methodIds.has(method?.id) ? 'duplicate-method-id' : 'invalid-method', id: method?.id || null })
    else methodIds.add(method.id)
  })
  const seen = new Set()
  const validAudio = audioItems.filter((item) => {
    const valid = Boolean(item?.id && item?.slug && item?.title && AUDIO_CATEGORIES.has(item.category) && AUDIO_LANGUAGES.has(item.language) && hasPlayableAudio(item) && item.source?.name)
    if (!valid || seen.has(item?.id)) { issues.push({ type: seen.has(item?.id) ? 'duplicate-audio-id' : 'invalid-audio', id: item?.id || null }); return false }
    seen.add(item.id)
    if (item.teacherId && !teacherIds.has(item.teacherId)) { issues.push({ type: 'missing-audio-teacher', id: item.id, teacherId: item.teacherId }); return false }
    if (item.source.pageUrl !== 'TO_BE_ADDED' && !isSafeWebUrl(item.source.pageUrl)) issues.push({ type: 'invalid-source-url', id: item.id })
    return true
  })
  const sessionIds = new Set()
  const validSessions = sessions.filter((session) => {
    if (!session?.id || sessionIds.has(session.id) || !session?.titleVi || !methodIds.has(session.methodId) || !Number.isFinite(session.durationSeconds) || session.durationSeconds <= 0 || !['guided', 'silent'].includes(session.guidanceType)) { issues.push({ type: sessionIds.has(session?.id) ? 'duplicate-session-id' : 'invalid-session', id: session?.id || null }); return false }
    sessionIds.add(session.id)
    if (session.teacherId && !teacherIds.has(session.teacherId)) { issues.push({ type: 'missing-session-teacher', id: session.id, teacherId: session.teacherId }); return false }
    return true
  })
  return { validAudio, validSessions, issues }
}

const validated = validateContentRecords()
export const VALID_AUDIO_ITEMS = validated.validAudio
export const CONTENT_VALIDATION_ISSUES = validated.issues
