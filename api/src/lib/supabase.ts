import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { requireSupabaseConfig, type Bindings } from '../config/env'

export function createSupabaseClient(env: Bindings): SupabaseClient {
  const { url, publishableKey } = requireSupabaseConfig(env)

  return createClient(url, publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch: (...args) => globalThis.fetch(...args),
    },
  })
}
