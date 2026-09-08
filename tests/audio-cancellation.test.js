import test from 'node:test'
import assert from 'node:assert/strict'
import { ambientAudio } from '../src/services/ambientSoundService.js'
import { playBell, stopBellSequence } from '../src/lib/bell.js'
import { playbackOwnership } from '../src/services/playbackOwnership.js'

const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }

test('paused ambience cannot start when a slow fetch finally completes, and can subsequently resume', async () => {
  const fetched = deferred()
  let starts = 0
  let stops = 0
  class Context {
    currentTime = 0
    async resume() {}
    async decodeAudioData() { return { duration: 30 } }
    createBufferSource() { return { connect() { return this }, start() { starts++ }, stop() { stops++ }, disconnect() {} } }
    createBiquadFilter() { return { frequency: {}, connect() { return this }, disconnect() {} } }
    createGain() { return { connect() {}, disconnect() {}, gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} } } }
  }
  globalThis.window = { AudioContext: Context, clearTimeout, setTimeout }
  globalThis.fetch = async () => { await fetched.promise; return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) } }
  const pending = ambientAudio.start('rain')
  await Promise.resolve()
  ambientAudio.pause()
  fetched.resolve()
  assert.equal(await pending, false)
  assert.equal(starts, 0)
  await ambientAudio.resume()
  assert.equal(starts, 1)
  ambientAudio.stop(2)
  const stopsBeforeInterruption = stops
  ambientAudio.pause()
  assert.ok(stops > stopsBeforeInterruption, 'a fading source must also stop immediately')
  await ambientAudio.start('rain')
  ambientAudio.pause()
  const resumed = deferred()
  Context.prototype.resume = () => resumed.promise
  const pendingResume = ambientAudio.resume()
  ambientAudio.stop(0)
  resumed.resolve()
  await pendingResume
  assert.equal(starts, 2, 'an interrupted browser resume must not reconnect its source')
})

test('a bell waiting for browser permission cannot ring after another mode takes ownership', async () => {
  const resumed = deferred()
  let oscillators = 0
  class Context {
    state = 'suspended'
    async resume() { await resumed.promise; this.state = 'running' }
    createGain() { assert.fail('stale bell must not create a gain node') }
    createOscillator() { oscillators++; return {} }
  }
  globalThis.window = { AudioContext: Context, clearTimeout, setTimeout }
  const cleanMeditation = playbackOwnership.register('silentMeditation', stopBellSequence)
  const cleanListening = playbackOwnership.register('listening', () => {})
  playbackOwnership.acquire('silentMeditation')
  const pending = playBell()
  playbackOwnership.acquire('listening')
  resumed.resolve()
  assert.equal(await pending, false)
  assert.equal(oscillators, 0)
  cleanMeditation(); cleanListening()
})
