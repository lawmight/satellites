/**
 * A search chunk that never arrives (a stalled request): the first wait for it runs out after EXONYM_WAIT_MS, and no
 * search or pin after it waits for the same download again. Its own file: the chunk is mocked to stall for every test.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { setBundleForTests } from '@/i18n/runtime'
import { ensureExonyms, EXONYM_WAIT_MS, exonym } from './exonyms'

vi.mock('./exonymSearch', () => new Promise(() => {}))

/** A promise's state, read synchronously. */
function settled(p: Promise<void>): () => boolean {
  let done = false
  void p.then(() => (done = true))
  return () => done
}

describe('ensureExonyms with the search chunk stalled', () => {
  afterEach(() => {
    vi.useRealTimers()
    setBundleForTests('en', null)
  })

  it('waits for it once, EXONYM_WAIT_MS at most, and never again', async () => {
    setBundleForTests('ru', { exonyms: { names: 'RU:Moscow=Москва' } })
    vi.useFakeTimers()
    const first = settled(ensureExonyms())
    await vi.advanceTimersByTimeAsync(EXONYM_WAIT_MS - 100)
    expect(first()).toBe(false)
    await vi.advanceTimersByTimeAsync(200)
    expect(first()).toBe(true)
    // The next searches (Paris, Berlin, Rome) and pins: no wait at all.
    for (let i = 0; i < 3; i++) {
      const next = settled(ensureExonyms())
      await vi.advanceTimersByTimeAsync(0)
      expect(next()).toBe(true)
    }
    expect(exonym('Moscow', 'ru', 'label')).toBe('Москва') // the table itself is in
  })
})
