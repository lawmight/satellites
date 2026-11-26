/**
 * The top-left readout's link to the code (Hud.tsx): its accessible name starts with the words a visitor sees, in every
 * language. WCAG 2.5.3 (label in name): a voice user says what they see ("Open source").
 */
import { describe, expect, it } from 'vitest'
import { LOCALES } from '../../../api/_lib/i18n/locales'
import type enHud from '@/i18n/en/hud'

describe('the link to the code', () => {
  it('is named by its visible words, then where it goes, in every language', () => {
    const catalogs = import.meta.glob<typeof enHud>('../../i18n/*/hud.ts', { import: 'default', eager: true })
    expect(Object.keys(catalogs)).toHaveLength(LOCALES.length)
    for (const [file, c] of Object.entries(catalogs)) {
      expect(c.sourceLink.trim(), file).not.toBe('')
      expect(c.sourceLinkLabel.startsWith(c.sourceLink), file).toBe(true)
      expect(c.sourceLinkLabel, file).toContain('GitHub')
    }
  })
})
