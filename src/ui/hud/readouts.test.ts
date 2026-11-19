import { afterEach, describe, expect, it } from 'vitest'
import enHud from '@/i18n/en/hud'
import { setBundleForTests } from '@/i18n/runtime'
import { ageOf, fmtCatalogAge, fmtGmst, fmtLatFixed, fmtLonFixed, fmtObjects, fmtSource, fmtStampZ, fmtSun, isStale } from './readouts'

describe('corner readout formatters', () => {
  it('pads latitude and longitude to fixed widths', () => {
    expect(fmtLatFixed(-6.24)).toBe('06.2°S')
    expect(fmtLatFixed(23.44)).toBe('23.4°N')
    expect(fmtLatFixed(0)).toBe('00.0°N')
    expect(fmtLonFixed(118.2)).toBe('118.2°E')
    expect(fmtLonFixed(-8)).toBe('008.0°W')
    expect(fmtLonFixed(190)).toBe('170.0°W')
    expect(fmtLonFixed(-179.97)).toBe('180.0°E')
    expect(fmtSun({ lat: -16.21, lon: 63.04 })).toBe('SUN 16.2°S 063.0°E')
  })

  it('keeps every sub-solar readout the same width', () => {
    const widths = new Set<number>()
    for (let lat = -23.4; lat <= 23.4; lat += 3.7) for (let lon = -179.9; lon <= 180; lon += 13.3) widths.add(fmtSun({ lat, lon }).length)
    expect([...widths]).toEqual([18])
  })

  it('formats GMST as sidereal HH:MM:SS', () => {
    // J2000.0 epoch: GMST ≈ 18h 41m 50.5s
    expect(fmtGmst(Date.UTC(2000, 0, 1, 12, 0, 0))).toBe('18:41:50')
    expect(fmtGmst(Date.UTC(2026, 10, 8, 4, 0, 0))).toMatch(/^\d\d:\d\d:\d\d$/)
  })

  it('formats catalog stamps and ages', () => {
    expect(fmtStampZ('2026-11-08T03:34:02.063Z')).toBe('2026-11-08 03:34Z')
    expect(fmtStampZ('nope')).toBe('—')
    const t = Date.UTC(2026, 10, 8, 3, 34)
    // The age is the corner's "<1 MIN ago" … "Stale, 3 D ago" (the HUD's text as before the catalog).
    expect(fmtCatalogAge(t, t + 30_000, false)).toBe('<1 MIN ago')
    expect(fmtCatalogAge(t, t + 75_000, false)).toBe('1 MIN ago')
    expect(fmtCatalogAge(t, t + 42 * 60_000, false)).toBe('42 MIN ago')
    expect(fmtCatalogAge(t, t + 5 * 3_600_000, false)).toBe('5 H ago')
    expect(fmtCatalogAge(t, t + 3 * 86_400_000, true)).toBe('Stale, 3 D ago')
    expect(fmtCatalogAge(t, t - 1000, false)).toBe('<1 MIN ago')
  })

  it('measures an age as a unit and a count, for every language to word', () => {
    const t = Date.UTC(2026, 10, 8, 3, 34)
    expect(ageOf(t, t + 59_999)).toEqual({ unit: 'underMinute', n: 0 })
    expect(ageOf(t, t + 89_000)).toEqual({ unit: 'minute', n: 1 })
    expect(ageOf(t, t + 89 * 60_000)).toEqual({ unit: 'minute', n: 89 })
    expect(ageOf(t, t + 90 * 60_000)).toEqual({ unit: 'hour', n: 2 })
    expect(ageOf(t, t + 47 * 3_600_000)).toEqual({ unit: 'hour', n: 47 })
    expect(ageOf(t, t + 48 * 3_600_000)).toEqual({ unit: 'day', n: 2 })
  })

  it('flags element sets older than two days', () => {
    const iso = '2026-11-08T03:34:02Z'
    const t = Date.parse(iso)
    expect(isStale(iso, t + 47 * 3_600_000)).toBe(false)
    expect(isStale(iso, t + 49 * 3_600_000)).toBe(true)
    expect(isStale('garbage', t)).toBe(false)
  })

  it('labels the catalog', () => {
    expect(fmtObjects(16893)).toBe('16,893 OBJECTS')
    expect(fmtSource('CelesTrak GP')).toBe('CELESTRAK GP')
    expect(fmtSource('CelesTrak GP (GROUP=active)')).toBe('CELESTRAK GP')
    expect(fmtSource('')).toBe('CATALOG')
  })
})

describe('corner readout words', () => {
  afterEach(() => setBundleForTests('en', null))

  it('words the catalog line in English as before', () => {
    expect(enHud.fetched('2026-11-08 03:34Z')).toBe('Fetched 2026-11-08 03:34Z')
    expect(enHud.catalogAge('hour', 4, false)).toBe('4 H ago')
    expect(enHud.catalogAge('day', 3, true)).toBe('Stale, 3 D ago')
    expect(enHud.catalogAge('underMinute', 0, true)).toBe('Stale, <1 MIN ago')
    expect(enHud.gmst('18:41:50')).toBe('GMST 18:41:50')
    // A count that reaches a person goes through the plural rules (the catalog never has one object, but still).
    expect(fmtObjects(1)).toBe('1 OBJECT')
  })

  it('follows the language at call time; coordinates, clocks and stamps stay as they are', () => {
    setBundleForTests('de', {
      hud: {
        ...enHud,
        sun: (lat: string, lon: string) => `Sonne ${lat} ${lon}`,
        objects: (n: number) => `${n} Objekte`,
        catalogAge: (unit: string, n: number, stale: boolean) => `${stale ? 'veraltet, ' : ''}vor ${n} ${unit === 'hour' ? 'Std.' : 'Tg.'}`,
        catalog: 'Katalog',
      },
    })
    expect(fmtSun({ lat: -16.21, lon: 63.04 })).toBe('Sonne 16.2°S 063.0°E')
    expect(fmtObjects(16893)).toBe('16893 Objekte')
    const t = Date.UTC(2026, 10, 8, 3, 34)
    expect(fmtCatalogAge(t, t + 5 * 3_600_000, false)).toBe('vor 5 Std.')
    expect(fmtCatalogAge(t, t + 50 * 3_600_000, true)).toBe('veraltet, vor 2 Tg.')
    expect(fmtSource('')).toBe('Katalog')
    expect(fmtStampZ('2026-11-08T03:34:02.063Z')).toBe('2026-11-08 03:34Z')
    expect(fmtGmst(Date.UTC(2000, 0, 1, 12, 0, 0))).toBe('18:41:50')
  })
})
