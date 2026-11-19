import { afterEach, describe, expect, it } from 'vitest'
import enPlaces from '@/i18n/en/places'
import { msgs, setBundleForTests } from '@/i18n/runtime'
import type { Pass, Place } from '@/types'
import { localizedPlace } from '@/ui/landing/curated'
import { EXAMPLE_PLACES } from '@/ui/landing/places'
import { linkPlaceIn, passLinkOpts, pickPreselect, placeSearch, readUrlTarget } from './links'
import { isSettled, raceTimeout, settleWaitMs } from './timing'

const DAY = 86_400_000
const NOW = Date.parse('2026-11-08T18:00:00Z')

describe('raceTimeout (R2K1)', () => {
  it('lets an already-settled promise win a 0 ms (or negative) race', async () => {
    await expect(raceTimeout(Promise.resolve(1), 0)).resolves.toBe(1)
    await expect(raceTimeout(Promise.resolve('share'), -1500)).resolves.toBe('share')
  })
  it('resolves null for a pending promise, and for a rejection', async () => {
    await expect(raceTimeout(new Promise(() => undefined), 0)).resolves.toBeNull()
    await expect(raceTimeout(Promise.reject(new Error('x')), 50)).resolves.toBeNull()
  })
  it('waits up to ms for a slower promise', async () => {
    const slow = new Promise<number>((r) => setTimeout(() => r(7), 20))
    await expect(raceTimeout(slow, 200)).resolves.toBe(7)
  })
})

const pass = (id: string, norad: number, tClosest: number) => ({ id, norad, tClosest }) as Pass

describe('readUrlTarget', () => {
  it('reads share links, plain deep links and the landing', () => {
    expect(readUrlTarget('?s=abcd2345', NOW)).toEqual({ kind: 'share', id: 'abcd2345' })
    expect(readUrlTarget('', NOW)).toBeNull()
    expect(readUrlTarget('?q=200,1&n=x', NOW)).toBeNull()
    expect(readUrlTarget('?sandbox=globe&q=43,-80', NOW)).toBeNull()
    expect(readUrlTarget('?q=43.4723,-80.5449&n=Waterloo&p=60989-29892501', NOW)).toEqual({
      kind: 'q',
      place: { label: 'Waterloo', lat: 43.4723, lon: -80.5449, source: 'url' },
      opts: { selectPassId: '60989-29892501' },
    })
  })

  it("opens an old fallback share link on its pass: the window centred on t (R2K5)", () => {
    const t = NOW - 10 * DAY
    const target = readUrlTarget(`?q=43.47,-80.54&n=Waterloo&p=x&sat=Sentinel-2C&norad=60989&verdict=imaged&t=${t}`, NOW)
    expect(target).toMatchObject({ kind: 'q', place: { lat: 43.47, lon: -80.54, label: 'Waterloo' } })
    const opts = target?.kind === 'q' ? target.opts : {}
    expect(opts).toEqual({ now: t + 3.5 * DAY, selectNorad: 60989, selectNear: t })
    // The window [now − 7 d, now] contains t, centred on it.
    const end = opts.now!
    expect(end - 7 * DAY < t && t < end).toBe(true)
    // …and the pass it opens is that satellite's pass nearest t, whatever ?p= said.
    const passes = [pass('60989-a', 60989, t - 5 * DAY), pass('60989-b', 60989, t + 60_000), pass('42063-c', 42063, t), pass('60989-d', 60989, t + 2 * DAY)]
    expect(pickPreselect({ passes, windowEnd: end }, opts)).toBe('60989-b')
  })

  it('keeps a recent fallback link on the default window', () => {
    const t = NOW - 2 * DAY
    const target = readUrlTarget(`?q=43.47,-80.54&n=Waterloo&p=x&norad=60989&t=${t}`, NOW)
    expect(target?.kind === 'q' && target.opts).toEqual({ now: NOW, selectNorad: 60989, selectNear: t })
  })

  it('falls back to the pass id when t or norad is missing or invalid', () => {
    for (const bad of ['&norad=60989', `&t=${NOW - DAY}`, '&norad=60989&t=-5', '&norad=60989&t=abc', '&norad=0&t=1793549661025', '&norad=1.5&t=1793549661025', '&norad=60989&t=', '&norad=x&t=1793549661025']) {
      const target = readUrlTarget(`?q=43.47,-80.54&n=Waterloo&p=60989-29892501${bad}`, NOW)
      expect(target?.kind === 'q' && target.opts, bad).toEqual({ selectPassId: '60989-29892501' })
    }
  })
})

