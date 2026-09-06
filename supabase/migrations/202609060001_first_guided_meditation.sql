-- First approved real meditation record for the end-to-end content path.
-- Source media inspection: 483.694875 seconds; stored as the nearest integer, 484.

do $$
declare
  source_uuid uuid;
  method_uuid uuid;
  session_uuid uuid;
begin
  select id
  into source_uuid
  from public.content_sources
  where slug = 'thien-duong-sinh-dasira-narada';

  if source_uuid is null then
    insert into public.content_sources (
      slug,
      name,
      youtube_url,
      permission_status,
      attribution_text,
      is_active
    )
    values (
      'thien-duong-sinh-dasira-narada',
      'Thiền Dưỡng Sinh DASIRA NARADA',
      'https://www.youtube.com/@thienduongsinhdasiranarada',
      'approved',
      'Âm thanh được chia sẻ với sự cho phép của Thiền Dưỡng Sinh DASIRA NARADA.',
      true
    )
    returning id into source_uuid;
  end if;

  select id
  into method_uuid
  from public.meditation_methods
  where slug = 'thien-dinh-chanh-niem';

  if method_uuid is null then
    insert into public.meditation_methods (
      slug,
      name_vi,
      sort_order,
      is_active
    )
    values (
      'thien-dinh-chanh-niem',
      'Thiền định chánh niệm',
      0,
      true
    )
    returning id into method_uuid;
  end if;

  select id
  into session_uuid
  from public.meditation_sessions
  where slug = 'huong-dan-thien-can-ban-8-phut';

  if session_uuid is null then
    insert into public.meditation_sessions (
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
      is_active,
      is_published,
      published_at
    )
    values (
      'huong-dan-thien-can-ban-8-phut',
      method_uuid,
      null,
      source_uuid,
      'Hướng dẫn thiền căn bản — 8 phút',
      null,
      null,
      null,
      484,
      'guided',
      'vi',
      null,
      'audio/meditation/thien-dinh-chanh-niem/huong-dan-thien-can-ban-8-phut.mp3',
      true,
      true,
      now()
    );
  end if;
end;
$$;
