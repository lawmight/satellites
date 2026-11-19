/**
 * English copy for one pass's paragraph: the sentences under a pass's picture or plan view (src/ui/results/lib/copy.ts
 * passSentences, shown by PassDetail). The order is always: what crossed, when, where and how it moved; then what that
 * means for the picture; then what we can't know (DESIGN §7: declarative, specific, quietly uncanny, second person:
 * "your spot", "your horizon" are the searched place).
 *
 * Why one message per sentence, with every slot: other languages order "who crossed, how high, how far, which way, at
 * what time" their own way, so code never glues pieces; it picks the sentence's shape (overhead or off to one side,
 * looking straight down or pointing away) and hands over raw values. A message returns rich parts: each number with
 * its unit is a num() part (set in the mono face, the unit smaller and dimmer; '°' and '%' attach without a space), so
 * a translation moves numbers with its words. Plain-text messages are whole sentences too.
 *
 * Slots, everywhere below:
 *   sat       a satellite's name ("Sentinel-2C", "ISS"): never translated or inflected
 *   place     the searched place's label, bare ("Waterloo", "Pacific Ocean"): data from the geocoder, never inflected.
 *             English adds "the" before seas and deserts itself (./plain/english.ts); write a frame that stays
 *             grammatical around a bare name
 *   time      the 24 h clock at the place, already written ("11:21:13", or "11:21"); `zone` its abbreviation ("EST",
 *             "UTC+9"): international notation, keep them together. English sets them as one mono part
 *   altKm, km, swathKm, gsdM, pct, deg, speedKmS
 *             raw numbers: format them with fmt(locale) (whole km and m, one decimal for degrees, two for km/s)
 *   dir, heading, toward
 *             a direction as an 8-point compass id ('n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'): `heading` is where
 *             the satellite was moving ("moving south"), `dir` / `toward` where it was from the place ("61 km to the
 *             west", "to the northeast" of your horizon). Most languages word these two differently: keep two tables
 *   offset    undefined when the satellite passed straight over the place (within 15 km): the "overhead" forms
 *
 * Proper names stay as they are: NASA, Sentinel-2, Landsat, the sensors (VIIRS, MODIS, MSI, OLI…). "Swath": the strip
 * of ground a fixed camera records as it flies. "Off straight down" / "off-nadir": how far the camera looked away from
 * the point directly below it.
 */
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import { ns } from '../ns'
import type { Compass16, Compass8 } from '@/ui/results/lib/copy'
import { capitalize, placeInProse } from './plain/english'

const en = fmt('en')

/** English says a direction the same way after "moving" and after "to the" (other languages need two tables). */
const WORDS: Record<Compass8, string> = {
  n: 'north',
  ne: 'northeast',
  e: 'east',
  se: 'southeast',
  s: 'south',
  sw: 'southwest',
  w: 'west',
  nw: 'northwest',
}

/** Where the satellite was from the place: `km` along the ground, toward `dir` (a translation can import this type) */
export interface Offset {
  km: number
  dir: Compass8
}

const km = (n: number) => num(en.int(n), 'km')
/** "10 minutes": a cadence, its unit set like a number's */
const minutes = (n: number) => num(en.int(n), en.plural(n, { one: 'minute', other: 'minutes' }))
const clock = (time: string, zone: string) => num(time, zone)
/** "786 km overhead" / "786 km up, 61 km to the west" */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? [km(altKm), ' up, ', km(offset.km), ` to the ${WORDS[offset.dir]}`] : [km(altKm), ' overhead']

