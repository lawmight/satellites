/**
 * The language of what is shared: the card, the post and the links are in the sharer's language, the links carry it
 * as `l=` (never for English, whose links stay exactly as they were), and the server reads it back to print the same
 * card and a share page in that language. These tests hold the plumbing (and the PNG's line breaking and shaping
 * rules), not the words: a stand-in German says what the tests need, and the real translations are only compared by
 * identity.
 */
import { afterEach, describe, expect, it } from 'vitest'
import enCard from '@/i18n/en/card'
import { setBundleForTests } from '@/i18n/runtime'
import { accentText, buildCardSpec, buildSummarySpec, headlineSize, type CardInput, type CardSpec, type SummaryInput } from '../../../api/_lib/cardSpec'
import { cardMessages, type CardMessages } from '../../../api/_lib/i18n/card/index'
// The server's table of every language's card, as the share modules load it: tests see the same answers in any order.
import '../../../api/_lib/i18n/card/server'
import deCard from '../../../api/_lib/i18n/card/de'
import frCard from '../../../api/_lib/i18n/card/fr'
import { accent, plain, type Rich } from '../../../api/_lib/i18n/parts'
import { EXAMPLE_PLACES } from '../landing/places'
import { waterlooReport } from '../results/__fixtures__/waterloo'
import { pixelLabel } from '../results/lib/captures'
import type { SatMeta } from '../results/lib/meta'
import { needsShaping, publicLabelOf, summaryCardSpec, summaryFacts, wrap } from './card'
import { deepLink, postText, shareLink, summaryLink } from './links'

// The server modules read process.env and tz-lookup: imported by a runtime specifier (as spec.test.ts).
interface Server {
  linkLocale: (q: URLSearchParams) => string
  summaryFromParams: (q: URLSearchParams) => (Parameters<typeof buildSummarySpec>[0] & { place: unknown }) | null
  shareTimeZone: (p: { lat: number; lon: number }) => string
}
const server = () => import('../../../api/_lib/share.ts' as string) as Promise<Server>
const sharePage = async () => ((await import('../../../api/s.ts' as string)) as { handleSharePage: (r: Request) => Promise<Response> }).handleSharePage

const meta = (n: number): SatMeta => ({ norad: n, name: n === 60989 ? 'Sentinel-2C' : `NORAD ${n}`, category: 'other' })
const strip = (s: CardSpec) => {
  const out = structuredClone(s)
  if (out.plate.kind === 'image') {
    delete out.plate.imageUrl
    delete out.plate.source
  }
  return out
}

