import { SUPPORT_PRACTICES } from '../data/supportPractices.js'

const PROGRESS_KEY = 'con-duong-xua:support-practice-progress'

export function isSupportPracticePlayable(practice) {
  if (!practice?.isPublished || !practice?.isActive) return false
  if (practice.contentType === 'audio_guided') return Boolean(practice.audioUrl)
  if (practice.contentType === 'visual_guided') return Boolean(practice.steps?.length)
  if (practice.contentType === 'mixed') return Boolean(practice.audioUrl || practice.steps?.length)
  return false
}

function readProgress() {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') } catch { return {} }
}

export const supportPracticeService = {
  isPlayable: isSupportPracticePlayable,
  getAll: () => SUPPORT_PRACTICES,
  getVisible: () => SUPPORT_PRACTICES.filter(isSupportPracticePlayable).sort((a, b) => a.order - b.order),
  getById: (id) => SUPPORT_PRACTICES.find((practice) => practice.id === id),
  getAvailableSessions(type) { return this.getVisible().filter((practice) => practice.type === type) },
  getActiveStep(practice, elapsedSeconds) {
    let cursor = 0
    for (let index = 0; index < (practice?.steps?.length || 0); index += 1) {
      const step = practice.steps[index]
      const end = cursor + step.durationSeconds
      if (elapsedSeconds < end) return { step, index, startSeconds: cursor, endSeconds: end, elapsedInStep: Math.max(0, elapsedSeconds - cursor) }
      cursor = end
    }
    const index = Math.max(0, (practice?.steps?.length || 1) - 1)
    const step = practice?.steps?.[index]
    return step ? { step, index, startSeconds: cursor - step.durationSeconds, endSeconds: cursor, elapsedInStep: step.durationSeconds } : null
  },
  getProgress(practiceId) { return readProgress()[practiceId] || null },
  saveProgress(progress) {
    try { const all = readProgress(); all[progress.practiceId] = { ...progress, updatedAt: new Date().toISOString() }; localStorage.setItem(PROGRESS_KEY, JSON.stringify(all)) } catch { /* practice still works */ }
  },
  completePractice(practiceId, durationSeconds, startedAt) { this.saveProgress({ practiceId, startedAt, progressSeconds: durationSeconds, completed: true }) },
}
