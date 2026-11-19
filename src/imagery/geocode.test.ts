import { afterEach, describe, expect, it, vi } from 'vitest'
import waterloo from './__fixtures__/photon-waterloo.json'
import tokyo from './__fixtures__/photon-tokyo.json'
import paris from './__fixtures__/photon-paris.json'
import kitchener from './__fixtures__/photon-kitchener-ontario.json'
import eiffel from './__fixtures__/photon-eiffel-tower.json'
import revWaterloo from './__fixtures__/photon-reverse-waterloo.json'
import revTokyo from './__fixtures__/photon-reverse-tokyo.json'
import revOcean from './__fixtures__/photon-reverse-ocean.json'
import saoPaulo from './__fixtures__/photon-sao-paulo.json'
import moscow from './__fixtures__/photon-moscow.json'
import ushuaia from './__fixtures__/photon-ushuaia.json'
import cnTower from './__fixtures__/photon-cn-tower.json'
import junk from './__fixtures__/photon-junk.json'
import {
  coordinateLabel,
  dedupePlaces,
  displaySublabel,
  joinUnique,
  locateMe,
  parseCoordinates,
  photonReverseToPlace,
  photonToPlace,
  nominatimToPhoton,
  openMeteoToPlaces,
  SEARCH_HEDGE_MS,
  reversePlace,
  REVERSE_HEDGE_MS,
  searchPlaces,
  sublabelOf,
  timeZoneAt,
  ensureTz,
  inCrimea,
  tzReady,
  nauticalZone,
  type PhotonResponse,
} from './geocode'
import type { Place } from '@/types'
import { setBundleForTests } from '@/i18n/runtime'
import enGeo from '@/i18n/en/geo'

const places = (r: unknown) => dedupePlaces((r as PhotonResponse).features.map((f) => photonToPlace(f)).filter((p): p is Place => !!p))
const labels = (ps: Place[]) => ps.map((p) => [p.label, p.sublabel ?? ''])

describe('Photon forward labels', () => {
  it('Waterloo: clean two-line labels, near-duplicates merged', () => {
    const ps = places(waterloo)
    expect(labels(ps)).toEqual([
      ['Waterloo', 'Iowa, United States'],
      ['Waterloo', 'Ontario, Canada'], // the city; the county of the same name 1 km away is merged
      ['Waterloo', 'Walloon Brabant, Belgium'], // district + town merged
      ['Waterloo', 'New York, United States'],
    ])
    const on = ps[1]
    expect(on.countryCode).toBe('ca')
    expect(on.source).toBe('search')
    expect(on.lat).toBeCloseTo(43.4652699)
    expect(on.lon).toBeCloseTo(-80.5222961)
  })

  it('Tokyo: accented duplicate merged; a local-script state is dropped under a Latin label', () => {
    expect(labels(places(tokyo))).toEqual([
      ['Tokyo', 'Japan'],
      ['Tokyo International Airport', 'Tokyo, Japan'],
      ['Tokyo Bay', 'Chiba Prefecture, Japan'],
      ['Tokyo Dome', 'Tokyo, Japan'],
      ['Tokyo Kanjo', 'Sagamihara, Kanagawa Prefecture, Japan'],
    ])
  })

  it('Paris: city and its admin boundaries collapse to one', () => {
    expect(labels(places(paris))).toEqual([
      ['Paris', 'Île-de-France, France'],
      ['Paris', 'Texas, United States'],
      ['Paris', 'Kentucky, United States'],
      ['Paris', 'Arkansas, United States'],
    ])
  })

  it('never repeats the label in the sublabel', () => {
    for (const p of [...places(kitchener), ...places(eiffel)]) {
      expect(p.sublabel?.split(', ').map((s) => s.toLowerCase()) ?? []).not.toContain(p.label.toLowerCase())
    }
    expect(places(kitchener)[0]).toMatchObject({ label: 'Kitchener', sublabel: 'Ontario, Canada', countryCode: 'ca' })
    expect(places(eiffel)[0]).toMatchObject({ label: 'Eiffel Tower', sublabel: 'Paris, Île-de-France, France', countryCode: 'fr' })
  })

  it('joins parts without duplicates, case- and accent-insensitively', () => {
    expect(joinUnique(['Tokyo', 'TOKYO', 'Tōkyō', undefined, ' ', 'Japan'])).toBe('Tokyo, Japan')
    expect(joinUnique(['Paris', 'France'], ['paris'])).toBe('France')
    expect(joinUnique([undefined])).toBeUndefined()
  })

  it('keeps local-script parts when the label is in that script, or when nothing else is left', () => {
    expect(sublabelOf('Москва', ['Tver Oblast', 'Russia'])).toBe('Tver Oblast, Russia')
    expect(sublabelOf('北京师范大学', ['北京市', 'China'])).toBe('北京市, China')
    expect(sublabelOf('Kyiv', ['Прибузька сільська громада', 'Mykolaiv Oblast', 'Ukraine'])).toBe('Mykolaiv Oblast, Ukraine')
    expect(sublabelOf('Tokyo Dome', ['東京都'])).toBe('東京都')
  })

  it('drops OSM objects whose name has no letters or digits', () => {
    const names = (junk as unknown as PhotonResponse).features.map((f) => photonToPlace(f)?.label)
    expect(names.filter(Boolean)).toEqual(['Gárgyán-erdő', 'Irodasori iskola'])
  })

  it('labels address hits by street', () => {
    const p = photonToPlace({ geometry: { type: 'Point', coordinates: [-80.54, 43.47] }, properties: { housenumber: '200', street: 'University Avenue West', city: 'Waterloo', state: 'Ontario', country: 'Canada', countrycode: 'CA' } })
    expect(p).toMatchObject({ label: '200 University Avenue West', sublabel: 'Waterloo, Ontario, Canada' })
  })
})

