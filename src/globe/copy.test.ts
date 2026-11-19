import { describe, expect, it } from 'vitest'
import { num, plain } from '../../api/_lib/i18n/parts'
import enGlobe from '@/i18n/en/globe'
import { pseudoBundle } from '@/i18n/pseudo'

describe("the globe's words (src/i18n/en/globe.ts)", () => {
  const m = enGlobe
  it('read in English as the overlay wrote them before they were messages, units now lowercase', () => {
    expect(m.imaged('11:21:13', 'EST')).toBe('IMAGED 11:21:13 EST')
    expect(m.imaged('16:21:13', 'UTC')).toBe('IMAGED 16:21:13 UTC')
    expect(m.imagedAbout('11:21', 'EST')).toBe('IMAGED ≈ 11:21 EST')
    expect(m.acquired('11:21:13', 'EST', m.resolutionM(10))).toBe('ACQUIRED 11:21:13 EST · 10 m')
    expect(m.acquiredAbout('11:21', 'UTC+9', m.resolutionKm(2))).toBe('ACQUIRED ≈ 11:21 UTC+9 · 2 km')
    expect(m.resolutionM(375)).toBe('375 m')
    expect(m.noradName('00005')).toBe('NORAD 00005')
    expect(m.acquisitionOf('SENTINEL-2C')).toBe('ACQUISITION · SENTINEL-2C')
    expect(m.closestApproachOf('NORAD 25544')).toBe('CLOSEST APPROACH · NORAD 25544')
  })

  it('build the callout meta line around its two values, in the old order', () => {
    const norad = num('25544')
    const alt = num('412')
    expect(plain(m.calloutMeta(norad, alt))).toBe('NORAD 25544 · 412 km')
    expect(plain(m.calloutMetaImaged(norad, alt, m.imaged('11:21:13', 'EST')))).toBe('NORAD 25544 · 412 km · IMAGED 11:21:13 EST')
    expect(plain(m.calloutMetaCompact(alt))).toBe('· 412 km')
  })

  it('hand the altitude slot back as the very part it was given (the frame loop finds it by identity)', () => {
    const alt = num('—')
    expect(m.calloutMeta(num('25544'), alt)).toContain(alt)
    // A translation that wraps the words (the dev pseudo-locale) still places the same part.
    const pseudo = pseudoBundle({ globe: enGlobe }).globe as typeof enGlobe
    expect(pseudo.calloutMeta(num('25544'), alt)).toContain(alt)
    expect(pseudo.calloutMetaCompact(alt)).toContain(alt)
  })

  it("say the pin's sentences whole", () => {
    expect(m.pin.placeTitle('Waterloo', 'Ontario, Canada')).toBe('Waterloo, Ontario, Canada')
    expect(m.pin.searchAria('43.4723°N 80.5449°W')).toBe('Show what passed over 43.4723°N 80.5449°W')
    expect(m.pin.droppedAt('43.4723°N 80.5449°W')).toBe('Pin dropped at 43.4723°N 80.5449°W.')
    expect(m.pin.droppedIn('Waterloo, Ontario, Canada')).toBe('Pin dropped in Waterloo, Ontario, Canada. Press Enter or the arrow to see what passed over it.')
    expect(m.pin.droppedUnnamed).toBe('Pin dropped. Press Enter or the arrow to see what passed over it.')
  })
})
