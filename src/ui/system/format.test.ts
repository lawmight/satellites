/**
 * The mono readout formatters: counts and decimals now follow the visitor's language (fmt(currentLocale())), so these
 * hold English to the en-US forms they always printed, and the UTC halves to the string they were cut from.
 */
import { afterEach, describe, expect, it } from 'vitest'
import { setBundleForTests } from '@/i18n/runtime'
import { fmtInt, fmtNum, fmtUtc, fmtUtcDate, fmtUtcTime } from './format'

describe('readout formatters', () => {
  afterEach(() => setBundleForTests('en', null))

  it('print counts and decimals in English exactly as before', () => {
    for (const n of [0, 1, 7.5, 999, 1715, 16893.4, 1_234_567, -42.5, 0.04]) {
      expect(fmtInt(n)).toBe(new Intl.NumberFormat('en-US').format(Math.round(n)))
      for (const d of [0, 1, 2]) expect(fmtNum(n, d)).toBe(n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }))
    }
  })

  it('group and separate digits the visitor’s way', () => {
    setBundleForTests('de', {})
    expect(fmtInt(16893)).toBe('16.893')
    expect(fmtNum(7.456, 2)).toBe('7,46')
  })

  it('splits the UTC stamp into its date and time without parsing it', () => {
    const t = Date.UTC(2026, 10, 8, 3, 31, 7)
    expect(fmtUtc(t)).toBe('2026-11-08 03:31:07')
    expect(fmtUtc(t, false)).toBe('2026-11-08 03:31')
    expect(fmtUtcDate(t)).toBe('2026-11-08')
    expect(fmtUtcTime(t)).toBe('03:31:07')
    expect(fmtUtcTime(t, false)).toBe('03:31')
  })
})
