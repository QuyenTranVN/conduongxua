import { useLayoutEffect, useRef } from 'react'
import { playbackOwnership } from '../services/playbackOwnership.js'

// Register once while always using the controller's latest state.
export function usePlaybackRegistration(mode, interrupt) {
  const latest = useRef(interrupt)
  useLayoutEffect(() => { latest.current = interrupt })
  useLayoutEffect(() => playbackOwnership.register(mode, () => latest.current()), [mode])
}
