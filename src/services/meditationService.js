import { MEDITATION_METHODS, MEDITATION_SESSIONS } from '../data/meditation.js'

const HISTORY_KEY = 'con-duong-xua:practice-history'
const GUIDANCE_KEY = 'con-duong-xua:preferred-guidance'

export const meditationService = {
  getMethods: () => MEDITATION_METHODS,
  getMethod: (id) => MEDITATION_METHODS.find((method) => method.id === id),
  getSessions: () => MEDITATION_SESSIONS,
  getSession: (id) => MEDITATION_SESSIONS.find((session) => session.id === id),
  getSessionsByMethod: (methodId) => MEDITATION_SESSIONS.filter((session) => session.methodId === methodId),
  getSessionsByTeacher: (teacherId) => MEDITATION_SESSIONS.filter((session) => session.teacherId === teacherId),
  getMeditationsByDuration(duration, toleranceMinutes = 2) {
    const target = duration * 60
    return MEDITATION_SESSIONS.filter((session) => Math.abs(session.durationSeconds - target) <= toleranceMinutes * 60)
  },
  getMeditationsByGuidanceType(guidanceType) {
    return MEDITATION_SESSIONS.filter((session) => session.guidanceType === guidanceType)
  },
  getRecommendedMeditation({ duration, guidanceType, preferredMethod, previousPractice }) {
    const target = duration * 60
    const exactMode = MEDITATION_SESSIONS.filter((session) => session.guidanceType === guidanceType)
    const pool = exactMode.length ? exactMode : MEDITATION_SESSIONS
    const previousMethod = previousPractice?.methodId
    return [...pool].map((session) => ({ session, score: Math.abs(session.durationSeconds - target) / 60 - (session.methodId === preferredMethod ? 3 : 0) - (session.methodId === previousMethod ? 2 : 0) })).sort((a, b) => a.score - b.score)[0]?.session
  },
  getRecommendedSession({ duration, previousMethod, preferredGuidance }) {
    return this.getRecommendedMeditation({ duration, guidanceType: preferredGuidance || 'guided', preferredMethod: previousMethod })
  },
  getRecentPractice() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')[0] || null } catch { return null } },
  getContinuePractice() {
    try { const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); return history.find((item) => item.updatedAt && !item.completed && (item.progressSeconds ?? item.durationCompleted ?? 0) > 0) || null } catch { return null }
  },
  getPreferredGuidance() { try { const saved = localStorage.getItem(GUIDANCE_KEY); return saved === 'silent' ? 'silent' : 'guided' } catch { return 'guided' } },
  savePreferredGuidance(guidanceType) { try { localStorage.setItem(GUIDANCE_KEY, guidanceType) } catch { /* optional preference */ } },
  saveProgress(progress) { this.savePracticeSession(progress) },
  discardPractice(sessionId) {
    try { const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); localStorage.setItem(HISTORY_KEY, JSON.stringify(current.filter((item) => (item.sessionId || item.meditationSessionId || item.id) !== sessionId))) } catch { /* Stopping still works. */ }
  },
  discardOtherIncompletePractices(activeSessionId) {
    try { const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); const filtered = current.filter((item) => { const itemId = item.sessionId || item.meditationSessionId || item.id; return item.completed || itemId === activeSessionId }); localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered)) } catch { /* Starting still works. */ }
  },
  completeSession(progress) { this.savePracticeSession({ ...progress, completed: true, completedAt: new Date().toISOString() }) },
  savePracticeSession(practice) {
    try { const current = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); const practiceKey = practice.sessionId || practice.meditationSessionId || practice.id; const timestampedPractice = { ...practice, updatedAt: new Date().toISOString() }; localStorage.setItem(HISTORY_KEY, JSON.stringify([timestampedPractice, ...current.filter((item) => (item.sessionId || item.meditationSessionId || item.id) !== practiceKey)].slice(0, 20))) } catch { /* Practice still works. */ }
  },
}