describe('search ranking (real Photon responses, limit 10)', () => {
  const run = async (fixture: unknown, q: string) => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(fixture)))
    try {
      return await searchPlaces(q)
    } finally {
      vi.unstubAllGlobals()
    }
  }

  it('São Paulo: the city, not the state centroid 250 km away, comes first', async () => {
    const r = await run(saoPaulo, 'São Paulo ranking')
    expect(r[0]).toMatchObject({ label: 'São Paulo', sublabel: 'Brazil' })
    expect(r[0].lat).toBeCloseTo(-23.5507, 3)
    expect(r.filter((p) => p.label === 'São Paulo' && p.sublabel === 'Brazil')).toHaveLength(1)
    expect(r.length).toBeLessThanOrEqual(6)
  })

  it('Moscow: the city at the Kremlin, not the federal subject centroid', async () => {
    const r = await run(moscow, 'Moscow ranking')
    expect(r[0]).toMatchObject({ label: 'Moscow', sublabel: 'Russia', countryCode: 'ru' })
    expect(r[0].lat).toBeCloseTo(55.7505, 3)
    expect(r.filter((p) => p.countryCode === 'ru')).toHaveLength(1)
  })

  it('Ushuaia: the department merges into the town; look-alike rows get their county', async () => {
    const r = await run(ushuaia, 'Ushuaia ranking')
    expect(labels(r).slice(0, 2)).toEqual([
      ['Ushuaia', 'Argentina'],
      ['Ushuaia', 'Departamento Tolhuin, Argentina'],
    ])
    const rows = r.map((p) => `${p.label}|${p.sublabel}`)
    expect(new Set(rows).size).toBe(rows.length)
  })

  it('CN Tower: tickets and edge walk at the same spot collapse into one', async () => {
    expect(labels(await run(cnTower, 'cn tower ranking'))).toEqual([['CN Tower', 'Toronto, Ontario, Canada']])
  })

  it('a query of only punctuation never reaches the network', async () => {
    const f = vi.fn()
    vi.stubGlobal('fetch', f)
    expect(await searchPlaces('!!!')).toEqual([])
    expect(await searchPlaces(' -- ')).toEqual([])
    expect(f).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})

