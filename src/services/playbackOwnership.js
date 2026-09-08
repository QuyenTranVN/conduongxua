const MODES = new Set(['listening', 'guidedMeditation', 'silentMeditation', 'supportPractice'])

// Ownership is deliberately not persisted: reloading must never auto-start audio.
export function createPlaybackOwnership() {
  let state = { mode: 'none', version: 0 }
  const handlers = new Map()
  const listeners = new Set()
  const mediaActions = new Map()
  let mediaMode = 'none'
  const syncMediaActions = () => {
    if (typeof navigator === 'undefined' || !navigator.mediaSession) return
    const actions = mediaActions.get(mediaMode) || {}
    for (const action of ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack']) {
      try { navigator.mediaSession.setActionHandler(action, actions[action] || null) } catch { /* unsupported action */ }
    }
  }
  const publish = (mode) => {
    state = { mode, version: state.version + 1 }
    listeners.forEach((listener) => listener())
    return state
  }
  const ownership = {
    getSnapshot: () => state,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
    setMediaActions(mode, actions) {
      mediaActions.set(mode, actions)
      if (mediaMode === mode) syncMediaActions()
      return () => {
        if (mediaActions.get(mode) !== actions) return
        mediaActions.delete(mode)
        if (mediaMode === mode) syncMediaActions()
      }
    },
    owns: (mode) => state.mode === mode,
    isCurrent: (lease) => state === lease,
    register(mode, interrupt) {
      if (!MODES.has(mode)) throw new Error(`Unknown playback mode: ${mode}`)
      handlers.set(mode, interrupt)
      return () => {
        if (handlers.get(mode) !== interrupt) return
        ownership.pause(mode)
        handlers.delete(mode)
      }
    },
    acquire(mode) {
      if (!handlers.has(mode)) throw new Error(`Playback mode is not registered: ${mode}`)
      // Save and synchronously silence the previous controller before granting ownership.
      if (state.mode !== 'none' && state.mode !== mode) handlers.get(state.mode)?.()
      const lease = publish(mode)
      mediaMode = mode
      syncMediaActions()
      return lease
    },
    pause(mode) {
      if (!ownership.owns(mode)) return
      handlers.get(mode)?.()
      publish('none')
    },
    release(mode) { if (ownership.owns(mode)) publish('none') },
  }
  return ownership
}

export const playbackOwnership = createPlaybackOwnership()
