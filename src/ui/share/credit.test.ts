/**
 * The licence credit ("Contains modified Copernicus Sentinel data 2026") is English in every language (docs/I18N.md),
 * so it is uppercased as English: a Turkish card must print CONTAINS MODIFIED, never CONTAİNS MODİFİED, while its
 * own mono rows keep Turkish casing. The spec marks the credit chip (Chip.lang) and every renderer reads the mark:
 * the share sheet's preview as lang="en", the PNG (canvas) here, the Open Graph card (satori) in
 * api/_lib/cardCredit.test.ts.
 */
import { describe, expect, it } from 'vitest'
import type { Pass } from '@/types'
import { LOCALES, LOCALE_INFO, type Locale } from '../../../api/_lib/i18n/locales'
import { waterlooReport } from '../results/__fixtures__/waterloo'
import type { SatMeta } from '../results/lib/meta'
import { cardCaps, cardSpec, chipCaps, summaryCardSpec } from './card'

const meta = (n: number): SatMeta => ({ norad: n, name: n === 60989 ? 'Sentinel-2C' : `NORAD ${n}`, category: 'other' })
const metaFor = (p: Pass): SatMeta => meta(p.norad)
/** The card's own casing, as renderCardPng builds it. */
const capsOf = (locale: Locale) => cardCaps(LOCALE_INFO[locale].intl)

async function specs(locale: Locale) {
  const report = await waterlooReport({ withTracks: false })
  const s2 = report.passes.find((p) => p.captureId?.startsWith('S2C_MSIL2A_20261101'))!
  return [
    cardSpec(s2, report, metaFor(s2), 'America/Toronto', 'www.watched.earth', { locale }),
    summaryCardSpec(report, 'Waterloo', meta, 'America/Toronto', 'www.watched.earth', locale),
  ]
}

describe('the licence credit is cased as English on every card', () => {
  it('marks the credit chip, and only it, as English in every language', async () => {
    for (const locale of LOCALES) {
      for (const spec of await specs(locale)) {
        if (spec.plate.kind !== 'image') throw new Error('the fixture’s cards show a picture')
        expect(spec.plate.credit.segs.map((s) => s.text)).toEqual(['Contains modified Copernicus Sentinel data 2026'])
        expect(spec.plate.credit.lang).toBe('en')
        expect(spec.plate.chip.lang).toBeUndefined()
        expect(spec.plate.fallback.chips.every((c) => c.lang === undefined)).toBe(true)
      }
    }
  })

  it('the PNG uppercases the credit as English and every other chip in the card’s language', async () => {
    const [spec] = await specs('tr')
    if (spec.plate.kind !== 'image') throw new Error('the fixture’s card shows a picture')
    const caps = capsOf('tr')
    const credit = chipCaps(spec.plate.credit, caps)
    expect(credit(spec.plate.credit.segs[0].text)).toBe('CONTAINS MODIFIED COPERNICUS SENTINEL DATA 2026')
    expect(chipCaps(spec.plate.chip, caps)(spec.plate.chip.segs[0].text)).toBe('SENTİNEL-2C · MSI · 10 m')
    // English: the casing it always had, its unit aside.
    const [en] = await specs('en')
    if (en.plate.kind !== 'image') throw new Error('the fixture’s card shows a picture')
    expect(chipCaps(en.plate.credit, capsOf('en'))(en.plate.credit.segs[0].text)).toBe(capsOf('en')(en.plate.credit.segs[0].text))
    expect(chipCaps(en.plate.chip, capsOf('en'))(en.plate.chip.segs[0].text)).toBe('SENTINEL-2C · MSI · 10 m')
  })
})
