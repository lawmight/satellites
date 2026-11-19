/**
 * Units keep their case in mono caps rows (./units.ts): the symbols after a number, and nothing else.
 */
import { describe, expect, it } from 'vitest'
import { capsExceptUnits, isUnitSymbol, unitRuns } from './units'

const en = (t: string, after = false) => capsExceptUnits(t, 'en', after)

describe('units keep their case in mono caps', () => {
  it('leaves km, m and km/s after a number as they are, and uppercases the rest', () => {
    expect(en('Sentinel-2C · MSI · 10 m')).toBe('SENTINEL-2C · MSI · 10 m')
    expect(en('Sentinel-2 L2A · 10 m · 10.0 km')).toBe('SENTINEL-2 L2A · 10 m · 10.0 km')
    expect(en('Closest < 1 km')).toBe('CLOSEST < 1 km')
    expect(en('Swath 2,900 km')).toBe('SWATH 2,900 km')
    expect(en('7.46 km/s')).toBe('7.46 km/s')
    expect(en('Daily mosaic · 250 m')).toBe('DAILY MOSAIC · 250 m')
    expect(en('Closest look · Sentinel-2B · 0.31 m')).toBe('CLOSEST LOOK · SENTINEL-2B · 0.31 m')
  })

  it('takes a no-break, narrow or thin space, or none, between the number and its unit', () => {
    expect(capsExceptUnits('Fauchée 2\u202f900\u00a0km', 'fr')).toBe('FAUCHÉE 2\u202f900\u00a0km')
    expect(en('10\u2009m')).toBe('10\u2009m')
    expect(en('10m')).toBe('10m')
  })

  it('never lowercases what is not a unit: names, products, other words, things already in capitals', () => {
    expect(en('Landsat C2 L2 · 30 m')).toBe('LANDSAT C2 L2 · 30 m')
    expect(en('In view 4 min 12 s')).toBe('IN VIEW 4 MIN 12 S')
    expect(en('2 mosaics')).toBe('2 MOSAICS')
    expect(en('NOAA 20 · VIIRS')).toBe('NOAA 20 · VIIRS')
    expect(en('ACQUIRED 11:21:13 EST · 10 M')).toBe('ACQUIRED 11:21:13 EST · 10 M')
    expect(en('m 5 km')).toBe('M 5 km')
    expect(en('Plan · north up')).toBe('PLAN · NORTH UP')
  })

  it('keeps Cyrillic and Turkish units lowercase, and the words around them in their language’s capitals', () => {
    expect(capsExceptUnits('Найближче 3\u00a0км', 'uk')).toBe('НАЙБЛИЖЧЕ 3\u00a0км')
    expect(capsExceptUnits('Смуга 290\u00a0км · 10\u00a0м', 'uk')).toBe('СМУГА 290\u00a0км · 10\u00a0м')
    expect(capsExceptUnits('7,46 км/с', 'uk')).toBe('7,46 км/с')
    expect(capsExceptUnits('2 млн', 'uk')).toBe('2 МЛН')
    expect(capsExceptUnits('En yakın 3 km · 7,46 km/sn', 'tr')).toBe('EN YAKIN 3 km · 7,46 km/sn')
    expect(capsExceptUnits('Şerit genişliği 290 km', 'tr-TR')).toBe('ŞERİT GENİŞLİĞİ 290 km')
  })

  it('takes a unit glued to Chinese, Japanese or Korean words (no spaces there)', () => {
    expect(capsExceptUnits('最近 3 km处', 'zh-Hans')).toBe('最近 3 km处')
    expect(capsExceptUnits('고도 786 km에서', 'ko')).toBe('고도 786 km에서')
  })

  it('a string that follows a number part may open on its unit', () => {
    expect(en(' km', true)).toBe(' km')
    expect(en('\u00a0км', true)).toBe('\u00a0км')
    expect(en(' km · imaged', true)).toBe(' km · IMAGED')
    expect(en(' kmh', true)).toBe(' KMH')
    expect(en(' km')).toBe(' KM')
  })

  it('cuts a string into runs, and leaves one without a unit whole', () => {
    expect(unitRuns('Swath 290 km')).toEqual([{ text: 'Swath 290 ' }, { text: 'km', unit: true }])
    expect(unitRuns('10 m · 2 km')).toEqual([{ text: '10 ' }, { text: 'm', unit: true }, { text: ' · 2 ' }, { text: 'km', unit: true }])
    expect(unitRuns('Plan · north up')).toEqual([{ text: 'Plan · north up' }])
    expect(unitRuns('')).toEqual([{ text: '' }])
  })

  it('tells a unit slot’s symbol from a word', () => {
    for (const u of ['km', 'm', 'km/s', 'km/sn', 'км', 'м', 'км/с', '\u00a0km']) expect(isUnitSymbol(u)).toBe(true)
    for (const u of ['day', 'scene', 'mosaic', 'up', 'KM', 'every 10 min', 'كم']) expect(isUnitSymbol(u)).toBe(false)
  })
})
