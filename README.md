# Con Đường Xưa — Đạo Phật Nguyên Thuỷ

A mobile-first Theravāda practice app: guided meditation, a silent timer,
Dhamma talks, teachers by lineage, and a personal library.

Built with **Vite + React 18**. No UI framework, no CSS framework, no state
library — everything is plain React and CSS custom properties, so you can read
all of it.

---

## Run it locally

You need **Node.js 18 or newer**. Check with `node -v`.

```bash
# 1. install dependencies
npm install

# 2. start the dev server
npm run dev
```

Vite prints a local address (usually `http://localhost:5173`) and opens it.
Edits hot-reload.

**To see it as a phone:** open DevTools (F12) → the device-toolbar icon → pick
iPhone 14 Pro. On a desktop browser at full width the app renders inside a
phone frame so proportions stay honest.

**On your actual phone:** run `npm run dev -- --host`, then open the Network
address it prints from a device on the same Wi-Fi.

### Other commands

```bash
npm run build     # production bundle into dist/
npm run preview   # serve the built bundle at :4173
```

---

## Where things are

```
src/
  data/content.js       ← all content. Teachers, talks, meditations, topics.
  lib/store.jsx         ← state + navigation + audio playback (React context)
  lib/bell.js           ← the meditation bell, synthesised with Web Audio
  lib/format.js         ← time formatting, greeting
  styles/tokens.css     ← colour, type, spacing, radius, shadow, motion
  styles/app.css        ← every component style
  components/           ← Icon, Img, Sheet, Scrubber, AppBar/TabBar/MiniPlayer, Drawer
  screens/              ← one file per screen
public/
  images/               ← your photographs (see images/README.md)
  audio/                ← your mp3 files (see audio/README.md)
```

### Screens

| Screen | File | Notes |
|---|---|---|
| Splash | `Splash.jsx` | auto-dismisses after 2.2s, or tap |
| Home | `Home.jsx` | greeting adapts to the real time of day |
| Meditate | `Meditate.jsx` | quick practice, guided list, by teacher |
| Create Meditation | `CreateMeditation.jsx` | duration, guidance, bell toggles |
| Session | `Session.jsx` | live countdown ring, working bells |
| Listen | `Listen.jsx` | continue, evening list, topic filter |
| Player | `Player.jsx` | real audio, ±15s, speed, sleep timer |
| Teachers | `Teachers.jsx` | lineage filter + profile |
| Library | `Library.jsx` | shelves and type tabs |
| Talk / Watch detail | `TalkDetail.jsx` | About / Transcript / Topics, related |
| Profile | `Drawer.jsx` | slides from the left, dark-mode switch |

---

## What actually works

- **Meditation timer** — real countdown, SVG progress ring, pause and resume.
- **Bells** — synthesised in the browser (three decaying sine partials). No
  sound file needed. Beginning, interval (every 5 min) and ending bells are
  independently switchable.
- **Audio player** — a real `<audio>` element. Seek, ±15s, playback speed and
  position all work once you add mp3s. With no file present the player falls
  back to a simulated timeline so the UI stays testable.
- **Dark mode** — full second token set, switched from the profile drawer.
- **Navigation** — a stack with working back, tabs, sheets and a drawer.
- **Bookmarks and downloads** — held in state; swap for `localStorage` or an
  API when you have one.

## What is deliberately not wired up

- **No photographs are bundled.** Every image slot draws a placeholder until
  you add your own. See `public/images/README.md` — this is a rights question,
  not a technical one: those are pictures of real, named monks.
- **No audio is bundled**, for the same reason.
- **Suttas, Articles and Books tabs are empty.** They need licensed text.
  Bhikkhu Sujato's translations on SuttaCentral are CC0 and can be used
  immediately; Vietnamese Nikāya translations need permission.
- **Search, playlists and notes** are UI only.

---

## Next steps if you continue this

1. Replace `src/data/content.js` with a fetch layer. The shape is already the
   shape an API should return.
2. Persist state: `bookmarks`, `downloads`, session history and playback
   position all live in `lib/store.jsx` and want `localStorage` at minimum.
3. Add the Media Session API in `store.jsx` so lock-screen controls work.
4. For the places/map feature, use **MapLibre + OpenStreetMap** rather than
   Google Maps — free, and tiles can be cached for offline use.
5. If you go native later, this structure ports cleanly to Expo: the tokens
   become a theme object and the screens keep their names.
