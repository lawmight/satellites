/**
 * Every character a Latin, Cyrillic or Vietnamese card prints is in the card's bundled fonts. A character they lack sends
 * satori to Google Fonts for a subset (two requests, up to 4 s each) before the card renders, and the app's canvas draws
 * it in a system face; French's narrow no-break space did both (cardSpec.ts cardSpaces). Every language's card is drawn
 * here, and every card once more for a Vietnamese and a Russian place (Hà Nội's ộ, Королёв's ё: the brand faces lack
 * both, the Vietnamese and Cyrillic cuts have them). Chinese, Japanese, Korean, Arabic and Hindi cards need Noto subsets
 * by design (fallbackFonts.ts) and are not checked here; a Persian link, like an Arabic one, unfurls with the English card (api/og.tsx
 * cardLocale), which is.
 *
 * satori reports what a card lacks by asking for it: fetch is stubbed, and any request to Google Fonts is a failure,
 * named with the characters it asked for.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import './i18n/card/server.js'
import { shareCard } from './card.js'
import { buildCardSpec, buildSummarySpec, type CardInput, type CardSpec } from './cardSpec.js'
import { cardFonts } from './fonts.js'
import { textOf } from './h.js'
import type { Locale } from './i18n/locales.js'
import { cardSvg } from './ogRender.js'

afterEach(() => vi.unstubAllGlobals())

const LOCALES: Locale[] = ['en', 'es', 'fr', 'de', 'pt-BR', 'it', 'nl', 'pl', 'tr', 'id', 'uk', 'ru', 'vi']
const T = Date.UTC(2026, 10, 1, 16, 21)
const pass = (verdict: CardInput['verdict'], extra: Partial<CardInput> = {}): CardInput => ({
  verdict,
  satName: 'Sentinel-2C',
  placeLabel: 'Waterloo',
  satellites: 1715,
  lat: 43.47,
  lon: -80.54,
  pass: { altitudeKm: 786, offNadirDeg: 5.3, groundDistanceKm: 61, groundSpeedKmS: 7.46, headingDeg: 192 },
  tClosest: T,
  timeZone: 'America/Toronto',
  host: 'www.watched.earth',
  ...extra,
})

function specs(l: Locale): CardSpec[] {
  const week = { placeLabel: 'Waterloo', lat: 43.47, lon: -80.54, counts: { imaged: 40, likely: 210, could: 1565, overhead: 68 }, windowEnd: T, timeZone: 'America/Toronto', host: 'www.watched.earth' }
  return [
    buildSummarySpec({ ...week, satellites: 256 }, l),
    buildSummarySpec({ ...week, satellites: 0, counts: { imaged: 0, likely: 0, could: 0, overhead: 0 } }, l),
    buildSummarySpec({ ...week, satellites: 12, archiveDown: true }, l),
    ...(['imaged', 'likely', 'could', 'overhead'] as const).map((v) => buildCardSpec(pass(v), l)),
    buildCardSpec(pass('could', { satName: undefined }), l),
    // A place named in Vietnamese and one in Russian, on every language's card
    buildCardSpec(pass('imaged', { placeLabel: 'Thành phố Hồ Chí Minh' }), l),
    buildSummarySpec({ ...week, placeLabel: 'Hà Nội', satellites: 31 }, l),
    buildCardSpec(pass('likely', { placeLabel: 'Королёв' }), l),
  ]
}

describe('a Latin, Cyrillic or Vietnamese card', () => {
  it('prints only characters its bundled fonts draw', async () => {
    const asked: string[] = []
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const u = String(url)
        if (u.startsWith('https://fonts.googleapis.com/')) asked.push(decodeURIComponent(new URL(u).searchParams.get('text') ?? ''))
        return new Response('', { status: 404 })
      }),
    )
    const missing: string[] = []
    for (const l of LOCALES) {
      for (const spec of specs(l)) {
        asked.length = 0
        const element = shareCard({ spec, image: null })
        await cardSvg(element, { width: 1200, height: 630, fonts: await cardFonts(l, textOf(element)) })
        if (asked.length) missing.push(`${l}: ${[...new Set(asked.join(''))].map((c) => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')} ${c}`).join(', ')}`)
      }
    }
    expect(missing).toEqual([])
  }, 120_000)
})
