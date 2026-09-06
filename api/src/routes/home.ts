import { Hono, type Context } from 'hono'
import { getSupabaseConfigStatus, type Bindings } from '../config/env'
import { isPlayableSession } from '../domain/meditation-methods'
import { apiError } from '../lib/api-response'
import { createSupabaseClient } from '../lib/supabase'
import {
  PUBLIC_SESSION_COLUMNS,
  toPublicSession,
  type MeditationSessionRow,
} from './meditation-sessions'
import {
  PUBLIC_TALK_COLUMNS,
  toPublicTalk,
  type DhammaTalkRow,
} from './talks'
import {
  PUBLIC_TEACHER_COLUMNS,
  toPublicTeacher,
  type TeacherRow,
} from './teachers'
import {
  PUBLIC_VIDEO_COLUMNS,
  toPublicVideo,
  type VideoRow,
} from './videos'
import type {
  ApiDataResponse,
  PublicHome,
} from '../types/api'

const FEATURED_TEACHER_LIMIT = 3
const FEATURED_VIDEO_LIMIT = 4
const MEDITATION_CANDIDATE_LIMIT = 10

export const homeRoute = new Hono<{ Bindings: Bindings }>()

homeRoute.get('/', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) {
    return context.json(
      apiError('API_CONFIGURATION_ERROR', 'The service is not configured correctly.'),
      500,
    )
  }

  try {
    const supabase = createSupabaseClient(context.env)
    const [meditations, talks, teachers, videos] = await Promise.all([
      supabase
        .from('meditation_sessions')
        .select(PUBLIC_SESSION_COLUMNS)
        .eq('is_active', true)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .order('id', { ascending: true })
        .limit(MEDITATION_CANDIDATE_LIMIT)
        .returns<MeditationSessionRow[]>(),
      supabase
        .from('dhamma_talks')
        .select(PUBLIC_TALK_COLUMNS)
        .eq('is_active', true)
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .order('id', { ascending: true })
        .limit(1)
        .returns<DhammaTalkRow[]>(),
      supabase
        .from('teachers')
        .select(PUBLIC_TEACHER_COLUMNS)
        .eq('is_active', true)
        .order('name', { ascending: true })
        .order('id', { ascending: true })
        .limit(FEATURED_TEACHER_LIMIT)
        .returns<TeacherRow[]>(),
      supabase
        .from('videos')
        .select(PUBLIC_VIDEO_COLUMNS)
        .eq('is_active', true)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .order('id', { ascending: true })
        .limit(FEATURED_VIDEO_LIMIT)
        .returns<VideoRow[]>(),
    ])

    if (meditations.error || talks.error || teachers.error || videos.error) {
      return fetchError(context)
    }

    const meditation = meditations.data?.find(isPlayableSession) ?? null
    const talk = talks.data?.[0] ?? null

    const data: PublicHome = {
      featuredMeditation: meditation
        ? toPublicSession(meditation, context.env)
        : null,
      featuredTalk: talk ? toPublicTalk(talk, context.env) : null,
      featuredTeachers: (teachers.data ?? []).map(toPublicTeacher),
      featuredVideos: (videos.data ?? []).map(toPublicVideo),
    }

    return context.json<ApiDataResponse<PublicHome>>({ data })
  } catch {
    return fetchError(context)
  }
})

function fetchError(context: Context<{ Bindings: Bindings }>) {
  return context.json(
    apiError('HOME_FETCH_FAILED', 'Unable to load home recommendations right now.'),
    502,
  )
}
