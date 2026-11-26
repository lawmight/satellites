/**
 * The tab title as a place page boots and opens its report (installHeadSync, against a stand-in document): the first
 * place name the tab shows is the one it keeps, in every language. Each test loads the modules afresh, as a page does.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Bundle } from '@/i18n/runtime'

/** The place pages' own data, as dist/place/<slug>.html carries it. */
const GIZA = { path: '/place/pyramids-of-giza', label: 'Pyramids of Giza', lat: 29.9792, lon: 31.1342, cc: 'eg' }
const MOSCOW = { path: '/place/moscow', label: 'Moscow', sublabel: 'Russia', lat: 55.752, lon: 37.618, cc: 'ru' }

/** The Russian chunk with its table still on its way: `arrive` brings it in. */
async function russianWaiting() {
  let arrive: (() => void) | undefined
  const ru = (await import('@/i18n/ru/index')).default
  const table = new Promise<void>((done) => (arrive = () => ((exonyms.names = 'RU:Moscow=Москва'), done())))
  const exonyms = { ...ru.exonyms, names: '', load: () => table }
  return { bundle: { ...ru, exonyms }, arrive: () => arrive?.() }
}

/** A place page's document: its static title, its place, and every title the app writes after. */
function pageDocument(page: object, title: string) {
  const titles: string[] = []
  const doc = {
    get title() {
      return title
    },
    set title(t: string) {
      title = t
      titles.push(t)
    },
    querySelector: () => null,
    getElementById: (id: string) => (id === 'place-page' ? { textContent: JSON.stringify(page) } : null),
    documentElement: { getAttribute: () => null },
  }
  return { doc, titles }
}

/** Boot a place page in `locale` (with `bundle`): the head as the controller installs it, and the store. */
async function bootPage(page: { path: string }, locale: 'fr' | 'ru' | 'de', bundle: () => Promise<Bundle>) {
  vi.resetModules()
  const { doc, titles } = pageDocument(page, 'static')
  vi.stubGlobal('document', doc)
  vi.stubGlobal('location', { pathname: page.path, search: '' })
  const runtime = await import('@/i18n/runtime')
  runtime.setBundleForTests(locale, await bundle())
  const { installHeadSync } = await import('./head')
  const { useApp } = await import('@/state/store')
  const { readUrlTarget, linkPlaceIn } = await import('./links')
  const { bootPlace } = await import('@/lib/placePage')
  const enPlaces = (await import('@/i18n/en/places')).default
  const { displayLabel } = await import('@/imagery')
  installHeadSync()
  /** What the controller does once boot ends: the report's place on screen, computing. */
  const openReport = () => {
    const target = readUrlTarget('', Date.now(), bootPlace())
    if (target?.kind !== 'q') throw new Error('no place page target')
    useApp.getState().setPlace(linkPlaceIn(target.place, runtime.msgs(enPlaces)))
    useApp.getState().setPhase('computing')
  }
  /** The results naming the place on screen (ui/results/placeName.ts), then what follows in the same task. */
  const shownByPage = async () => {
    const place = useApp.getState().place
    if (place) displayLabel(place)
    await new Promise((r) => setTimeout(r, 0))
  }
  return { titles, openReport, shownByPage, runtime }
}

describe('the tab title of a place page', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('names a curated place in the page’s language from the first frame, as its report will', async () => {
    const { titles, openReport } = await bootPage(GIZA, 'fr', async () => (await import('@/i18n/fr/index')).default)
    openReport()
    expect(titles).toEqual(['Pyramides de Gizeh · Watched'])
  })

  it('names a place in a language with a table only once the table is in: Москва, never Moscow first', async () => {
    const ru = await russianWaiting()
    const { titles, openReport } = await bootPage(MOSCOW, 'ru', async () => ru.bundle)
    expect(titles).toEqual([]) // the static page's title stays while the table is on its way
    ru.arrive()
    await new Promise((r) => setTimeout(r, 0))
    openReport()
    expect(titles).toEqual(['Москва · Watched'])
  })

  it('names it by its label, once and for good, when the table is kept out (a name was shown without it)', async () => {
    const ru = await russianWaiting()
    const { titles, openReport, shownByPage } = await bootPage(MOSCOW, 'ru', async () => ru.bundle)
    openReport()
    expect(titles).toEqual([])
    await shownByPage() // the report shows Moscow as it came: the table is late now
    ru.arrive()
    await new Promise((r) => setTimeout(r, 0))
    expect(titles).toEqual(['Moscow · Watched'])
  })

  it('names a curated place at once in a language with a table, its table on its way or never coming', async () => {
    const ru = await russianWaiting()
    const { titles, openReport } = await bootPage(GIZA, 'ru', async () => ru.bundle)
    openReport()
    expect(titles).toEqual(['Пирамиды Гизы · Watched']) // the 'places' copy names it: no table to wait for
  })

  it('renames a curated place in the tab as the results do when the language changes', async () => {
    const fr = async () => (await import('@/i18n/fr/index')).default
    const { titles, openReport, runtime } = await bootPage(GIZA, 'fr', fr)
    openReport()
    runtime.setBundleForTests('de', (await import('@/i18n/de/index')).default)
    expect(titles).toEqual(['Pyramides de Gizeh · Watched', 'Pyramiden von Gizeh · Watched'])
  })

  it('names a curated place in English by its English name after a switch to English', async () => {
    const fr = async () => (await import('@/i18n/fr/index')).default
    const { titles, openReport, runtime } = await bootPage(GIZA, 'fr', fr)
    openReport()
    runtime.setBundleForTests('en', null)
    expect(titles).toEqual([
      'Pyramides de Gizeh · Watched',
      'Pyramids of Giza: this week’s satellite images and passes · Watched',
    ])
  })
})
