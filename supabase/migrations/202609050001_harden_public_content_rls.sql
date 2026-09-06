-- Harden public, read-only access for Con Duong Xua content.
-- No INSERT, UPDATE, or DELETE privileges/policies are granted to public roles.

alter table public.teachers enable row level security;
alter table public.content_sources enable row level security;
alter table public.meditation_methods enable row level security;
alter table public.meditation_sessions enable row level security;
alter table public.dhamma_talks enable row level security;
alter table public.videos enable row level security;
alter table public.support_practices enable row level security;

revoke all privileges on table public.teachers from anon, authenticated;
revoke all privileges on table public.content_sources from anon, authenticated;
revoke all privileges on table public.meditation_methods from anon, authenticated;
revoke all privileges on table public.meditation_sessions from anon, authenticated;
revoke all privileges on table public.dhamma_talks from anon, authenticated;
revoke all privileges on table public.videos from anon, authenticated;
revoke all privileges on table public.support_practices from anon, authenticated;

drop policy if exists "Public can read active teachers" on public.teachers;
drop policy if exists "Public can read active content sources" on public.content_sources;
drop policy if exists "Public can read playable meditation methods" on public.meditation_methods;
drop policy if exists "Public can read published meditation sessions" on public.meditation_sessions;
drop policy if exists "Public can read published dhamma talks" on public.dhamma_talks;
drop policy if exists "Public can read published videos" on public.videos;
drop policy if exists "Public can read published support practices" on public.support_practices;

create policy "Public can read active teachers"
on public.teachers
for select
to anon, authenticated
using (is_active);

create policy "Public can read active content sources"
on public.content_sources
for select
to anon, authenticated
using (is_active);

create policy "Public can read playable meditation methods"
on public.meditation_methods
for select
to anon, authenticated
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
        or (
          meditation_sessions.guidance_type = 'guided'
          and (
            meditation_sessions.audio_url is not null
            or meditation_sessions.audio_key is not null
          )
        )
        or (
          meditation_sessions.guidance_type = 'light_guidance'
          and (
            meditation_sessions.audio_url is not null
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
      )
  )
);

create policy "Public can read published meditation sessions"
on public.meditation_sessions
for select
to anon, authenticated
using (
  is_active
  and is_published
  and (
    guidance_type = 'silent'
    or (
      guidance_type = 'guided'
      and (audio_url is not null or audio_key is not null)
    )
    or (
      guidance_type = 'light_guidance'
      and (
        audio_url is not null
        or audio_key is not null
        or intro_audio_url is not null
        or closing_audio_url is not null
        or case
          when jsonb_typeof(interval_prompts) = 'array'
            then jsonb_array_length(interval_prompts) > 0
          else false
        end
      )
    )
  )
);

create policy "Public can read published dhamma talks"
on public.dhamma_talks
for select
to anon, authenticated
using (
  is_active
  and is_published
  and (audio_url is not null or audio_key is not null)
);

create policy "Public can read published videos"
on public.videos
for select
to anon, authenticated
using (
  is_active
  and is_published
  and btrim(youtube_video_id) <> ''
);

create policy "Public can read published support practices"
on public.support_practices
for select
to anon, authenticated
using (
  is_active
  and is_published
  and (
    (
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
  )
);

grant usage on schema public to anon, authenticated;

grant select (
  id,
  slug,
  name,
  name_vi,
  biography_vi,
  biography_en,
  tradition,
  lineage,
  monastery,
  image_url,
  website_url,
  is_active,
  created_at,
  updated_at
) on public.teachers to anon, authenticated;

-- Public attribution fields only. Permission/audit/contact columns intentionally
-- remain inaccessible to anon and authenticated clients.
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
) on public.content_sources to anon, authenticated;

grant select (
  id,
  slug,
  name_vi,
  name_pali,
  name_en,
  description_vi,
  description_en,
  canonical_source,
  sort_order,
  is_active,
  created_at,
  updated_at
) on public.meditation_methods to anon, authenticated;

grant select (
  id,
  slug,
  method_id,
  teacher_id,
  source_id,
  title_vi,
  title_en,
  description_vi,
  description_en,
  duration_seconds,
  guidance_type,
  language,
  audio_url,
  audio_key,
  intro_audio_url,
  closing_audio_url,
  interval_prompts,
  transcript_vi,
  transcript_en,
  is_published,
  is_active,
  published_at,
  created_at,
  updated_at
) on public.meditation_sessions to anon, authenticated;

grant select (
  id,
  slug,
  teacher_id,
  source_id,
  title_vi,
  title_en,
  description_vi,
  description_en,
  duration_seconds,
  language,
  audio_url,
  audio_key,
  transcript_vi,
  transcript_en,
  is_published,
  is_active,
  published_at,
  created_at,
  updated_at
) on public.dhamma_talks to anon, authenticated;

grant select (
  id,
  teacher_id,
  source_id,
  title_vi,
  title_en,
  youtube_video_id,
  source_url,
  language,
  duration_seconds,
  description_vi,
  description_en,
  is_published,
  is_active,
  created_at,
  updated_at
) on public.videos to anon, authenticated;

grant select (
  id,
  slug,
  title_vi,
  title_en,
  description_vi,
  description_en,
  practice_type,
  content_type,
  duration_seconds,
  hero_image_url,
  audio_url,
  audio_key,
  steps,
  is_published,
  is_active,
  sort_order,
  created_at,
  updated_at
) on public.support_practices to anon, authenticated;

-- Migration-time safety assertions: abort if a public role can mutate content
-- or read internal permission/contact fields.
do $$
declare
  role_name text;
  table_name text;
  private_column text;
  public_roles constant text[] := array['anon', 'authenticated'];
  content_tables constant text[] := array[
    'teachers',
    'content_sources',
    'meditation_methods',
    'meditation_sessions',
    'dhamma_talks',
    'videos',
    'support_practices'
  ];
  private_source_columns constant text[] := array[
    'permission_status',
    'permission_type',
    'permission_received_at',
    'permission_notes',
    'contact_name',
    'contact_email'
  ];
begin
  foreach role_name in array public_roles loop
    foreach table_name in array content_tables loop
      if has_table_privilege(role_name, format('public.%I', table_name), 'INSERT')
        or has_table_privilege(role_name, format('public.%I', table_name), 'UPDATE')
        or has_table_privilege(role_name, format('public.%I', table_name), 'DELETE') then
        raise exception '% unexpectedly has write access to public.%', role_name, table_name;
      end if;
    end loop;

    foreach private_column in array private_source_columns loop
      if has_column_privilege(
        role_name,
        'public.content_sources',
        private_column,
        'SELECT'
      ) then
        raise exception '% unexpectedly has access to content_sources.%',
          role_name,
          private_column;
      end if;
    end loop;
  end loop;
end;
$$;
