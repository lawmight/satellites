/**
 * Places: forward search and reverse lookup (Photon / OpenStreetMap), browser geolocation, and
 * time zones (offline, @photostructure/tz-lookup).
 *
 * Most names never need the network: the offline place list (./localPlaces.ts: towns, states, countries and the
 * landmarks people search for) names a pin near a town, and answers a typed search that it has at least
 * ENOUGH_LOCAL matches for. That keeps them fast (Photon's public server stalled for 45 s on 2026-11-12) and keeps
 * the free geocoders' quotas for what only they know.
 *
 * Typed searches the list can't answer go to Open-Meteo's place search first (GeoNames, made for type-ahead; free
 * up to ~10,000 requests a day), and to Photon too if Open-Meteo is slow or has nothing, since only Photon knows
 * streets and points of interest. Open-Meteo matches old and alternate names ("waterloo" → Austin, Texas, once
 * called Waterloo), so only results whose own name matches the query are kept, and an empty answer counts as none.
 *
 * Reverse lookups the list can't answer (open sea, wilderness) are hedged: if Photon has not answered within
 * REVERSE_HEDGE_MS, Nominatim (the same OSM data) is asked too, and the first answer wins. Nominatim's usage policy
 * allows about one request a second and no autocomplete, so it is never used for search-as-you-type, is asked only
 * when Photon is slow, and its requests are spaced NOMINATIM_GAP_MS apart.
 *
 * Labels are built for a two-line display: `label` is the thing itself ("Waterloo"),
 * `sublabel` is where it is ("Ontario, Canada"), with no part repeated. Both are data, in English whatever the
 * visitor's language (the geocoders are asked in English, the offline list is English): the usage stats and the
 * lookups count them, so one town is one row in every language. Only on screen does the sublabel's country follow the
 * visitor's language (`displaySublabel`). A geocoder that names Russia for a point in Crimea is read, when its answer
 * is parsed, as naming Ukraine (CRIMEA below), as the offline list (GeoNames) names it.
 */
import { haversineKm } from '@/lib/geo'
import type { LatLon, Place } from '@/types'
import enGeo from '@/i18n/en/geo'
import { currentLocale, msgs } from '@/i18n/runtime'
import { NOMINATIM, OPEN_METEO_GEOCODE, PHOTON } from './endpoints'
import { LOCALE_INFO } from '../../api/_lib/i18n/locales'
import {
  englishCountryKey,
  ensureExonyms,
  exonymApostrophes,
  exonym,
  exonymAlternates,
  exonymContested,
  exonymHome,
  exonymsActive,
  exonymsOwnScript,
  exonymVariants,
  namesCountries,
} from './exonyms'
import {
  countryCodeOf,
  countryName,
  isListCountry,
  nearestLocal,
  prefetchLocal,
  searchLocal,
  shownCountryName,
  type LocalPlace,
} from './localPlaces'
import { Lru } from './lru'
import { placeKey } from './placeKey'
import { fetchJson, hedge, HttpError, isAbortError, sleep, throwIfAborted } from './net'

// ── Photon wire types ──────────────────────────────────────────────────────────────────────

export interface PhotonProperties {
  name?: string
  housenumber?: string
  street?: string
  locality?: string
  district?: string
  city?: string
  county?: string
  state?: string
  country?: string
  countrycode?: string
  postcode?: string
  osm_key?: string
  osm_value?: string
  type?: string
  /** Bounding box of areas: [minLon, maxLat, maxLon, minLat] */
  extent?: [number, number, number, number]
}

export interface PhotonFeature {
  type?: 'Feature'
  geometry: { type: 'Point'; coordinates: [number, number] }
  properties: PhotonProperties
}

export interface PhotonResponse {
  features: PhotonFeature[]
}

// ── Label building (pure) ──────────────────────────────────────────────────────────────────

/** Case- and accent-insensitive key: "Tōkyō" and "tokyo" compare equal. */
export function textKey(s: string): string {
  return s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/** Join non-empty parts with ", ", dropping repeats and anything equal to `exclude`. */
export function joinUnique(parts: (string | undefined)[], exclude: (string | undefined)[] = []): string | undefined {
  const seen = new Set(exclude.filter((x): x is string => !!x).map(textKey))
  const out: string[] = []
  for (const p of parts) {
    const t = p?.trim()
    if (!t) continue
    const k = textKey(t)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(t)
  }
  return out.length ? out.join(', ') : undefined
}

/**
 * A place's name as shown to the visitor: the name the visitor's language gives that town, region or feature in that
 * country (./exonyms.ts: München, Київ; a region as a region, `kind`), else, for a country in a language whose table
 * says so, the browser's name for it (Германия for Germany, as the where line names it; a country is known by the
 * browser's English names or by the offline list's own, Palestinian Territory: isListCountry), else its label as it
 * came, in the language's apostrophe (Italian: L’Aquila, exonymApostrophes). In English, the label itself. Read at call
 * time, as displaySublabel is; the Place keeps its English label, which is what the usage stats and lookups send.
 */
export function displayLabel(place: Pick<Place, 'label' | 'countryCode' | 'kind'>): string {
  const bank = place.kind === 'region' ? westBank(place.label, place.countryCode) : undefined
  if (bank) return bank
  const shown = exonym(place.label, place.countryCode, place.kind ?? 'label')
  const cc = place.countryCode
  if (shown !== place.label || !cc || !namesCountries()) return exonymApostrophes(shown)
  if (!namesCountry(place.label, cc)) return exonymApostrophes(shown)
  const local = shownCountryName(cc, currentLocale())
  return local.toUpperCase() === cc.toUpperCase() ? exonymApostrophes(shown) : local
}

/**
 * Does `name` name country `cc`, as the browser does in English, with or without its aside in brackets (Chromium's
 * Falkland Islands (Islas Malvinas), where the list says Falkland Islands), or as the offline list (Palestinian
 * Territory)?
 */
function namesCountry(name: string, cc: string): boolean {
  const key = placeKey(name)
  const [long, short] = [countryName(cc), shownCountryName(cc, 'en')]
  const bare = (n: string) => n.replace(/\s*\([^)]*\)/g, '')
  const english = [englishCountryKey(long), englishCountryKey(bare(long)), placeKey(short), placeKey(bare(short))]
  return english.includes(key) || isListCountry(name, cc)
}

/**
 * Israel's region for the West Bank in the place data (GeoNames' and OpenStreetMap's "Judea and Samaria Area", under
 * which they file the settlements): in a language that names the West Bank (PS's region), that name, and a where line
 * that ends with it has no country after it (Ariel · Westjordanland). The guides decide neutral naming there (de.md and
 * it.md §8: Westjordanland, Cisgiordania; never Giudea e Samaria), and "Westjordanland, Israel" would put the West
 * Bank in Israel. Undefined for any other name, and in a language without a name for the West Bank (as it came).
 */
function westBank(name: string, cc: string | undefined): string | undefined {
  if (cc?.toUpperCase() !== 'IL' || placeKey(name) !== 'judea and samaria area') return undefined
  const bank = exonym('West Bank', 'PS', 'region')
  return bank === 'West Bank' ? undefined : bank
}

