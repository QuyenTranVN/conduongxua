import { Hono, type Context } from 'hono'
import { getSupabaseConfigStatus, type Bindings } from '../config/env'
import { apiError, getPagination, paginationMeta } from '../lib/api-response'
import { resolvePublicAudioUrl } from '../lib/media'
import { createSupabaseClient } from '../lib/supabase'
import type {
  ApiDataResponse,
  ApiListResponse,
  PublicSupportPractice,
} from '../types/api'

type SupportPracticeRow = {
  id: string
  slug: string
  title_vi: string
  title_en: string | null
  description_vi: string | null
  description_en: string | null
  practice_type: string
  content_type: string
  duration_seconds: number
  hero_image_url: string | null
  audio_url: string | null
  audio_key: string | null
  steps: unknown[]
}

const PUBLIC_SUPPORT_COLUMNS = [
  'id', 'slug', 'title_vi', 'title_en', 'description_vi', 'description_en',
  'practice_type', 'content_type', 'duration_seconds', 'hero_image_url',
  'audio_url', 'audio_key', 'steps',
].join(',')

export const supportPracticesRoute = new Hono<{ Bindings: Bindings }>()

supportPracticesRoute.get('/', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) return configError(context)

  const pagination = getPagination(context.req.query('page'), context.req.query('pageSize'))

  try {
    const { data, error, count } = await createSupabaseClient(context.env)
      .from('support_practices')
      .select(PUBLIC_SUPPORT_COLUMNS, { count: 'exact' })
      .eq('is_active', true)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .range(pagination.from, pagination.to)
      .returns<SupportPracticeRow[]>()

    if (error) return fetchError(context)

    return context.json<ApiListResponse<PublicSupportPractice>>({
      data: (data ?? []).map((row) => toPublicPractice(row, context.env)),
      meta: paginationMeta(pagination.page, pagination.pageSize, count ?? 0),
    })
  } catch {
    return fetchError(context)
  }
})

supportPracticesRoute.get('/:slug', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) return configError(context)

  try {
    const { data, error } = await createSupabaseClient(context.env)
      .from('support_practices')
      .select(PUBLIC_SUPPORT_COLUMNS)
      .eq('slug', context.req.param('slug'))
      .eq('is_active', true)
      .eq('is_published', true)
      .limit(1)
      .returns<SupportPracticeRow[]>()

    if (error) return fetchError(context)

    const row = data?.[0]
    if (!row) {
      return context.json(apiError('SUPPORT_PRACTICE_NOT_FOUND', 'Support practice not found.'), 404)
    }

    return context.json<ApiDataResponse<PublicSupportPractice>>({
      data: toPublicPractice(row, context.env),
    })
  } catch {
    return fetchError(context)
  }
})

function toPublicPractice(row: SupportPracticeRow, env: Bindings): PublicSupportPractice {
  return {
    id: row.id,
    slug: row.slug,
    titleVi: row.title_vi,
    titleEn: row.title_en,
    descriptionVi: row.description_vi,
    descriptionEn: row.description_en,
    practiceType: row.practice_type,
    contentType: row.content_type,
    durationSeconds: row.duration_seconds,
    heroImageUrl: row.hero_image_url,
    audioUrl: resolvePublicAudioUrl({ audioKey: row.audio_key, audioUrl: row.audio_url }, env),
    steps: row.steps,
  }
}

function configError(context: Context<{ Bindings: Bindings }>) {
  return context.json(apiError('API_CONFIGURATION_ERROR', 'The service is not configured correctly.'), 500)
}

function fetchError(context: Context<{ Bindings: Bindings }>) {
  return context.json(
    apiError('SUPPORT_PRACTICES_FETCH_FAILED', 'Unable to load support practices right now.'),
    502,
  )
}
