import { playbackOwnership } from '../services/playbackOwnership.js'

let ctx = null
let sequenceTimers = []
let generation = 0
const voices = new Set()
const getCtx = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)())

export async function unlockBell() {
  try { await getCtx().resume(); return ctx.state === 'running' } catch { return false }
}

export async function playBell(volume = 0.5) {
  const request = generation
  try {
    const ac = getCtx()
    if (ac.state !== 'running') await ac.resume()
    if (request !== generation || ac.state !== 'running') return false
    const now = ac.currentTime
    const master = ac.createGain()
    master.gain.value = volume
    master.connect(ac.destination)
    const oscillators = []
    const stop = () => {
      oscillators.forEach((osc) => { osc.onended = null; try { osc.stop(); osc.disconnect() } catch { /* already ended */ } })
      master.disconnect()
      voices.delete(stop)
    }
    voices.add(stop)
    ;[[528, 1, 5.5], [1584, 0.28, 3.2], [2640, 0.11, 1.8]].forEach(([freq, amp, decay], index) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      oscillators.push(osc)
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(amp, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
      osc.connect(gain).connect(master)
      if (index === 0) osc.onended = stop
      osc.start(now)
      osc.stop(now + decay + 0.1)
    })
    return true
  } catch (error) {
    console.warn('Bell unavailable:', error)
    return false
  }
}

export function playBellSequence(count = 3, volume = 0.5, spacingMs = 3000) {
  stopBellSequence()
  const request = generation
  playBell(volume)
  for (let index = 1; index < count; index += 1) {
    sequenceTimers.push(window.setTimeout(() => { if (request === generation) playBell(volume) }, index * spacingMs))
  }
}

export function stopBellSequence() {
  generation += 1
  sequenceTimers.forEach((timer) => window.clearTimeout(timer))
  sequenceTimers = []
  ;[...voices].forEach((stop) => stop())
}

// Covers ringing tails as well as bells waiting on browser permission or a timer.
playbackOwnership.subscribe(stopBellSequence)
