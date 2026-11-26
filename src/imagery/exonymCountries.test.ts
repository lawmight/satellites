/**
 * A country found by the name its where line shows (./exonymSearch.ts countriesTyped), in a browser that names it
 * otherwise than Node does: Chromium 157 calls the Palestinian territories Palästina in German, which de.md §6.7
 * rejects, so the page shows the name ./localPlaces.ts pins (Palästinensische Autonomiegebiete). A file of its own: the
 * names are built once a language, so the browser's are stubbed before any is read. The real list and tables.
 */
import { afterAll, describe, expect, it, vi } from 'vitest'
import { setBundleForTests } from '@/i18n/runtime'
import deExonyms from '@/i18n/de/exonyms'
import ruExonyms from '@/i18n/ru/exonyms'
import hiExonyms from '@/i18n/hi/exonyms'
import deNames from '@/i18n/de/exonyms.gen'
import ruNames from '@/i18n/ru/exonyms.gen'
import hiNames from '@/i18n/hi/exonyms.gen'
import { displayLabel, searchPlaces } from './geocode'
import { ensureExonyms } from './exonyms'

const FILES = import.meta.glob<string>('/public/places/**/*.txt', { query: '?raw', import: 'default' })

/** Chromium 157's names where they differ from Node's, for the cases below. */
const NODE = Intl.DisplayNames
class Chromium157 extends NODE {
  of(code: string): string | undefined {
    const { locale } = this.resolvedOptions()
    if (code === 'PS' && locale.startsWith('de')) return 'Palästina'
    return super.of(code)
  }
}
Object.defineProperty(Intl, 'DisplayNames', { value: Chromium157, configurable: true, writable: true })
afterAll(() => Object.defineProperty(Intl, 'DisplayNames', { value: NODE, configurable: true, writable: true }))

describe('a country by the name its where line shows', () => {
  it('finds it offline and first, pinned, short and without its aside, and names it so', async () => {
    const network: string[] = []
    vi.stubGlobal('fetch', async (input: string) => {
      const url = String(input)
      if (url.startsWith('/places/')) {
        const file = FILES[`/public${url}`]
        return file ? new Response(await file()) : new Response('', { status: 404 })
      }
      network.push(url)
      return Response.json({ results: [], features: [] })
    })
    const first = async (q: string) => (await searchPlaces(q))[0]
    const as = async (locale: 'de' | 'ru' | 'hi', ns: typeof deExonyms, names: string) => {
      setBundleForTests(locale, { exonyms: { ...ns, names, load: undefined } })
      await ensureExonyms()
    }
    await as('de', deExonyms, deNames)
    const palestine = await first('Palästinensische Autonomiegebiete')
    expect(palestine).toMatchObject({ label: 'Palestinian Territory', countryCode: 'ps' })
    expect(displayLabel(palestine)).toBe('Palästinensische Autonomiegebiete')
    expect(await first('USA')).toMatchObject({ label: 'United States', countryCode: 'us' })
    await as('hi', hiExonyms, hiNames)
    expect(await first('अमेरिका')).toMatchObject({ label: 'United States', countryCode: 'us' })
    await as('ru', ruExonyms, ruNames)
    const myanmar = await first('Мьянма')
    expect([myanmar.label, myanmar.countryCode, displayLabel(myanmar)]).toEqual(['Myanmar', 'mm', 'Мьянма (Бирма)'])
    expect(network).toEqual([])
    vi.unstubAllGlobals()
    setBundleForTests('en', null)
  })
})
