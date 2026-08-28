import { SUPPORT_PRACTICES } from '../data/supportPractices.js'
import { readLocalJson, writeLocalJson } from './localStorageService.js'

const PROGRESS_KEY = 'con-duong-xua:support-practice-progress'

export function isSupportPracticePlayable(practice) {
  if (!practice?.isPublished || !practice?.isActive) return false
  if (practice.contentType === 'audio_guided') return Boolean(practice.audioUrl)
  if (practice.contentType === 'visual_guided') return Boolean(practice.steps?.length)
  if (practice.contentType === 'mixed') return Boolean(practice.audioUrl || practice.steps?.length)
  return false
}

function readProgress() {
  const value = readLocalJson(PROGRESS_KEY, {})
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
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
  getProgress(practiceId) {
    const practice = this.getById(practiceId)
    const progress = readProgress()[practiceId]
    if (!practice || !progress || !Number.isFinite(Number(progress.progressSeconds))) return null
    const seconds = Math.max(0, Math.min(Number(progress.progressSeconds), practice.durationSeconds))
    return { ...progress, practiceId, progressSeconds: seconds, completed: Boolean(progress.completed) || seconds >= practice.durationSeconds }
  },
  saveProgress(progress) {
    const practice = this.getById(progress?.practiceId)
    if (!practice || !Number.isFinite(Number(progress.progressSeconds))) return false
    const all = readProgress()
    const seconds = Math.max(0, Math.min(Number(progress.progressSeconds), practice.durationSeconds))
    all[practice.id] = { ...progress, practiceId: practice.id, progressSeconds: seconds, completed: Boolean(progress.completed) || seconds >= practice.durationSeconds, updatedAt: new Date().toISOString() }
    return writeLocalJson(PROGRESS_KEY, all)
  },
  completePractice(practiceId, durationSeconds, startedAt) { this.saveProgress({ practiceId, startedAt, progressSeconds: durationSeconds, completed: true }) },
}
