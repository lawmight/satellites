/**
 * The About page's rich paragraphs (src/i18n/en/about.ts): flattened, they read exactly as the page's English always
 * did, and the one link in each sits where it did.
 */
import { describe, expect, it } from 'vitest'
import { isNum, numText } from '../../../api/_lib/i18n/parts'
import en, { type AboutPart } from '@/i18n/en/about'

const flat = (parts: readonly AboutPart[]): string =>
  parts.map((p) => (typeof p === 'string' ? p : 'link' in p ? `[${flat(p.link)}]` : isNum(p) ? `<${numText(p)}>` : '')).join('')

describe('About copy', () => {
  it('reads the method paragraph as before, the link on CelesTrak', () => {
    expect(flat(en.method.orbits)).toBe(
      'Every object in orbit has a public set of numbers that describes its path. [CelesTrak] publishes them from US Space Force tracking, and we grab a fresh copy every six hours.',
    )
    expect(flat(en.method.loaded(16893, '2026-11-08 03:34Z'))).toBe('This page loaded <16,893> objects, fetched <2026-11-08 03:34Z>.')
  })

  it('credits the maker with his handle as the link', () => {
    expect(flat(en.credits.madeBy.text('@armaangupt0'))).toBe('Armaan, [@armaangupt0] on X')
    expect(flat(en.builtBy('@armaangupt0'))).toBe('Built by [@armaangupt0]')
  })

  it('has a heading for every section, and says more after three of the four verdicts', () => {
    expect(Object.keys(en.sections)).toEqual(['short', 'method', 'words', 'accuracy', 'privacy', 'credits', 'keys'])
    expect(Object.entries(en.verdictMore).filter(([, v]) => v).map(([k]) => k)).toEqual(['imaged', 'likely', 'could'])
  })
})
