/**
 * Place names as the visitor reads them: München for a German, Monaco di Baviera for an Italian, Київ for a Ukrainian,
 * Москва for a Russian, Hà Nội for a Vietnamese, تهران for a Persian reader, नई दिल्ली for a Hindi one, 동해 for a
 * Korean, where the place data says Munich, Kyiv, Moscow or Sea of Japan. Display only (geocode.ts displayLabel and
 * displaySublabel, ui/results/placeName.ts): a Place keeps its English label and sublabel, which the usage stats,
 * record_lookup, links and shares carry, so one town is one row in every language. And search: a query typed the way
 * the visitor's language writes a place (Москва, Ha Noi, Mailand) finds that place in the offline list
 * (./exonymSearch.ts, read by geocode.ts searchPlaces through exonymAlternates).
 *
 * The names come from the active language's 'exonyms' namespace (src/i18n/en/exonyms.ts gives its format), so each
 * language's table ships with that language only; English has none, and an English page shows every name as it came and
 * downloads nothing for it. A small table is in the language's chunk; a large one (Cyrillic, Persian and Hindi write
 * every name) is a chunk of its own, fetched at idle once the landing is up (prefetchExonyms) and awaited by everything
 * that shows a place name first (ensureExonyms): a search, a pin, a report, a language switch. The search through a
 * table is a chunk of its own too (./exonymSearch.ts), loaded with it, so English carries none of it. A name must never
 * change after it is shown (owner rule), so a table that arrives after a name was shown without it is not applied in
 * that page: the page keeps the names it showed.
 *
 * Why by country and by kind: the same English name is many places (London, Ontario is never Londra; Kyiv the city is
 * Київ, Kyiv the oblast's sublabel is Київська область), so a name is looked up in the place's own country, and as what
 * the place is: a town's label among towns only (never its oblast's name: Kherson the city is not Oblast Cherson), a
 * region's among regions only (Chelyabinsk Oblast is not the city), a part of the where line among regions first
 * (Bavaria), then towns (a city in a geocoder's where line). A landmark or a natural feature takes the names written
 * for landmarks (`^`: the White House is Nhà Trắng, White House, Tennessee is not), then a town's. A place with no
 * country (a sea) is looked up among the countryless names (a sea the data files under a country is written under it
 * too: the English Channel under GB); a place opened from a link takes its country from the offline list at its point
 * (./linkCountry.ts), so a link to London, Ontario shows London.
 */
import enExonyms from '@/i18n/en/exonyms'
import { quietImport, SEARCH_CHUNK } from '@/i18n/optionalChunks'
import { msgs } from '@/i18n/runtime'
import { placeKey } from './placeKey'
import type { Alternate, ExonymSearch } from './exonymSearch'

export interface ExonymTable {
  /** `<CC>|<placeKey of the English name>` → the name shown, for towns (and anything not a region) */
  towns: Map<string, string>
  /** The same, for first-level regions */
  regions: Map<string, string>
  /** The same, for landmarks and natural features only (`^`: a town shares the English name) */
  features: Map<string, string>
  /** A region's own label where it differs from its name in a where line (`#`: استان قم for the province, قم in a line) */
  labels: Map<string, string>
}

/**
 * What a place is, for the lookup of its name: a town's label, a region's, a landmark's or feature's, a where line's
 * last part (its region), or a part another follows (`locality`: a geocoder's city, as in "Odesa, Odesa Oblast").
 */
export type NameAs = 'label' | 'region' | 'feature' | 'where' | 'locality'

/** The table's display half (src/i18n/en/exonyms.ts): a search-only entry (`~`) is left to ./exonymSearch.ts. */
export function parseExonyms(src: string): ExonymTable {
  const towns = new Map<string, string>()
  const regions = new Map<string, string>()
  const features = new Map<string, string>()
  const labels = new Map<string, string>()
  const kinds: Record<string, Map<string, string>> = { '*': regions, '^': features, '#': labels }
  for (const group of src.split('|')) {
    const at = group.indexOf(':')
    if (at < 0) continue
    const cc = group.slice(0, at).trim().toUpperCase()
    for (const entry of group.slice(at + 1).split(';')) {
      const eq = entry.indexOf('=')
      const mark = kinds[entry[0]] ? entry[0] : ''
      const english = entry.slice(mark.length, eq)
      const shown = entry.slice(eq + 1)
      if (eq < 0 || entry.startsWith('~') || !placeKey(english) || !shown) continue
      ;(kinds[mark] ?? towns).set(`${cc}|${placeKey(english)}`, shown)
    }
  }
  return { towns, regions, features, labels }
}

