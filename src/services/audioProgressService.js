import { readLocalJson, writeLocalJson } from './localStorageService.js'

export const AUDIO_PROGRESS_KEY = 'con-duong-xua:audio-progress'

const readAll = () => {
  const value = readLocalJson(AUDIO_PROGRESS_KEY, {})
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

export const audioProgressService = {
  get(audioId) {
    const progress = readAll()[audioId]
    if (!progress || !Number.isFinite(Number(progress.currentTime)) || !Number.isFinite(Number(progress.duration)) || Number(progress.duration) <= 0) return null
    const duration = Number(progress.duration)
    const currentTime = Math.max(0, Math.min(Number(progress.currentTime), duration))
    return { ...progress, audioId, currentTime, duration, completed: Boolean(progress.completed) || currentTime / duration >= .93 }
  },
  save(audioId, time, total) {
    if (!audioId || !Number.isFinite(Number(total)) || Number(total) <= 0) return false
    const duration = Number(total)
    const currentTime = Math.max(0, Math.min(Number(time) || 0, duration))
    const all = readAll()
    all[audioId] = { audioId, currentTime, duration, updatedAt: new Date().toISOString(), completed: currentTime / duration >= .93 }
    return writeLocalJson(AUDIO_PROGRESS_KEY, all)
  },
  getUnfinished(items) {
    return items.map((item) => ({ item, progress: this.get(item.id) })).filter(({ progress }) => progress && progress.currentTime > 0 && !progress.completed).sort((a, b) => String(b.progress.updatedAt || '').localeCompare(String(a.progress.updatedAt || '')))
  },
}
