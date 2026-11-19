/**
 * Dutch copy for one pass's paragraph (see docs/i18n/nl.md §2, §3.4, §4.3, §5): what crossed, when, where and how it
 * moved; then what that means for the image; then what we cannot know.
 *
 * Why it is built this way:
 *  - One verb carries the first sentence, in Dutch middle-field order: time, then altitude, then the separable
 *    particle last (`vloog om 16:14:21 UTC op 786 km hoogte recht over`), and the movement trails as a phrase
 *    (`met 7,46 km/s naar het zuiden`), never as an English participle (§2).
 *  - The satellite is never referred to by a pronoun or `zijn` (§5): the second sentence makes the camera or the radar
 *    its subject, a geostationary satellite is `de satelliet` with the genderless `zich`, a station is `het station`.
 *  - The place is inserted bare, after `naar`, `over`, `bij` or as an object, never at a sentence's start: the one
 *    English sentence that opens on it (`insideSwath`) says `De plek` instead, and a relative position always takes
 *    `van de plek` (`61 km ten westen van de plek`).
 *  - Directions need three tables, because Dutch words a heading (`naar het zuiden`), a position (`ten zuiden van`)
 *    and a point on the horizon (`in het zuiden`) differently; one noun list feeds all three (§4.3). The 16-point
 *    readouts use the Dutch letters (`ZZW`, `O`); coordinates and seats as written by code stay international.
 *  - `kon`, never `had … kunnen` (§3.4): it states what the camera could do and implies nothing. The open question is
 *    always `Of dat ook gebeurd is, kunnen we niet weten.`, with the comma between its two finite verbs.
 *  - The clock arrives with its zone and is set as one mono part; nothing (`uur`, `plaatselijke tijd`) is added to it.
 *  - A geostationary seat is written in words inside the sentence (`op 0,2° westerlengte`, §4.3): code hands it over in
 *    its international form ("0.2°W"), which is read back here; anything else is kept as it came.
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('nl')

/** The compass noun every direction phrase is built on (§4.3) */
const NOUN: Record<Compass8, string> = {
  n: 'noorden',
  ne: 'noordoosten',
  e: 'oosten',
  se: 'zuidoosten',
  s: 'zuiden',
  sw: 'zuidwesten',
  w: 'westen',
  nw: 'noordwesten',
}
/** Where the satellite was heading: "naar het zuiden" */
const toward = (d: Compass8) => `naar het ${NOUN[d]}`
/** Where it was from the place: "ten westen van de plek" */
const from = (d: Compass8) => `ten ${NOUN[d]} van de plek`
/** Where it stood on the horizon: "in het zuiden" */
const onHorizon = (d: Compass8) => `in het ${NOUN[d]}`

const km = (n: number) => num(f.int(n), 'km')
const deg1 = (n: number) => num(f.dec(n, 1), '°')
const clock = (time: string, zone: string) => num(time, zone)

/** "op 0,2° westerlengte" from code's "0.2°W"; a seat in any other form is kept as it came ("op …") */
function seatInWords(seat: string): string {
  const m = /^(\d+(?:\.\d+)?)°([EW])$/.exec(seat)
  if (!m) return `op ${seat}`
  return `op ${f.dec(Number(m[1]), 1)}° ${m[2] === 'W' ? 'westerlengte' : 'oosterlengte'}`
}

/** "op 786 km hoogte recht over" / "op 786 km hoogte voorbij, 61 km ten westen van de plek" (after the clock) */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? [' op ', km(altKm), ' hoogte voorbij, ', km(offset.km), ` ${from(offset.dir)}`] : [' op ', km(altKm), ' hoogte recht over']

/** The question every "could" sentence ends on */
const UNKNOWN = ' Of dat ook gebeurd is, kunnen we niet weten.'

