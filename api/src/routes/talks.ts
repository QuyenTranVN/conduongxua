import { Hono, type Context } from 'hono'
import { getSupabaseConfigStatus, type Bindings } from '../config/env'
import { apiError, getPagination, paginationMeta } from '../lib/api-response'
import { resolvePublicAudioUrl } from '../lib/media'
import { createSupabaseClient } from '../lib/supabase'
import type { ApiDataResponse, ApiListResponse, PublicDhammaTalk } from '../types/api'

export type DhammaTalkRow = {
  id: string
  slug: string
  teacher_id: string
  source_id: string
  title_vi: string
  title_en: string | null
  description_vi: string | null
  description_en: string | null
  duration_seconds: number
  language: string
  audio_url: string | null
  audio_key: string | null
  transcript_vi: string | null
  transcript_en: string | null
  published_at: string
}

export const PUBLIC_TALK_COLUMNS = [
  'id', 'slug', 'teacher_id', 'source_id', 'title_vi', 'title_en',
  'description_vi', 'description_en', 'duration_seconds', 'language',
  'audio_url', 'audio_key', 'transcript_vi', 'transcript_en', 'published_at',
].join(',')

export const talksRoute = new Hono<{ Bindings: Bindings }>()

talksRoute.get('/', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) return configError(context)

  const pagination = getPagination(context.req.query('page'), context.req.query('pageSize'))

  try {
    const { data, error, count } = await createSupabaseClient(context.env)
      .from('dhamma_talks')
      .select(PUBLIC_TALK_COLUMNS, { count: 'exact' })
      .eq('is_active', true)
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(pagination.from, pagination.to)
      .returns<DhammaTalkRow[]>()

    if (error) return fetchError(context)

    return context.json<ApiListResponse<PublicDhammaTalk>>({
      data: (data ?? []).map((row) => toPublicTalk(row, context.env)),
      meta: paginationMeta(pagination.page, pagination.pageSize, count ?? 0),
    })
  } catch {
    return fetchError(context)
  }
})

talksRoute.get('/:slug', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) return configError(context)

  try {
    const { data, error } = await createSupabaseClient(context.env)
      .from('dhamma_talks')
      .select(PUBLIC_TALK_COLUMNS)
      .eq('slug', context.req.param('slug'))
      .eq('is_active', true)
      .eq('is_published', true)
      .limit(1)
      .returns<DhammaTalkRow[]>()

    if (error) return fetchError(context)

    const row = data?.[0]
    if (!row) return context.json(apiError('TALK_NOT_FOUND', 'Dhamma talk not found.'), 404)

    return context.json<ApiDataResponse<PublicDhammaTalk>>({
      data: toPublicTalk(row, context.env),
    })
  } catch {
    return fetchError(context)
  }
})

export function toPublicTalk(row: DhammaTalkRow, env: Bindings): PublicDhammaTalk {
  return {
    id: row.id,
    slug: row.slug,
    teacherId: row.teacher_id,
    sourceId: row.source_id,
    titleVi: row.title_vi,
    titleEn: row.title_en,
    descriptionVi: row.description_vi,
    descriptionEn: row.description_en,
    durationSeconds: row.duration_seconds,
    language: row.language,
    audioUrl: resolvePublicAudioUrl({ audioKey: row.audio_key, audioUrl: row.audio_url }, env),
    transcriptVi: row.transcript_vi,
    transcriptEn: row.transcript_en,
    publishedAt: row.published_at,
  }
}

function configError(context: Context<{ Bindings: Bindings }>) {
  return context.json(apiError('API_CONFIGURATION_ERROR', 'The service is not configured correctly.'), 500)
}

function fetchError(context: Context<{ Bindings: Bindings }>) {
  return context.json(apiError('TALKS_FETCH_FAILED', 'Unable to load Dhamma talks right now.'), 502)
}
