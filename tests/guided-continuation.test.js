import test from 'node:test'
import assert from 'node:assert/strict'
import { meditationService } from '../src/services/meditationService.js'

const key = 'con-duong-xua:practice-history'
const snapshot = { id: 'api-guided-saved', slug: 'guided-saved', titleVi: 'Saved meditation', teacherId: 'brahm', teacherName: 'Ajahn Brahm', methodId: 'anapanasati', guidanceType: 'guided', durationSeconds: 480, audioUrl: 'https://media.example.com/meditation.mp3' }
const record = { sessionId: snapshot.id, progressSeconds: 42.75, durationSeconds: 479.9, selectedDurationSeconds: 480, paused: true, completed: false, updatedAt: '2026-09-08T00:00:00Z', sessionSnapshot: snapshot }

test.beforeEach(() => {
  const values = new Map()
  globalThis.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }
})

test('a paused API practice restores its position and session information without a loaded catalog', () => {
  localStorage.setItem(key, JSON.stringify([record]))
  const restored = meditationService.getContinuePractice()
  assert.equal(restored.sessionId, snapshot.id)
  assert.equal(restored.progressSeconds, 42.75)
  assert.equal(restored.durationSeconds, 479.9)
  assert.equal(restored.selectedDurationSeconds, 480)
  assert.equal(restored.paused, true)
  assert.equal(restored.completed, false)
  assert.equal(meditationService.getSession(snapshot.id).teacherName, 'Ajahn Brahm')
  assert.equal(meditationService.getSession(snapshot.id).audioUrl, snapshot.audioUrl)
})

test('saving paused progress retains the source snapshot and does not complete the practice', () => {
  localStorage.setItem(key, JSON.stringify([record]))
  meditationService.saveProgress({ sessionId: snapshot.id, progressSeconds: 60.25, durationSeconds: 479.9, selectedDurationSeconds: 480, paused: true, completed: false })
  const saved = meditationService.getPracticeProgress(snapshot.id)
  assert.equal(saved.progressSeconds, 60.25)
  assert.equal(saved.completed, false)
  assert.equal(saved.sessionSnapshot.teacherId, snapshot.teacherId)
  assert.equal(saved.sessionSnapshot.titleVi, snapshot.titleVi)
})

test('closing before audio starts can continue from zero, but completed practices stay excluded', () => {
  localStorage.setItem(key, JSON.stringify([{ ...record, progressSeconds: 0 }]))
  assert.equal(meditationService.getContinuePractice().progressSeconds, 0)
  localStorage.setItem(key, JSON.stringify([{ ...record, completed: true }]))
  assert.equal(meditationService.getContinuePractice(), null)
})

test('invalid snapshots cannot restore an unknown catalog session', () => {
  for (const changes of [{ audioUrl: 'javascript:alert(1)' }, { id: 'different-id' }, { durationSeconds: -1 }, { titleVi: {} }]) {
    localStorage.setItem(key, JSON.stringify([{ ...record, sessionSnapshot: { ...snapshot, ...changes } }]))
    assert.equal(meditationService.getContinuePractice(), null)
  }
})