/**
 * A place's sublabel as shown to the visitor. When the sublabel ends with the English name of the place's own country
 * (as the offline list and the geocoders, asked in English, write it: CLDR's long name, or the short one SHORT_NAMES
 * shows), that country is named as the visitor reads it (shownCountryName: the browser's own names, a few by their
 * short name) and joined to the rest by the 'geo' namespace's `where`. The rest stays as it came, one piece of data in
 * its own order and punctuation, except that each of its names the visitor's language names otherwise in that country
 * is shown so (./exonyms.ts: "Bavaria" → Bayern). In English that is the sublabel itself, except Hong Kong and Macao by
 * their short names. Any other sublabel (no country code, a geocoder's own spelling of the country, a curated place's
 * copy already in the visitor's language) is shown as it came.
 *
 * In another language, three more things. A landmark's where line, written by hand in English, that names two countries
 * (the place's and another: "France and Italy") or two regions the language names ("Nevada and Arizona, United States")
 * lists them in the language (Intl.ListFormat: Francia e Italia, Невада и Аризона). Under a label the language writes
 * in its own script (Лондон, لندن, लंदन: its namespace's `ownScript`), a part it has no name for is left out rather
 * than shown in Latin letters beside it (Лондон · Велика Британія, not Лондон · England, Велика Британія), as English
 * leaves out a geocoder's non-Latin parts (sublabelOf); Korean's where line stays the data's. And a place in an area
 * the language's readers hold to be their own, filed by the data under another country (the Paracels and Spratlys, in
 * Vietnamese: ./exonyms.ts exonymContested), shows no where line at all.
 *
 * Read at call time: React callers subscribe to the language (useLocale()) so a switch re-renders it. The Place keeps
 * its English sublabel, which is what the usage stats and lookups send.
 */
export function displaySublabel(
  place: Pick<Place, 'sublabel' | 'countryCode'> & Partial<Pick<Place, 'label' | 'kind' | 'lat' | 'lon'>>,
): string | undefined {
  const sub = place.sublabel
  const cc = place.countryCode
  if (!sub || !cc) return sub
  const locale = currentLocale()
  const { lat, lon } = place
  if (locale !== 'en' && lat !== undefined && lon !== undefined && exonymContested(lat, lon, cc)) return undefined
  const long = countryName(cc)
  const short = shownCountryName(cc, 'en')
  let country = [long, short].find((c) => sub === c || sub.endsWith(`, ${c}`))
  let shown: string | undefined
  // The country whose names the parts take: the place's, or for a landmark or feature, the one its line ends with (Rome,
  // Italy for the Vatican: Roma, Italia).
  let partsIn = cc
  if (country === undefined && locale !== 'en') {
    // A landmark's where line, written by hand, may name two countries, the place's one of them, or another country.
    const at = sub.lastIndexOf(', ')
    const last = at < 0 ? sub : sub.slice(at + 2)
    const pair = last.split(' and ').map(countryCodeOf)
    if (pair.length === 2 && pair[0] && pair[1] && pair.includes(cc.toUpperCase())) {
      country = last
      shown = inList(pair.map((c) => shownCountryName(c!, locale)), locale)
    } else if (pair.length === 1 && pair[0] && place.kind === 'feature') {
      country = last
      shown = shownCountryName(pair[0], locale)
      partsIn = pair[0]
    }
  }
  if (country === undefined) {
    // A landmark's line with no country in it ("Jerusalem", "Chagos Archipelago"): named in the language if every part is.
    if (locale === 'en' || place.kind !== 'feature') return sub
    const all = sub.split(', ')
    const named = all.map((part) => exonym(part, cc, 'where'))
    if (named.every((n, i) => n !== all[i])) return exonymApostrophes(named.join(msgs(enGeo).parts ?? ', '))
    // Under a label in the language's own script, a line left in Latin letters is left out (Диего-Гарсия, not
    // Диего-Гарсия · Chagos Archipelago), as a where line's Latin parts are.
    const label = place.label && displayLabel({ label: place.label, countryCode: cc, kind: place.kind })
    return exonymsOwnScript() && !!label && !LATIN.test(label) && LATIN.test(sub) ? undefined : sub
  }
  const rest = sub === country ? undefined : sub.slice(0, -(country.length + 2))
  if (locale !== 'en' && cc.toUpperCase() === 'IL') {
    // The West Bank as the language names it, with no country after it (westBank).
    if (place.label && place.kind === 'region' && westBank(place.label, cc) && rest === undefined) return undefined
    const at = rest?.lastIndexOf(', ') ?? -1
    const bank = rest === undefined ? undefined : westBank(rest.slice(at + 1).trim(), cc)
    if (bank) return at < 0 ? bank : msgs(enGeo).where(rest!.slice(0, at), bank)
  }
  shown ??= shownCountryName(cc, locale)
  // Under a label in the language's own script, a part left in Latin letters is left out (Ukrainian, Russian, Persian,
  // Hindi: exonymsOwnScript).
  const label = place.label && displayLabel({ label: place.label, countryCode: cc, kind: place.kind })
  const script = locale !== 'en' && exonymsOwnScript() && !!label && !LATIN.test(label)
  const parts = rest
    ?.split(', ')
    // "Washington, D.C." is one name, not Washington (the state) and D.C.
    .reduce<string[]>(
      (all, part) => (part === 'D.C.' && all.length ? [...all.slice(0, -1), `${all.at(-1)}, ${part}`] : [...all, part]),
      [],
    )
    // The last part is a region (the offline list's, Photon's state); one another follows is a city (Photon's: Odesa
    // in "Odesa, Odesa Oblast" is the city, not its oblast).
    .map((part, i, all) => {
      const as = i < all.length - 1 ? 'locality' : 'where'
      const whole = exonym(part, partsIn, as)
      if (whole !== part || locale === 'en') return whole
      // Two regions in one part (Nevada and Arizona), each with a name in the language: listed in it, and so are two US
      // states a Latin table writes as they are (Arizona e Utah). A region named with "and" (Sistan and Baluchestan) is
      // one name, kept whole.
      const both = part.split(' and ')
      const names = both.map((p) => exonym(p, partsIn, as))
      const states = partsIn.toUpperCase() === 'US' && both.every((p) => /^\p{Lu}/u.test(p))
      return both.length === 2 && (states || names.every((n, i) => n !== both[i])) ? inList(names, locale) : part
    })
    .filter((part) => !script || !LATIN.test(part))
    // Two parts the language names alike say it once.
    .filter((part, i, all) => i === 0 || part !== all[i - 1])
  // As it came, the rest is the geocoder's data; named in the language, it is one list in it (Persian «، »: `parts`).
  const asCame = parts?.join(', ') === rest
  const named = parts?.length ? parts.join(asCame ? ', ' : (msgs(enGeo).parts ?? ', ')) : undefined
  // A browser with no name for it in that language answers with the code: keep the English name rather than "CA".
  return msgs(enGeo).where(named && exonymApostrophes(named), shown.toUpperCase() === cc.toUpperCase() ? short : shown)
}

/** Names as a list in the visitor's language ("Francia e Italia"), or joined by "/" where the browser has no lists. */
function inList(names: string[], locale: string): string {
  try {
    return new Intl.ListFormat(LOCALE_INFO[locale as keyof typeof LOCALE_INFO].intl, { type: 'conjunction' }).format(names)
  } catch {
    return names.join(' / ')
  }
}

