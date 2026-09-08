# Playback ownership

Only one primary mode owns playback in an app instance: `none`, `listening`,
`guidedMeditation`, `silentMeditation`, or `supportPractice`.

## Handoff behavior

The ownership service synchronously asks the previous controller to save its
current position and pause before granting the next controller a new lease.
Paused sessions remain available to their existing continuation controls.
Switching between listening recordings saves the outgoing element's ID and
position before changing its source. Closing either meditation type pauses and preserves it; the explicit silent Stop button still discards it.
Closing meditation now pauses and saves it; it does not reset progress or
complete the practice. Opening Continue Practice restores the same session
and position paused, including after refresh. Its existing play control can
still explicitly resume playback. Saved records include paused state, selected
duration and a validated session snapshot for catalog sessions.

Bells belong to the current session. A handoff cancels scheduled bells,
oscillator tails, pending ambience loads/resumes, and fading ambience. Late
HTML audio play rejections cannot pause a newer request. Browser media actions
are assigned to the last owning mode and use the same handoff functions.

Before this change, only meditation paused listening. Listening and support
practice could leave meditation running. Progress could depend on a later
pause event or periodic save, and a late ambient load or closing bell could
sound after switching modes.

No colors, typography, spacing, layout, navigation, or visible controls changed.
No application dependencies were added. Ownership is not persisted: reloading
starts with `none`; progress and silent ambience preferences use existing local
storage records.

## Files

- `src/services/playbackOwnership.js`: central owner, leases, interruption and media-action dispatch.
- `src/lib/playbackOwnership.jsx`: controller registration with current callbacks.
- `src/lib/store.jsx`: exposes the current mode in application state.
- `src/lib/audio.jsx`: immediate listening handoff, track-specific progress, guarded playback requests.
- `src/lib/meditationAudio.jsx`: guided/silent ownership, pause/resume persistence, session effects.
- `src/services/ambientSoundService.js`: cancels pending starts, resumes and fading sources.
- `src/lib/bell.js`: cancels scheduled and active bells, including delayed browser resume.
- `src/components/meditation/QuickPractice.jsx`: unlocks audio on the user gesture; opening bells run after ownership is obtained.
- `src/screens/Meditate.jsx`: continuation bell follows ownership acquisition.
- `src/screens/Session.jsx`: uses the meditation controller for session bells.
- `src/screens/SupportPracticePlayer.jsx`: support-mode ownership and immediate saved progress on interruption/unmount.
- `tests/playback-ownership.test.js`: every cross-mode handoff, stale leases and cleanup.
- `tests/audio-cancellation.test.js`: pending fetch/resume, fade and bell cancellation.
- `tests/playback-ownership.browser.cjs`: real browser playback and persistence journeys.

## Validation

Run `npm test` and `npm run build`.
The browser script uses an existing Playwright installation without adding an
application dependency. Set `PLAYWRIGHT_MODULE` to that module's directory and
`TEST_BASE_URL` to a local Vite server. The server must use its own origin as
`VITE_API_URL` and local audio (empty `VITE_AUDIO_CDN_URL`). The script stubs the
meditation catalog and streams local recordings. Set `TEST_MOBILE=1` for a
390-by-844 touch viewport. `TEST_BROWSER` defaults to `msedge`.

Covered journeys:

1. Nghe -> guided -> Nghe, with saved positions and at most one playing audio element.
2. Track A -> B -> A, including rapid consecutive requests.
3. Listening -> support, support interruption and resume.
4. Silent session interruption, saved time/ambience, resume, and explicit stop.
5. Media play/pause targets the current/last session mode.
6. Late play rejection and delayed closing bells after switching to Nghe.

## Browser limits

Ownership is scoped to one app instance; separate tabs/devices are not
coordinated. Playback still depends on browser user-activation and OS audio
policies. Progress persistence depends on local storage being available.
Desktop Edge and mobile viewport/touch emulation were exercised; physical iOS
Safari and Android lock-screen behavior still require device testing. Existing
background timer/visibility policy is outside this ownership change.

## Guided close validation

Additional tests: `tests/guided-continuation.test.js` and `tests/guided-close.browser.cjs`.
Close saves without completing, paused seeking is retained, and Continue restores paused after refresh even before the catalog is available. Opening or closing that paused practice leaves Nghe playing independently; explicitly resuming meditation hands ownership back. Closing during a pending audio load also stays paused and resumable at zero.

Validated with 22 unit tests, desktop and mobile viewport guided-close journeys, the existing desktop ownership journeys, and a production build. No player markup or styles changed.

## Silent close continuation

Silent Close uses the shared pause/save path, stops ambience and bells, and retains original duration, elapsed time (remaining = duration minus elapsed), sound, volume and paused state. Normalized continuation records identify `guidanceType`. The silent countdown reads the shared provider clock so reopening shows saved progress accurately. Continue opens paused for both types; its explicit play control can resume. Layout and styles are unchanged.

Affected files: `src/screens/Session.jsx`, `src/screens/Meditate.jsx`, `src/services/meditationService.js` and `tests/silent-close.browser.cjs`. The browser test checks close, a frozen countdown, refresh, restored rain at the selected volume, explicit resume and Nghe independence.
