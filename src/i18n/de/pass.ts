/**
 * German copy for one pass's paragraph (see src/i18n/en/pass.ts for where each sentence shows and its slots;
 * docs/i18n/de.md §3.4, §4.2 and §5 are the authority on every sentence here).
 *
 * Why it reads this way:
 *  - What satellites did is told in Präteritum, the instrument's log (*zog … hinweg*, *blickte*, *kam in Sichtweite*),
 *    and German puts the time before the place, then one appended phrase after the verb bracket: *Sentinel-2C zog um
 *    16:14:21 UTC in 786 km Höhe genau über den Ort hinweg, mit 7,46 km/s Richtung Süden.* A second fact goes inside
 *    the bracket (*in 786 km Höhe und 61 km westlich am Ort vorbei*), so the German order is built here, never from
 *    the English parts (§2.3, §3.4).
 *  - The satellite is the bare subject, singular verb, and no pronoun ever points back to it: its gender is unknown
 *    (*die ISS*, *der Satellit*). The next sentence makes one of our own nouns the subject (*die Kamera*, *das Radar
 *    an Bord*, *der VIIRS-Sensor an Bord*, *der Betreiber*, *der Satellit* for a geostationary one, *die Station*), and
 *    pronouns follow only those. A crewed station is *Die Raumstation ISS* (subjectDe, from the one German names
 *    table): every German writes *die ISS* (§5.2).
 *  - The searched place's name is never repeated in body prose: the headline above shows it, and a bare name next to
 *    a pronoun or a preposition would need a case code cannot give it. Sentences say *den Ort*, *dem Ort*, *deinen
 *    Ort*, *deinem Horizont* (§5.1). The `place` slots are therefore unused.
 *  - Directions take three forms: the noun after *Richtung* and after *im* (*Richtung Süden*, *im Südwesten*: all eight
 *    are masculine, so one table serves both) and the adverb (*61 km westlich*). The readout letters (`compass16`) are
 *    those of German weather maps: *O* for east, *SSO*, *NNO* (§4.2).
 *  - Numbers come from fmt('de') inside num() parts (*786 km*, *7,46 km/s*, *5,4°*, *25 %*: the renderer puts the
 *    no-break space before % for German). Clocks stay as they arrive; every zone goes through zoneDe (CET → MEZ, §6.3),
 *    and no *Uhr* stands beside a zone (§5.5).
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import { zoneDe } from '../../../api/_lib/i18n/card/deZone'
import { subjectDe } from '../../../api/_lib/i18n/card/deNames'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('de')

/** After *Richtung* and after *im*: *Richtung Süden*, *im Südwesten* (every compass noun is masculine, §4.2) */
const NOUN: Record<Compass8, string> = {
  n: 'Norden',
  ne: 'Nordosten',
  e: 'Osten',
  se: 'Südosten',
  s: 'Süden',
  sw: 'Südwesten',
  w: 'Westen',
  nw: 'Nordwesten',
}

/** Where the satellite was from the place: *61 km westlich am Ort vorbei*, *61 km westlich des Ortes* */
const ADVERB: Record<Compass8, string> = {
  n: 'nördlich',
  ne: 'nordöstlich',
  e: 'östlich',
  se: 'südöstlich',
  s: 'südlich',
  sw: 'südwestlich',
  w: 'westlich',
  nw: 'nordwestlich',
}

const km = (n: number) => num(f.int(n), 'km')
const deg1 = (n: number) => num(f.dec(n, 1), '°')
/** "16:14:21 UTC", "10:41:07 MEZ": the clock and its zone, one mono part */
const clock = (time: string, zone: string) => num(time, zoneDe(zone))

/**
 * "[SAT] zog um [TIME] in [ALT] km Höhe genau über den Ort hinweg" / "… in [ALT] km Höhe und [KM] km westlich am Ort
 * vorbei": the crossing, its second fact inside the verb bracket, without the closing punctuation
 */
const crossing = (sat: string, altKm: number, time: string, zone: string, offset?: Offset): Part[] => [
  `${subjectDe(sat)} zog um `,
  clock(time, zone),
  ' in ',
  km(altKm),
  ...(offset ? [' Höhe und ', km(offset.km), ` ${ADVERB[offset.dir]} am Ort vorbei`] : [' Höhe genau über den Ort hinweg']),
]

