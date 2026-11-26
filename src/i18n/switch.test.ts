import { afterEach, describe, expect, it, vi } from 'vitest'

/**
 * A switch to a language whose place names are a chunk of their own shows the language only once they are in (or after
 * 3 s, when they never come): the names on screen change once, with the rest of the page. The Russian chunk is a
 * stand-in here, whose `ready` the test settles.
 */
let release: (() => void) | undefined
vi.mock('./ru/index.ts', () => ({
  default: { switcher: {} },
  accentFont: undefined,
  ready: () => new Promise<void>((done) => (release = done)),
}))

const { currentLocale, setBundleForTests, setLocale, waitBeforeSwitch } = await import('./runtime')

describe('setLocale', () => {
  afterEach(() => {
    vi.useRealTimers()
    setBundleForTests('en', null)
    release = undefined
  })

  it('switches only once the language’s place names are in, and what the app waits for besides', async () => {
    let linked: (() => void) | undefined
    waitBeforeSwitch(() => new Promise<void>((done) => (linked = done)))
    let done = false
    const switching = setLocale('ru').then(() => (done = true))
    await vi.waitFor(() => expect(release).toBeDefined())
    expect([done, currentLocale()]).toEqual([false, 'en'])
    release?.()
    await new Promise((r) => setTimeout(r, 10))
    expect([done, currentLocale()]).toEqual([false, 'en']) // the link's country is still being looked up
    linked?.()
    await switching
    expect(currentLocale()).toBe('ru')
  })

  it('switches after 3 s at most when they never arrive', async () => {
    waitBeforeSwitch(() => Promise.resolve())
    vi.useFakeTimers()
    let done = false
    const switching = setLocale('ru').then(() => (done = true))
    await vi.advanceTimersByTimeAsync(2_900)
    expect([done, currentLocale()]).toEqual([false, 'en'])
    await vi.advanceTimersByTimeAsync(200)
    await switching
    expect(currentLocale()).toBe('ru')
  })
})
