import test from 'node:test'
import assert from 'node:assert/strict'
import { createPlaybackOwnership } from '../src/services/playbackOwnership.js'

const modes = ['listening', 'guidedMeditation', 'silentMeditation', 'supportPractice']

test('every mode saves and stops the previous mode before it can start', () => {
  for (const from of modes) for (const to of modes.filter(mode => mode !== from)) {
    const ownership = createPlaybackOwnership()
    const events = []
    const active = new Set()
    for (const mode of modes) ownership.register(mode, () => { events.push(`save:${mode}`); active.delete(mode); events.push(`pause:${mode}`) })
    ownership.acquire(from)
    active.add(from)
    const staleLease = ownership.getSnapshot()
    ownership.acquire(to)
    assert.equal(active.size, 0, `${from} must be silent before ${to} starts`)
    active.add(to)
    assert.deepEqual(events, [`save:${from}`, `pause:${from}`])
    assert.equal(ownership.getSnapshot().mode, to)
    assert.equal(ownership.isCurrent(staleLease), false)
  }
})

test('rapid same-mode requests invalidate old play promises without interrupting the new request', () => {
  const ownership = createPlaybackOwnership()
  ownership.register('listening', () => assert.fail('same-mode acquisition should not call another controller'))
  const first = ownership.acquire('listening')
  const second = ownership.acquire('listening')
  assert.equal(ownership.isCurrent(first), false)
  assert.equal(ownership.isCurrent(second), true)
})

test('an inactive controller cannot pause or release the owner', () => {
  const ownership = createPlaybackOwnership()
  ownership.register('listening', () => {})
  ownership.register('guidedMeditation', () => {})
  ownership.acquire('listening')
  ownership.pause('guidedMeditation')
  ownership.release('guidedMeditation')
  assert.equal(ownership.getSnapshot().mode, 'listening')
  ownership.pause('listening')
  assert.equal(ownership.getSnapshot().mode, 'none')
})

test('unmounting an active controller saves and relinquishes ownership', () => {
  const ownership = createPlaybackOwnership()
  let saved = false
  const unregister = ownership.register('supportPractice', () => { saved = true })
  ownership.acquire('supportPractice')
  unregister()
  assert.equal(saved, true)
  assert.equal(ownership.getSnapshot().mode, 'none')
})

test('a failed synchronous handoff never grants playback to the next mode', () => {
  const ownership = createPlaybackOwnership()
  ownership.register('listening', () => { throw new Error('cannot stop') })
  ownership.register('silentMeditation', () => {})
  ownership.acquire('listening')
  assert.throws(() => ownership.acquire('silentMeditation'), /cannot stop/)
  assert.equal(ownership.getSnapshot().mode, 'listening')
})