describe('Photon reverse labels', () => {
  it('prefers the settlement over the nearest object (a tree called "Class of 1995")', () => {
    const f = (revWaterloo as unknown as PhotonResponse).features[0]
    expect(photonReverseToPlace(f, 43.4723, -80.5449)).toEqual({
      lat: 43.4723,
      lon: -80.5449,
      label: 'Waterloo',
      sublabel: 'Ontario, Canada',
      countryCode: 'ca',
      source: 'geolocation',
    })
  })
  it('Tokyo', () => {
    const f = (revTokyo as unknown as PhotonResponse).features[0]
    expect(photonReverseToPlace(f, 35.6762, 139.6503)).toMatchObject({ label: 'Tokyo', sublabel: 'Japan', countryCode: 'jp' })
  })
  it('names wilderness by its natural feature, not "Unorganized …"', () => {
    const p = photonReverseToPlace(
      { geometry: { type: 'Point', coordinates: [-92.04, 50.53] }, properties: { name: 'lac Seul', osm_key: 'natural', osm_value: 'water', city: 'Unorganized Kenora District', county: 'Kenora', state: 'Ontario', country: 'Canada', countrycode: 'CA' } },
      50.5,
      -92,
    )
    expect(p).toMatchObject({ label: 'lac Seul', sublabel: 'Ontario, Canada' })
  })
})

describe('coordinates', () => {
  it('formats coordinate labels with the shared formatter', () => {
    expect(coordinateLabel(43.4723, -80.5449)).toBe('43.4723°N 80.5449°W')
    expect(coordinateLabel(-33.8688, 151.2093)).toBe('33.8688°S 151.2093°E')
  })
  it('parses typed coordinates', () => {
    expect(parseCoordinates('43.4723, -80.5449')).toEqual({ lat: 43.4723, lon: -80.5449 })
    expect(parseCoordinates('43.4723 -80.5449')).toEqual({ lat: 43.4723, lon: -80.5449 })
    expect(parseCoordinates('43.4723°N 80.5449°W')).toEqual({ lat: 43.4723, lon: -80.5449 })
    expect(parseCoordinates('33.8688S,151.2093E')).toEqual({ lat: -33.8688, lon: 151.2093 })
    expect(parseCoordinates('91, 0')).toBeNull()
    expect(parseCoordinates('waterloo')).toBeNull()
    expect(parseCoordinates('10 Downing St')).toBeNull()
  })
  it('reads the true minus and an en dash wherever a hyphen is read', () => {
    // The search hint, as every language prints it.
    expect(parseCoordinates('43.47, \u221280.54')).toEqual({ lat: 43.47, lon: -80.54 })
    expect(parseCoordinates('\u221233.8688 151.2093')).toEqual({ lat: -33.8688, lon: 151.2093 })
    expect(parseCoordinates('\u221233.8688;\u2212151.2093')).toEqual({ lat: -33.8688, lon: -151.2093 })
    expect(parseCoordinates('43.47, \u201380.54')).toEqual({ lat: 43.47, lon: -80.54 })
    expect(parseCoordinates('\u2212 33, 151')).toBeNull() // a sign apart from its number, as for '-'
    // Copied out of the Arabic hint, isolates and all, or with an Arabic letter mark.
    expect(parseCoordinates('\u206643.47, \u221280.54\u2069')).toEqual({ lat: 43.47, lon: -80.54 })
    expect(parseCoordinates('\u061c43.47, \u221280.54')).toEqual({ lat: 43.47, lon: -80.54 })
  })
  it('reads full-width digits and punctuation, as a Chinese, Japanese or Korean input method types them', () => {
    expect(parseCoordinates('43.47\uff0c\u221280.54')).toEqual({ lat: 43.47, lon: -80.54 })
    expect(parseCoordinates('\uff14\uff13\uff0e\uff14\uff17\uff0c\u3000\uff0d\uff18\uff10\uff0e\uff15\uff14')).toEqual({
      lat: 43.47,
      lon: -80.54,
    })
    expect(parseCoordinates('\uff14\uff13\uff0e\uff14\uff17\uff2e \uff18\uff10\uff0e\uff15\uff14\uff37')).toEqual({
      lat: 43.47,
      lon: -80.54,
    })
    // The ordinal sign some keyboards give for a degree is still a degree, not the letter o.
    expect(parseCoordinates('43.47\u00baN 80.54\u00baW')).toEqual({ lat: 43.47, lon: -80.54 })
  })
  it('reads decimal commas only when a space or a semicolon parts the numbers', () => {
    expect(parseCoordinates('41,01 28,98')).toEqual({ lat: 41.01, lon: 28.98 })
    expect(parseCoordinates('43,47; \u221280,54')).toEqual({ lat: 43.47, lon: -80.54 })
    expect(parseCoordinates('43,47;-80,54')).toEqual({ lat: 43.47, lon: -80.54 })
    expect(parseCoordinates('33,8688°S 151,2093°E')).toEqual({ lat: -33.8688, lon: 151.2093 })
    expect(parseCoordinates('41,01   28')).toEqual({ lat: 41.01, lon: 28 })
    // Where the comma could be the separator, it is read as one, as before.
    expect(parseCoordinates('41,01')).toEqual({ lat: 41, lon: 1 })
    expect(parseCoordinates('41, 28')).toEqual({ lat: 41, lon: 28 })
    expect(parseCoordinates('41,01,28,98')).toBeNull()
    expect(parseCoordinates('41,01, 28,98')).toBeNull()
    // After a hemisphere letter a comma can only part the numbers.
    expect(parseCoordinates('41,01N, 28,98E')).toEqual({ lat: 41.01, lon: 28.98 })
    expect(parseCoordinates('33,8688°S,151,2093°E')).toEqual({ lat: -33.8688, lon: 151.2093 })
    expect(parseCoordinates('41,01N28,98E')).toBeNull() // no separator at all, as with points
    expect(parseCoordinates('91,5 0')).toBeNull()
  })
  it('reads no hemisphere letters but N, S, E and W', () => {
    // O is west in French, Spanish and Italian but east (Ost) in German: never guessed.
    expect(parseCoordinates('43.47N 80.54O')).toBeNull()
    expect(parseCoordinates('41,01N 28,98E')).toEqual({ lat: 41.01, lon: 28.98 })
  })
})

