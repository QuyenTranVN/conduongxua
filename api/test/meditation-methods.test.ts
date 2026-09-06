import assert from 'node:assert/strict'
import test from 'node:test'
import {
  isPlayableSession,
  toVisibleMeditationMethods,
  type MeditationMethodWithSessions,
  type MeditationSessionForVisibility,
} from '../src/domain/meditation-methods'

const baseSession: MeditationSessionForVisibility = {
  is_active: true,
  is_published: true,
  guidance_type: 'guided',
  audio_url: null,
  audio_key: null,
  intro_audio_url: null,
  closing_audio_url: null,
  interval_prompts: null,
}

test('guided sessions require playable main audio', () => {
  assert.equal(isPlayableSession(baseSession), false)
  assert.equal(isPlayableSession({ ...baseSession, audio_key: 'audio/file.mp3' }), true)
  assert.equal(isPlayableSession({ ...baseSession, audio_url: 'https://media.example/file.mp3' }), true)
})

test('light guidance accepts any usable audio or prompt source', () => {
  const light = { ...baseSession, guidance_type: 'light_guidance' }

  assert.equal(isPlayableSession(light), false)
  assert.equal(isPlayableSession({ ...light, intro_audio_url: 'https://media.example/intro.mp3' }), true)
  assert.equal(isPlayableSession({ ...light, closing_audio_url: 'https://media.example/end.mp3' }), true)
  assert.equal(isPlayableSession({ ...light, interval_prompts: [{ at: 60 }] }), true)
})

test('silent sessions need no audio but all sessions must be active and published', () => {
  const silent = { ...baseSession, guidance_type: 'silent' }

  assert.equal(isPlayableSession(silent), true)
  assert.equal(isPlayableSession({ ...silent, is_active: false }), false)
  assert.equal(isPlayableSession({ ...silent, is_published: false }), false)
})

test('only methods with playable sessions are returned and counted in sort order', () => {
  const method = (
    id: string,
    slug: string,
    sortOrder: number,
    sessions: MeditationSessionForVisibility[],
  ): MeditationMethodWithSessions => ({
    id,
    slug,
    name_vi: slug,
    name_pali: null,
    name_en: null,
    description_vi: null,
    canonical_source: null,
    sort_order: sortOrder,
    meditation_sessions: sessions,
  })

  const result = toVisibleMeditationMethods([
    method('metta-id', 'metta', 3, []),
    method('anapanasati-id', 'anapanasati', 2, [baseSession]),
    method('vipassana-id', 'vipassana', 1, [
      { ...baseSession, audio_key: 'audio/one.mp3' },
      { ...baseSession, guidance_type: 'silent' },
      { ...baseSession, audio_key: 'audio/inactive.mp3', is_active: false },
    ]),
  ])

  assert.deepEqual(result.map(({ slug }) => slug), ['vipassana'])
  assert.equal(result[0]?.availableSessionCount, 2)
})
