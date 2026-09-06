-- Add the approved DASIRA NARADA guided meditation sessions only after their
-- R2 objects have been uploaded and verified.
--
-- Measured source durations (seconds) and stored nearest whole seconds:
--   30 minutes:  1817.518730 -> 1818
--   90 minutes:  5407.625578 -> 5408
--   120 minutes: 7200.391837 -> 7200

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
      'huong-dan-thien-dinh-chanh-niem-30-phut',
      method_uuid,
      null,
      source_uuid,
      'Hướng dẫn thiền định chánh niệm — 30 phút',
      null,
      null,
      null,
      1818,
      'guided',
      'vi',
      null,
      'audio/meditation/thien-dinh-chanh-niem/huong-dan-thien-dinh-chanh-niem-30-phut.mp3',
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
      'huong-dan-thien-dinh-chanh-niem-90-phut',
      method_uuid,
      null,
      source_uuid,
      'Hướng dẫn thiền định chánh niệm — 90 phút',
      null,
      null,
      null,
      5408,
      'guided',
      'vi',
      null,
      'audio/meditation/thien-dinh-chanh-niem/huong-dan-thien-dinh-chanh-niem-90-phut.mp3',
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
      'huong-dan-thien-dinh-chanh-niem-120-phut',
      method_uuid,
      null,
      source_uuid,
      'Hướng dẫn thiền định chánh niệm — 120 phút',
      null,
      null,
      null,
      7200,
      'guided',
      'vi',
      null,
      'audio/meditation/thien-dinh-chanh-niem/huong-dan-thien-dinh-chanh-niem-120-phut.mp3',
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
