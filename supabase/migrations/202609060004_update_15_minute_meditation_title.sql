-- Update only the public title. Keep the stable session slug and R2 object key
-- unchanged so existing playback and saved progress references remain valid.
update public.meditation_sessions
set
  title_vi = 'Thiền buông thả — 15 phút',
  updated_at = now()
where slug = 'thien-buong-thu-15-phut'
  and source_id = 'c77a9bc9-12ed-4dfd-8b49-ea9d76572e6e'::uuid
  and method_id = '23d72fb3-7849-4454-b816-a8995460daf7'::uuid;

do $$
begin
  if not exists (
    select 1
    from public.meditation_sessions
    where slug = 'thien-buong-thu-15-phut'
      and title_vi = 'Thiền buông thả — 15 phút'
  ) then
    raise exception 'The approved 15-minute meditation session was not updated';
  end if;
end;
$$;
