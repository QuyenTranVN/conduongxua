import { Hono } from 'hono'
import { createSupabaseClient } from '../lib/supabase'
import { apiError } from '../lib/api-response'
import { getSupabaseConfigStatus, type Bindings } from '../config/env'
import type {
  ApiDataResponse,
  ApiErrorResponse,
  PublicTeacher,
} from '../types/api'

export const PUBLIC_TEACHER_COLUMNS = [
  'id',
  'slug',
  'name',
  'name_vi',
  'biography_vi',
  'biography_en',
  'tradition',
  'lineage',
  'monastery',
  'image_url',
  'website_url',
].join(',')

export type TeacherRow = {
  id: string
  slug: string
  name: string
  name_vi: string | null
  biography_vi: string | null
  biography_en: string | null
  tradition: string | null
  lineage: string | null
  monastery: string | null
  image_url: string | null
  website_url: string | null
}

export function toPublicTeacher(row: TeacherRow): PublicTeacher {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameVi: row.name_vi,
    biographyVi: row.biography_vi,
    biographyEn: row.biography_en,
    tradition: row.tradition,
    lineage: row.lineage,
    monastery: row.monastery,
    imageUrl: row.image_url,
    websiteUrl: row.website_url,
  }
}

export const teachersRoute = new Hono<{ Bindings: Bindings }>()

teachersRoute.get('/', async (context) => {
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
      .from('teachers')
      .select(PUBLIC_TEACHER_COLUMNS)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .returns<TeacherRow[]>()

    if (error) {
      console.error('Failed to fetch active teachers', { code: error.code })

      return context.json<ApiErrorResponse>(
        {
          error: {
            code: 'TEACHERS_FETCH_FAILED',
            message: 'Unable to load teachers right now.',
          },
        },
        502,
      )
    }

    return context.json<ApiDataResponse<PublicTeacher[]>>({
      data: (data ?? []).map(toPublicTeacher),
    })
  } catch {
    return context.json<ApiErrorResponse>(
      {
        error: {
          code: 'TEACHERS_FETCH_FAILED',
          message: 'Unable to load teachers right now.',
        },
      },
      502,
    )
  }
})

teachersRoute.get('/:slug', async (context) => {
  if (!getSupabaseConfigStatus(context.env).configured) {
    return context.json(
      apiError('API_CONFIGURATION_ERROR', 'The service is not configured correctly.'),
      500,
    )
  }

  try {
    const { data, error } = await createSupabaseClient(context.env)
      .from('teachers')
      .select(PUBLIC_TEACHER_COLUMNS)
      .eq('slug', context.req.param('slug'))
      .eq('is_active', true)
      .limit(1)
      .returns<TeacherRow[]>()

    if (error) {
      return context.json(
        apiError('TEACHER_FETCH_FAILED', 'Unable to load the teacher right now.'),
        502,
      )
    }

    const teacher = data?.[0]

    if (!teacher) {
      return context.json(apiError('TEACHER_NOT_FOUND', 'Teacher not found.'), 404)
    }

    return context.json<ApiDataResponse<PublicTeacher>>({
      data: toPublicTeacher(teacher),
    })
  } catch {
    return context.json(
      apiError('TEACHER_FETCH_FAILED', 'Unable to load the teacher right now.'),
      502,
    )
  }
})
