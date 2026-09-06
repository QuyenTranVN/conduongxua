export type ApiDataResponse<T> = {
  data: T
}

export type PaginationMeta = {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type ApiListResponse<T> = ApiDataResponse<T[]> & {
  meta: PaginationMeta
}

export type ApiErrorResponse = {
  error: {
    code: string
    message: string
  }
}

export type PublicTeacher = {
  id: string
  slug: string
  name: string
  nameVi: string | null
  biographyVi: string | null
  biographyEn: string | null
  tradition: string | null
  lineage: string | null
  monastery: string | null
  imageUrl: string | null
  websiteUrl: string | null
}

export type PublicMeditationMethod = {
  id: string
  slug: string
  nameVi: string
  namePali: string | null
  nameEn: string | null
  descriptionVi: string | null
  canonicalSource: string | null
  availableSessionCount: number
}

export type PublicMeditationSession = {
  id: string
  slug: string
  methodId: string
  teacherId: string | null
  sourceId: string | null
  titleVi: string
  titleEn: string | null
  descriptionVi: string | null
  descriptionEn: string | null
  durationSeconds: number
  guidanceType: string
  language: string
  audioUrl: string | null
  introAudioUrl: string | null
  closingAudioUrl: string | null
  intervalPrompts: unknown
  transcriptVi: string | null
  transcriptEn: string | null
}

export type PublicDhammaTalk = {
  id: string
  slug: string
  teacherId: string
  sourceId: string
  titleVi: string
  titleEn: string | null
  descriptionVi: string | null
  descriptionEn: string | null
  durationSeconds: number
  language: string
  audioUrl: string | null
  transcriptVi: string | null
  transcriptEn: string | null
  publishedAt: string
}

export type PublicVideo = {
  id: string
  teacherId: string
  sourceId: string
  titleVi: string
  titleEn: string | null
  youtubeVideoId: string
  sourceUrl: string | null
  language: string
  durationSeconds: number | null
  descriptionVi: string | null
  descriptionEn: string | null
}

export type PublicSupportPractice = {
  id: string
  slug: string
  titleVi: string
  titleEn: string | null
  descriptionVi: string | null
  descriptionEn: string | null
  practiceType: string
  contentType: string
  durationSeconds: number
  heroImageUrl: string | null
  audioUrl: string | null
  steps: unknown[]
}

export type PublicHome = {
  featuredMeditation: PublicMeditationSession | null
  featuredTalk: PublicDhammaTalk | null
  featuredTeachers: PublicTeacher[]
  featuredVideos: PublicVideo[]
}
