import { Hono, type Context } from 'hono'
import { getSupabaseConfigStatus, type Bindings } from '../config/env'
import {
  isPlayableSession,
  type MeditationSessionForVisibility,
} from '../domain/meditation-methods'
import { apiError, getPagination, paginationMeta } from '../lib/api-response'
import { resolvePublicAudioUrl } from '../lib/media'
import { createSupabaseClient } from '../lib/supabase'
import type {
  ApiDataResponse,
  ApiListResponse,
  PublicMeditationSession,
} from '../types/api'

export type MeditationSessionRow = MeditationSessionForVisibility & {
  id: string
  slug: string
  method_id: string
  teacher_id: string | null
  source_id: string | null
  title_vi: string
  title_en: string | null
  description_vi: string | null
  description_en: string | null
  duration_seconds: number
  language: string
  transcript_vi: string | null
  transcript_en: string | null
}

export const PUBLIC_SESSION_COLUMNS = [
  'id', 'slug', 'method_id', 'teacher_id', 'source_id',
  'title_vi', 'title_en', 'description_vi', 'description_en',
  'duration_seconds', 'guidance_type', 'language',
  'audio_url', 'audio_key', 'intro_audio_url', 'closing_audio_url',
  'interval_prompts', 'transcript_vi', 'transcript_en',
  'is_active', 'is_published',
].join(',')

export const meditationSessionsRoute = new Hono<{ Bindings: Bindings }>()

meditationSessionsRoute.get('/', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) {
    return context.json(apiError('API_CONFIGURATION_ERROR', 'The service is not configured correctly.'), 500)
  }

  const pagination = getPagination(
    context.req.query('page'),
    context.req.query('pageSize'),
  )
  const methodSlug = context.req.query('method')?.trim()

  try {
    const supabase = createSupabaseClient(context.env)
    let methodId: string | undefined

    if (methodSlug) {
      const { data: methods, error: methodError } = await supabase
        .from('meditation_methods')
        .select('id')
        .eq('slug', methodSlug)
        .eq('is_active', true)
        .limit(1)
        .returns<Array<{ id: string }>>()

      if (methodError) return fetchError(context)
      methodId = methods?.[0]?.id

      if (!methodId) {
        return context.json<ApiListResponse<PublicMeditationSession>>({
          data: [],
          meta: paginationMeta(pagination.page, pagination.pageSize, 0),
        })
      }
    }

    let query = supabase
      .from('meditation_sessions')
      .select(PUBLIC_SESSION_COLUMNS, { count: 'exact' })
      .eq('is_active', true)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(pagination.from, pagination.to)

    if (methodId) query = query.eq('method_id', methodId)

    const { data, error, count } = await query
      .returns<MeditationSessionRow[]>()

    if (error) return fetchError(context)

    const sessions = (data ?? [])
      .filter(isPlayableSession)
      .map((row) => toPublicSession(row, context.env))

    return context.json<ApiListResponse<PublicMeditationSession>>({
      data: sessions,
      meta: paginationMeta(pagination.page, pagination.pageSize, count ?? 0),
    })
  } catch {
    return fetchError(context)
  }
})

meditationSessionsRoute.get('/:slug', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) {
    return context.json(apiError('API_CONFIGURATION_ERROR', 'The service is not configured correctly.'), 500)
  }

  try {
    const { data, error } = await createSupabaseClient(context.env)
      .from('meditation_sessions')
      .select(PUBLIC_SESSION_COLUMNS)
      .eq('slug', context.req.param('slug'))
      .eq('is_active', true)
      .eq('is_published', true)
      .limit(1)
      .returns<MeditationSessionRow[]>()

    if (error) return fetchError(context)

    const row = data?.[0]

    if (!row || !isPlayableSession(row)) {
      return context.json(apiError('MEDITATION_SESSION_NOT_FOUND', 'Meditation session not found.'), 404)
    }

    return context.json<ApiDataResponse<PublicMeditationSession>>({
      data: toPublicSession(row, context.env),
    })
  } catch {
    return fetchError(context)
  }
})

export function toPublicSession(row: MeditationSessionRow, env: Bindings): PublicMeditationSession {
  return {
    id: row.id,
    slug: row.slug,
    methodId: row.method_id,
    teacherId: row.teacher_id,
    sourceId: row.source_id,
    titleVi: row.title_vi,
    titleEn: row.title_en,
    descriptionVi: row.description_vi,
    descriptionEn: row.description_en,
    durationSeconds: row.duration_seconds,
    guidanceType: row.guidance_type,
    language: row.language,
    audioUrl: resolvePublicAudioUrl({ audioKey: row.audio_key, audioUrl: row.audio_url }, env),
    introAudioUrl: row.intro_audio_url,
    closingAudioUrl: row.closing_audio_url,
    intervalPrompts: row.interval_prompts,
    transcriptVi: row.transcript_vi,
    transcriptEn: row.transcript_en,
  }
}

function fetchError(context: Context<{ Bindings: Bindings }>) {
  return context.json(
    apiError('MEDITATION_SESSIONS_FETCH_FAILED', 'Unable to load meditation sessions right now.'),
    502,
  )
}
