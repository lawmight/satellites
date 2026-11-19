/**
 * The results' catalogs ('results', 'pass', 'verdicts'): their English is the baseline every translation is written
 * from (counts in their plural forms, lists, the optional parts of rich labels, days written from instants), and what
 * the results model caches holds no words, so a language switch rewords it without rebuilding it (lib.test.ts holds
 * the sentences themselves to their English). A curated place's name is copy too, read when shown (placeName).
 */
import { afterEach, describe, expect, it } from 'vitest'
import { isNum, isStrong, plain, type Rich } from '../../../api/_lib/i18n/parts'
import enPass from '@/i18n/en/pass'
import enResults from '@/i18n/en/results'
import enTime from '@/i18n/en/time'
import enVerdicts from '@/i18n/en/verdicts'
import enPlaces from '@/i18n/en/places'
import { msgs, setBundleForTests } from '@/i18n/runtime'
import { linkPlaceIn } from '@/app/links'
import type { Place } from '@/types'
import { localizedPlace } from '@/ui/landing/curated'
import { EXAMPLE_PLACES, SURPRISE_PLACES } from '@/ui/landing/places'
import { waterlooReport } from './__fixtures__/waterloo'
import { productLabel } from './lib/captures'
import { compassAbbr, imagesPublicText } from './lib/copy'
import { VERDICT_META, VERDICT_TAG, VERDICT_TITLE, verdictUnit } from './lib/meta'
import { localParts } from './lib/time'
import { buildResultsModel } from './model'
import { placeName } from './placeName'

afterEach(() => setBundleForTests('en', null))

const count = (parts: Rich, test: (p: Rich[number]) => boolean) => parts.filter(test).length

