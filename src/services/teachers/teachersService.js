import { TEACHERS as LOCAL_TEACHERS } from '../../data/content.js'
import { apiGet } from '../api/apiClient.js'

let teachersPromise

export const teachersService = {
  async getTeachers({ signal, force = false } = {}) {
    if (!teachersPromise || force || signal) {
      const request = apiGet('/v1/teachers', { signal })
        .then(({ data }) => data.length
          ? data.map(toUiTeacher)
          : getTemporaryLocalTeachers())
        // Temporary V1 fallback until Supabase has real teacher records.
        .catch(() => getTemporaryLocalTeachers())
      if (!signal) teachersPromise = request.catch((error) => {
        teachersPromise = undefined
        throw error
      })
      else return request
    }
    return teachersPromise
  },

  async getTeacher(slug, { signal } = {}) {
    const cachedTeacher = (await this.getTeachers()).find(
      (teacher) => teacher.slug === slug || teacher.legacyId === slug,
    )
    if (cachedTeacher) return cachedTeacher

    const { data } = await apiGet(`/v1/teachers/${encodeURIComponent(slug)}`, {
      signal,
    })
    return toUiTeacher(data)
  },
}

function toUiTeacher(teacher) {
  const localTeacher = LOCAL_TEACHERS.find((item) => item.name === teacher.name)
  const lineage = normalizeLineage(teacher.lineage || teacher.tradition)

  return {
    id: teacher.slug,
    apiId: teacher.id,
    slug: teacher.slug,
    legacyId: localTeacher?.id,
    name: teacher.nameVi || teacher.name_vi || teacher.name,
    canonicalName: teacher.name,
    lineage,
    tradition: teacher.tradition,
    monastery: teacher.monastery,
    img: teacher.imageUrl || teacher.image_url,
    bio: teacher.biographyVi || teacher.biography_vi || teacher.biographyEn || teacher.biography_en || '',
    websiteUrl: teacher.websiteUrl || teacher.website_url,
    years: localTeacher?.years || '',
  }
}

function getTemporaryLocalTeachers() {
  return LOCAL_TEACHERS.map((teacher) => ({
    ...teacher,
    apiId: null,
    slug: teacher.id,
    legacyId: teacher.id,
    canonicalName: teacher.name,
    tradition: null,
    monastery: null,
    websiteUrl: null,
  }))
}

function normalizeLineage(value = '') {
  const normalized = value.toLocaleLowerCase()
  if (normalized.includes('ajahn chah')) return 'chah'
  if (normalized.includes('forest') || normalized.includes('rừng')) return 'forest'
  return 'other'
}