describe('a place link in any language', () => {
  afterEach(() => setBundleForTests('en', null))
  const giza = EXAMPLE_PLACES.find((p) => p.label === 'Pyramids of Giza')!
  const FRENCH = { places: { ...enPlaces, giza: { chip: 'Gizeh', label: 'Pyramides de Gizeh', sublabel: 'Gizeh, Égypte' } } }
  const opened = (search: string) => {
    const t = readUrlTarget(`?${search}`, NOW)
    return t?.kind === 'q' ? linkPlaceIn(t.place, msgs(enPlaces)) : undefined
  }

  it('writes what the address bar always held', () => {
    expect(placeSearch({ label: 'Waterloo', lat: 43.47234, lon: -80.54491, source: 'search' }, '60989-29892501')).toBe('q=43.472%2C-80.545&n=Waterloo&p=60989-29892501')
    expect(placeSearch(giza)).toBe('q=29.979%2C31.134&n=Pyramids+of+Giza')
  })

  it("names a curated place in English whatever language it was shown in, and shows it in the reader's", () => {
    setBundleForTests('fr', FRENCH)
    const shown = localizedPlace(giza)
    expect(shown.label).toBe('Pyramides de Gizeh')
    const search = placeSearch(shown)
    expect(search).toBe(placeSearch(giza))
    // A French reader sees it in French, still a link's place (what the stats record does not change)…
    const french = opened(search)
    expect(french).toEqual({ label: 'Pyramides de Gizeh', canonicalLabel: 'Pyramids of Giza', lat: 29.979, lon: 31.134, source: 'url' })
    // …and the next address-bar write is the same link.
    expect(placeSearch(french!)).toBe(search)
    // An English reader gets exactly the place a link always gave.
    setBundleForTests('en', null)
    expect(opened(search)).toEqual({ label: 'Pyramids of Giza', lat: 29.979, lon: 31.134, source: 'url' })
  })

  it('leaves every other link as it came', () => {
    setBundleForTests('fr', FRENCH)
    // The curated name somewhere else, or another name at the curated spot.
    expect(opened('q=48.858,2.294&n=Pyramids+of+Giza')?.label).toBe('Pyramids of Giza')
    expect(opened('q=29.979,31.134&n=Giza')?.label).toBe('Giza')
    // A translation that lacks the place shows the English name.
    setBundleForTests('fr', { places: { ...enPlaces, giza: undefined } } as unknown as Record<string, object>)
    expect(opened('q=29.979,31.134&n=Pyramids+of+Giza')?.label).toBe('Pyramids of Giza')
    // Only a link's place: a geocoded search keeps its own name.
    const typed: Place = { label: 'Pyramids of Giza', lat: 29.979, lon: 31.134, source: 'search' }
    expect(linkPlaceIn(typed, FRENCH.places)).toBe(typed)
  })
})

describe('passLinkOpts / pickPreselect', () => {
  it('centres the window only for passes older than six days', () => {
    expect(passLinkOpts(NOW - 6.5 * DAY, 1, NOW).now).toBe(NOW - 3 * DAY)
    expect(passLinkOpts(NOW - 5 * DAY, 1, NOW).now).toBe(NOW)
  })
  it('prefers the named pass, then the norad nearest the time, else nothing', () => {
    const passes = [pass('a', 1, 100), pass('b', 1, 300), pass('c', 2, 200)]
    expect(pickPreselect({ passes, windowEnd: 1000 }, { selectPassId: 'c', selectNorad: 1 })).toBe('c')
    expect(pickPreselect({ passes, windowEnd: 1000 }, { selectPassId: 'zz', selectNorad: 1, selectNear: 260 })).toBe('b')
    expect(pickPreselect({ passes, windowEnd: 1000 }, { selectNorad: 1 })).toBe('b')
    expect(pickPreselect({ passes, windowEnd: 1000 }, { selectNorad: 9 })).toBeUndefined()
    expect(pickPreselect({ passes, windowEnd: 1000 }, {})).toBeUndefined()
  })
})

describe('first results paint (R-M1)', () => {
  it('waits for the final report, and for its clear cover when the cover leads', () => {
    expect(isSettled({ partial: true, coverPending: false })).toBe(false)
    expect(isSettled({ partial: false, coverPending: true })).toBe(false)
    expect(isSettled({ partial: false, coverPending: false })).toBe(true)
    // A share / pass link opens on its pass's photo: a pending cover doesn't hold it.
    expect(isSettled({ partial: false, coverPending: true }, true)).toBe(true)
    expect(isSettled({ partial: true, coverPending: false }, true)).toBe(false)
  })

  it('stretches the wait (by at most the grace) for a final report due just after it', () => {
    // Due 1.75 s from now: worth 1.9 s (150 ms slack) instead of 1.5 s.
    expect(settleWaitMs(1000, 1500, 600, 2750)).toBe(1900)
    // Due within the race anyway: the race.
    expect(settleWaitMs(1000, 1500, 600, 1800)).toBe(1500)
    // Due too late (beyond the grace), or unknown: the race.
    expect(settleWaitMs(1000, 1500, 600, 4000)).toBe(1500)
    expect(settleWaitMs(1000, 1500, 600)).toBe(1500)
  })
})
