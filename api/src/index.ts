import { Hono } from 'hono'
import { cors } from 'hono/cors'
import {
  getR2ConfigStatus,
  getSupabaseConfigStatus,
  type Bindings,
} from './config/env'
import { teachersRoute } from './routes/teachers'
import { meditationMethodsRoute } from './routes/meditation-methods'
import { meditationSessionsRoute } from './routes/meditation-sessions'
import { supportPracticesRoute } from './routes/support-practices'
import { talksRoute } from './routes/talks'
import { videosRoute } from './routes/videos'
import { homeRoute } from './routes/home'

const app = new Hono<{ Bindings: Bindings }>()

app.use('/v1/*', cors({
  origin: '*',
  allowMethods: ['GET', 'OPTIONS'],
  allowHeaders: ['Accept', 'Content-Type'],
  maxAge: 86400,
}))

app.get('/health', (context) => {
  return context.json({
    status: 'ok',
    service: 'con-duong-xua-api',
  })
})

app.get('/health/config', (context) => {
  const supabase = getSupabaseConfigStatus(context.env)
  const r2 = getR2ConfigStatus(context.env)

  return context.json({
    status: supabase.configured && r2.configured ? 'ok' : 'configuration_required',
    service: 'con-duong-xua-api',
    supabase,
    r2,
  })
})

app.route('/v1/teachers', teachersRoute)
app.route('/v1/meditation/methods', meditationMethodsRoute)
app.route('/v1/meditation/sessions', meditationSessionsRoute)
app.route('/v1/talks', talksRoute)
app.route('/v1/videos', videosRoute)
app.route('/v1/support-practices', supportPracticesRoute)
app.route('/v1/home', homeRoute)

export default app