/**
 * "43.4723°N 80.5449°W": international notation, the same in every language, Vietnamese included (a place's label is
 * data: it travels in share links and lookups, so it never takes one page's hemisphere letters, fmtLat).
 */
export function coordinateLabel(lat: number, lon: number): string {
  const l = ((((lon + 180) % 360) + 360) % 360) - 180
  return `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(l).toFixed(4)}°${l >= 0 ? 'E' : 'W'}`
}

const finite = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n)

/** True if `s` carries any letter or digit (OSM has POIs named "-", ".", "🗲", a lone zero-width joiner). */
export const hasText = (s: string | undefined): s is string => !!s && /[\p{L}\p{N}]/u.test(s)
const LATIN = /\p{Script=Latin}/u

/**
 * Join the "where" line. With `lang=en`, OSM still hands back local-script names where no English
 * one exists ("Tokyo Dome · Tokyo, 東京都, Japan"); under a Latin-script label those read as noise,
 * so non-Latin parts are dropped, unless nothing would be left.
 */
export function sublabelOf(label: string, parts: (string | undefined)[]): string | undefined {
  let kept = parts
  if (LATIN.test(label)) {
    const latin = parts.filter((p) => !p || LATIN.test(p))
    if (latin.some((p) => p?.trim())) kept = latin
  }
  return joinUnique(kept, [label])
}

// ── Crimea ─────────────────────────────────────────────────────────────────────────────────

/**
 * The Crimean peninsula and Sevastopol, [lon, lat, lon, lat, …]: OpenStreetMap's boundaries of the Autonomous Republic
 * of Crimea and of Sevastopol (relations 72639 and 1574364, Nominatim, 2026-11-19), their territorial sea included,
 * simplified to ~5 km at sea and on the Perekop isthmus and kept as mapped in the Kerch Strait: there the line runs
 * between Kerch and Tuzla Island (Crimea) and the Chushka spit, Port Kavkaz and the Taman peninsula (Russia), ~3 km
 * apart at the ferry. Checked against every GeoNames point of Ukraine and Russia around the peninsula: each Crimean
 * town is inside, each Russian place and each town of Kherson Oblast outside. Its own copy, not seasonRegions.ts's
 * outline, which ships only in the time-lapse's chunk.
 */
const CRIMEA = [
  32.202, 45.397, 32.362, 45.171, 32.831, 45.151, 33.028, 45.007, 33.295, 44.941, 33.091, 44.575, 33.28, 44.344,
  33.697, 44.191, 34.238, 44.232, 34.736, 44.585, 35.177, 44.597, 35.632, 44.849, 35.84, 44.792, 36.415, 44.853,
  36.61, 44.941, 36.568, 45.051, 36.543, 45.134, 36.53, 45.199, 36.594, 45.253, 36.594, 45.282, 36.603, 45.309,
  36.664, 45.36, 36.682, 45.457, 36.668, 45.627, 35.802, 45.645, 35.575, 45.49, 35.233, 45.792, 34.96, 45.757,
  34.629, 45.986, 34.476, 45.944, 34.32, 46.068, 33.647, 46.23, 33.541, 46.012, 32.773, 45.827, 32.322, 45.597,
]

/** Is the point on the Crimean peninsula (or in its waters)? Even–odd rule, after a bounding-box test. */
export function inCrimea(lat: number, lon: number): boolean {
  if (lat < 44.19 || lat > 46.23 || lon < 32.2 || lon > 36.69) return false
  let inside = false
  for (let i = 0, j = CRIMEA.length - 2; i < CRIMEA.length; j = i, i += 2) {
    const [x1, y1, x2, y2] = [CRIMEA[i], CRIMEA[i + 1], CRIMEA[j], CRIMEA[j + 1]]
    if (y1 > lat !== y2 > lat && lon < ((x2 - x1) * (lat - y1)) / (y2 - y1) + x1) inside = !inside
  }
  return inside
}

const namesRussia = (country: string | undefined, code: string | undefined) =>
  code?.toUpperCase() === 'RU' || /^(russia|russian federation)$/i.test(country?.trim() ?? '')

/**
 * A geocoder's country for a point, with Crimea in Ukraine: an answer that names Russia for a point on the peninsula
 * is read as Ukraine (in every language: this is the place's data, as the offline list has it from GeoNames, and what
 * the stats and lookups keep). Anything else is returned as it came.
 */
function crimeaCountry(country: string | undefined, code: string | undefined, lat: number, lon: number): { country?: string; code?: string } | undefined {
  if (!namesRussia(country, code) || !inCrimea(lat, lon)) return undefined
  return { country: 'Ukraine', code: code === undefined ? undefined : code === code.toLowerCase() ? 'ua' : 'UA' }
}

/** Photon's (or Nominatim's) properties for a point, with Crimea in Ukraine (crimeaCountry). */
export function withCrimeaInUkraine(p: PhotonProperties, lat: number, lon: number): PhotonProperties {
  const fixed = crimeaCountry(p.country, p.countrycode, lat, lon)
  return fixed ? { ...p, country: fixed.country, countrycode: fixed.code } : p
}

/** A forward-search feature with Crimea in Ukraine, at the feature's own point. */
function featureWithCrimea(f: PhotonFeature): PhotonFeature {
  const [lon, lat] = f.geometry?.coordinates ?? []
  if (!finite(lat) || !finite(lon) || !f.properties) return f
  const properties = withCrimeaInUkraine(f.properties, lat, lon)
  return properties === f.properties ? f : { ...f, properties }
}

/** A forward-search result → Place. Undefined if the feature has no usable position or a junk name. */
export function photonToPlace(feature: PhotonFeature, source: Place['source'] = 'search'): Place | undefined {
  const f = featureWithCrimea(feature)
  const [lon, lat] = f.geometry?.coordinates ?? []
  if (!finite(lat) || !finite(lon)) return undefined
  const p = f.properties ?? {}
  if (p.name !== undefined && !hasText(p.name)) return undefined
  const address = p.street ? joinUnique([[p.housenumber, p.street].filter(Boolean).join(' ')]) : undefined
  const label = p.name?.trim() || address || p.city || p.district || p.county || p.state || p.country || coordinateLabel(lat, lon)
  return {
    lat,
    lon,
    label,
    sublabel: sublabelOf(label, [p.city, p.state, p.country]),
    countryCode: p.countrycode?.toLowerCase() || undefined,
    source,
    ...(isStreetLevel(p, label === address) ? { streetLevel: true } : {}),
    ...((p.osm_value === 'state' || p.type === 'state') && label === p.name ? { kind: 'region' as const } : {}),
  }
}

/** A street, building or address: usage stats keep only its city (src/lib/telemetry.ts regionLabel). */
function isStreetLevel(p: PhotonProperties, labelIsAddress: boolean): boolean {
  return labelIsAddress || !!p.housenumber || p.osm_key === 'highway' || p.osm_key === 'building' || p.type === 'street' || p.type === 'house'
}

const SETTLEMENT = new Set(['city', 'town', 'village', 'hamlet', 'suburb', 'neighbourhood', 'quarter', 'borough', 'municipality', 'locality', 'island', 'islet'])
const NAMED_LAND = new Set(['natural', 'waterway', 'place', 'mountain_pass'])