describe('links carry the card’s language', () => {
  it('adds l= for any language but English, last, and nothing for English', () => {
    expect(shareLink('https://w.e', 'ab3d5f7h')).toBe('https://w.e/s/ab3d5f7h')
    expect(shareLink('https://w.e', 'ab3d5f7h', 'en')).toBe('https://w.e/s/ab3d5f7h')
    expect(shareLink('https://w.e', 'ab3d5f7h', 'zh-Hant')).toBe('https://w.e/s/ab3d5f7h?l=zh-Hant')
    const en = deepLink('https://w.e', 'Waterloo', 43.4723, -80.5449, 'p1', { norad: 60989, satName: 'Sentinel-2C', verdict: 'imaged', tClosest: 1 })
    const de = deepLink('https://w.e', 'Waterloo', 43.4723, -80.5449, 'p1', { norad: 60989, satName: 'Sentinel-2C', verdict: 'imaged', tClosest: 1 }, 'de')
    expect(de).toBe(`${en}&l=de`)
    expect(en).not.toMatch(/(\?|&#38;)l=/)
    const base = { label: 'Waterloo', lat: 43.47, lon: -80.54, satellites: 7, counts: { imaged: 1, likely: 2, could: 3, overhead: 4 }, windowEnd: 1 }
    expect(summaryLink('https://w.e', base, 'ar')).toBe(`${summaryLink('https://w.e', base)}&l=ar`)
  })

  it('never puts words in a link: a picture whose satellite has no name carries no bs=', () => {
    const link = summaryLink('https://w.e', {
      label: 'Waterloo',
      lat: 43.47,
      lon: -80.54,
      satellites: 7,
      counts: { imaged: 1, likely: 0, could: 0, overhead: 0 },
      windowEnd: 1,
      best: { collection: 'sentinel-2-l2a', itemId: 'S2C_MSIL2A_20261101T161421_R140_T17TNJ_20261102T164803', tClosest: 1, gsdM: 10 },
    })
    expect(new URL(link).searchParams.has('bs')).toBe(false)
  })

  it('the server builds the same summary card in the link’s language', async () => {
    const { linkLocale, summaryFromParams, shareTimeZone } = await server()
    const report = await waterlooReport({ withTracks: false })
    for (const locale of ['de', 'ja', 'ar'] as const) {
      const client = summaryCardSpec(report, 'Waterloo', meta, 'America/Toronto', 'www.watched.earth', locale)
      expect(client.locale).toBe(locale)
      const q = new URL(summaryLink('https://www.watched.earth', summaryFacts(report, 'Waterloo', meta), locale)).searchParams
      expect(linkLocale(q)).toBe(locale)
      const { place: _place, ...input } = summaryFromParams(q)!
      void _place
      const srv = buildSummarySpec({ ...input, timeZone: shareTimeZone(input), host: 'www.watched.earth' }, linkLocale(q) as typeof locale)
      expect(strip(srv)).toEqual(strip(client))
    }
    // A language we don't speak, or none, reads English.
    expect(linkLocale(new URLSearchParams('l=xx'))).toBe('en')
    expect(linkLocale(new URLSearchParams(''))).toBe('en')
  })

  it('a picture with no satellite name is named by the card, in its language, on both sides', async () => {
    const { summaryFromParams } = await server()
    const q = new URLSearchParams(
      'q=43.47,-80.54&n=Waterloo&sv=7&sc=1,0,0,0&sw=1793678400000&bc=sentinel-2-l2a&bi=S2C_MSIL2A_20261101T161421_R140_T17TNJ_20261102T164803&bt=1793549661025&bg=10',
    )
    const spec = buildSummarySpec({ ...summaryFromParams(q)!, host: '' })
    expect(spec.plate.kind === 'image' && spec.plate.chip.segs[0].text).toBe(`Closest look · ${cardMessages('en').aSatellite} · 10 m`)
  })
})

describe('the share page speaks the link’s language', () => {
  const UA = { headers: { 'user-agent': 'Twitterbot/1.0' } }
  const Q = 'q=43.47,-80.54&n=Waterloo&sv=256&sc=31,220,1544,66&sw=1793678400000'

  it('sets <html lang dir> and carries l= into the card and canonical URLs, never into the hand-off', async () => {
    const handle = await sharePage()
    const de = await (await handle(new Request(`https://www.watched.earth/api/s?${Q}&l=de`, UA))).text()
    expect(de).toContain('<html lang="de">')
    expect(de).toMatch(/<meta property="og:image" content="https:\/\/www\.watched\.earth\/api\/og\?kind=summary&#38;[^"]*&#38;l=de">/)
    expect(de).toMatch(/<link rel="canonical" href="[^"]*&#38;l=de">/)
    expect(de).not.toMatch(/url=\/\?[^"]*l=de/)
    const ar = await (await handle(new Request(`https://www.watched.earth/api/s?${Q}&l=ar`, UA))).text()
    expect(ar).toContain('<html lang="ar" dir="rtl">')
    // English, and a language we don't speak: the page as it always was.
    const en = await (await handle(new Request(`https://www.watched.earth/api/s?${Q}`, UA))).text()
    expect(await (await handle(new Request(`https://www.watched.earth/api/s?${Q}&l=xx`, UA))).text()).toBe(en)
    expect(en).toContain('<html lang="en">')
    expect(en).not.toMatch(/(\?|&#38;)l=/)
  })

  it('renders the default card for a language without a baked one, and keeps the baked PNG for English', async () => {
    const handle = await sharePage()
    const de = await (await handle(new Request('https://www.watched.earth/api/s?id=bad!&l=de', UA))).text()
    expect(de).toMatch(/<meta property="og:image" content="https:\/\/www\.watched\.earth\/api\/og\?v=\d+&#38;l=de">/)
    const en = await (await handle(new Request('https://www.watched.earth/api/s?id=bad!', UA))).text()
    expect(en).toContain('<meta property="og:image" content="https://www.watched.earth/og-default.png">')
    expect(en).toContain('<p>Opening <a href="/">Watched</a></p>')
  })
})

describe('the PNG’s line breaking and shaping (canvas has no CSS)', () => {
  // Every code point 10 px wide: lines of at most 10 code points.
  const ctx = { measureText: (t: string) => ({ width: Array.from(t).length * 10 }) } as unknown as Parameters<typeof wrap>[0]

  it('breaks Latin text at spaces and after hyphens, as it always did', () => {
    expect(wrap(ctx, 'Saint-Jean-sur-Richelieu', 100, 0)).toEqual(['Saint-', 'Jean-sur-', 'Richelieu'])
    expect(wrap(ctx, '7 satellites watched', 100, 0)).toEqual(['7', 'satellites', 'watched'])
    expect(wrap(ctx, 'No satellite we track watched', 140, 0)).toEqual(['No satellite', 'we track', 'watched'])
    // A no-break space holds a count to its noun, as the preview (and satori) keep it
    expect(wrap(ctx, 'дивилися 256\u00a0супутників.', 140, 0)).toEqual(['дивилися', '256\u00a0супутників.'])
  })

  it('breaks text written without spaces between its words, never before closing punctuation', () => {
    const lines = wrap(ctx, '東京都千代田区丸の内一丁目東京駅前広場周辺の大きな公園と庭園。', 100, 0, 'ja')
    expect(lines.length).toBeGreaterThan(1)
    expect(lines.join('')).toBe('東京都千代田区丸の内一丁目東京駅前広場周辺の大きな公園と庭園。')
    for (const l of lines) expect(l).not.toMatch(/^[。、」]/)
    // Korean writes spaces: its words stay whole.
    expect(wrap(ctx, '서울특별시 중구 세종대로', 70, 0, 'ko')).toEqual(['서울특별시', '중구 세종대로'])
  })

  it('keeps a no-break space’s neighbours together in text written without spaces', () => {
    // Intl.Segmenter cuts "12,345", the no-break space and 张 into three words; the line may not break between them.
    const lines = wrap(ctx, '至少 12,345\u00a0张图像已公开。', 75, 0, 'zh-Hans')
    expect(lines.join('')).toBe('至少12,345\u00a0张图像已公开。')
    expect(lines).toContain('12,345\u00a0张')
    for (const l of lines) expect(l).not.toMatch(/^\u00a0|\u00a0$/)
    // zh-Hant ties a Latin name's words with them (keepName): 台北 101 stays one name
    expect(wrap(ctx, '台北\u00a0101大樓', 40, 0, 'zh-Hant')[0]).toBe('台北\u00a0101')
  })

  it('knows which text a shaping engine must draw as one run', () => {
    expect(needsShaping('Waterloo')).toBe(false)
    expect(needsShaping('東京')).toBe(false)
    expect(needsShaping('٧ أقمار صناعية')).toBe(true)
    expect(needsShaping('תל אביב')).toBe(true)
    // Devanagari's conjuncts and reordered vowel signs, and its headline stroke that tracking would cut
    expect(needsShaping('256 उपग्रहों ने देखा।')).toBe(true)
  })

  it('keeps the headline’s blocks, in order, for every renderer', () => {
    const de: CardMessages = { ...enCard, headline: (n: number, place: string, cut: boolean): Rich => [`${n} Satelliten beobachteten`, accent(place, ' von oben', ...(cut ? [] : ['.']))] }
    setBundleForTests('de', { card: de })
    try {
      const spec = buildCardSpec({ verdict: 'imaged', satName: 'Sentinel-2C', placeLabel: 'Waterloo', satellites: 7, lat: 0, lon: 0, pass: {}, host: '' }, 'de')
      expect(spec.locale).toBe('de')
      expect(spec.head.map((p) => (typeof p === 'string' ? p : 'accent' in p ? `*${plain(p.accent)}*` : '?'))).toEqual(['7 Satelliten beobachteten', '*Waterloo von oben.*'])
    } finally {
      setBundleForTests('en', null)
    }
  })
})

describe('shared things never carry the sharer’s language as data', () => {
  it('names a curated place by its English name, whatever language it is shown in', () => {
    const giza = EXAMPLE_PLACES.find((p) => p.label === 'Pyramids of Giza')!
    expect(publicLabelOf({ ...giza, label: 'Pyramides de Gizeh', sublabel: 'Gizeh, Égypte', canonicalLabel: giza.label })).toBe('Pyramids of Giza')
    expect(publicLabelOf(giza)).toBe('Pyramids of Giza')
    // …and when it came from a link, translated for this reader (src/app/links.ts keeps the English as canonicalLabel).
    expect(publicLabelOf({ label: 'Pyramides de Gizeh', canonicalLabel: 'Pyramids of Giza', lat: 29.979, lon: 31.134, source: 'url' })).toBe('Pyramids of Giza')
    // A curated name with a number in it is shared by its city, the English sublabel's (as in English).
    const area51 = EXAMPLE_PLACES.find((p) => p.label === 'Area 51')!
    expect(publicLabelOf({ ...area51, label: 'Zone 51', sublabel: 'Lac Groom, Nevada, États-Unis', canonicalLabel: 'Area 51' })).toBe('Groom Lake')
    expect(publicLabelOf(area51)).toBe('Groom Lake')
    // A geocoder's name is data, shared as it came; a street address never is.
    expect(publicLabelOf({ label: 'Waterloo', sublabel: 'Ontario, Canada', lat: 43.4723, lon: -80.5449, source: 'search' })).toBe('Waterloo')
    expect(publicLabelOf({ label: '200 University Ave W', sublabel: 'Waterloo, Ontario', lat: 43.4723, lon: -80.5449, source: 'search' })).toBe('Waterloo')
  })

  it('gives the post the raw pixel size, which English writes as the results do', () => {
    const base = { verdict: 'imaged' as const, satName: 'Sentinel-2C', placeLabel: 'Waterloo', altitudeKm: 795, tClosest: Date.UTC(2026, 10, 1, 16, 21), timeZone: 'America/Toronto' }
    for (const gsdM of [0.31, 10, 30, 375, 999.6, 1000, 2000, 4012]) expect(postText({ ...base, pixelM: gsdM })).toContain(`. ${pixelLabel({ gsdM })} per pixel; this is the actual image.`)
    expect(postText(base)).toContain('. This is the actual image.')
  })
})

// The server modules read process.env and tz-lookup: imported by a runtime specifier (as above).
interface ServerCopy {
  headline: (s: unknown) => string
  description: (s: unknown) => string
  summaryDescription: (s: unknown) => string
  summaryAlt: (s: unknown) => string
  cardInputFromShare: (s: unknown, host: string) => CardInput
}
const copy = () => import('../../../api/_lib/share.ts' as string) as Promise<ServerCopy>

describe('a satellite with no name', () => {
  // An old share that kept neither the satellite's name nor its NORAD id.
  const nameless = { placeLabel: 'Waterloo', lat: 43.47, lon: -80.54, verdict: 'imaged', pass: { headingDeg: 190, groundDistanceKm: 40, altitudeKm: 786 } }

  it('is said by each English sentence exactly as before', async () => {
    const s = await copy()
    expect(s.headline(nameless)).toBe('A satellite watched Waterloo.')
    expect(s.description(nameless)).toBe('A satellite crossed 786 km above Waterloo, moving south. What watched you this week?')
    expect(s.description({ ...nameless, verdict: 'could' })).toMatch(/^A satellite passed within view of Waterloo, moving south\. /)
    // A week whose picture has no satellite name reads as a link that carried "A satellite" did.
    const week = { placeLabel: 'Waterloo', satellites: 7, counts: { imaged: 1, likely: 0, could: 0, overhead: 0 } }
    const best = { tClosest: 1, capture: { collection: 'sentinel-2-l2a', itemId: 'x' } }
    for (const look of ['closest', 'lastClear', 'radar'] as const) {
      expect(s.summaryDescription({ ...week, best: { ...best, look } })).toBe(s.summaryDescription({ ...week, best: { ...best, look, satName: 'A satellite' } }))
    }
    expect(s.summaryDescription({ ...week, best })).toBe('1 image was made public. The closest look is from A satellite. What watched you this week?')
    expect(s.summaryAlt({ ...week, best })).toBe('7 satellites watched Waterloo this week. The share card, with the week’s closest photo, from A satellite.')
    expect(s.summaryAlt(week)).toBe('7 satellites watched Waterloo this week. The share card.')
  })

  it('reaches the card with no name: the headline says it in its words, the callout prints the label', async () => {
    const s = await copy()
    const input = s.cardInputFromShare(nameless, '')
    expect(input.satName).toBeUndefined()
    const spec = buildCardSpec(input)
    expect(spec.lead).toBe('A satellite watched')
    expect(spec.plate.kind === 'plan' && spec.plate.chips.some((c) => c.segs[0].text === enCard.aSatellite)).toBe(true)
  })
})

describe('the app’s bundle speaks for the card', () => {
  afterEach(() => setBundleForTests('en', null))
  // A stand-in translation: a sentence that says "a satellite" its own way, and words on the place's serif line.
  const de: CardMessages = {
    ...enCard,
    headline: (n: number, place: string, cut: boolean): Rich => [`${n} Satelliten beobachteten`, accent(place, ' von oben', ...(cut ? [] : ['.']))],
    headlineBy: { ...enCard.headlineBy, imaged: (sat: string | undefined, place: string): Rich => [`${sat ?? 'Ein Satellit'} beobachtete`, accent(place, '.')] },
  }
  const input: CardInput = { verdict: 'imaged', placeLabel: 'Waterloo', lat: 0, lon: 0, pass: {}, host: '' }

  it('in the app’s language: the preview and the PNG take the bundle’s words (and ?hl=pseudo’s)', () => {
    setBundleForTests('de', { card: de })
    expect(cardMessages('de')).toBe(de)
    expect(buildCardSpec(input, 'de').lead).toBe('Ein Satellit beobachtete')
    expect(buildCardSpec({ ...input, satName: 'Sentinel-2C' }, 'de').lead).toBe('Sentinel-2C beobachtete')
    // Another language than the app's, or a bundle without a card: the server's table answers.
    expect(cardMessages('fr')).toBe(frCard)
    setBundleForTests('de', {})
    expect(cardMessages('de')).toBe(deCard)
  })

  it('sizes the headline on every word of the place’s line, never its closing full stop', () => {
    expect(accentText(enCard.headline(7, 'Waterloo', false), 'en')).toBe('Waterloo')
    expect(accentText(enCard.headline(7, 'Waterl…', true), 'en')).toBe('Waterl…')
    expect(accentText(enCard.headlineWeek(7, 'Waterloo', false), 'en')).toBe('Waterloo this week.')
    const en = buildCardSpec({ ...input, satellites: 7, placeLabel: 'Kitchener-Waterloo' }, 'en')
    setBundleForTests('de', { card: de })
    const withWords = buildCardSpec({ ...input, satellites: 7, placeLabel: 'Kitchener-Waterloo' }, 'de')
    expect(accentText(withWords.head, 'de')).toBe('Kitchener-Waterloo von oben')
    expect(withWords.size).toBeLessThan(en.size)
  })

  it('keeps an English week the size it always was', () => {
    const week: SummaryInput = { placeLabel: 'Waterloo', lat: 0, lon: 0, satellites: 7, counts: { imaged: 1, likely: 0, could: 0, overhead: 0 }, host: '' }
    // "Waterloo this week." counts toward the serif lines, as it always did: 19 characters step it down to 62 px.
    expect(buildSummarySpec(week).size).toBe(headlineSize('7 satellites watched', 'Waterloo this week.'))
    expect(buildSummarySpec(week).size).toBe(62)
  })
})
