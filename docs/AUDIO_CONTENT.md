# Audio content workflow

## Architecture

The app never plays a Theravada.vn MP3 URL. Approved recordings follow this path:

`Theravada.vn → controlled importer → object storage → public CDN → global app player`

The frontend receives only `VITE_AUDIO_CDN_URL`. Storage credentials belong only in the terminal or a protected CI secret and must never be added under `src/` or committed.

All listening and guided-meditation URLs are resolved by `src/services/audioStorage.js`. Content may store either a storage-relative path (`Meditation/example.mp3`), a local-style path (`/audio/Meditation/example.mp3`), or an approved absolute URL. Do not concatenate audio URLs inside screens or player components.

## Storage layout

```text
audio/
  teachers/ajahn-chah/
  teachers/ajahn-jayasaro/
  teachers/ajahn-brahm/
  suttas/dn/
  suttas/mn/
  suttas/sn/
  suttas/an/
  suttas/kn/
  meditation/guided/breathing/
  meditation/guided/walking/
  meditation/silent/
  chanting/pali/
  chanting/vietnamese/
```

Use lowercase ASCII slugs with hyphens. Production MP3 files do not belong in `public/audio`; that folder is only a development fallback.

## Add the first approved recording

1. Select one recording covered by the permission from Theravada.vn.
2. Add only that recording to `content/audio-import.json`. Supply its exact page URL, exact audio URL, and safe destination.
3. Validate without downloading:

   ```bash
   npm run audio:import -- --dry-run
   ```

4. Configure the server-side environment shown in `.env.example`, then run:

   ```bash
   npm run audio:import
   ```

5. The importer validates HTTPS URLs, path safety, MIME type and audio signature; it rejects HTML/error pages and refuses known existing destinations.
6. Add or verify the matching metadata in `src/data/audio.ts`.
7. Set `VITE_AUDIO_CDN_URL` for the frontend and test playback.

The importer reads only explicit manifest entries. It does not crawl pages or discover URLs.

## Required metadata and attribution

Each `AudioItem` needs an ID, slug, verified title, category, language, storage-relative `audioPath`, original page provenance, attribution, and approved permission status. Teacher, duration, description, canonical reference, collection, and publication date should only be added when verified.

Keep these concepts separate:

- `audioPath` is played from our CDN.
- `source.pageUrl` is shown as “Xem nội dung gốc.”
- `source.originalAudioUrl` is retained for provenance/importing and is never used by the player.

Every Theravada.vn detail page displays: “Audio được chia sẻ với sự cho phép của Theravada.vn.”

## Player, progress, and favorites

`AudioProvider` owns the app's single HTML audio element. Playback survives internal route changes. Listening progress is stored locally under `con-duong-xua:audio-progress`; an item is completed at 93%. Favorites use `con-duong-xua:audio-favorites`. These storage calls can later be replaced with API endpoints without changing screen components.

Guided meditation uses the same URL resolver and pauses the listening player before it starts. Empty sources are not launchable. Network and media failures remain inside their player and can be retried with the existing play control.

Teacher/audio relationships use `teacherId`. Future APIs can replace `audioService` with `GET /api/audio`, `GET /api/audio/:slug`, and `GET /api/teachers/:slug/audio` while preserving the existing model.