/**
 * A reverse-geocoding hit → Place at the *queried* coordinates. The nearest OSM object is often a
 * shop or a tree ("Class of 1995"), which is not what anyone means by "where I am", so prefer the
 * settlement (city / district / locality), then a named natural feature, then the region.
 */
export function photonReverseToPlace(f: PhotonFeature, lat: number, lon: number, source: Place['source'] = 'geolocation'): Place {
  const p = withCrimeaInUkraine(f.properties ?? {}, lat, lon)
  const city = p.city && !/^unorganized\b/i.test(p.city) ? p.city : undefined
  const label =
    (p.osm_key === 'place' && p.osm_value && SETTLEMENT.has(p.osm_value) ? p.name : undefined) ||
    city ||
    p.district ||
    p.locality ||
    (p.osm_key && NAMED_LAND.has(p.osm_key) ? p.name : undefined) ||
    p.county ||
    p.state ||
    p.country ||
    coordinateLabel(lat, lon)
  return {
    lat,
    lon,
    label,
    sublabel: sublabelOf(label, [p.state, p.country]),
    countryCode: p.countrycode?.toLowerCase() || undefined,
    source,
  }
}

/**
 * Drop near-identical results, keeping the first (best-ranked):
 *  - the same name (accent/case-insensitive) within 25 km is the same place to a person (OSM often
 *    has a city node, its boundary relation and its station);
 *  - anything within 1 km of a better result is the same spot for this product (a pass covers
 *    kilometres; "CN Tower", "CN Tower Edge Walk", "CN Tower tickets").
 * `nameOf` gives the name compared: the label, or the name the visitor reads (distinctAsShown).
 */
export function dedupePlaces(places: Place[], withinKm = 25, sameSpotKm = 1, nameOf: (p: Place) => string = (p) => p.label): Place[] {
  return distinctIndexes(places, withinKm, sameSpotKm, nameOf).map((i) => places[i])
}

/** Indexes of the places `dedupePlaces` keeps, in order. */
function distinctIndexes(places: Place[], withinKm = 25, sameSpotKm = 1, nameOf: (p: Place) => string = (p) => p.label): number[] {
  const kept: number[] = []
  const keys = places.map((p) => textKey(nameOf(p)))
  places.forEach((p, i) => {
    const k = keys[i]
    const dup = kept.some((j) => {
      const d = haversineKm(p, places[j])
      return d < sameSpotKm || (d < withinKm && keys[j] === k)
    })
    if (!dup) kept.push(i)
  })
  return kept
}

/** Settlements people mean when they type a name that is also a region's. */
const MAJOR_SETTLEMENT = new Set(['city', 'town', 'village', 'hamlet', 'municipality', 'borough', 'suburb'])
const ADMIN_PLACE = new Set(['country', 'state', 'province', 'region', 'county', 'district', 'territory'])
const isSettlement = (p: PhotonProperties) => p.osm_key === 'place' && !!p.osm_value && MAJOR_SETTLEMENT.has(p.osm_value)
const isAdminArea = (p: PhotonProperties) => p.osm_key === 'boundary' || (p.osm_key === 'place' && !!p.osm_value && ADMIN_PLACE.has(p.osm_value))

function insideExtent(e: PhotonProperties['extent'], pt: LatLon): boolean {
  if (!e || e.length !== 4) return false
  const [minLon, maxLat, maxLon, minLat] = e
  return pt.lat >= minLat && pt.lat <= maxLat && pt.lon >= minLon && pt.lon <= maxLon
}

/** A result plus the raw properties ranking needs. */
export interface Hit {
  place: Place
  props: PhotonProperties
}

/**
 * "São Paulo", "Moscow", "New York", "Cairo": Photon often ranks the region above the city of the
 * same name, and its point is the region's centroid (São Paulo state: 250 km from the city). When
 * a same-named settlement lies inside the region, the settlement takes the region's rank and the
 * region is dropped. Same-named places elsewhere are left alone.
 */
export function preferSettlements(hits: Hit[]): Hit[] {
  const out = [...hits]
  for (let i = 0; i < out.length; i++) {
    const a = out[i]
    if (!isAdminArea(a.props)) continue
    const k = textKey(a.place.label)
    const j = out.findIndex(
      (s) => s !== a && isSettlement(s.props) && textKey(s.place.label) === k && (insideExtent(a.props.extent, s.place) || (!a.props.extent && haversineKm(a.place, s.place) < 50)),
    )
    if (j < 0) continue
    if (j < i) {
      // The settlement already outranks this admin area: drop the duplicate, never demote the city.
      out.splice(i, 1)
      i--
      continue
    }
    // Promote the settlement into the admin area's rank (j > i, so index i is unaffected by the splice).
    const [s] = out.splice(j, 1)
    out[i] = s
  }
  return out
}

/**
 * An OpenStreetMap tag as English words ('bus_stop' → 'Bus stop'). It goes into the sublabel, which is data (English
 * in every language, kept by the stats and lookups); a Place does not carry the tag, so the word cannot be shown in
 * another language until it does (src/i18n/en/geo.ts says so to translators).
 */
const humanise = (v: string) => v.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())

/** Two rows reading exactly alike ("Ushuaia · Argentina" twice) get the county, then the kind. */
function disambiguate(hits: Hit[]): Place[] {
  const seen = new Set<string>()
  const key = (p: Place) => `${textKey(p.label)}|${textKey(p.sublabel ?? '')}`
  return hits.map(({ place, props: p }) => {
    let out = place
    if (seen.has(key(out))) {
      const withCounty = sublabelOf(place.label, [p.county ?? p.district, p.city, p.state, p.country])
      out = { ...place, sublabel: withCounty }
      if (seen.has(key(out)) && p.osm_value) out = { ...place, sublabel: sublabelOf(place.label, [humanise(p.osm_value), p.city, p.state, p.country]) }
    }
    seen.add(key(out))
    return out
  })
}

/** Two numbers with decimal points, apart by a comma, a semicolon or a space. */
const POINT_PAIR = /^([+-]?\d{1,2}(?:\.\d+)?)\s*([NS])?\s*[,;\s]\s*([+-]?\d{1,3}(?:\.\d+)?)\s*([EW])?$/
/**
 * Two numbers that may have decimal commas, apart by a semicolon or a space, or by a comma only after a hemisphere
 * letter (where it cannot be a decimal one).
 */
const COMMA_PAIR = /^([+-]?\d{1,2}(?:[.,]\d+)?)\s*(?:([NS])\s*[,;\s]|[;\s])\s*([+-]?\d{1,3}(?:[.,]\d+)?)\s*([EW])?$/
/**
 * What is typed or pasted for the minutes mark (prime, either curly quote, modifier prime and apostrophe, acute,
 * grave) and for the seconds mark (double prime, either curly double quote, modifier double prime, double acute).
 */