const pass: typeof en = {
  // The letters of German weather maps and wind reports: *O* is east (§4.2). Readouts only; coordinates keep E and W.
  compass16: {
    n: 'N',
    nne: 'NNO',
    ne: 'NO',
    ene: 'ONO',
    e: 'O',
    ese: 'OSO',
    se: 'SO',
    sse: 'SSO',
    s: 'S',
    ssw: 'SSW',
    sw: 'SW',
    wsw: 'WSW',
    w: 'W',
    wnw: 'WNW',
    nw: 'NW',
    nnw: 'NNW',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    // *Der Satellit* carries the second sentence, so no pronoun follows the bare name. A cadence of one minute is
    // *jede Minute*, never *alle 1 Minute*.
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} zieht nicht vorüber. Der Satellit steht in `,
      km(o.altKm),
      o.seat !== undefined ? ` Höhe über dem Äquator bei ${o.seat}` : ' Höhe über dem Äquator',
      ...(o.cadenceMin
        ? f.plural<Part[]>(o.cadenceMin, {
            one: [' und tastet jede Minute die ganze sichtbare Erdscheibe ab.'],
            other: [' und tastet alle ', num(f.int(o.cadenceMin), 'Minuten'), ' die ganze sichtbare Erdscheibe ab.'],
          })
        : [' und tastet die ganze sichtbare Erdscheibe ab.']),
    ],
    // *gegen* is "about" for a time (§5.5).
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      'Die Scanlinie dieses Bildes erreichte den Ort gegen ',
      clock(o.time, o.zone),
      ` und lief Richtung ${NOUN[o.heading]} weiter.`,
    ],
    infrared: 'Hier war es dunkel, darum zeigt das Bild Infrarot: Wolkenobergrenzen nach Temperatur, je kälter, desto heller.',
  },

  // ── a pass with a picture ("Beobachtet") ─────────────────────────────────────────────────
  // One appended phrase after the bracket: the speed and the heading (§2.3).
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    ...crossing(o.sat, o.altKm, o.time, o.zone, o.offset),
    ', mit ',
    num(f.dec(o.speedKmS, 2), 'km/s'),
    ` Richtung ${NOUN[o.heading]}.`,
  ],
  // *Der VIIRS-Sensor an Bord*: our noun, hyphenated with the acronym (§6.1); *der NASA*, never *NASAs*.
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Der ${o.sensor}-Sensor an Bord erfasste den Ort für das tägliche Echtfarbenmosaik der NASA, mit `,
    num(f.int(o.gsdM), 'm'),
    ' pro Pixel.',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Das Radar an Bord blickte ',
    deg1(o.deg),
    o.dark ? ' zur Seite und bildete den Ort im Dunkeln mit ' : ' zur Seite und bildete den Ort mit ',
    num(f.int(o.gsdM), 'm'),
    ' pro Pixel ab.',
  ],
  lookingDown: 'Die Kamera blickte senkrecht nach unten.',
  lookingOff: (deg: number): Rich => ['Die Kamera war um ', deg1(deg), ' aus der Senkrechten geneigt.'],
  cloudCover: (pct: number): Rich => ['Bewölkung der ganzen Szene: ', num(f.int(pct), '%'), '.'],

  // ── "Vermutlich beobachtet" ──────────────────────────────────────────────────────────────
  likely: {
    // *ihn* is *den Ort* of the same sentence (*über den Ort hinweg*, *am Ort vorbei*).
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      ...crossing(o.sat, o.altKm, o.time, o.zone, o.offset),
      ...(o.swathKm ? ['; der ', km(o.swathKm), ' breite Aufnahmestreifen deckte ihn ab.'] : ['.']),
    ],
    archiveFailed: 'Es war Tag, die Kamera hätte den Ort also aufgenommen. Das Archiv ließ sich gerade nicht durchsuchen.',
    noScene:
      'Zu diesem Überflug gibt es keine Szene. Sentinel-2 zeichnet nur Land und Küstengewässer auf und hat diesen Ort womöglich nicht eingeplant.',
    notYet:
      'Es war Tag, die Kamera hat den Ort also höchstwahrscheinlich aufgenommen. ' +
      'Zu diesem Überflug ist noch keine Szene veröffentlicht; Archive können einen Tag oder länger hinterherhinken.',
    dark: 'Hier war es dunkel. Wettersensoren messen nachts im Infrarot weiter. Gesehen hat der Sensor deine Wolken, nicht deine Straßen.',
    mosaicUnconfirmed: 'Das Tagesmosaik der NASA zu diesem Überflug ließ sich an deinem Ort nicht bestätigen.',
    notPublished: 'Die Daten dieses Sensors fließen in Wettervorhersagen ein; als Bilder, die wir zeigen können, werden sie nicht veröffentlicht.',
  },

  // ── "Konnte hierher blicken" ─────────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${subjectDe(o.sat)} kam um `,
      clock(o.time, o.zone),
      ...(o.offset ? [' in Sichtweite, ', km(o.offset.km), ` ${ADVERB[o.offset.dir]} des Ortes.`] : [' in Sichtweite, genau über dem Ort.']),
    ],
    // Opens on *Der Ort*, our noun; the operator is not the imager, so the camera is named (§3.4).
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'Der Ort lag innerhalb des ',
      km(o.swathKm),
      ' breiten Aufnahmestreifens. Der Betreiber veröffentlicht nicht, wo die Kamera aufgenommen hat; ob dieser Ort dabei war, können wir nicht wissen.',
    ],
    // *es* is *das Radar*, never the satellite.
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Radar sieht durch Wolken und Dunkelheit. ',
      ...(o.deg === undefined
        ? ['Das Radar hätte den Ort kartieren können.']
        : ['Um ', deg1(o.deg), ' zur Seite geneigt, hätte das Radar den Ort kartieren können.']),
      o.openArchive ? ' Von diesem Überflug fanden wir kein veröffentlichtes Bild.' : ' Ob es das getan hat, können wir nicht wissen.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined
        ? ['Mit senkrechtem Blick hätte die Kamera den Ort beobachten können.']
        : ['Um ', deg1(o.deg), ' aus der Senkrechten geschwenkt, hätte die Kamera den Ort beobachten können.']),
      ' Ob sie es getan hat, können wir nicht wissen.',
    ],
  },

  // ── "Überflogen" ─────────────────────────────────────────────────────────────────────────
  // *vorüber*: it crossed the sky, not the spot. Near the zenith, *fast senkrecht über dir*.
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${subjectDe(o.sat)} zog um `,
    clock(o.time, o.zone),
    ' in ',
    km(o.altKm),
    ' Höhe vorüber, ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' über deinem Horizont, fast senkrecht über dir.' : ` über deinem Horizont im ${NOUN[o.toward]}.`,
  ],
  // *die Station … sie*: our noun carries the pronoun (§5.2).
  darkStation: 'Bei dir war es dunkel. Stand die Station noch im Sonnenlicht, dann zog sie als heller, ruhig leuchtender Punkt über deinen Himmel.',
}

export default pass
