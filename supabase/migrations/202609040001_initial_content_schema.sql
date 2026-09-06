-- Initial public content schema for Con Duong Xua.
-- User accounts and device-local progress are intentionally out of scope.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  name_vi text,
  biography_vi text,
  biography_en text,
  tradition text,
  lineage text,
  monastery text,
  image_url text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teachers_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint teachers_name_not_blank_check
    check (btrim(name) <> ''),
  constraint teachers_name_vi_not_blank_check
    check (name_vi is null or btrim(name_vi) <> ''),
  constraint teachers_monastery_not_blank_check
    check (monastery is null or btrim(monastery) <> ''),
  constraint teachers_image_url_not_blank_check
    check (image_url is null or btrim(image_url) <> ''),
  constraint teachers_website_url_check
    check (website_url is null or website_url ~* '^https?://[^[:space:]]+$')
);

create table public.content_sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  website_url text,
  youtube_url text,
  permission_status text not null default 'unknown',
  permission_type text,
  permission_received_at timestamptz,
  permission_notes text,
  attribution_text text,
  contact_name text,
  contact_email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_sources_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint content_sources_name_not_blank_check
    check (btrim(name) <> ''),
  constraint content_sources_website_url_check
    check (website_url is null or website_url ~* '^https?://[^[:space:]]+$'),
  constraint content_sources_youtube_url_check
    check (
      youtube_url is null
      or youtube_url ~* '^https?://(www\.)?(youtube\.com|youtu\.be)/[^[:space:]]+$'
    ),
  constraint content_sources_attribution_not_blank_check
    check (attribution_text is null or btrim(attribution_text) <> ''),
  constraint content_sources_permission_type_not_blank_check
    check (permission_type is null or btrim(permission_type) <> ''),
  constraint content_sources_permission_notes_not_blank_check
    check (permission_notes is null or btrim(permission_notes) <> ''),
  constraint content_sources_contact_name_not_blank_check
    check (contact_name is null or btrim(contact_name) <> ''),
  constraint content_sources_contact_email_check
    check (
      contact_email is null
      or contact_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    ),
  constraint content_sources_permission_status_check
    check (permission_status in (
      'unknown',
      'pending',
      'approved',
      'rejected',
      'restricted'
    ))
);

comment on column public.content_sources.website_url is
  'Public source website used for attribution and source discovery.';

comment on column public.content_sources.youtube_url is
  'Public YouTube channel or source URL used for attribution.';

comment on column public.content_sources.attribution_text is
  'Public credit text that may be returned by the content API and displayed in clients.';

comment on column public.content_sources.permission_status is
  'Internal audit status. This column is not granted to the public API role.';

comment on column public.content_sources.permission_type is
  'Internal description of the permission scope or license. Not public API data.';

comment on column public.content_sources.permission_received_at is
  'Internal audit timestamp recording when permission was received.';

comment on column public.content_sources.permission_notes is
  'Internal permission evidence or notes. Never expose through the normal public API.';

comment on column public.content_sources.contact_name is
  'Optional internal contact detail; store only when needed for permission auditing.';

comment on column public.content_sources.contact_email is
  'Optional internal contact detail; store only when needed and never expose publicly.';

create table public.meditation_methods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_vi text not null,
  name_pali text,
  name_en text,
  description_vi text,
  description_en text,
  canonical_source text,
  sort_order integer not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meditation_methods_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint meditation_methods_name_vi_not_blank_check
    check (btrim(name_vi) <> ''),
  constraint meditation_methods_name_pali_not_blank_check
    check (name_pali is null or btrim(name_pali) <> ''),
  constraint meditation_methods_name_en_not_blank_check
    check (name_en is null or btrim(name_en) <> ''),
  constraint meditation_methods_canonical_source_not_blank_check
    check (canonical_source is null or btrim(canonical_source) <> ''),
  constraint meditation_methods_sort_order_check
    check (sort_order >= 0)
);

comment on table public.meditation_methods is
  'Meditation taxonomy only. App visibility must be derived from active methods with at least one valid, playable, published meditation session.';

comment on column public.meditation_methods.is_active is
  'Administrative taxonomy status; false by default and not sufficient by itself to make a method visible in the app.';