let parsed: { src: string; table: ExonymTable } | undefined
/** Namespaces whose table arrived after a name was shown without it: kept out for the rest of the page. */
const late = new WeakSet<object>()

/** Told whenever the active language's names may have become ready (onExonymsReady). */
const readyListeners = new Set<() => void>()
const tellReady = () => readyListeners.forEach((fn) => fn())
/** Table downloads whose arrival tells them (one hook a download, however many calls wait for it). */
const hooked = new WeakSet<Promise<void>>()

/**
 * Call `fn` whenever the active language's names may have become ready (exonymsReady): its table has arrived, or is
 * kept out as late because a name was shown before it. What waits to name a place until then (the tab's title,
 * src/app/head.ts) names it once, with the name the page shows. Asked of a table ensureExonyms has asked for.
 */
export function onExonymsReady(fn: () => void): void {
  readyListeners.add(fn)
}

/** The active language's table source, or '' for one that has none (English) or whose table is not in yet. */
function activeSource(shown: boolean): string {
  const m = msgs(enExonyms)
  if (late.has(m)) return ''
  // A name shown now, before the language's own chunk of names is in: this page keeps showing it as it came.
  if (!m.names && shown && m.load) {
    late.add(m)
    queueMicrotask(tellReady) // not while the name is still being rendered
    if (import.meta.env.DEV) console.warn('A place name was shown before its language’s names loaded; they stay as they came on this page.')
  }
  return m.names
}

function activeTable(shown: boolean): ExonymTable | undefined {
  const src = activeSource(shown)
  if (!src) return undefined
  if (parsed?.src !== src) parsed = { src, table: parseExonyms(src) }
  return parsed.table
}

/** Has the active language a table at all (in or still to load)? English has none. */
export function exonymsActive(): boolean {
  const m = msgs(enExonyms)
  return !!m.names || !!m.load
}

/** Is the active language's table in (or has it none to load)? Synchronous: what a caller checks before awaiting. */
export function exonymsReady(): boolean {
  const m = msgs(enExonyms)
  return !m.load || !!m.names || late.has(m)
}

let search: ExonymSearch | undefined
let searchLoad: Promise<void> | undefined

/**
 * How long anything that shows a place name waits for the table and its search, at most: a request that stalls (a
 * mobile network that never answers) must not hold a search or a report for ever. Past it, the names are shown as
 * they came, and the table, when it does arrive, is kept out of the page (`late`), so nothing changes once shown; and
 * nothing waits for that download again (`overdue`).
 */
export const EXONYM_WAIT_MS = 3_000

/**
 * Downloads a held wait has run out on (a table or a search still pending EXONYM_WAIT_MS after a search, a pin or a
 * report began waiting for it): no later call waits for them again, or a stalled search chunk would hold every search
 * and every pin 3 s; one that arrives is used all the same. A prefetch's time never counts (prefetchExonyms): a table
 * asked for at idle and still on its way when the first search comes is a moment away, and worth that search's wait
 * (without it, a Cyrillic query misses the offline list and the page keeps the names as they came). A download asked
 * again after a failure is a new one, and is waited for.
 */
const overdue = new WeakSet<Promise<void>>()

/**
 * Load the active language's table if it is a chunk of its own, and the search through it, for something about to
 * show a place name: a search, a pin, a report (idempotent, shared by every caller; nothing in English). Never rejects,
 * and resolves within EXONYM_WAIT_MS: a failed load leaves the names as they came, and the next call tries again,
 * until a name has been shown. Neither download's failure reloads the page, Safari's included
 * (src/i18n/optionalChunks.ts: the table's `load` is quiet itself, so a language switch's is too).
 */
export const ensureExonyms = (): Promise<void> => loadNames(true)

/**
 * ensureExonyms for what nobody is held up by: the landing at idle, the boot beside a link's engine, the tab's title
 * (which follows onExonymsReady). The same downloads and the same bound on resolving, but a prefetch that runs out
 * marks nothing overdue: the first search, pin or report still waits for them, once.
 */
export const prefetchExonyms = (): Promise<void> => loadNames(false)

