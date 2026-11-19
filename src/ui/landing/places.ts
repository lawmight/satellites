/**
 * Curated example places for the landing chips. Real coordinates, chosen so every chip delivers a
 * picture: a secret airbase, a park that reads as a rectangle at 10 m and a desert monument under clear
 * skies (the three most picked of the launch's five chips), plus a "Surprise me" pool of famous places.
 * (The Arctic is out until the radar copy ships: in winter its optical archive is empty.)
 *
 * Their names are copy, shown in the visitor's language: CURATED_NAMES (src/i18n/en/plain/placeNames.ts) is the
 * English text of the 'places' namespace (src/i18n/en/places.ts), and ./curated.ts gives a place its translated label.
 * The objects here stay English: they are what usage stats and record_lookup keep (so counts never split by language)
 * and what the offline place list is built with. This module imports no runtime, because scripts/build-places.ts reads
 * it under plain Node (which is also why the names come by a relative path, not '@/').
 */
import type { Place } from '@/types'
import { CURATED_NAMES } from '../../i18n/en/plain/placeNames'

export { CURATED_NAMES }

export interface ExamplePlace extends Place {
  /** Short chip text, mono caps */
  chip: string
}

export type CuratedId = keyof typeof CURATED_NAMES
type ExampleId = { [K in CuratedId]: (typeof CURATED_NAMES)[K] extends { chip: string } ? K : never }[CuratedId]

/** Where each curated place is: latitude, longitude, ISO country code. */
const SPOTS: Record<CuratedId, readonly [lat: number, lon: number, countryCode: string]> = {
  area51: [37.235, -115.8111, 'us'],
  centralPark: [40.7812, -73.9665, 'us'],
  giza: [29.9792, 31.1342, 'eg'],
  uluru: [-25.3444, 131.0369, 'au'],
  palmJumeirah: [25.1124, 55.139, 'ae'],
  worldIslands: [25.2232, 55.165, 'ae'],
  grandCanyon: [36.0544, -112.1401, 'us'],
  meteorCrater: [35.0274, -111.0225, 'us'],
  lowerManhattan: [40.7075, -74.0113, 'us'],
  lasVegasStrip: [36.1147, -115.1728, 'us'],
  hooverDam: [36.016, -114.7377, 'us'],
  goldenGate: [37.8199, -122.4783, 'us'],
  kennedySpaceCenter: [28.6084, -80.6043, 'us'],
  washingtonDc: [38.8893, -77.0353, 'us'],
  mountStHelens: [46.1914, -122.1956, 'us'],
  niagaraFalls: [43.0779, -79.0754, 'ca'],
  panamaCanal: [9.2726, -79.9218, 'pa'],
  rioDeJaneiro: [-22.9486, -43.1566, 'br'],
  paris: [48.8566, 2.3522, 'fr'],
  venice: [45.4341, 12.3388, 'it'],
  vesuvius: [40.8214, 14.4265, 'it'],
  istanbul: [41.0186, 28.9784, 'tr'],
  chernobyl: [51.389, 30.099, 'ua'],
  tableMountain: [-33.9628, 18.4098, 'za'],
  kilimanjaro: [-3.0674, 37.3556, 'tz'],
  everest: [27.9881, 86.925, 'np'],
  angkorWat: [13.4125, 103.867, 'kh'],
  singapore: [1.2834, 103.8607, 'sg'],
  hongKong: [22.293, 114.1694, 'hk'],
  tokyo: [35.6812, 139.7671, 'jp'],
  fuji: [35.3606, 138.7274, 'jp'],
  sydneyHarbour: [-33.8568, 151.2153, 'au'],
  // Added after rendering each one's 12 km crop from a recent clear Sentinel-2 scene and looking at it: the subject
  // fills the frame as a shape, colour or texture (a pit, a reef, a caldera, a dam wall, a field pattern).
  richat: [21.1243, -11.4005, 'mr'],
  greatBlueHole: [17.3158, -87.5347, 'bz'],
  boraBora: [-16.5004, -151.7415, 'pf'],
  hardyReef: [-19.7667, 149.1833, 'au'],
  male: [4.1755, 73.5093, 'mv'],
  deadSea: [31.19, 35.45, 'jo'],
  binghamCanyon: [40.523, -112.15, 'us'],
  mountWhaleback: [-23.3667, 119.6667, 'au'],
  etna: [37.751, 14.9934, 'it'],
  santorini: [36.404, 25.396, 'gr'],
  teide: [28.2723, -16.6423, 'es'],
  kilauea: [19.4069, -155.2834, 'us'],
  craterLake: [42.9446, -122.109, 'us'],
  glenCanyonDam: [36.9371, -111.4837, 'us'],
  gardenCity: [37.9717, -100.8727, 'us'],
  almeria: [36.78, -2.72, 'es'],
  gibraltar: [36.1408, -5.3536, 'gi'],
  suezCanal: [30.5852, 32.2654, 'eg'],
  aswanDam: [23.97, 32.878, 'eg'],
  wadiRum: [29.5764, 35.4197, 'jo'],
  sossusvlei: [-24.7275, 15.2954, 'na'],
  victoriaFalls: [-17.9243, 25.8572, 'zw'],
  threeGorges: [30.8231, 111.0033, 'cn'],
  shanghai: [31.2304, 121.4737, 'cn'],
  itaipu: [-25.4086, -54.5889, 'br'],
}