describe('results copy (English baseline)', () => {
  const m = enResults
  it('writes the headline whole, with its one strong count and one serif place', () => {
    expect(plain(m.headline.watched(1, 'Waterloo', { lastDays: 7 }))).toBe('In the last 7 days, 1 satellite watched Waterloo.')
    const older = { fromMs: Date.UTC(2026, 9, 29, 12), toMs: Date.UTC(2026, 10, 5, 12), timeZone: 'UTC' }
    expect(plain(m.headline.watched(1715, 'Pacific Ocean', older))).toBe('Between 29 Oct and 5 Nov, 1,715 satellites watched the Pacific Ocean.')
    // The days are written at the place's zone: 03:00 UTC on 30 Oct is still 29 Oct in Toronto.
    const toronto = { fromMs: Date.UTC(2026, 9, 30, 3), toMs: Date.UTC(2026, 10, 6, 3), timeZone: 'America/Toronto' }
    expect(plain(m.headline.watched(2, 'Waterloo', toronto))).toBe('Between 29 Oct and 5 Nov, 2 satellites watched Waterloo.')
    expect(plain(m.headline.none('Sahara Desert', true))).toBe('No satellite we track watched the Sahara Desert that week.')
    const parts = m.headline.watched(256, 'Waterloo', { lastDays: 7 })
    expect(count(parts, isStrong)).toBe(1)
    expect(parts.filter((p) => typeof p === 'object' && 'accent' in p)).toEqual([{ accent: ['Waterloo'] }])
  })

  it('pluralises every count', () => {
    expect(plain(m.why.infrared(1))).toBe('Weather satellites still swept it in infrared, 1 time.')
    expect(plain(m.why.infrared(42))).toBe('Weather satellites still swept it in infrared, 42 times.')
    expect(m.why.unpublished(1)).toBe('Sentinel-2 or Landsat crossed it once in daylight, but no scene has been published yet.')
    expect(plain(m.why.radar(['Umbra-08'], 1, 3))).toBe('Radar doesn’t need light. Umbra-08 and 1 other radar satellite passed within range 3 times.')
    expect(plain(m.why.radar(['Umbra-08', 'Capella-14'], 0, 1))).toBe('Radar doesn’t need light. Umbra-08 and Capella-14 passed within range 1 time.')
    expect(m.verdictReadout(1, 'imaged', 'Watched')).toBe('1 pass: Watched')
    expect(m.verdictReadout(1715, 'overhead', 'Passed overhead')).toBe('1,715 passes: Passed overhead')
    expect(plain(m.geo.images(1008, 7))).toBe('1,008 images this week')
    expect(plain(m.geo.images(432, 3))).toBe('432 images in 3 days')
    expect(m.head.windowSpan(7, Date.UTC(2026, 10, 1, 5), Date.UTC(2026, 10, 8, 5), 'UTC')).toBe('7 days · 1 → 8 Nov')
    expect(m.head.windowSpan(7, Date.UTC(2026, 9, 29, 5), Date.UTC(2026, 10, 5, 5), 'America/Toronto')).toBe('7 days · 29 Oct → 5 Nov')
    expect(m.computing.stages.propagate.idle(7)).toBe('Propagate orbits · 7 days')
    expect(m.timeline.meta(7, 'America/Toronto', 'EST')).toBe('7 days · America/Toronto · EST')
    expect(m.notes.checked(1, 1)).toBe('1 pass from 1 imaging and crewed satellite checked.')
    for (const v of ['imaged', 'likely', 'could', 'overhead'] as const) {
      expect(enVerdicts[v].unit(1)).toBe('pass')
      expect(enVerdicts[v].unit(31)).toBe('passes')
    }
  })

  it("marks the images line's \"at least\" as its one optional part", () => {
    const parts = m.imagesPublic(4)
    expect(count(parts, isStrong)).toBe(1)
    expect(count(parts, isNum)).toBe(1)
    expect(imagesPublicText(parts, true)).toBe('At least 4 images were made public.')
    expect(imagesPublicText(parts, false)).toBe('4 images were made public.')
    expect(imagesPublicText(m.imagesPublic(1), false)).toBe('1 image was made public.')
  })

  it('keeps the labels that narrow screens shorten readable both ways', () => {
    const without = (r: Rich) => plain(r.filter((p) => !isStrong(p)))
    expect([plain(m.footer.shareButton.pass), without(m.footer.shareButton.pass)]).toEqual(['Share this pass', 'Share'])
    expect([plain(m.footer.checkPlace), without(m.footer.checkPlace)]).toEqual(['Check your place', 'your place'])
    expect([plain(m.footer.clearest), without(m.footer.clearest)]).toEqual(['See the clearest look', 'clearest look'])
    const window = m.computing.window(7, { ms: Date.UTC(2026, 10, 1, 5, 47), time: '05:47' }, { ms: Date.UTC(2026, 10, 8, 5, 47), time: '05:47' })
    expect(plain(window)).toBe('7-day window · 1 Nov 05:47 → 8 Nov 05:47 UTC')
    expect(without(window)).toBe('1 Nov 05:47 → 8 Nov 05:47 UTC')
    expect(plain(m.computing.sharedCaption(undefined, 'Waterloo'))).toBe('Shared with you · A satellite watched Waterloo')
    // 16:14 UTC on 1 Nov is 11:14 in Toronto, the same day: the day is the place's, the clock arrives written.
    const when = { ms: Date.UTC(2026, 10, 1, 16, 14), timeZone: 'America/Toronto', time: '11:14' }
    expect(plain(m.computing.sharedCaption('Sentinel-2C', 'Waterloo', when))).toBe('Shared with you · Sentinel-2C watched Waterloo · Sun 1 Nov, 11:14')
  })

  it("writes a pass's day from its instant, beside the clock it is given", () => {
    const t = Date.UTC(2026, 10, 1, 16, 14, 21)
    const p = localParts(t, 'America/Toronto')
    expect(m.head.passWhen(t, 'America/Toronto', p, '11:14:21', 'EST', false)).toBe('Sun 1 Nov · 11:14:21 EST')
    expect(m.head.passWhen(t, 'America/Toronto', p, '11:14', 'EST', true)).toBe('Sun 1 Nov · ≈ 11:14 EST')
    // The pass list's row for the same pass reads the same day.
    expect(enTime.stamp(t, 'America/Toronto', p, '11:14', 'EST')).toBe('Sun 1 Nov · 11:14 EST')
  })

  it("names the verdicts in the timeline's summary with the verdicts' own words", () => {
    const counts = { imaged: 12, likely: 3, could: 1565, overhead: 40 }
    const titles = { imaged: enVerdicts.imaged.title, likely: enVerdicts.likely.title, could: enVerdicts.could.title, overhead: enVerdicts.overhead.title }
    expect(m.timeline.summary(7, counts, titles)).toBe('Timeline, 7 days: 12 watched, 3 likely watched, 1,565 could have pointed here, 40 passed overhead.')
    expect(m.timeline.summary(7, counts, { ...titles, imaged: 'Seen' })).toMatch(/^Timeline, 7 days: 12 seen, 3 likely watched/)
  })

  it('says a pass in whole sentences, the place bare in the slot', () => {
    const at = { time: '11:21:13', zone: 'EST' }
    expect(plain(enPass.crossed({ sat: 'Sentinel-2C', altKm: 786.4, offset: { km: 61.2, dir: 'w' }, ...at, heading: 's', speedKmS: 6.823 }))).toBe(
      'Sentinel-2C crossed 786 km up, 61 km to the west at 11:21:13 EST, moving south at 6.82 km/s.',
    )
    expect(plain(enPass.could.insideSwath({ place: 'Pacific Ocean', swathKm: 32 }))).toMatch(/^The Pacific Ocean was inside its 32 km swath\./)
    expect(plain(enPass.geo.sits({ sat: 'GOES-19', altKm: 35786, seat: '75.2°W', cadenceMin: 1 }))).toBe(
      'GOES-19 doesn’t pass. It sits 35,786 km above the equator at 75.2°W and scans the whole face of the Earth below it every 1 minute.',
    )
  })
})