create table public.meditation_sessions (
  id uuid primary key default gen_random_uuid(),
  method_id uuid not null references public.meditation_methods(id) on delete restrict,
  teacher_id uuid references public.teachers(id) on delete set null,
  source_id uuid references public.content_sources(id) on delete set null,
  slug text not null unique,
  title_vi text not null,
  title_en text,
  description_vi text,
  description_en text,
  guidance_type text not null,
  duration_seconds integer not null,
  language text not null default 'vi',
  audio_url text,
  audio_key text,
  intro_audio_url text,
  closing_audio_url text,
  interval_prompts jsonb,
  transcript_vi text,
  transcript_en text,
  is_active boolean not null default true,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meditation_sessions_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint meditation_sessions_title_vi_not_blank_check
    check (btrim(title_vi) <> ''),
  constraint meditation_sessions_title_en_not_blank_check
    check (title_en is null or btrim(title_en) <> ''),
  constraint meditation_sessions_guidance_type_check
    check (guidance_type in ('guided', 'light_guidance', 'silent')),
  constraint meditation_sessions_duration_check
    check (duration_seconds > 0 and duration_seconds <= 43200),
  constraint meditation_sessions_language_check
    check (language ~ '^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$'),
  constraint meditation_sessions_audio_url_check
    check (audio_url is null or audio_url ~* '^https?://[^[:space:]]+$'),
  constraint meditation_sessions_audio_key_not_blank_check
    check (audio_key is null or btrim(audio_key) <> ''),
  constraint meditation_sessions_intro_audio_url_check
    check (
      intro_audio_url is null
      or intro_audio_url ~* '^https?://[^[:space:]]+$'
    ),
  constraint meditation_sessions_closing_audio_url_check
    check (
      closing_audio_url is null
      or closing_audio_url ~* '^https?://[^[:space:]]+$'
    ),
  constraint meditation_sessions_interval_prompts_check
    check (interval_prompts is null or jsonb_typeof(interval_prompts) = 'array'),
  constraint meditation_sessions_guided_audio_check
    check (
      guidance_type <> 'guided'
      or audio_url is not null
      or audio_key is not null
    ),
  constraint meditation_sessions_light_guidance_content_check
    check (
      guidance_type <> 'light_guidance'
      or intro_audio_url is not null
      or audio_url is not null
      or audio_key is not null
      or closing_audio_url is not null
      or case
        when jsonb_typeof(interval_prompts) = 'array'
          then jsonb_array_length(interval_prompts) > 0
        else false
      end
    ),
  constraint meditation_sessions_published_at_check
    check (not is_published or published_at is not null)
);

comment on table public.meditation_sessions is
  'Playable meditation practices. Guided sessions require main audio; light guidance uses one or more guidance components; silent sessions require no teacher audio.';

comment on column public.meditation_sessions.audio_key is
  'Stable object key for audio stored in Cloudflare R2; resolve it to a delivery URL outside the database.';

comment on column public.meditation_sessions.audio_url is
  'Optional public streaming URL. Prefer deriving this value from audio_key and MEDIA_BASE_URL.';

comment on column public.meditation_sessions.interval_prompts is
  'Optional ordered JSON array of timed prompts used by light-guidance sessions.';

create table public.dhamma_talks (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  source_id uuid not null references public.content_sources(id) on delete restrict,
  slug text not null unique,
  title_vi text not null,
  title_en text,
  description_vi text,
  description_en text,
  duration_seconds integer not null,
  language text not null default 'vi',
  audio_url text,
  audio_key text,
  transcript_vi text,
  transcript_en text,
  is_active boolean not null default true,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dhamma_talks_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint dhamma_talks_title_vi_not_blank_check
    check (btrim(title_vi) <> ''),
  constraint dhamma_talks_title_en_not_blank_check
    check (title_en is null or btrim(title_en) <> ''),
  constraint dhamma_talks_language_check
    check (language ~ '^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$'),
  constraint dhamma_talks_duration_check
    check (duration_seconds > 0),
  constraint dhamma_talks_audio_url_check
    check (audio_url is null or audio_url ~* '^https?://[^[:space:]]+$'),
  constraint dhamma_talks_audio_key_not_blank_check
    check (audio_key is null or btrim(audio_key) <> ''),
  constraint dhamma_talks_published_audio_check
    check (not is_published or audio_url is not null or audio_key is not null),
  constraint dhamma_talks_published_at_check
    check (not is_published or published_at is not null)
);

comment on table public.dhamma_talks is
  'Listening and learning content; deliberately separate from meditation_sessions, which represent user practice.';

comment on column public.dhamma_talks.audio_key is
  'Stable object key for a Dhamma talk stored in Cloudflare R2.';