describe('time zones', () => {
  it('answers with the nautical zone until the table has loaded', () => {
    if (tzReady()) return // another test loaded it first
    expect(timeZoneAt(43.4723, -80.5449)).toBe('Etc/GMT+5')
    expect(nauticalZone(139.65)).toBe('Etc/GMT-9')
    expect(nauticalZone(-0.12)).toBe('UTC')
    expect(nauticalZone(179.9)).toBe('Etc/GMT-12')
  })

  it('looks up IANA zones offline', async () => {
    await ensureTz()
    expect(tzReady()).toBe(true)
    expect(timeZoneAt(43.4723, -80.5449)).toBe('America/Toronto')
    expect(timeZoneAt(35.6762, 139.6503)).toBe('Asia/Tokyo')
    expect(timeZoneAt(51.5, 360 - 0.12)).toBe('Europe/London') // longitude wrapped
    expect(timeZoneAt(Number.NaN, 0)).toBe('UTC')
  })
})

/** The URLs a fetch mock was called with that went to Photon (the offline place files are fetched too). */
const photonCalls = (f: { mock: { calls: unknown[][] } }) => f.mock.calls.map((c) => String(c[0])).filter((u) => u.startsWith('https://photon.komoot.io/'))

describe('network', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('searchPlaces queries Photon in English (10 asked, ≤ 6 kept), URL-encoded, and caches', async () => {
    const f = vi.fn(async () => Response.json(waterloo))
    vi.stubGlobal('fetch', f)
    const r = await searchPlaces('  Waterloo ')
    expect(r).toHaveLength(4)
    expect(photonCalls(f)).toEqual(['https://photon.komoot.io/api/?q=Waterloo&limit=10&lang=en'])
    await searchPlaces('a&b=c/d?e#f 東京')
    expect(photonCalls(f)[1]).toBe('https://photon.komoot.io/api/?q=a%26b%3Dc%2Fd%3Fe%23f%20%E6%9D%B1%E4%BA%AC&limit=10&lang=en')
    f.mockClear()
    await searchPlaces('waterloo')
    expect(f).toHaveBeenCalledTimes(0)
    expect(await searchPlaces('w')).toEqual([])
  })

  it('reverse-geocodes typed coordinates', async () => {
    const f = vi.fn(async () => Response.json(revWaterloo))
    vi.stubGlobal('fetch', f)
    const r = await searchPlaces('43.4723, -80.5449')
    expect(r).toEqual([{ lat: 43.4723, lon: -80.5449, label: 'Waterloo', sublabel: 'Ontario, Canada', countryCode: 'ca', source: 'search' }])
    expect(photonCalls(f)[0]).toContain('/reverse?lat=43.472300&lon=-80.544900&lang=en&limit=1')
  })

  it('reversePlace falls back to a coordinate label at sea or offline', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(revOcean)))
    expect(await reversePlace(30, -40)).toEqual({ lat: 30, lon: -40, label: '30.0000°N 40.0000°W', source: 'geolocation' })
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))))
    expect((await reversePlace(43.4723, -80.5449)).label).toBe('43.4723°N 80.5449°W')
  })

  it('reversePlace asks Nominatim when Photon stalls, and names the spot from its reply', async () => {
    const urls: string[] = []
    const f = vi.fn((url: string, init?: RequestInit) => {
      urls.push(url)
      if (url.startsWith('https://photon.komoot.io/')) {
        return new Promise<Response>((_, rej) => init?.signal?.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError'))))
      }
      return Promise.resolve(Response.json(nominatimWaterloo))
    })
    vi.stubGlobal('fetch', f)
    const t0 = Date.now()
    const place = await reversePlace(43.4723, -80.5449)
    expect(Date.now() - t0).toBeLessThan(REVERSE_HEDGE_MS + 1_000)
    expect(place).toEqual({ lat: 43.4723, lon: -80.5449, label: 'Waterloo', sublabel: 'Ontario, Canada', countryCode: 'ca', source: 'geolocation' })
    expect(urls[1]).toBe('https://nominatim.openstreetmap.org/reverse?lat=43.472300&lon=-80.544900&format=geocodejson&zoom=10&accept-language=en')
  })
})