async function loadNames(held: boolean): Promise<void> {
  const m = msgs(enExonyms)
  if (!m.names && !m.load) return
  searchLoad ??= quietImport(SEARCH_CHUNK, () => import('./exonymSearch')).then(
    (x) => void (search = x),
    () => void (searchLoad = undefined),
  )
  const table = exonymsReady() ? undefined : m.load?.()
  if (table && !hooked.has(table)) {
    hooked.add(table)
    void table.then(tellReady, () => undefined)
  }
  const pending = (p: Promise<void> | undefined): p is Promise<void> => !!p && !overdue.has(p)
  const downloads = [table, searchLoad].filter(pending)
  if (!downloads.length) return
  const both = Promise.all(downloads).catch(() => {
    /* offline or a stale build: names as they came */
  })
  let timer: ReturnType<typeof setTimeout> | undefined
  const ranOut = new Promise<boolean>((done) => (timer = setTimeout(() => done(true), EXONYM_WAIT_MS)))
  if ((await Promise.race([both.then(() => false), ranOut])) && held) for (const p of downloads) overdue.add(p)
  clearTimeout(timer)
}

/**
 * `name` as the visitor's language names that place in country `cc` (ISO, any case; undefined: no country), or `name`
 * itself. `as` says what the name is (NameAs): a town's own name ('label': towns only), a first-level region's
 * ('region': regions only, its own label first: استان قم), a landmark's or a natural feature's ('feature': landmarks,
 * then towns), a where line's last part ('where': regions first, then towns: Photon's state, the offline list's
 * region), or a part another follows ('locality': towns first, then regions: Photon's city, Odesa in "Odesa, Odesa
 * Oblast", is the city). Read at call time.
 */
export function exonym(name: string, cc: string | undefined, as: NameAs): string {
  const t = activeTable(true)
  if (!t) return name
  const key = placeKey(name)
  const here = `${(cc ?? '').toUpperCase()}|${key}`
  if (as === 'label') return t.towns.get(here) ?? name
  if (as === 'region') return t.labels.get(here) ?? t.regions.get(here) ?? name
  if (as === 'where') return t.regions.get(here) ?? t.towns.get(here) ?? name
  if (as === 'locality') return t.towns.get(here) ?? t.regions.get(here) ?? name
  return t.features.get(here) ?? t.towns.get(here) ?? name
}

/** The active language's own countries (its namespace's `home`): a name they share with a place abroad is theirs first. */
export const exonymHome = (): readonly string[] => (activeSource(false) ? (msgs(enExonyms).home ?? []) : [])

/**
 * The query as the active language also types it, for the offline search: German's ae, oe, ue read as ä, ö, ü
 * (Muenster finds Münster, Luebeck Lübeck: towns the table has no entry for, since their name is the data's). [] in a
 * language that types no such spelling, and for a query without one.
 */
export function exonymVariants(query: string): string[] {
  if (!msgs(enExonyms).umlauts) return []
  const plain = query.replace(/([aou])e/gi, '$1')
  return plain === query ? [] : [plain]
}

/**
 * Is (lat, lon) in an area the active language's readers hold to be their own, for a place the data files under country
 * `cc` that is not one of the language's (its namespace's `contested`)? Its where line is then not shown.
 */
export function exonymContested(lat: number, lon: number, cc: string): boolean {
  const m = msgs(enExonyms)
  if (!m.contested || m.home?.includes(cc.toUpperCase())) return false
  return m.contested.some(([s, w, n, e]) => lat >= s && lat <= n && lon >= w && lon <= e)
}

/**
 * `name` with the data's typewriter apostrophe as the active language writes it (`apostrophes`: Italian's ’, it.md §0:
 * L’Aquila, Reggio nell’Emilia, for the thousands of names the table does not rewrite), or as it is.
 */
export const exonymApostrophes = (name: string): string => (msgs(enExonyms).apostrophes ? name.replace(/'/g, '’') : name)

/** Does the active language leave a where line's Latin parts out under a label in its own script (`ownScript`)? */
export const exonymsOwnScript = (): boolean => !!msgs(enExonyms).ownScript

/** Does the active language name countries by the browser's names on their own label too (its namespace says so)? */
export const namesCountries = (): boolean => !!msgs(enExonyms).countries && !!activeTable(true)

/** English country names as the offline list writes them, where the browser's differ only in form (& for and). */
export const englishCountryKey = (english: string) => placeKey(english.replace(/&/g, 'and').replace(/^St\. /, 'Saint '))

/**
 * The places a query typed in the visitor's language stands for (./exonymSearch.ts), once ensureExonyms has loaded
 * the search: [] in English, or before.
 */
export function exonymAlternates(query: string, countryName: (cc: string) => string): Alternate[] {
  const src = activeSource(false)
  if (!src || !search) return []
  const m = msgs(enExonyms)
  const countries = m.countries ? [...search.countriesTyped(), ...search.countryAliasesTyped(m.countryAliases)] : []
  return search.exonymSearch(src, query, (cc) => englishCountryKey(countryName(cc)), countries, m.home ?? [])
}
