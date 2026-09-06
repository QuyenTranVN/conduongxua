-- Complete the approved DASIRA NARADA meditation collection after each R2
-- object was uploaded and independently verified.
--
-- Measured source durations (seconds) and stored nearest whole seconds:
--   15 minutes: 900.098322  -> 900
--   45 minutes: 2718.429751 -> 2718
--   60 minutes: 3600.161088 -> 3600
--
-- The 60-minute object is the AAC-LC M4A. Its decoded signal matches the local
-- 320 kbps MP3 duplicate, while using substantially less storage.

do $$
declare
  source_uuid uuid;
  method_uuid uuid;
begin
  select id
  into source_uuid
  from public.content_sources
  where slug = 'thien-duong-sinh-dasira-narada';

  if source_uuid is null then
    raise exception 'Required content source % does not exist',
      'thien-duong-sinh-dasira-narada';
  end if;

  select id
  into method_uuid
  from public.meditation_methods
  where slug = 'thien-dinh-chanh-niem';

  if method_uuid is null then
    raise exception 'Required meditation method % does not exist',
      'thien-dinh-chanh-niem';
  end if;

  insert into public.meditation_sessions (
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
    is_active,
    is_published,
    published_at
  )
  values
    (
      gen_random_uuid(),
      'thien-buong-thu-15-phut',
      method_uuid,
      null,
      source_uuid,
      'Thiền buông thư — 15 phút',
      null,
      null,
      null,
      900,
      'guided',
      'vi',
      null,
      'audio/meditation/thien-dinh-chanh-niem/thien-buong-thu-15-phut.mp3',
      null,
      null,
      null,
      null,
      null,
      true,
      true,
      now()
    ),
    (
      gen_random_uuid(),
      'thien-dinh-chanh-niem-can-ban-45-phut',
      method_uuid,
      null,
      source_uuid,
      'Thiền định chánh niệm căn bản — 45 phút',
      null,
      null,
      null,
      2718,
      'guided',
      'vi',
      null,
      'audio/meditation/thien-dinh-chanh-niem/thien-dinh-chanh-niem-can-ban-45-phut.mp3',
      null,
      null,
      null,
      null,
      null,
      true,
      true,
      now()
    ),
    (
      gen_random_uuid(),
      'huong-dan-thien-dinh-60-phut',
      method_uuid,
      null,
      source_uuid,
      'Hướng dẫn thiền định — 60 phút',
      null,
      null,
      null,
      3600,
      'guided',
      'vi',
      null,
      'audio/meditation/thien-dinh-chanh-niem/huong-dan-thien-dinh-60-phut.m4a',
      null,
      null,
      null,
      null,
      null,
      true,
      true,
      now()
    )
  on conflict (slug) do update
  set
    method_id = excluded.method_id,
    teacher_id = excluded.teacher_id,
    source_id = excluded.source_id,
    title_vi = excluded.title_vi,
    title_en = excluded.title_en,
    description_vi = excluded.description_vi,
    description_en = excluded.description_en,
    duration_seconds = excluded.duration_seconds,
    guidance_type = excluded.guidance_type,
    language = excluded.language,
    audio_url = excluded.audio_url,
    audio_key = excluded.audio_key,
    intro_audio_url = excluded.intro_audio_url,
    closing_audio_url = excluded.closing_audio_url,
    interval_prompts = excluded.interval_prompts,
    transcript_vi = excluded.transcript_vi,
    transcript_en = excluded.transcript_en,
    is_active = excluded.is_active,
    is_published = excluded.is_published,
    published_at = coalesce(public.meditation_sessions.published_at, excluded.published_at),
    updated_at = now();
end;
$$;