comment on column public.dhamma_talks.audio_url is
  'Optional public streaming URL. Prefer deriving this value from audio_key and MEDIA_BASE_URL.';

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(id) on delete restrict,
  source_id uuid not null references public.content_sources(id) on delete restrict,
  title_vi text not null,
  title_en text,
  youtube_video_id text not null unique,
  source_url text,
  language text not null default 'vi',
  duration_seconds integer,
  description_vi text,
  description_en text,
  is_active boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint videos_title_vi_not_blank_check
    check (btrim(title_vi) <> ''),
  constraint videos_title_en_not_blank_check
    check (title_en is null or btrim(title_en) <> ''),
  constraint videos_youtube_video_id_check
    check (youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
  constraint videos_source_url_check
    check (source_url is null or source_url ~* '^https?://[^[:space:]]+$'),
  constraint videos_language_check
    check (language ~ '^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$'),
  constraint videos_duration_check
    check (duration_seconds is null or duration_seconds > 0),
  constraint videos_description_vi_not_blank_check
    check (description_vi is null or btrim(description_vi) <> ''),
  constraint videos_description_en_not_blank_check
    check (description_en is null or btrim(description_en) <> '')
);

comment on table public.videos is
  'YouTube metadata only. Clients construct the embed player from youtube_video_id; video files must not be downloaded or rehosted.';

comment on column public.videos.youtube_video_id is
  'The required 11-character YouTube video identifier used by clients to construct an embed URL.';

comment on column public.videos.source_url is
  'Optional but recommended original YouTube page URL for provenance and attribution.';

create table public.support_practices (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_vi text not null,
  title_en text,
  description_vi text,
  description_en text,
  practice_type text not null,
  content_type text not null,
  duration_seconds integer not null,
  hero_image_url text,
  audio_url text,
  audio_key text,
  steps jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint support_practices_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint support_practices_title_vi_not_blank_check
    check (btrim(title_vi) <> ''),
  constraint support_practices_title_en_not_blank_check
    check (title_en is null or btrim(title_en) <> ''),
  constraint support_practices_practice_type_check
    check (practice_type in ('body_relaxation', 'evening_wind_down')),
  constraint support_practices_content_type_check
    check (content_type in ('audio_guided', 'visual_guided', 'mixed')),
  constraint support_practices_duration_check
    check (duration_seconds > 0),
  constraint support_practices_hero_image_url_check
    check (
      hero_image_url is null
      or hero_image_url ~* '^https?://[^[:space:]]+$'
    ),
  constraint support_practices_audio_url_check
    check (audio_url is null or audio_url ~* '^https?://[^[:space:]]+$'),
  constraint support_practices_audio_key_not_blank_check
    check (audio_key is null or btrim(audio_key) <> ''),
  constraint support_practices_steps_array_check
    check (jsonb_typeof(steps) = 'array'),
  constraint support_practices_published_content_check
    check (
      not is_published
      or (
        content_type = 'audio_guided'
        and (audio_url is not null or audio_key is not null)
      )
      or (
        content_type = 'visual_guided'
        and case
          when jsonb_typeof(steps) = 'array' then jsonb_array_length(steps) > 0
          else false
        end
      )
      or (
        content_type = 'mixed'
        and (audio_url is not null or audio_key is not null)
        and case
          when jsonb_typeof(steps) = 'array' then jsonb_array_length(steps) > 0
          else false
        end
      )
    ),
  constraint support_practices_sort_order_check
    check (sort_order >= 0)
);

comment on table public.support_practices is
  'Well-being support content kept separate from Buddhist meditation method taxonomy.';

comment on column public.support_practices.steps is
  'Ordered JSON array. Each step supports: id, titleVi, descriptionVi, imageUrl, durationSeconds, and optional audioStartSeconds/audioEndSeconds.';

comment on column public.support_practices.audio_key is
  'Stable object key for support-practice audio stored in Cloudflare R2.';

comment on column public.support_practices.audio_url is
  'Optional public streaming URL. Prefer deriving this value from audio_key and MEDIA_BASE_URL.';

create index teachers_active_name_idx
  on public.teachers (name)
  where is_active;

create index teachers_active_name_vi_idx
  on public.teachers (name_vi)
  where is_active and name_vi is not null;

create index teachers_active_tradition_lineage_idx
  on public.teachers (tradition, lineage)
  where is_active;

create index content_sources_active_name_idx
  on public.content_sources (name)
  where is_active;