/** Nominatim GeoCodeJSON replies (abridged from live answers, 2026-11-12). */
const nominatimWaterloo = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        geocoding: {
          osm_key: 'boundary',
          osm_value: 'administrative',
          type: 'city',
          name: 'Waterloo',
          county: 'Region of Waterloo',
          state: 'Ontario',
          country: 'Canada',
          country_code: 'ca',
        },
      },
      geometry: { type: 'Point', coordinates: [-80.5222961, 43.4652699] },
    },
  ],
}
const geocoding = (g: Record<string, string>) => ({ features: [{ properties: { geocoding: g } }] })

describe('Nominatim reverse labels', () => {
  const label = (res: Parameters<typeof nominatimToPhoton>[0]) => {
    const f = nominatimToPhoton(res, 1, 2)
    return f && photonReverseToPlace(f, 1, 2)
  }

  it('names a city by the city, not its county', () => {
    expect(label(nominatimWaterloo)).toMatchObject({ label: 'Waterloo', sublabel: 'Ontario, Canada', countryCode: 'ca' })
  })

  it('prefers the city over its district, as Photon does', () => {
    const r = geocoding({ osm_key: 'boundary', type: 'district', name: 'Suginami', city: 'Tokyo', country: 'Japan', country_code: 'jp' })
    expect(label(r)).toMatchObject({ label: 'Tokyo', sublabel: 'Japan' })
  })

  it('falls back to the region in open country', () => {
    const r = geocoding({ osm_key: 'boundary', type: 'state', name: 'Matruh', country: 'Egypt', country_code: 'eg' })
    expect(label(r)).toMatchObject({ label: 'Matruh', sublabel: 'Egypt' })
  })

  it('has nothing at sea', () => {
    expect(nominatimToPhoton({ error: 'Unable to geocode' }, 1, 2)).toBeNull()
  })
})

