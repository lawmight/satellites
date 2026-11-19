/**
 * The Open Graph card's licence credit is English in every language (docs/I18N.md), so satori is handed it uppercased
 * as English: a Turkish card prints CONTAINS MODIFIED, never CONTAİNS MODİFİED, while the card's other mono text keeps
 * Turkish casing. The spec's mark (Chip.lang) and the PNG's casing are held in src/ui/share/credit.test.ts.
 */
import { describe, expect, it } from 'vitest'
import { defaultCard, shareCard } from './card.js'
import { buildCardSpec, type CardInput } from './cardSpec.js'
import { textOf } from './h.js'
import { LOCALES, type Locale } from './i18n/locales.js'

const T = Date.UTC(2026, 10, 1, 16, 21)
const INPUT: CardInput = {
  verdict: 'imaged',
  satName: 'Sentinel-2C',
  placeLabel: 'Waterloo',
  lat: 43.47,
  lon: -80.54,
  tClosest: T,
  timeZone: 'America/Toronto',
  pass: { altitudeKm: 795, offNadirDeg: 5.3 },
  capture: { collection: 'sentinel-2-l2a', itemId: 'S2C_MSIL2A_20261101T161421_R140_T17TNJ_20261102T164803', gsdM: 10, datetime: T },
  host: 'www.watched.earth',
}
const IMAGE = { dataUri: 'data:image/jpeg;base64,AAAA' }
const CREDIT = 'CONTAINS MODIFIED COPERNICUS SENTINEL DATA 2026'

const cards = (locale: Locale) => [
  shareCard({ spec: buildCardSpec(INPUT, locale), image: IMAGE }),
  defaultCard({ host: 'www.watched.earth', plateDataUri: IMAGE.dataUri, locale }),
]

describe('the Open Graph card’s licence credit', () => {
  it('is uppercased as English in every language', () => {
    for (const locale of LOCALES) {
      for (const card of cards(locale)) {
        const text = textOf(card)
        expect(text).toContain(CREDIT)
        expect(text).not.toMatch(/CONTAİNS|MODİFİED|SENTİNEL DATA/u)
      }
    }
  })

  it('leaves the card’s own mono text in the card’s casing, and its units lowercase', () => {
    const [share] = cards('tr')
    expect(textOf(share)).toContain('SENTİNEL-2C · MSI · 10 m')
    expect(textOf(cards('en')[0])).toContain('SENTINEL-2C · MSI · 10 m')
  })
})
