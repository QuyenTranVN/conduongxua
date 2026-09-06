export type Bindings = {
  SUPABASE_URL?: string
  SUPABASE_PUBLISHABLE_KEY?: string
  R2_BUCKET?: R2Bucket
  MEDIA_BASE_URL?: string
}

const REQUIRED_SUPABASE_VARIABLES = [
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
] as const

export function getSupabaseConfigStatus(env: Bindings) {
  const missing = REQUIRED_SUPABASE_VARIABLES.filter((name) => !env[name]?.trim())

  return {
    configured: missing.length === 0,
    missing,
  }
}

export function requireSupabaseConfig(env: Bindings) {
  const status = getSupabaseConfigStatus(env)

  if (!status.configured) {
    throw new Error(`Missing required Supabase configuration: ${status.missing.join(', ')}`)
  }

  return {
    url: env.SUPABASE_URL!.trim(),
    publishableKey: env.SUPABASE_PUBLISHABLE_KEY!.trim(),
  }
}

export function getR2ConfigStatus(env: Bindings) {
  const mediaBaseUrlConfigured = Boolean(env.MEDIA_BASE_URL?.trim())

  return {
    configured: mediaBaseUrlConfigured,
    missing: mediaBaseUrlConfigured ? [] : ['MEDIA_BASE_URL'],
    bucketBound: Boolean(env.R2_BUCKET),
    mediaBaseUrlConfigured,
  }
}

export function requireR2Bucket(env: Bindings): R2Bucket {
  if (!env.R2_BUCKET) {
    throw new Error('Missing required R2 bucket binding: R2_BUCKET')
  }

  return env.R2_BUCKET
}

export function requireMediaBaseUrl(env: Bindings): string {
  const value = env.MEDIA_BASE_URL?.trim()

  if (!value) {
    throw new Error('Missing required media configuration: MEDIA_BASE_URL')
  }

  let url: URL

  try {
    url = new URL(value)
  } catch {
    throw new Error('MEDIA_BASE_URL must be a valid absolute URL')
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    throw new Error('MEDIA_BASE_URL must use HTTP or HTTPS')
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error('MEDIA_BASE_URL must not contain credentials, a query, or a fragment')
  }

  return url.toString().replace(/\/$/, '')
}