const pass: typeof en = {
  compass16: {
    n: 'N',
    nne: 'NNO',
    ne: 'NO',
    ene: 'ONO',
    e: 'O',
    ese: 'OZO',
    se: 'ZO',
    sse: 'ZZO',
    s: 'Z',
    ssw: 'ZZW',
    sw: 'ZW',
    wsw: 'WZW',
    w: 'W',
    wnw: 'WNW',
    nw: 'NW',
    nnw: 'NNW',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} vliegt niet over. De satelliet staat `,
      km(o.altKm),
      o.seat !== undefined ? ` boven de evenaar ${seatInWords(o.seat)}` : ' boven de evenaar',
      ...(!o.cadenceMin
        ? [' en scant de hele aardschijf onder zich.']
        : f.category(o.cadenceMin) === 'one'
          ? [' en scant elke minuut de hele aardschijf onder zich.']
          : [' en scant elke ', num(f.int(o.cadenceMin), 'minuten'), ' de hele aardschijf onder zich.']),
    ],
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `De scanlijn bereikte ${o.place} rond `,
      clock(o.time, o.zone),
      ` en schoof ${toward(o.heading)}.`,
    ],
    infrared: 'Het was hier donker, dus dit is infrarood: wolkentoppen naar temperatuur, hoe kouder hoe lichter.',
  },

  // ── a pass with a picture ("Bekeken") ────────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `${o.sat} vloog om `,
    clock(o.time, o.zone),
    ...where(o.altKm, o.offset),
    ', met ',
    num(f.dec(o.speedKmS, 2), 'km/s'),
    ` ${toward(o.heading)}.`,
  ],
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `De ${o.sensor}-camera streek over ${o.place} voor het dagelijkse NASA-mozaïek in ware kleuren, met `,
    num(f.int(o.gsdM), 'm'),
    ' per pixel.',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'De radar keek ',
    deg1(o.deg),
    ` opzij en bracht ${o.place} in beeld met `,
    num(f.int(o.gsdM), 'm'),
    o.dark ? ' per pixel, in het donker.' : ' per pixel.',
  ],
  lookingDown: 'De camera keek recht naar beneden.',
  lookingOff: (deg: number): Rich => ['De camera keek ', deg1(deg), ' schuin naar beneden.'],
  cloudCover: (pct: number): Rich => ['Bewolking over de hele opname: ', num(f.int(pct), '%'), '.'],

  // ── "Waarschijnlijk bekeken" ─────────────────────────────────────────────────────────────
  likely: {
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `${o.sat} vloog om `,
      clock(o.time, o.zone),
      ...where(o.altKm, o.offset),
      ...(o.swathKm ? [', binnen de opnamestrook van ', km(o.swathKm), '.'] : ['.']),
    ],
    archiveFailed: 'Het was dag, dus de camera zou deze plek hebben vastgelegd. Het archief kon nu niet worden doorzocht.',
    noScene:
      'Er bestaat geen opname van deze overvlucht. Sentinel-2 neemt alleen land en kustwater op, en heeft deze plek misschien niet ingepland.',
    notYet:
      'Het was dag, dus de camera heeft deze plek vrijwel zeker vastgelegd. ' +
      'Er is nog geen opname van deze overvlucht gepubliceerd; archieven lopen soms een dag of langer achter.',
    dark: 'Het was hier donker. Weercamera’s scannen ’s nachts in infrarood door: ze zagen je wolken, niet je straten.',
    mosaicUnconfirmed: 'Het dagmozaïek van NASA voor deze overvlucht kon op je plek niet worden bevestigd.',
    notPublished: 'De beelden gaan naar weersverwachtingen; ze worden niet gepubliceerd als beelden die we kunnen tonen.',
  },

  // ── "Kon hierheen kijken" ────────────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${o.sat} kwam om `,
      clock(o.time, o.zone),
      ...(o.offset ? [' binnen bereik, ', km(o.offset.km), ` ${from(o.offset.dir)}.`] : [' binnen bereik, recht boven de plek.']),
    ],
    // English opens on the place; a Dutch sentence never does (§5), so the place is `De plek`.
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'De plek lag binnen de opnamestrook van ',
      km(o.swathKm),
      '. De exploitant maakt niet bekend waar de camera opnamen maakte; of dat hier ook gebeurd is, kunnen we niet weten.',
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Radar kijkt door wolken en duisternis heen. ',
      ...(o.deg === undefined
        ? [`De radar kon ${o.place} in kaart brengen.`]
        : [deg1(o.deg), ` opzij gericht kon de radar ${o.place} in kaart brengen.`]),
      o.openArchive ? ' We vonden geen gepubliceerd beeld van deze overvlucht.' : UNKNOWN,
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['Recht naar beneden gericht'] : [deg1(o.deg), ' schuin naar beneden gericht']),
      ` kon de camera naar ${o.place} kijken.`,
      UNKNOWN,
    ],
  },

  // ── "Vloog over je heen" ─────────────────────────────────────────────────────────────────
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat} vloog om `,
    clock(o.time, o.zone),
    ' op ',
    km(o.altKm),
    ' hoogte over, ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' boven je horizon, bijna recht omhoog.' : ` boven je horizon ${onHorizon(o.toward)}.`,
  ],
  darkStation:
    'Het was donker waar je bent. Als het station nog in de zon stond, trok het over je hemel als een helder lichtpunt dat niet knipperde.',
}
export default pass
