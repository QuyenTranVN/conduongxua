import type { PublicMeditationMethod } from '../types/api'

export type MeditationSessionForVisibility = {
  is_active: boolean
  is_published: boolean
  guidance_type: 'guided' | 'light_guidance' | 'silent' | string
  audio_url: string | null
  audio_key: string | null
  intro_audio_url: string | null
  closing_audio_url: string | null
  interval_prompts: unknown
}

export type MeditationMethodWithSessions = {
  id: string
  slug: string
  name_vi: string
  name_pali: string | null
  name_en: string | null
  description_vi: string | null
  canonical_source: string | null
  sort_order: number
  meditation_sessions: MeditationSessionForVisibility[] | null
}

function hasText(value: string | null): boolean {
  return Boolean(value?.trim())
}

function hasPrompts(value: unknown): boolean {
  return Array.isArray(value) && value.length > 0
}

export function isPlayableSession(
  session: MeditationSessionForVisibility,
): boolean {
  if (!session.is_active || !session.is_published) {
    return false
  }

  if (session.guidance_type === 'silent') {
    return true
  }

  const hasMainAudio = hasText(session.audio_url) || hasText(session.audio_key)

  if (session.guidance_type === 'guided') {
    return hasMainAudio
  }

  if (session.guidance_type === 'light_guidance') {
    return (
      hasMainAudio
      || hasText(session.intro_audio_url)
      || hasText(session.closing_audio_url)
      || hasPrompts(session.interval_prompts)
    )
  }

  return false
}

export function toVisibleMeditationMethods(
  methods: MeditationMethodWithSessions[],
): PublicMeditationMethod[] {
  return methods
    .map((method) => ({
      method,
      availableSessionCount: (method.meditation_sessions ?? []).filter(
        isPlayableSession,
      ).length,
    }))
    .filter(({ availableSessionCount }) => availableSessionCount > 0)
    .sort((left, right) => {
      return (
        left.method.sort_order - right.method.sort_order
        || left.method.name_vi.localeCompare(right.method.name_vi, 'vi')
      )
    })
    .map(({ method, availableSessionCount }) => ({
      id: method.id,
      slug: method.slug,
      nameVi: method.name_vi,
      namePali: method.name_pali,
      nameEn: method.name_en,
      descriptionVi: method.description_vi,
      canonicalSource: method.canonical_source,
      availableSessionCount,
    }))
}