describe('Crimea', () => {
  /** A Photon feature at (lat, lon) whose country is `country` */
  const feature = (name: string, lat: number, lon: number, country: string, countrycode: string, state?: string): PhotonResponse['features'][number] => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [lon, lat] },
    properties: { name, state, country, countrycode, osm_key: 'place', osm_value: 'city' },
  })

  it('is the peninsula and Sevastopol, up to the middle of the Kerch Strait', () => {
    for (const [lat, lon] of [
      [44.9521, 34.1025], // Simferopol
      [44.6054, 33.522], // Sevastopol
      [44.4988, 34.169], // Yalta
      [45.3563, 36.4671], // Kerch, on the strait
      [45.2716, 36.5463], // Tuzla Island, in it
      [46.1109, 33.6922], // Armyansk, on the Perekop isthmus
      [45.2957, 35.4788], // the Arabat fortress, at the Arabat Spit's Crimean end
      [45.4299, 35.8225], // Shcholkine, on the Sea of Azov
    ])
      expect(inCrimea(lat, lon), `${lat}, ${lon}`).toBe(true)
    for (const [lat, lon] of [
      [45.333, 36.6662], // Chushka, on the Chushka spit (Russia), 3 km across the strait from Crimea
      [45.3402, 36.6746], // Port Kavkaz
      [45.3601, 36.7137], // the Chushka spit
      [45.1954, 36.598], // Cape Tuzla, the Taman peninsula's tip
      [45.2117, 36.7161], // Taman
      [45.0448, 38.976], // Krasnodar
      [46.1714, 34.8034], // Henichesk, Kherson Oblast
      [46.6354, 32.6169], // Kherson
      [45.8959, 34.883], // Strilkove, on the Arabat Spit in Kherson Oblast
    ])
      expect(inCrimea(lat, lon), `${lat}, ${lon}`).toBe(false)
  })

  it('reads a Photon answer that names Russia for a point in Crimea as Ukraine, and only there', () => {
    expect(photonToPlace(feature('Simferopol', 44.9521, 34.1025, 'Russia', 'RU', 'Republic of Crimea'))).toMatchObject({
      label: 'Simferopol',
      sublabel: 'Republic of Crimea, Ukraine',
      countryCode: 'ua',
    })
    expect(photonToPlace(feature('Kerch', 45.3563, 36.4671, 'Russian Federation', 'RU'))).toMatchObject({ sublabel: 'Ukraine', countryCode: 'ua' })
    expect(photonToPlace(feature('Port Kavkaz', 45.3402, 36.6746, 'Russia', 'RU', 'Krasnodar Krai'))).toMatchObject({
      sublabel: 'Krasnodar Krai, Russia',
      countryCode: 'ru',
    })
    // An answer that already says Ukraine, or another country, is left as it came.
    expect(photonToPlace(feature('Yalta', 44.4988, 34.169, 'Ukraine', 'UA', 'Autonomous Republic of Crimea'))).toMatchObject({
      sublabel: 'Autonomous Republic of Crimea, Ukraine',
      countryCode: 'ua',
    })
    // A reverse lookup is judged at the point asked about, and a country alone is the label.
    const rev = photonReverseToPlace({ geometry: { type: 'Point', coordinates: [0, 0] }, properties: { country: 'Russia', countrycode: 'RU' } }, 45.2716, 36.5463)
    expect(rev).toMatchObject({ label: 'Ukraine', countryCode: 'ua' })
  })

  it('reads Nominatim and Open-Meteo the same way', () => {
    const nom = nominatimToPhoton(geocoding({ type: 'city', name: 'Sevastopol', state: 'Sevastopol', country: 'Russia', country_code: 'ru' }), 44.6054, 33.522)
    expect(nom && photonReverseToPlace(nom, 44.6054, 33.522)).toMatchObject({ label: 'Sevastopol', sublabel: 'Ukraine', countryCode: 'ua' })
    const om = openMeteoToPlaces(
      [
        { name: 'Feodosiya', latitude: 45.0319, longitude: 35.3824, country_code: 'RU', country: 'Russia', admin1: 'Crimea', population: 69145 },
        { name: 'Feodosiyevka', latitude: 45.3, longitude: 39.1, country_code: 'RU', country: 'Russia', admin1: 'Krasnodar Krai' },
      ],
      'feodosiy',
    )
    expect(om.map((p) => [p.sublabel, p.countryCode])).toEqual([
      ['Crimea, Ukraine', 'ua'],
      ['Krasnodar Krai, Russia', 'ru'],
    ])
  })
})

