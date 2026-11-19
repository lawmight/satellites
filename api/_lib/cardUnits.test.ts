/**
 * Units keep their case on the Open Graph card (./i18n/units.ts): satori is handed every mono row already in capitals,
 * its units aside, and never asked to uppercase anything itself (its text-transform would uppercase the units too).
 * The PNG's casing is held in src/ui/share/credit.test.ts, the preview's by the [data-unit] spans it shares with the app.
 */
import { describe, expect, it } from 'vitest'
import './i18n/card/server.js'
import { shareCard } from './card.js'
import { buildCardSpec, type CardInput } from './cardSpec.js'
import { textOf } from './h.js'
import type { Locale } from './i18n/locales.js'

const T = Date.UTC(2026, 10, 1, 16, 21)
const INPUT: CardInput = {
  verdict: 'imaged',
  satName: 'Sentinel-2C',
  placeLabel: 'Waterloo',
  lat: 43.47,
  lon: -80.54,
  tClosest: T,
  timeZone: 'America/Toronto',
  pass: { altitudeKm: 795, offNadirDeg: 5.3, groundDistanceKm: 61 },
  capture: { collection: 'sentinel-2-l2a', itemId: 'S2C_MSIL2A_20261101T161421_R140_T17TNJ_20261102T164803', gsdM: 10, datetime: T },
  host: 'www.watched.earth',
}
const IMAGE = { dataUri: 'data:image/jpeg;base64,AAAA' }

/** Every element's style.textTransform in the tree */
function transforms(node: unknown, out: string[] = []): string[] {
  if (Array.isArray(node)) node.forEach((n) => transforms(n, out))
  else if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props: { style?: { textTransform?: string }; children?: unknown } }).props
    if (props.style?.textTransform) out.push(props.style.textTransform)
    transforms(props.children, out)
  }
  return out
}

/** A unit in capitals after a number, in any of the scripts that have them */
const CAPITAL_UNIT = /\d[\s\u00a0\u202f]?(KM\/SN|KM\/S|KM|CM|M|КМ\/С|КМ|СМ|М)(?![\p{Script=Latin}\p{Script=Cyrillic}])/u

describe('the Open Graph card’s units', () => {
  const locales: Locale[] = ['en', 'tr', 'uk', 'de', 'fr', 'pl', 'ja', 'ar']
  it('keeps the chip’s, the scale bar’s and the readouts’ units lowercase, with or without the picture', () => {
    for (const locale of locales) {
      for (const image of [IMAGE, null]) {
        const card = shareCard({ spec: buildCardSpec(INPUT, locale), image })
        const text = textOf(card)
        expect(text, locale).not.toMatch(CAPITAL_UNIT)
        expect(transforms(card), locale).not.toContain('uppercase')
      }
    }
  })

  it('still sets the words around them in the language’s capitals', () => {
    const tr = textOf(shareCard({ spec: buildCardSpec(INPUT, 'tr'), image: IMAGE }))
    expect(tr).toContain('SENTİNEL-2C · MSI · 10 m')
    const uk = textOf(shareCard({ spec: buildCardSpec(INPUT, 'uk'), image: IMAGE }))
    expect(uk).toMatch(/795 км/u)
    expect(uk).toMatch(/10\u00a0м|10 м/u)
    const en = textOf(shareCard({ spec: buildCardSpec(INPUT, 'en'), image: null }))
    expect(en).toContain('ALTITUDE 795 km')
    expect(en).toContain('50 km')
  })
})