const EXAMPLE_IDS: readonly ExampleId[] = ['area51', 'centralPark', 'giza']

/** Every curated place that is not an example chip, in its pool order (the draw's order: keep it). */
const SURPRISE_IDS = (Object.keys(CURATED_NAMES) as CuratedId[]).filter((id) => !(EXAMPLE_IDS as readonly CuratedId[]).includes(id))

export const EXAMPLE_PLACES: readonly ExamplePlace[] = EXAMPLE_IDS.map((id) => {
  const { chip, label, sublabel } = CURATED_NAMES[id]
  const [lat, lon, countryCode] = SPOTS[id]
  return { chip, label, sublabel, lat, lon, countryCode, source: 'demo' }
})

/**
 * "Surprise me": famous places you can make out from orbit at the photos' 10–30 m a pixel, in a 10–15 km frame: big
 * landforms, craters and volcanoes, coastlines and harbours, and city layouts (no single statue or building: at 10 m a
 * monument is a few pixels). Mostly in dry or often-clear skies, on every continent. Not a random point: seven tenths
 * of one would be open ocean. Source 'surprise', so usage stats tell them apart from the example chips.
 */
export const SURPRISE_PLACES: readonly Place[] = SURPRISE_IDS.map((id) => {
  const { label, sublabel } = CURATED_NAMES[id]
  const [lat, lon, countryCode] = SPOTS[id]
  return { label, sublabel, lat, lon, countryCode, source: 'surprise' }
})

/** English label → id, for every curated place (labels are unique: the tests hold them to it). */
const ID_BY_LABEL = new Map<string, CuratedId>(Object.entries(CURATED_NAMES).map(([id, n]) => [n.label, id as CuratedId]))
const ENGLISH = new Map<CuratedId, Place>([...EXAMPLE_PLACES, ...SURPRISE_PLACES].map((p) => [ID_BY_LABEL.get(p.label)!, p]))

/** The curated place a Place is (an example chip or a Surprise me pick, in any language), if it is one. */
export function curatedId(place: Pick<Place, 'label' | 'source' | 'canonicalLabel'>): CuratedId | undefined {
  if (place.source !== 'demo' && place.source !== 'surprise') return undefined
  return ID_BY_LABEL.get(place.canonicalLabel ?? place.label)
}

/**
 * The English Place for a curated place shown in another language (its English label AND sublabel, the ones usage
 * stats, record_lookup and shares keep); any other place as it is.
 */
export function englishPlace<P extends Place>(place: P): P | Place {
  const id = curatedId(place)
  return id ? (ENGLISH.get(id) ?? place) : place
}

/** The English Place for a curated id. */
export const curatedPlace = (id: CuratedId): Place => ENGLISH.get(id)!

/** A place from SURPRISE_PLACES, never `previous` (two presses in a row always go somewhere new). English: ./curated.ts translates it. */
export function surprisePlace(previous?: Pick<Place, 'label' | 'canonicalLabel'>, random: () => number = Math.random): Place {
  const last = previous ? (previous.canonicalLabel ?? previous.label) : undefined
  const pool = last !== undefined ? SURPRISE_PLACES.filter((p) => p.label !== last) : SURPRISE_PLACES
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))]
}
