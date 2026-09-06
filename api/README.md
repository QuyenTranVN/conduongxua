# Con Đường Xưa API

Public, read-only API for Con Đường Xưa, built with Hono and Cloudflare Workers.

The API reads public content from Supabase. Authentication and user data are
intentionally not part of this version.

## Requirements

- Node.js 22 or newer (required by the current Supabase JavaScript client)

## Development

```bash
npm install
cp .dev.vars.example .dev.vars
npm run typecheck
npm run dev
```

The local health endpoint is available at `http://localhost:8787/health`.

Local development requires these values in `.dev.vars`:

```dotenv
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
MEDIA_BASE_URL=https://media.example.com
```

Copy the placeholders from `.dev.vars.example` and replace them locally. Never
commit `.dev.vars`, `.env`, or their environment-specific variants.

`GET /health` does not depend on external services. `GET /health/config`
reports only configuration status and names of missing variables; it never
returns configured values. Database routes such as `GET /v1/teachers` return a
sanitized configuration error when required Supabase variables are absent.

## Production configuration

Configure `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, and `MEDIA_BASE_URL` as
Cloudflare Worker environment variables for each deployed environment. They
must not be committed to `wrangler.jsonc` or source code. Values can be managed
in the Cloudflare dashboard or with Wrangler's secret-variable workflow, for
example:

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_PUBLISHABLE_KEY
npx wrangler secret put MEDIA_BASE_URL
```

The publishable key is intentionally the public/anon-style Supabase key used
with Row Level Security. Never configure a Supabase service-role key in this
public read-only API.

## R2 media configuration

Set `MEDIA_BASE_URL` to the public R2 development URL or a custom media
domain. Keep the value environment-specific; the API does not hardcode a
production domain.

Bind the R2 bucket as `R2_BUCKET` through a Cloudflare Worker R2 binding after
the real development and production buckets have been created. Do not add R2
access-key IDs or secret-access keys to `.dev.vars` or Worker variables. A
commented binding template is included in `wrangler.jsonc`, so placeholder
bucket names do not break local startup.

Use these object-key prefixes:

```text
audio/meditation/
audio/dhamma/
audio/support/
images/teachers/
images/support/
images/places/
```

`getPublicMediaUrl` in `src/lib/media.ts` converts a stored object key into a
public URL. `resolvePublicAudioUrl` prefers `audio_key` plus `MEDIA_BASE_URL`
and falls back to an explicitly stored public `audio_url`. These helpers do not
fetch objects, require authentication, or generate signed URLs.
