// Synthesised meditation bell — no audio file needed.
// Two detuned sine partials with an exponential decay.
let ctx = null
let sequenceTimers = []
const getCtx = () => (ctx ||= new (window.AudioContext || window.webkitAudioContext)())

export async function playBell(volume = 0.5) {
  try {
    const ac = getCtx()
    if (ac.state !== 'running') await ac.resume()
    if (ac.state !== 'running') {
      console.warn('Bell unavailable: audio playback is still blocked by the browser')
      return false
    }
    const now = ac.currentTime
    const master = ac.createGain()
    master.gain.value = volume
    master.connect(ac.destination)
    ;[[528, 1, 5.5], [1584, 0.28, 3.2], [2640, 0.11, 1.8]].forEach(([freq, amp, decay]) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(amp, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decay)
      osc.connect(gain).connect(master)
      osc.start(now)
      osc.stop(now + decay + 0.1)
    })
    return true
  } catch (e) {
    console.warn('Bell unavailable:', e)
    return false
  }
}

export function playBellSequence(count = 3, volume = 0.5, spacingMs = 3000) {
  stopBellSequence()
  playBell(volume)
  for (let index = 1; index < count; index += 1) {
    sequenceTimers.push(window.setTimeout(() => playBell(volume), index * spacingMs))
  }
}

export function stopBellSequence() {
  sequenceTimers.forEach((timer) => window.clearTimeout(timer))
  sequenceTimers = []
}