const MINUTE_MARKS = /[\u2032\u2018\u2019\u02b9\u02bc\u00b4`]/g
const SECOND_MARKS = /[\u2033\u201c\u201d\u02ba\u02dd]/g

/**
 * Coordinates typed into the search box: "43.4723, -80.5449", "43.4723 -80.5449",
 * "43.4723°N 80.5449°W", "43.4723N,80.5449W". Null if it isn't a coordinate pair.
 *
 * The minus may be the true minus sign (U+2212, as the search hint prints "43.47, −80.54") or an en dash, which
 * keyboards and word processors put in its place. Most of Europe writes decimal commas ("41,01 28,98", "43,47;
 * −80,54"): those are read only when the two numbers are apart by a space or a semicolon (or by a comma after a
 * hemisphere letter, "41,01N, 28,98E"), so that "41,01" stays latitude 41, longitude 1 as before and "41,01,28,98"
 * stays no pair at all. Hemisphere letters are only N/S/E/W: the other languages' letters clash (O is west in
 * French, Spanish and Italian, east in German).
 * Bidirectional marks are dropped, so coordinates copied out of right-to-left text still read, and full-width digits
 * and punctuation (a Chinese, Japanese or Korean input method's "４３．４７，−８０．５４") read as their ASCII forms
 * (NFKC, after the degree signs go: it would turn "º" into the letter o). So do the digits an Arabic, Persian or Hindi
 * keyboard types ("۴۳٫۴۷، −۸۰٫۵۴", "٤٣٫٤٧"), with the Arabic decimal sign and comma.
 *
 * Whatever those two forms do not read goes to `parseAngles` (below): degrees with minutes and seconds, as Wikipedia
 * and the map apps print a position ("43°28′20″N 80°32′42″W"), and a hemisphere letter before its number
 * ("N 43.4723 W 80.5449"). The marks for minutes and seconds are made one character each first, before NFKC, which
 * would turn a double prime into two primes and an acute accent into a space and a combining mark.
 */
export function parseCoordinates(q: string): LatLon | null {
  const s = q
    .replace(/[\u0660-\u0669\u06f0-\u06f9\u0966-\u096f]/g, (d) => {
      const c = d.codePointAt(0)!
      return String(c - (c >= 0x0966 ? 0x0966 : c >= 0x06f0 ? 0x06f0 : 0x0660))
    })
    .replace(/\u066b/g, '.')
    .replace(/\u060c/g, ',')
    .replace(/[\u061c\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/º/g, '°')
    .replace(MINUTE_MARKS, "'")
    .replace(SECOND_MARKS, '"')
    .normalize('NFKC')
    .trim()
    .toUpperCase()
    .replace(/[\u2212\u2013]/g, '-')
  const plain = s.replace(/°/g, ' ').trim()
  const m = POINT_PAIR.exec(plain) ?? COMMA_PAIR.exec(plain)
  if (!m) {
    // The comma parts the numbers where it can, as above; only then is one between two digits a decimal comma.
    const marked = s.replace(/''/g, '"')
    return parseAngles(marked) ?? parseAngles(marked.replace(/(\d),(?=\d)/g, '$1.'))
  }
  let lat = Number(m[1].replace(',', '.'))
  let lon = Number(m[3].replace(',', '.'))
  if (m[2] === 'S') lat = -Math.abs(lat)
  if (m[4] === 'W') lon = -Math.abs(lon)
  if (!(Math.abs(lat) <= 90 && Math.abs(lon) <= 180)) return null
  return { lat, lon }
}

/** One piece of a typed position: a number, a unit mark, a hemisphere letter, or the comma or semicolon between. */
interface AngleToken {
  kind: 'num' | 'mark' | 'letter' | 'sep'
  text: string
  /** White space came before it */
  gap: boolean
}

const ANGLE_TOKEN = /(\s*)(?:([+-]?\d+(?:\.\d+)?)|([°'"])|([NSEW])|([,;]))/y
/** The mark each part of an angle may carry: degrees, minutes, seconds. */
const ANGLE_MARKS = ['°', "'", '"']

/** `s` as tokens, or null if anything in it is not part of a position (so no address is ever read as one). */
function angleTokens(s: string): AngleToken[] | null {
  const out: AngleToken[] = []
  ANGLE_TOKEN.lastIndex = 0
  while (ANGLE_TOKEN.lastIndex < s.length) {
    const m = ANGLE_TOKEN.exec(s)
    if (!m) return null
    const gap = m[1].length > 0
    if (m[2] !== undefined) out.push({ kind: 'num', text: m[2], gap })
    else if (m[3] !== undefined) out.push({ kind: 'mark', text: m[3], gap })
    else if (m[4] !== undefined) out.push({ kind: 'letter', text: m[4], gap })
    else out.push({ kind: 'sep', text: m[5], gap })
  }
  return out
}

/**
 * One angle from `t[at]` on: an optional hemisphere letter (one of `letters`) before or after, and one to three
 * numbers (degrees, minutes, seconds), each with its own mark or none. Only the last number may have a fraction
 * ("43°28.34'"), and minutes and seconds stay under 60. Null if it is not such an angle, or is over `max` degrees.
 *
 * Where the angle ends when nothing parts it from the next: at a number with a sign or a degree mark (the next
 * angle's degrees), after a number with a fraction, and after the third number.
 */
function readAngle(t: AngleToken[], at: number, letters: string, max: number): { value: number; next: number } | null {
  let i = at
  let hemi: string | undefined
  if (t[i]?.kind === 'letter') {
    if (!letters.includes(t[i].text)) return null
    hemi = t[i++].text
  }
  const led = hemi !== undefined
  const parts: string[] = []
  let marked = false
  while (parts.length < 3 && t[i]?.kind === 'num') {
    const text = t[i].text
    if (parts.length && (/^[+-]/.test(text) || t[i + 1]?.text === '°' || parts[parts.length - 1].includes('.'))) break
    parts.push(text)
    i++
    if (t[i]?.kind === 'mark') {
      if (t[i].text !== ANGLE_MARKS[parts.length - 1]) return null
      marked = true
      i++
    }
  }
  if (!parts.length) return null
  if (!led && t[i]?.kind === 'letter' && letters.includes(t[i].text)) hemi = t[i++].text
  // Bare numbers are minutes and seconds only beside a mark or a hemisphere letter: "43 28" stays latitude, longitude.
  if (parts.length > 1 && !marked && !hemi) return null
  const [deg, min = 0, sec = 0] = parts.map((p) => Math.abs(Number(p)))
  if (min >= 60 || sec >= 60) return null
  const size = deg + min / 60 + sec / 3600
  if (!(size <= max)) return null
  // As in the plain forms above: S and W are the negative side, and a minus sign is one whatever the letter.
  const negative = hemi === 'S' || hemi === 'W' || parts[0].startsWith('-')
  return { value: negative ? -size : size, next: i }
}

/**
 * A latitude and a longitude with minutes and seconds, or with their hemisphere letters first: what the two plain
 * patterns above do not read. `s` is the query as `parseCoordinates` cleaned it.
 *
 *   43°28'20"N 80°32'42"W        43° 28' 20" N, 80° 32' 42" W      43°28.34'N 80°32.7'W
 *   -33°51'54" 151°12'34"        43 28 20 N 80 32 42 W             N 43.4723 W 80.5449
 *   N 43° 28.340 W 080° 32.700   S33°51'54" E151°12'34"
 *
 * Latitude comes first, as everywhere here, and white space, a comma or a semicolon parts the two ("…N80…" is no
 * position, as "43.47N80.54W" is none above). Something must say these are angles: a mark or a letter somewhere,
 * or the plain patterns' answer (none) stands.
 */
function parseAngles(s: string): LatLon | null {
  const t = angleTokens(s)
  if (!t || !t.some((k) => k.kind === 'mark' || k.kind === 'letter')) return null
  const lat = readAngle(t, 0, 'NS', 90)
  if (!lat) return null
  let i = lat.next
  if (t[i]?.kind === 'sep') i++
  else if (!t[i]?.gap) return null
  const lon = readAngle(t, i, 'EW', 180)
  if (!lon || lon.next !== t.length) return null
  return { lat: lat.value, lon: lon.value }
}

// ── Network ────────────────────────────────────────────────────────────────────────────────

const PHOTON_TIMEOUT_MS = 8_000
const searchCache = /* @__PURE__ */ new Lru<string, Place[]>(48)

/** Results returned, and asked of Photon (extra, so merged duplicates and junk don't thin the list). */
const MAX_RESULTS = 6
const PHOTON_LIMIT = 10

/** How long Photon has to answer a typed search before Open-Meteo is asked as well. */
export const SEARCH_HEDGE_MS = 1_200

/** One Open-Meteo search result (the fields used). */
export interface OpenMeteoPlace {
  name?: string
  latitude?: number
  longitude?: number
  country_code?: string
  country?: string
  admin1?: string
  population?: number
  /** GeoNames' feature code: ADM1 for a first-level region */
  feature_code?: string
}

const words = (s: string) => textKey(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean)

/**
 * Open-Meteo results → Places, keeping only those the query actually names: the query's first word starts a word
 * of the place's own name, and every other word starts a word of its name, region or country ("paris, france").
 * Largest first: its own order puts Waterloo, Iowa above Waterloo, Ontario, which has more people.
 */
export function openMeteoToPlaces(results: OpenMeteoPlace[] | undefined, query: string): Place[] {
  const [first, ...rest] = words(query)
  if (!first) return []
  const out: Place[] = []
  const byPopulation = [...(results ?? [])].sort((a, b) => (b.population ?? 0) - (a.population ?? 0))
  for (const r of byPopulation) {
    if (!hasText(r.name) || !finite(r.latitude) || !finite(r.longitude)) continue
    const own = words(r.name)
    const all = [...own, ...words(r.admin1 ?? ''), ...words(r.country ?? '')]
    if (!own.some((w) => w.startsWith(first)) || !rest.every((q) => all.some((w) => w.startsWith(q)))) continue
    const label = r.name.trim()
    const fixed = crimeaCountry(r.country, r.country_code, r.latitude, r.longitude)
    out.push({
      lat: r.latitude,
      lon: r.longitude,
      label,
      sublabel: sublabelOf(label, [r.admin1, fixed?.country ?? r.country]),
      countryCode: (fixed?.code ?? r.country_code)?.toLowerCase() || undefined,
      source: 'search',
      ...(r.feature_code === 'ADM1' ? { kind: 'region' as const } : {}),
    })
  }
  return out
}

async function photonSearch(query: string, signal: AbortSignal): Promise<Place[]> {
  let res: PhotonResponse
  try {
    res = await fetchJson<PhotonResponse>(`${PHOTON}/api/?q=${encodeURIComponent(query)}&limit=${PHOTON_LIMIT}&lang=en`, {
      signal,
      timeoutMs: PHOTON_TIMEOUT_MS,
      retries: 0,
    })
  } catch (err) {
    if (err instanceof HttpError && err.status === 400) return [] // e.g. a query Photon can't parse
    throw err
  }
  const hits = (res.features ?? []).map(featureWithCrimea).flatMap((f): Hit[] => {
    const place = photonToPlace(f)
    return place ? [{ place, props: f.properties ?? {} }] : []
  })
  const ranked = preferSettlements(hits)
  const distinct = distinctIndexes(ranked.map((h) => h.place)).map((i) => ranked[i])
  return disambiguate(distinct).slice(0, MAX_RESULTS)
}

async function openMeteoSearch(query: string, signal: AbortSignal): Promise<Place[]> {
  const res = await fetchJson<{ results?: OpenMeteoPlace[] }>(
    `${OPEN_METEO_GEOCODE}?name=${encodeURIComponent(query)}&count=${PHOTON_LIMIT}&language=en&format=json`,
    { signal, timeoutMs: PHOTON_TIMEOUT_MS, retries: 0 },
  )
  const places = dedupePlaces(openMeteoToPlaces(res.results, query)).slice(0, MAX_RESULTS)
  // Nothing it can name (a landmark, a street): leave the answer to Photon.
  if (!places.length) throw new Error('Open-Meteo has no match')
  return places
}

/**
 * A typed search goes to the network only if the offline list (towns, states, countries, landmarks) has fewer
 * matches than this, and none of them is named exactly what was typed. The matches are places, counted before rows
 * that read alike are shown as one (distinctAsShown): the city of Запоріжжя and its two namesake villages are three,
 * as in English, so the commonest searches stay offline in every language.
 */
export const ENOUGH_LOCAL = 3

const localToPlace = (r: LocalPlace, source: Place['source']): Place => ({
  lat: r.lat,
  lon: r.lon,
  label: r.name,
  sublabel: r.kind === 'l' ? r.where : r.kind === 'c' ? undefined : sublabelOf(r.name, [echoes(r.admin1, r.name) ? undefined : r.admin1, countryName(r.cc)]),
  countryCode: r.cc.toLowerCase() || undefined,
  source,
  ...(r.kind === 'r' ? { kind: 'region' as const } : r.kind === 'f' || r.kind === 'l' ? { kind: 'feature' as const } : {}),
})

/** A state that only repeats the city's name ("Berlin · State of Berlin") says nothing: "Berlin · Germany". */
function echoes(admin1: string, name: string): boolean {
  return ` ${placeKey(admin1)} `.includes(` ${placeKey(name)} `)
}

/**
 * The places of a search as one list: the same rules as dedupePlaces, the names compared as the visitor reads them
 * (a city-state and its state, both Berlino; Huế and the province the table calls Huế, 14 km apart, are one row).
 * In a language with names, rows that read the same, name and where line, in one country are one row too, however far
 * apart: the best-ranked, or the country where a country and a region read alike (Đài Loan); never a country and a
 * town (Джибути, the country and its capital). Places of one name in
 * one region read the same once named in the language (Запоріжжя · Запорізька область, Україна: the city and two
 * villages of that name; Hà Nội · Việt Nam: the capital and a hamlet), and rows nobody can tell apart are noise. A
 * city whose where line repeats its name is not its region's row (Санкт-Петербург · Санкт-Петербург, Россия, beside
 * Санкт-Петербург · Россия). The first `fixed` rows, already on screen, stay as they are. In English, each label as it
 * came.
 */
const distinctAsShown = (places: Place[], fixed = 0): Place[] => oneOfAlike(distinctPlaces(places), fixed)

/** dedupePlaces, the names compared as the visitor reads them: the distinct places, as ENOUGH_LOCAL counts them. */
const distinctPlaces = (places: Place[]) =>
  dedupePlaces(places, undefined, undefined, exonymsActive() ? displayLabel : undefined)

/** Distinct places as rows: in a language with names, one of those in one country that read alike (distinctAsShown). */
function oneOfAlike(places: Place[], fixed = 0): Place[] {
  if (!exonymsActive()) return places
  const kept: Place[] = []
  const reads: (string | undefined)[] = []
  for (const p of places) {
    const read = p.countryCode && `${p.countryCode.toLowerCase()}|${displayLabel(p)}|${displaySublabel(p) ?? ''}`
    // A country and a town are two places someone means, however alike they read (Джибути, the country and its
    // capital): only a country and a region (Đài Loan), or places of one kind, are one row.
    const at = read ? reads.findIndex((r, i) => r === read && !countryAndTown(p, kept[i])) : -1
    if (at < 0) {
      kept.push(p)
      reads.push(read || undefined)
    } else if (at >= fixed && isCountry(p) && !isCountry(kept[at])) kept[at] = p
  }
  return kept
}

/** Is the place a country itself: a row with no where line or kind, named as the browser or the list names it? */
const isCountry = (p: Place) => !p.kind && !p.sublabel && !!p.countryCode && namesCountry(p.label, p.countryCode)

/**
 * Is one of the two a country and the other a town? A town is a row with no kind, and may read as the country itself:
 * a capital named like its country has no where line (Djibouti's would only repeat its name).
 */
const countryAndTown = (a: Place, b: Place) => (isCountry(a) && !b.kind) || (isCountry(b) && !a.kind)

/** `first`, then whatever in `more` is not already there (distinctAsShown's rules), at most MAX_RESULTS. */
const appendNew = (first: Place[], more: Place[]) =>
  distinctAsShown([...first, ...more], first.length).slice(0, MAX_RESULTS)

/**
 * Up to 6 places matching `q`, best first. Coordinates are accepted and reverse-geocoded. Resolves [] for queries under
 * 2 characters or with no letters or digits. Rejects on network failure with nothing found offline (show "search
 * unavailable") and on abort.
 *
 * The offline list answers first (./localPlaces.ts: towns, states, countries and landmarks, in ~50 ms), by the names
 * the visitor's language gives them too (./exonyms.ts: Москва, Hà Nội, Mailand). With at least ENOUGH_LOCAL matches, or
 * one named exactly what was typed, that is the answer, and no geocoder is asked: most searches never leave the site,
 * which keeps them fast and Open-Meteo's free quota for the rest. Otherwise Open-Meteo is asked, and Photon too if
 * Open-Meteo is slow or has nothing (it knows streets and points of interest); `onEarly` gets the offline matches
 * meanwhile, and the promise resolves with them first and the network's new ones after, so a list on screen only grows
 * at the bottom.
 */
export async function searchPlaces(q: string, signal?: AbortSignal, onEarly?: (places: Place[]) => void): Promise<Place[]> {
  throwIfAborted(signal)
  const query = q.trim().replace(/\s+/g, ' ')
  if (query.length < 2 || !hasText(query)) return []
  // The visitor's own names (./exonyms.ts) are part of the answer, and are shown in it: in before either. The files a
  // Latin query reads in any case load meanwhile, so the first search after the landing waits for the longer download,
  // not for both in turn (English has no names to wait for, and reads them as before).
  if (exonymsActive() && !parseCoordinates(query)) prefetchLocal(query)
  await ensureExonyms()
  throwIfAborted(signal)
  const key = `${currentLocale()}|${textKey(query)}`
  const hit = searchCache.get(key)
  if (hit) return hit

  const coords = parseCoordinates(query)
  if (coords) {
    const place = { ...(await reversePlace(coords.lat, coords.lon, signal)), source: 'search' as const }
    return [place]
  }

  let exact = false
  let matches = 0
  const alternates = exonymAlternates(query, countryName)
  // The names the visitor reads each place by: its label, and a region's name in a where line (قم for استان قم).
  const namesOf = exonymsActive()
    ? (r: LocalPlace) => [displayLabel(localToPlace(r, 'search')), ...(r.kind === 'r' ? [exonym(r.name, r.cc, 'where')] : [])]
    : undefined
  // Where the visitor's language holds the land its own (the Spratlys, for Vietnamese): named so, it leads abroad.
  const ownArea = (lat: number, lon: number) => exonymContested(lat, lon, '')
  const [home, variants] = [exonymHome(), exonymVariants(query)]
  const local = await searchLocal(query, signal, undefined, alternates, home, variants, namesOf, ownArea).then(
    (rows) => {
      exact = rows.some((r) => r.exact)
      const places = distinctPlaces(rows.map((r) => localToPlace(r, 'search')))
      matches = places.length
      return oneOfAlike(places)
    },
    (err: unknown) => {
      if (isAbortError(err) || signal?.aborted) throw err
      return [] as Place[]
    },
  )
  if (matches >= ENOUGH_LOCAL || exact) {
    searchCache.set(key, local)
    return local
  }

  const net = hedge(
    (s) => openMeteoSearch(query, s),
    (s) => photonSearch(query, s),
    SEARCH_HEDGE_MS,
    signal,
  )
  if (!local.length) {
    const found = exonymsActive() ? distinctAsShown(await net) : await net
    searchCache.set(key, found)
    return found
  }
  onEarly?.(local)
  try {
    const found = appendNew(local, await net)
    searchCache.set(key, found)
    return found
  } catch (err) {
    if (isAbortError(err) || signal?.aborted) throw err
    return local
  }
}

/** Photon's budget for one reverse lookup: no retry, since Nominatim is already being asked by then. */
const REVERSE_TIMEOUT_MS = 6_000
/** How long Photon has to answer a reverse lookup before Nominatim is asked as well. */
export const REVERSE_HEDGE_MS = 1_200
/** Nominatim's usage policy: at most about one request a second from us. */
const NOMINATIM_GAP_MS = 1_100
let nominatimNextAt = 0

/** Nominatim's GeoCodeJSON reply: the same fields as Photon's, under `properties.geocoding`. */
interface NominatimGeocoding extends Omit<PhotonProperties, 'countrycode' | 'extent'> {
  country_code?: string
}
interface NominatimResponse {
  features?: { properties?: { geocoding?: NominatimGeocoding } }[]
  error?: string
}

/** Nominatim types that name the field Photon would have put the object's name in. */
const NOMINATIM_TYPE_FIELD: Record<string, 'city' | 'district' | 'locality' | 'county' | 'state'> = {
  city: 'city',
  town: 'city',
  village: 'city',
  hamlet: 'city',
  municipality: 'city',
  district: 'district',
  suburb: 'district',
  locality: 'locality',
  county: 'county',
  state: 'state',
}

/**
 * A Nominatim GeoCodeJSON feature → the Photon shape photonReverseToPlace reads. Nominatim names the object
 * itself (a city's boundary: name "Waterloo", type "city", no `city` field), so the name also fills the field its
 * type stands for. Null when Nominatim has nothing here (open sea, ice sheet). The point is the queried one, as
 * photonReverseToPlace keeps it.
 */
export function nominatimToPhoton(res: NominatimResponse, lat: number, lon: number): PhotonFeature | null {
  const f = res.features?.[0]
  const g = f?.properties?.geocoding
  if (!f || !g) return null
  const { country_code, ...rest } = g
  const props: PhotonProperties = { ...rest, countrycode: country_code }
  const field = g.type ? NOMINATIM_TYPE_FIELD[g.type] : undefined
  if (field && hasText(g.name)) props[field] ??= g.name
  return { type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] }, properties: props }
}

async function photonReverse(lat: number, lon: number, signal: AbortSignal): Promise<PhotonFeature | null> {
  const res = await fetchJson<PhotonResponse>(`${PHOTON}/reverse?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}&lang=en&limit=1&radius=25`, {
    signal,
    timeoutMs: REVERSE_TIMEOUT_MS,
    retries: 0,
  })
  return res.features?.[0] ?? null
}

async function nominatimReverse(lat: number, lon: number, signal: AbortSignal): Promise<PhotonFeature | null> {
  const now = Date.now()
  const at = Math.max(now, nominatimNextAt)
  nominatimNextAt = at + NOMINATIM_GAP_MS
  if (at > now) await sleep(at - now, signal)
  // zoom 10: the settlement or district, never the nearest shop (Photon's reply is ranked the same way).
  const res = await fetchJson<NominatimResponse>(
    `${NOMINATIM}/reverse?lat=${lat.toFixed(6)}&lon=${lon.toFixed(6)}&format=geocodejson&zoom=10&accept-language=en`,
    { signal, timeoutMs: REVERSE_TIMEOUT_MS, retries: 0 },
  )
  return nominatimToPhoton(res, lat, lon)
}

/**
 * Name the place at (lat, lon). Never rejects except on abort: if neither geocoder has anything nearby (open
 * ocean, ice sheet) or can be reached, the label is the coordinates themselves.
 * The returned position is exactly (lat, lon), not the matched OSM object's. Resolves once the visitor's place names
 * are in too (./exonyms.ts), since the caller shows the name at once (a pin's label, a report).
 */
export async function reversePlace(lat: number, lon: number, signal?: AbortSignal): Promise<Place> {
  const names = ensureExonyms()
  const place = await reverseUnnamed(lat, lon, signal)
  await names
  return place
}

async function reverseUnnamed(lat: number, lon: number, signal?: AbortSignal): Promise<Place> {
  throwIfAborted(signal)
  const fallback: Place = { lat, lon, label: coordinateLabel(lat, lon), source: 'geolocation' }
  if (!(Math.abs(lat) <= 90 && Math.abs(lon) <= 180)) return fallback
  try {
    const near = await nearestLocal(lat, lon, signal)
    if (near) return { ...localToPlace(near, 'geolocation'), lat, lon }
  } catch (err) {
    if (isAbortError(err) || signal?.aborted) throw err
    // The tile didn't load: ask the network.
  }
  try {
    const f = await hedge(
      (s) => photonReverse(lat, lon, s),
      (s) => nominatimReverse(lat, lon, s),
      REVERSE_HEDGE_MS,
      signal,
    )
    return f ? photonReverseToPlace(f, lat, lon) : fallback
  } catch (err) {
    if (isAbortError(err) || signal?.aborted) throw err
    return fallback
  }
}

// ── Geolocation ────────────────────────────────────────────────────────────────────────────

export type LocateErrorCode = 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'insecure'

/**
 * A geolocation failure. `code` says why; the words a visitor reads are the landing's, chosen by that code
 * (src/i18n/en/landing.ts `locateErrors`) and rendered in the language on screen. `message` is only a developer's
 * diagnostic, in English, the same in every language.
 */
export class LocateError extends Error {
  readonly code: LocateErrorCode
  constructor(code: LocateErrorCode, message = `Geolocation failed: ${code}`) {
    super(message)
    this.name = 'LocateError'
    this.code = code
  }
}

const LOCATE_TIMEOUT_MS = 10_000
/**
 * Hard cap while the permission prompt is open. The API's own `timeout` only starts once
 * permission is granted, and some browsers never call back if the prompt is ignored.
 */
const LOCATE_PROMPT_CAP_MS = 30_000

/**
 * The device's position. Rejects with a LocateError whose code says why (the landing words it).
 * Coarse accuracy is plenty (a pass covers kilometres) and much faster on desktop.
 */
export function locateMe(): Promise<LatLon> {
  return new Promise<LatLon>((resolve, reject) => {
    const fail = (code: LocateErrorCode) => reject(new LocateError(code))
    if (typeof window !== 'undefined' && window.isSecureContext === false) return fail('insecure')
    const geo = typeof navigator !== 'undefined' ? navigator.geolocation : undefined
    if (!geo) return fail('unsupported')
    let done = false
    const cap = setTimeout(() => {
      if (done) return
      done = true
      fail('timeout')
    }, LOCATE_PROMPT_CAP_MS)
    geo.getCurrentPosition(
      (pos) => {
        if (done) return
        done = true
        clearTimeout(cap)
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude })
      },
      (err) => {
        if (done) return
        done = true
        clearTimeout(cap)
        fail(err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable')
      },
      { enableHighAccuracy: false, timeout: LOCATE_TIMEOUT_MS, maximumAge: 5 * 60_000 },
    )
  })
}

// ── Time zone ──────────────────────────────────────────────────────────────────────────────
//
// The offline table (@photostructure/tz-lookup, ~70 kB) is not needed for the first screen, so it is a
// separate chunk: `ensureTz()` loads it (the controller starts it at landing idle and at boot for deep
// links; computeReport awaits it before producing a report), and `timeZoneAt` stays synchronous. Until
// the table is in, `timeZoneAt` answers with the nautical zone for the longitude (Etc/GMT±N), which is
// never more than an hour or two off and is only ever seen in the computing readout.

type TzLookup = (lat: number, lon: number) => string
let tzlookup: TzLookup | undefined
let tzLoad: Promise<void> | undefined

/** Load the time-zone table (idempotent; a failed load is retried by the next call). Never rejects. */
export function ensureTz(): Promise<void> {
  if (tzlookup) return Promise.resolve()
  tzLoad ??= import('@photostructure/tz-lookup').then(
    (m) => {
      const fn = ((m as { default?: unknown }).default ?? m) as TzLookup
      if (typeof fn === 'function') tzlookup = fn
    },
    (err: unknown) => {
      console.warn('Time-zone table failed to load; using nautical zones.', err)
      tzLoad = undefined
    },
  )
  return tzLoad
}

/** True once `ensureTz()` has loaded the table. */
export const tzReady = () => !!tzlookup

/** Nautical time zone for a longitude: the IANA "Etc/GMT±N" id (signs inverted by POSIX convention). */
export function nauticalZone(lon: number): string {
  const n = Math.max(-12, Math.min(12, Math.round(lon / 15)))
  if (n === 0) return 'UTC'
  return n > 0 ? `Etc/GMT-${n}` : `Etc/GMT+${-n}`
}

/**
 * IANA time zone at a position ("America/Toronto"). Offline; open sea gets "Etc/GMT±N".
 * Before `ensureTz()` has resolved, the nautical zone for the longitude.
 */
export function timeZoneAt(lat: number, lon: number): string {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return 'UTC'
  const la = Math.max(-90, Math.min(90, lat))
  const lo = ((((lon + 180) % 360) + 360) % 360) - 180
  if (!tzlookup) {
    void ensureTz()
    return nauticalZone(lo)
  }
  try {
    return tzlookup(la, lo)
  } catch {
    return 'UTC'
  }
}