create index content_sources_permission_status_idx
  on public.content_sources (permission_status);

create index meditation_methods_active_sort_idx
  on public.meditation_methods (sort_order, name_vi)
  where is_active;

create index meditation_methods_name_pali_idx
  on public.meditation_methods (name_pali)
  where name_pali is not null;

create index meditation_sessions_method_id_idx
  on public.meditation_sessions (method_id);

create index meditation_sessions_teacher_id_idx
  on public.meditation_sessions (teacher_id);

create index meditation_sessions_source_id_idx
  on public.meditation_sessions (source_id);

create index meditation_sessions_public_browse_idx
  on public.meditation_sessions (
    guidance_type,
    duration_seconds,
    language,
    published_at desc
  )
  where is_active and is_published;

create index dhamma_talks_teacher_id_idx
  on public.dhamma_talks (teacher_id);

create index dhamma_talks_source_id_idx
  on public.dhamma_talks (source_id);

create index dhamma_talks_public_browse_idx
  on public.dhamma_talks (published_at desc, teacher_id)
  where is_active and is_published;

create index dhamma_talks_publication_status_idx
  on public.dhamma_talks (is_published, is_active, published_at desc);

create index videos_teacher_id_idx
  on public.videos (teacher_id);

create index videos_source_id_idx
  on public.videos (source_id);

create index videos_public_browse_idx
  on public.videos (language, created_at desc)
  where is_active and is_published;

create index support_practices_public_browse_idx
  on public.support_practices (practice_type, content_type, sort_order)
  where is_active and is_published;

create trigger teachers_set_updated_at
before update on public.teachers
for each row execute function public.set_updated_at();

create trigger content_sources_set_updated_at
before update on public.content_sources
for each row execute function public.set_updated_at();

create trigger meditation_methods_set_updated_at
before update on public.meditation_methods
for each row execute function public.set_updated_at();

create trigger meditation_sessions_set_updated_at
before update on public.meditation_sessions
for each row execute function public.set_updated_at();

create trigger dhamma_talks_set_updated_at
before update on public.dhamma_talks
for each row execute function public.set_updated_at();

create trigger videos_set_updated_at
before update on public.videos
for each row execute function public.set_updated_at();

create trigger support_practices_set_updated_at
before update on public.support_practices
for each row execute function public.set_updated_at();

alter table public.teachers enable row level security;
alter table public.content_sources enable row level security;
alter table public.meditation_methods enable row level security;
alter table public.meditation_sessions enable row level security;
alter table public.dhamma_talks enable row level security;
alter table public.videos enable row level security;
alter table public.support_practices enable row level security;

create policy "Public can read active teachers"
on public.teachers for select to anon
using (is_active);

create policy "Public can read active content sources"
on public.content_sources for select to anon
using (is_active);

create policy "Public can read playable meditation methods"
on public.meditation_methods for select to anon
using (
  is_active
  and exists (
    select 1
    from public.meditation_sessions
    where meditation_sessions.method_id = meditation_methods.id
      and meditation_sessions.is_active
      and meditation_sessions.is_published
      and (
        meditation_sessions.guidance_type = 'silent'
        or meditation_sessions.audio_url is not null
        or meditation_sessions.audio_key is not null
        or meditation_sessions.intro_audio_url is not null
        or meditation_sessions.closing_audio_url is not null
        or case
          when jsonb_typeof(meditation_sessions.interval_prompts) = 'array'
            then jsonb_array_length(meditation_sessions.interval_prompts) > 0
          else false
        end
      )
  )
);

create policy "Public can read published meditation sessions"
on public.meditation_sessions for select to anon
using (is_active and is_published);

create policy "Public can read published dhamma talks"
on public.dhamma_talks for select to anon
using (is_active and is_published);

create policy "Public can read published videos"
on public.videos for select to anon
using (is_active and is_published);

create policy "Public can read published support practices"
on public.support_practices for select to anon
using (is_active and is_published);

grant usage on schema public to anon;
grant select on public.teachers to anon;
revoke select on public.content_sources from anon;
grant select (
  id,
  slug,
  name,
  website_url,
  youtube_url,
  attribution_text,
  is_active,
  created_at,
  updated_at
) on public.content_sources to anon;
grant select on public.meditation_methods to anon;
grant select on public.meditation_sessions to anon;
grant select on public.dhamma_talks to anon;
grant select on public.videos to anon;
grant select on public.support_practices to anon;
