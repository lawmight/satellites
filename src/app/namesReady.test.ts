import { afterEach, describe, expect, it, vi } from 'vitest'
import ruNames from '@/i18n/ru/exonyms.gen'
import { setBundleForTests } from '@/i18n/runtime'
import { displayLabel, linkedForName } from '@/imagery'
import { EXONYM_WAIT_MS } from '@/imagery/exonyms'
import type { Place } from '@/types'
import { placeNamesReady } from './namesReady'

const FILES = import.meta.glob<string>('/public/places/**/*.txt', { query: '?raw', import: 'default' })

describe('placeNamesReady: what a report waits for before it names its place', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    setBundleForTests('en', null)
  })

  it('waits for nothing when nothing is on its way: the report goes on within a microtask', async () => {
    // A layer handover (src/lib/backStack.ts) waits one microtask: the report must have gone on by then.
    const order: string[] = []
    const place: Place = { label: 'New York', lat: 43, lon: -75.5, source: 'search' }
    const ready = placeNamesReady(place).then(() => order.push('ready'))
    queueMicrotask(() => queueMicrotask(() => order.push('handover')))
    await ready
    await new Promise((r) => setTimeout(r, 0))
    expect(order).toEqual(['ready', 'handover'])
  })

  it('waits for a table still on its way, and for a link’s country, before resolving', async () => {
    const tiles: (() => void)[] = []
    vi.stubGlobal('fetch', async (input: string) => {
      const file = FILES[`/public${String(input)}`]
      if (String(input).includes('/t/')) await new Promise<void>((done) => tiles.push(done))
      return file ? new Response(await file()) : new Response('', { status: 404 })
    })
    let arrive: (() => void) | undefined
    const ns: { names: string; load: () => Promise<void> } = {
      names: '',
      load: () => new Promise<void>((done) => (arrive = () => ((ns.names = ruNames), done()))),
    }
    setBundleForTests('ru', { exonyms: ns })
    const link: Place = { label: 'Moscow', lat: 55.756, lon: 37.617, source: 'url' }
    let ready = false
    const waiting = placeNamesReady(link).then(() => (ready = true))
    await vi.waitFor(() => expect(arrive).toBeDefined())
    await new Promise((r) => setTimeout(r, 20))
    expect(ready).toBe(false)
    arrive?.()
    await vi.waitFor(() => expect(tiles.length).toBeGreaterThan(0))
    await new Promise((r) => setTimeout(r, 20))
    expect(ready).toBe(false) // the link's country is still being looked up
    for (const done of tiles) done()
    await waiting
    expect(displayLabel(linkedForName(link))).toBe('Москва')
  })

  it('waits for a link’s country EXONYM_WAIT_MS at most, and keeps the name countryless after it', async () => {
    // Every tile around the point stalls (the landmarks' file, read by the test above, is in already).
    const held: (() => void)[] = []
    vi.stubGlobal('fetch', async (input: string) => {
      const file = FILES[`/public${String(input)}`]
      await new Promise<void>((done) => held.push(done))
      return file ? new Response(await file()) : new Response('', { status: 404 })
    })
    setBundleForTests('ru', { exonyms: { names: ruNames, countries: true } })
    const link: Place = { label: 'Kyiv', lat: 50.454, lon: 30.524, source: 'url' }
    vi.useFakeTimers()
    let ready = false
    void placeNamesReady(link).then(() => (ready = true))
    await vi.advanceTimersByTimeAsync(EXONYM_WAIT_MS - 100)
    expect([ready, held.length > 0]).toEqual([false, true])
    await vi.advanceTimersByTimeAsync(200)
    expect(ready).toBe(true) // the report starts, the curtain lifts
    vi.useRealTimers()
    expect(displayLabel(linkedForName(link))).toBe('Kyiv')
    for (const done of held) done()
    await new Promise((r) => setTimeout(r, 50))
    expect(displayLabel(linkedForName(link))).toBe('Kyiv') // the late answer (Киев) is not applied
  })
})
