import { VALID_AUDIO_ITEMS as AUDIO_ITEMS } from './contentValidation.js'
import { hasPlayableAudio } from './audioStorage.js'

export const audioService = {
  getAll: () => AUDIO_ITEMS,
  getPlayable: () => AUDIO_ITEMS.filter(hasPlayableAudio),
  getById: (id) => AUDIO_ITEMS.find((item) => item.id === id),
  getBySlug: (slug) => AUDIO_ITEMS.find((item) => item.slug === slug),
  getFeatured: () => AUDIO_ITEMS.filter((item) => item.featured && hasPlayableAudio(item)),
  getByCategory: (category) => AUDIO_ITEMS.filter((item) => item.category === category && hasPlayableAudio(item)),
  getByTeacher: (teacherId) => AUDIO_ITEMS.filter((item) => item.teacherId === teacherId && hasPlayableAudio(item)),
  search(query, filters = {}) {
    const needle = query.trim().toLocaleLowerCase('vi')
    return AUDIO_ITEMS.filter((item) => {
      const textMatches = !needle || [item.title, item.teacher, item.collection, item.canonReference].filter(Boolean).some((value) => value.toLocaleLowerCase('vi').includes(needle))
      return hasPlayableAudio(item) && textMatches && (!filters.language || item.language === filters.language) && (!filters.category || item.category === filters.category) && (!filters.teacherId || item.teacherId === filters.teacherId)
    })
  },
}
