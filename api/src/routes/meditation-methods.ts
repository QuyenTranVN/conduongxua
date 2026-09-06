import { Hono } from 'hono'
import { getSupabaseConfigStatus, type Bindings } from '../config/env'
import {
  toVisibleMeditationMethods,
  type MeditationMethodWithSessions,
} from '../domain/meditation-methods'
import { createSupabaseClient } from '../lib/supabase'
import { apiError } from '../lib/api-response'
import type {
  ApiDataResponse,
  ApiErrorResponse,
  PublicMeditationMethod,
} from '../types/api'

const PUBLIC_METHOD_WITH_SESSIONS = `
  id,
  slug,
  name_vi,
  name_pali,
  name_en,
  description_vi,
  canonical_source,
  sort_order,
  meditation_sessions!inner(
    is_active,
    is_published,
    guidance_type,
    audio_url,
    audio_key,
    intro_audio_url,
    closing_audio_url,
    interval_prompts
  )
`

export const meditationMethodsRoute = new Hono<{ Bindings: Bindings }>()

meditationMethodsRoute.get('/', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) {
    return context.json<ApiErrorResponse>(
      {
        error: {
          code: 'API_CONFIGURATION_ERROR',
          message: 'The service is not configured correctly.',
        },
      },
      500,
    )
  }

  try {
    const supabase = createSupabaseClient(context.env)
    const { data, error } = await supabase
      .from('meditation_methods')
      .select(PUBLIC_METHOD_WITH_SESSIONS)
      .eq('is_active', true)
      .eq('meditation_sessions.is_active', true)
      .eq('meditation_sessions.is_published', true)
      .order('sort_order', { ascending: true })
      .returns<MeditationMethodWithSessions[]>()

    if (error) {
      console.error('Failed to fetch visible meditation methods', {
        code: error.code,
      })

      return context.json<ApiErrorResponse>(
        {
          error: {
            code: 'MEDITATION_METHODS_FETCH_FAILED',
            message: 'Unable to load meditation methods right now.',
          },
        },
        502,
      )
    }

    const methods = toVisibleMeditationMethods(data ?? [])

    return context.json<ApiDataResponse<PublicMeditationMethod[]>>({
      data: methods,
    })
  } catch {
    return context.json<ApiErrorResponse>(
      {
        error: {
          code: 'MEDITATION_METHODS_FETCH_FAILED',
          message: 'Unable to load meditation methods right now.',
        },
      },
      502,
    )
  }
})

meditationMethodsRoute.get('/:slug', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) {
    return context.json(
      apiError('API_CONFIGURATION_ERROR', 'The service is not configured correctly.'),
      500,
    )
  }

  try {
    const { data, error } = await createSupabaseClient(context.env)
      .from('meditation_methods')
      .select(PUBLIC_METHOD_WITH_SESSIONS)
      .eq('slug', context.req.param('slug'))
      .eq('is_active', true)
      .eq('meditation_sessions.is_active', true)
      .eq('meditation_sessions.is_published', true)
      .limit(1)
      .returns<MeditationMethodWithSessions[]>()

    if (error) {
      return context.json(
        apiError('MEDITATION_METHOD_FETCH_FAILED', 'Unable to load the meditation method right now.'),
        502,
      )
    }

    const method = toVisibleMeditationMethods(data ?? [])[0]

    if (!method) {
      return context.json(
        apiError('MEDITATION_METHOD_NOT_FOUND', 'Meditation method not found.'),
        404,
      )
    }

    return context.json<ApiDataResponse<PublicMeditationMethod>>({ data: method })
  } catch {
    return context.json(
      apiError('MEDITATION_METHOD_FETCH_FAILED', 'Unable to load the meditation method right now.'),
      502,
    )
  }
})