/** Open-Meteo search results (abridged from live answers, 2026-11-12). */
const omWaterloo = [
  { name: 'Austin', latitude: 30.26715, longitude: -97.74306, country_code: 'US', country: 'United States', admin1: 'Texas' },
  { name: 'Waterloo', latitude: 42.49276, longitude: -92.34296, country_code: 'US', country: 'United States', admin1: 'Iowa', population: 68460 },
  { name: 'Waterloo', latitude: 43.4668, longitude: -80.51639, country_code: 'CA', country: 'Canada', admin1: 'Ontario', population: 104986 },
]

describe('Open-Meteo search results', () => {
  it('keeps only places the query names (not an old name: Austin was once Waterloo), largest first', () => {
    const r = openMeteoToPlaces(omWaterloo, 'waterl')
    expect(r.map((p) => `${p.label} · ${p.sublabel}`)).toEqual(['Waterloo · Ontario, Canada', 'Waterloo · Iowa, United States'])
    expect(r[0]).toMatchObject({ lat: 43.4668, lon: -80.51639, countryCode: 'ca', source: 'search' })
  })

  it('matches later words against the region or country', () => {
    expect(openMeteoToPlaces(omWaterloo, 'waterloo, canada').map((p) => p.sublabel)).toEqual(['Ontario, Canada'])
    expect(openMeteoToPlaces([{ name: 'Florence', latitude: 1, longitude: 2, admin1: 'Indiana' }], 'new york')).toEqual([])
  })
})