describe('a language switch rewords, and rebuilds nothing', () => {
  it('reads the verdicts, compass points and pass times in the language showing', async () => {
    const report = await waterlooReport({ withTracks: false })
    const model = buildResultsModel(report)
    const p = report.passes[0]
    const english = model.times(p)
    expect(english.stamp).toBe(`${english.day} · ${english.time} ${english.zone}`)
    const photos = model.photos
    setBundleForTests('de', {
      time: { ...enTime, day: () => 'So. 1. Nov.', stamp: (_ms: number, _tz: string, _p: unknown, time: string, zone: string) => `So. · ${time} ${zone}` },
      verdicts: { ...enVerdicts, imaged: { ...enVerdicts.imaged, title: 'Beobachtet', short: 'Foto', unit: (n: number) => (n === 1 ? 'Überflug' : 'Überflüge') } },
      pass: { ...enPass, compass16: { ...enPass.compass16, n: 'Nd' } },
      results: { ...enResults, product: { ...enResults.product, sentinel2: (mm: number) => `Sentinel-2 L2A · ${mm} Meter` } },
    })
    expect(model.times(p).day).toBe('So. 1. Nov.')
    expect(model.times(p).stamp).toBe(`So. · ${english.time} ${english.zone}`)
    expect(model.photos).toBe(photos)
    expect([VERDICT_META.imaged.title, VERDICT_TITLE.imaged, VERDICT_TAG.imaged, verdictUnit('imaged', 2)]).toEqual(['Beobachtet', 'Beobachtet', 'Foto', 'Überflüge'])
    expect(compassAbbr(0)).toBe('Nd')
    expect(productLabel({ collection: 'sentinel-2-l2a', provider: 'planetary-computer', gsdM: 10 })).toBe('Sentinel-2 L2A · 10 Meter')
    setBundleForTests('en', null)
    expect(model.times(p)).toEqual(english)
    expect(VERDICT_META.imaged.title).toBe('Watched')
  })
})

describe("a curated place's name follows the language showing (placeName)", () => {
  afterEach(() => setBundleForTests('en', null))
  const giza = EXAMPLE_PLACES.find((p) => p.label === 'Pyramids of Giza')!
  const FRENCH = { places: { ...enPlaces, giza: { chip: 'Gizeh', label: 'Pyramides de Gizeh', sublabel: 'Gizeh, Égypte' } } }
  const link: Place = { label: 'Pyramids of Giza', lat: 29.979, lon: 31.134, source: 'url' }

  it('is the label itself in English', () => {
    for (const p of [...EXAMPLE_PLACES, ...SURPRISE_PLACES, link]) expect(placeName(p)).toBe(p.label)
  })

  it('renames a place picked or linked in one language when the language changes', () => {
    setBundleForTests('fr', FRENCH)
    // As the landing and the controller store them, in French.
    const picked = localizedPlace(giza)
    const opened = linkPlaceIn(link, msgs(enPlaces))
    expect([placeName(picked), placeName(opened)]).toEqual(['Pyramides de Gizeh', 'Pyramides de Gizeh'])
    setBundleForTests('en', null)
    expect([placeName(picked), placeName(opened)]).toEqual(['Pyramids of Giza', 'Pyramids of Giza'])
    // Picked or opened in English, then shown in French.
    setBundleForTests('fr', FRENCH)
    expect([placeName(giza), placeName(link)]).toEqual(['Pyramides de Gizeh', 'Pyramides de Gizeh'])
    // What links and the stats keep is untouched.
    expect(picked.canonicalLabel).toBe('Pyramids of Giza')
  })

  it("shows a geocoder's place under the name the language gives it there, and a link's as it came", () => {
    setBundleForTests('it', { exonyms: { names: 'GB:London=Londra|DE:Munich=Monaco di Baviera' } })
    const london: Place = { label: 'London', sublabel: 'England, United Kingdom', countryCode: 'gb', lat: 51.5085, lon: -0.1257, source: 'search' }
    expect(placeName(london)).toBe('Londra')
    expect(placeName({ ...london, countryCode: 'ca', lat: 42.98, lon: -81.25 })).toBe('London') // London, Ontario
    expect(placeName({ ...london, source: 'url', countryCode: undefined })).toBe('London')
    expect(london.label).toBe('London')
  })

  it('shows every other place as it came (geocoder names are data)', () => {
    setBundleForTests('fr', FRENCH)
    expect(placeName({ ...link, source: 'search' })).toBe('Pyramids of Giza')
    // The curated name at another spot, or another name at the curated spot.
    expect(placeName({ ...link, lat: 48.858, lon: 2.294 })).toBe('Pyramids of Giza')
    expect(placeName({ ...link, label: 'Giza' })).toBe('Giza')
  })
})