export default ns('pass', {
  /**
   * The 16-point compass abbreviations, by direction (clockwise from north): the pass view's readouts ("58° · SSW",
   * "SSW · Desc"), mono caps in narrow cells, at most 3 characters. Keep the Latin letters if your readers know them
   * as technical notation, or use your language's own abbreviations.
   */
  compass16: {
    n: 'N',
    nne: 'NNE',
    ne: 'NE',
    ene: 'ENE',
    e: 'E',
    ese: 'ESE',
    se: 'SE',
    sse: 'SSE',
    s: 'S',
    ssw: 'SSW',
    sw: 'SW',
    wsw: 'WSW',
    w: 'W',
    wnw: 'WNW',
    nw: 'NW',
    nnw: 'NNW',
  } satisfies Record<Compass16, string>,

  // ── a geostationary scan (a weather satellite that never moves across the sky) ─────────────
  geo: {
    /**
     * It never crosses: it sits above the equator and scans. `seat` is its longitude, already written in
     * international notation ("0.2°W", "140.8°E"), absent when unknown; `cadenceMin` how often it takes a full picture
     * (absent when unknown)
     */
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} doesn’t pass. It sits `,
      km(o.altKm),
      o.seat !== undefined ? ` above the equator at ${o.seat}` : ' above the equator',
      ...(o.cadenceMin
        ? [' and scans the whole face of the Earth below it every ', minutes(o.cadenceMin), '.']
        : [' and scans the whole face of the Earth below it.']),
    ],
    /** When its scan line reached the place (known to about a minute, hence "about"), and which way the line moved */
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `This scan’s line reached ${placeInProse(o.place)} at about `,
      clock(o.time, o.zone),
      `, moving ${WORDS[o.heading]}.`,
    ],
    /** The frame shown was taken at night, in infrared */
    infrared: 'It was dark here, so this is infrared: cloud tops by temperature, colder is lighter.',
  },

  // ── a pass with a picture ("Watched") ─────────────────────────────────────────────────────
  /** What crossed, how high, where from the place, when, and how it moved (`speedKmS` its ground speed) */
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `${o.sat} crossed `,
    ...where(o.altKm, o.offset),
    ' at ',
    clock(o.time, o.zone),
    `, moving ${WORDS[o.heading]} at `,
    num(en.dec(o.speedKmS, 2), 'km/s'),
    '.',
  ],
  /** A weather satellite's picture is NASA's daily mosaic: `sensor` its imager ("VIIRS", "MODIS"), `gsdM` the pixel in metres */
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Its ${o.sensor} imager swept ${placeInProse(o.place)} into NASA’s daily true-colour mosaic at `,
    num(en.int(o.gsdM), 'm'),
    ' per pixel.',
  ],
  /** A radar image (Sentinel-1): it looks to the side, `deg` off straight down; `dark` when the sun was well down */
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Its radar, looking ',
    num(en.dec(o.deg, 1), '°'),
    ` to the side, imaged ${placeInProse(o.place)} at `,
    num(en.int(o.gsdM), 'm'),
    o.dark ? ' per pixel, in the dark.' : ' per pixel.',
  ],
  /** A photo taken looking straight down (within 1.5°) */
  lookingDown: 'It was looking straight down.',
  /** …or `deg` away from straight down */
  lookingOff: (deg: number): Rich => ['It was looking ', num(en.dec(deg, 1), '°'), ' off straight down.'],
  /** The archive's own cloud estimate for the whole scene (not just the place) */
  cloudCover: (pct: number): Rich => ['Cloud cover across the scene: ', num(en.int(pct), '%'), '.'],

  // ── "Likely watched": a camera that is always on crossed, no picture published ─────────────
  likely: {
    /** What crossed, how high, where from the place and when; `swathKm` the width it records (absent when unknown) */
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `${o.sat} crossed `,
      ...where(o.altKm, o.offset),
      ' at ',
      clock(o.time, o.zone),
      ...(o.swathKm ? [', inside its ', km(o.swathKm), ' swath.'] : ['.']),
    ],
    /** Sentinel-2 / Landsat in daylight, but the photo archive could not be searched */
    archiveFailed: 'It was daylight, so it would have recorded this spot. The archive could not be searched just now.',
    /** …two days on, and the archive has no scene from the pass */
    noScene: 'No scene exists for this pass. Sentinel-2 records only land and coastal water, and may not have scheduled this spot.',
    /** …a recent pass: the scene may not be published yet */
    notYet:
      'It was daylight, so it almost certainly recorded this spot. ' +
      'No scene from this pass has been published yet; archives can lag by a day or more.',
    /** A weather satellite at night */
    dark: 'It was dark here. Weather imagers keep scanning at night in infrared, so it saw your clouds, not your streets.',
    /** A weather satellite whose daily mosaic (NASA's) could not be checked at the place */
    mosaicUnconfirmed: 'NASA’s daily mosaic for this pass could not be confirmed at your spot.',
    /** A weather satellite whose pictures are not published */
    notPublished: 'Its images feed weather forecasts; they are not published as pictures we can show.',
  },

  // ── "Could have pointed here": a steerable or private camera was in range ──────────────────
  could: {
    /** What passed and when; `offset` absent when straight overhead ("…, directly overhead.") */
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${o.sat} passed within view at `,
      clock(o.time, o.zone),
      ...(o.offset ? [', ', km(o.offset.km), ` to the ${WORDS[o.offset.dir]}.`] : [', directly overhead.']),
    ],
    /** A commercial camera that records a fixed strip all the time (Planet's Doves), privately. Starts with the place */
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      `${capitalize(placeInProse(o.place))} was inside its `,
      km(o.swathKm),
      ' swath. Its operator does not publish where it imaged, so we can’t know whether it did.',
    ],
    /**
     * A radar satellite. `deg`: how far it would have pointed to the side, absent when it passed straight over;
     * `openArchive`: its operator publishes every image (Sentinel-1), so we looked and found none, else we can't know
     */
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Radar sees through cloud and darkness. ',
      ...(o.deg === undefined ? [] : ['Pointing ', num(en.dec(o.deg, 1), '°'), ' to the side, ']),
      `${o.deg === undefined ? 'It' : 'it'} could have mapped ${placeInProse(o.place)}.`,
      o.openArchive ? ' We found no published image of it from this pass.' : ' We can’t know whether it did.',
    ],
    /** A steerable camera. `deg`: how far off straight down it would have had to point, absent when it passed straight over */
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['Looking straight down, '] : ['Pointing ', num(en.dec(o.deg, 1), '°'), ' off straight down, ']),
      `it could have watched ${placeInProse(o.place)}. We can’t know whether it did.`,
    ],
  },

  // ── "Passed overhead": it crossed your sky ─────────────────────────────────────────────────
  /**
   * How high, when, how far above your horizon (`elevationDeg`), and toward which direction; `toward` is absent near
   * the zenith (80° and up), where a direction means nothing: "almost straight up"
   */
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat} passed `,
    km(o.altKm),
    ' up at ',
    clock(o.time, o.zone),
    ', ',
    num(en.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' above your horizon, almost straight up.' : ` above your horizon to the ${WORDS[o.toward]}.`,
  ],
  /** At night where you are: a station (the ISS) still lit by the sun is a moving point of light */
  darkStation: 'It was dark where you are. If the station was still in sunlight, it crossed your sky as a bright, steady point.',
})