describe('searchPlaces on the network (Open-Meteo first, Photon as backup)', () => {
  afterEach(() => vi.unstubAllGlobals())
  const stalledPhoton = (other: () => Response) =>
    vi.fn((url: string, init?: RequestInit) =>
      url.startsWith('https://photon.komoot.io/')
        ? new Promise<Response>((_, rej) => init?.signal?.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError'))))
        : Promise.resolve(other()),
    )

  it('answers from Open-Meteo without waiting for Photon, and caches it', async () => {
    const f = stalledPhoton(() => Response.json({ results: omWaterloo }))
    vi.stubGlobal('fetch', f)
    const t0 = Date.now()
    const r2 = await searchPlaces('Waterlo')
    expect(Date.now() - t0).toBeLessThan(SEARCH_HEDGE_MS + 1_000)
    expect(r2.map((p) => p.sublabel)).toEqual(['Ontario, Canada', 'Iowa, United States'])
    expect(String((f.mock.calls.at(-1) as unknown[])[0])).toBe('https://geocoding-api.open-meteo.com/v1/search?name=Waterlo&count=10&language=en&format=json')
    f.mockClear()
    expect((await searchPlaces('waterlo')).map((p) => p.sublabel)).toEqual(['Ontario, Canada', 'Iowa, United States'])
    expect(f).not.toHaveBeenCalled()
  })

  it('waits for Photon when Open-Meteo has no match', async () => {
    const ctrl = new AbortController()
    vi.stubGlobal('fetch', stalledPhoton(() => Response.json({})))
    const p = searchPlaces('CN Tower stalled', ctrl.signal)
    let settled = false
    void p.then(() => (settled = true), () => (settled = true))
    await new Promise((r) => setTimeout(r, SEARCH_HEDGE_MS + 300))
    expect(settled).toBe(false)
    ctrl.abort()
    await expect(p).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('places on screen', () => {
  afterEach(() => setBundleForTests('en', null))

  it('show the English sublabel as it is in English', () => {
    for (const sublabel of ['Ontario, Canada', 'Paris, Île-de-France, France', 'Giza, Egypt', 'Japan', 'Bus stop, Ushuaia, Tierra del Fuego, Argentina'])
      expect(displaySublabel({ sublabel, countryCode: 'ca' })).toBe(sublabel)
    expect(displaySublabel({ sublabel: 'New York, United States', countryCode: 'us' })).toBe('New York, United States')
    expect(displaySublabel({ countryCode: 'ca' })).toBeUndefined()
  })

  it('name the country in the language on screen, joined its way to the rest, which keeps its order and punctuation', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${country} · ${rest}`)
    setBundleForTests('de', { geo: { ...enGeo, where } })
    expect(displaySublabel({ sublabel: 'Ontario, Canada', countryCode: 'ca' })).toBe('Kanada · Ontario')
    expect(displaySublabel({ sublabel: 'Germany', countryCode: 'de' })).toBe('Deutschland')
    // The rest is never reordered or re-punctuated: a disambiguated row keeps its kind and commas exactly as written.
    expect(displaySublabel({ sublabel: 'Paris, Île-de-France, France', countryCode: 'fr' })).toBe('Frankreich · Paris, Île-de-France')
    expect(displaySublabel({ sublabel: 'Bus stop, Ushuaia, Tierra del Fuego, Argentina', countryCode: 'ar' })).toBe(
      'Argentinien · Bus stop, Ushuaia, Tierra del Fuego',
    )
  })

  it('name Hong Kong and Macao by their short names in every language, English included, and Palestine so in Arabic and Indonesian', () => {
    expect(displaySublabel({ sublabel: 'Wong Tai Sin District, Hong Kong SAR China', countryCode: 'hk' })).toBe('Wong Tai Sin District, Hong Kong')
    expect(displaySublabel({ sublabel: 'Macao SAR China', countryCode: 'mo' })).toBe('Macao')
    expect(displaySublabel({ sublabel: 'Gaza Strip, Palestinian Territories', countryCode: 'ps' })).toBe('Gaza Strip, Palestinian Territories')
    expect(displaySublabel({ sublabel: 'England, United Kingdom', countryCode: 'gb' })).toBe('England, United Kingdom') // never "UK"
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}، ${country}`)
    setBundleForTests('ar', { geo: { ...enGeo, where } })
    expect(displaySublabel({ sublabel: 'Gaza Strip, Palestinian Territories', countryCode: 'ps' })).toBe('Gaza Strip، فلسطين')
    expect(displaySublabel({ sublabel: 'Hong Kong SAR China', countryCode: 'hk' })).toBe('هونغ كونغ')
    expect(displaySublabel({ sublabel: 'Washington, United States', countryCode: 'us' })).toBe('Washington، الولايات المتحدة')
    setBundleForTests('id', { geo: { ...enGeo } })
    expect(displaySublabel({ sublabel: 'West Bank, Palestinian Territories', countryCode: 'ps' })).toBe('West Bank, Palestina')
    expect(displaySublabel({ sublabel: 'Macao SAR China', countryCode: 'mo' })).toBe('Makau')
    setBundleForTests('de', { geo: { ...enGeo } })
    expect(displaySublabel({ sublabel: 'Gaza Strip, Palestinian Territories', countryCode: 'ps' })).toBe('Gaza Strip, Palästinensische Autonomiegebiete')
    expect(displaySublabel({ sublabel: 'Kowloon City District, Hong Kong SAR China', countryCode: 'hk' })).toBe('Kowloon City District, Hongkong')
    // A geocoder that writes the short name already is read the same way.
    expect(displaySublabel({ sublabel: 'Macao', countryCode: 'mo' })).toBe('Macau')
  })

  it('show any other sublabel as it came: no code, another country, a spelling not the browser’s, copy already translated', () => {
    setBundleForTests('de', { geo: { ...enGeo, where: () => 'never' } })
    expect(displaySublabel({ sublabel: 'Ontario, Canada' })).toBe('Ontario, Canada')
    expect(displaySublabel({ sublabel: 'Ontario, Canada', countryCode: 'us' })).toBe('Ontario, Canada')
    expect(displaySublabel({ sublabel: 'Ontario, Kanada', countryCode: 'ca' })).toBe('Ontario, Kanada')
    expect(displaySublabel({ sublabel: 'Gizeh, Ägypten', countryCode: 'eg' })).toBe('Gizeh, Ägypten')
    expect(displaySublabel({ sublabel: 'Little Canada', countryCode: 'ca' })).toBe('Little Canada')
    expect(displaySublabel({ countryCode: 'ca' })).toBeUndefined()
  })

  it('reject a failed "Use my location" with a stable code and an English diagnostic, whatever the language', async () => {
    const failure = { name: 'LocateError', code: 'unsupported', message: 'Geolocation failed: unsupported' }
    await expect(locateMe()).rejects.toMatchObject(failure)
    setBundleForTests('de', { geo: enGeo })
    await expect(locateMe()).rejects.toMatchObject(failure)
  })
})
