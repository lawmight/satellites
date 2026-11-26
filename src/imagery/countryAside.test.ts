/**
 * A country row whose English name the browser gives with an aside in brackets: Chromium names FK "Falkland Islands
 * (Islas Malvinas)" where the offline list (and Node's ICU, which the other tests run on) says "Falkland Islands". The
 * row is still the country, named in the language as its where lines name it. Intl.DisplayNames is stood in for
 * before the modules load, so the test holds whichever CLDR the runner has.
 */
import { afterAll, expect, it, vi } from 'vitest'

const Real = Intl.DisplayNames
class ChromiumNames extends Real {
  private readonly english: boolean
  constructor(locales: string[], options: Intl.DisplayNamesOptions) {
    super(locales, options)
    this.english = this.resolvedOptions().locale.startsWith('en')
  }
  of(code: string) {
    return this.english && code.toUpperCase() === 'FK' ? 'Falkland Islands (Islas Malvinas)' : super.of(code)
  }
}
vi.stubGlobal('Intl', { ...Intl, DisplayNames: ChromiumNames })
afterAll(() => vi.unstubAllGlobals())

it('names a country row as its country when the browser’s English name for it has an aside', async () => {
  const { setBundleForTests } = await import('@/i18n/runtime')
  const { ensureExonyms } = await import('./exonyms')
  const { displayLabel } = await import('./geocode')
  const { countryName, shownCountryName } = await import('./localPlaces')
  expect(countryName('FK')).toBe('Falkland Islands (Islas Malvinas)')
  const falklands = { label: 'Falkland Islands', countryCode: 'fk' }
  for (const [locale, mod] of [
    ['ru', () => import('@/i18n/ru/exonyms.gen')],
    ['de', () => import('@/i18n/de/exonyms.gen')],
  ] as const) {
    setBundleForTests(locale, { exonyms: { names: (await mod()).default, countries: true } })
    await ensureExonyms()
    expect([locale, displayLabel(falklands)]).toEqual([locale, shownCountryName('FK', locale)])
    expect(displayLabel(falklands)).not.toBe('Falkland Islands')
  }
  setBundleForTests('en', null)
  expect(displayLabel(falklands)).toBe('Falkland Islands')
})

it('writes out the islands Russian CLDR abbreviates, in every country name the page shows', async () => {
  const { shownCountryName } = await import('./localPlaces')
  const codes = ['FK', 'SC', 'MH', 'SB', 'CK', 'IM', 'SH', 'FO', 'VG', 'UM']
  const names = Object.fromEntries(codes.map((cc) => [cc, shownCountryName(cc, 'ru')]))
  expect(names).toMatchObject({
    SC: 'Сейшельские Острова',
    MH: 'Маршалловы Острова',
    SB: 'Соломоновы Острова',
    CK: 'Острова Кука',
    IM: 'Остров Мэн',
    SH: 'Остров Святой Елены',
    FO: 'Фарерские острова',
    VG: 'Виргинские острова (Великобритания)',
    UM: 'Внешние малые острова (США)',
  })
  expect(names.FK).toMatch(/^Фолклендские (\(Мальвинские\) )?острова$/)
  for (let a = 65; a <= 90; a++)
    for (let b = 65; b <= 90; b++) expect(shownCountryName(String.fromCharCode(a, b), 'ru')).not.toMatch(/о-в|Св\./)
  expect(shownCountryName('SC', 'uk')).not.toMatch(/Острова/) // Russian only
})
