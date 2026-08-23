import { AUDIO_ITEMS } from '../data/audio.ts'

export const audioService = {
  getAll: () => AUDIO_ITEMS,
  getById: (id) => AUDIO_ITEMS.find((item) => item.id === id),
  getBySlug: (slug) => AUDIO_ITEMS.find((item) => item.slug === slug),
  getFeatured: () => AUDIO_ITEMS.filter((item) => item.featured),
  getByCategory: (category) => AUDIO_ITEMS.filter((item) => item.category === category),
  getByTeacher: (teacherId) => AUDIO_ITEMS.filter((item) => item.teacherId === teacherId),
  search(query, filters = {}) {
    const needle = query.trim().toLocaleLowerCase('vi')
    return AUDIO_ITEMS.filter((item) => {
      const textMatches = !needle || [item.title, item.teacher, item.collection, item.canonReference].filter(Boolean).some((value) => value.toLocaleLowerCase('vi').includes(needle))
      return textMatches && (!filters.language || item.language === filters.language) && (!filters.category || item.category === filters.category) && (!filters.teacherId || item.teacherId === filters.teacherId)
    })
  },
}
