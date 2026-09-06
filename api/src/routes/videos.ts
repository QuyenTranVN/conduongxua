import { Hono } from 'hono'
import { getSupabaseConfigStatus, type Bindings } from '../config/env'
import { apiError, getPagination, paginationMeta } from '../lib/api-response'
import { createSupabaseClient } from '../lib/supabase'
import type { ApiListResponse, PublicVideo } from '../types/api'

export type VideoRow = {
  id: string
  teacher_id: string
  source_id: string
  title_vi: string
  title_en: string | null
  youtube_video_id: string
  source_url: string | null
  language: string
  duration_seconds: number | null
  description_vi: string | null
  description_en: string | null
}

export const PUBLIC_VIDEO_COLUMNS = [
  'id', 'teacher_id', 'source_id', 'title_vi', 'title_en',
  'youtube_video_id', 'source_url', 'language', 'duration_seconds',
  'description_vi', 'description_en',
].join(',')

export const videosRoute = new Hono<{ Bindings: Bindings }>()

videosRoute.get('/', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) {
    return context.json(apiError('API_CONFIGURATION_ERROR', 'The service is not configured correctly.'), 500)
  }

  const pagination = getPagination(context.req.query('page'), context.req.query('pageSize'))

  try {
    const { data, error, count } = await createSupabaseClient(context.env)
      .from('videos')
      .select(PUBLIC_VIDEO_COLUMNS, { count: 'exact' })
      .eq('is_active', true)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(pagination.from, pagination.to)
      .returns<VideoRow[]>()

    if (error) throw new Error('query failed')

    return context.json<ApiListResponse<PublicVideo>>({
      data: (data ?? []).map(toPublicVideo),
      meta: paginationMeta(pagination.page, pagination.pageSize, count ?? 0),
    })
  } catch {
    return context.json(apiError('VIDEOS_FETCH_FAILED', 'Unable to load videos right now.'), 502)
  }
})

export function toPublicVideo(row: VideoRow): PublicVideo {
  return {
    id: row.id,
    teacherId: row.teacher_id,
    sourceId: row.source_id,
    titleVi: row.title_vi,
    titleEn: row.title_en,
    youtubeVideoId: row.youtube_video_id,
    sourceUrl: row.source_url,
    language: row.language,
    durationSeconds: row.duration_seconds,
    descriptionVi: row.description_vi,
    descriptionEn: row.description_en,
  }
}
