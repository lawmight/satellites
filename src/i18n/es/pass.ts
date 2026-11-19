/**
 * Spanish copy for one pass's paragraph (see src/i18n/en/pass.ts; docs/i18n/es.md §3.4 is the authority on these
 * sentences, §5 on their slots).
 *
 * Why it reads this way:
 *  - The satellite's name is a bare subject (*Sentinel-2C pasó…*), never with an article, and nothing agrees with it;
 *    after it the sentences drop the pronoun (*Miraba…*, *Su franja…*, *Su operador…*), so its gender never shows.
 *  - The place is never a subject and never referred back to with *lo* or *la*: it is a direct object with no personal
 *    *a* (*Su franja de 24 km cubría Waterloo*, *pudo haber observado Waterloo*) or follows a preposition with no
 *    contraction (*llegó a [PLACE]*, *una imagen de [PLACE]*); *lo hizo* refers to the action, never to the place.
 *  - Dated facts in the preterite (*pasó*, *llegó*), what was going on during the pass in the imperfect (*Miraba…*,
 *    *Aquí era de noche*, *cubría*); *pudo haber* + participle for what we cannot know (never *pudo* + infinitive,
 *    which reads "managed to"). No gerund of a later action: *rumbo al sur*, not *moviéndose hacia el sur*.
 *  - Clocks arrive written (with their zone, one mono part); *a las* becomes *a la* before a clock that starts with
 *    `01:` (and *hacia las* / *hacia la* the same way). Numbers go through fmt('es'): decimal comma, 5 digits and up
 *    grouped with a no-break space (*35 778 km*), percent attached (*25%*), degrees `°`.
 *  - Directions have two tables, as English warns: where the satellite was heading (*rumbo al sur*) and where it was
 *    from the place (*61 km al oeste*, *hacia el noroeste*); the 16-point readouts use *O* for *oeste* (`SSO`, `ONO`).
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('es')

/** Where the satellite was heading: "rumbo al sur" (every compass word is masculine, so "al" fits them all) */
const HEADING: Record<Compass8, string> = {
  n: 'norte',
  ne: 'noreste',
  e: 'este',
  se: 'sureste',
  s: 'sur',
  sw: 'suroeste',
  w: 'oeste',
  nw: 'noroeste',
}
/** Where the satellite was from the place: "61 km al oeste", "hacia el noroeste" (the same words, after their own preposition) */
const SIDE: Record<Compass8, string> = HEADING

/** "a las 16:14:21", "a la 01:12:09": the article agrees with the hour */
const aLas = (time: string) => (/^01:/.test(time) ? 'a la' : 'a las')
/** "hacia las 07:49", "hacia la 01:49": about a time */
const haciaLas = (time: string) => (/^01:/.test(time) ? 'hacia la' : 'hacia las')

const km = (n: number) => num(f.int(n), 'km')
/** "10 minutos": a cadence, its unit set like a number's */
const minutes = (n: number) => num(f.int(n), f.plural(n, { one: 'minuto', many: 'minutos', other: 'minutos' }))
const clock = (time: string, zone: string) => num(time, zone)
/** " justo encima a 786 km de altura" / " a 786 km de altura y 61 km al oeste" */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? [' a ', km(altKm), ' de altura y ', km(offset.km), ` al ${SIDE[offset.dir]}`] : [' justo encima a ', km(altKm), ' de altura']

const pass: typeof en = {
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
    ssw: 'SSO',
    sw: 'SO',
    wsw: 'OSO',
    w: 'O',
    wnw: 'ONO',
    nw: 'NO',
    nnw: 'NNO',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} no pasa. Se mantiene a `,
      km(o.altKm),
      o.seat !== undefined ? ` sobre el ecuador, en ${o.seat},` : ' sobre el ecuador',
      ...(o.cadenceMin
        ? [' y cada ', minutes(o.cadenceMin), ' escanea toda la cara de la Tierra que tiene debajo.']
        : [' y escanea toda la cara de la Tierra que tiene debajo.']),
    ],
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `La línea de este escaneo llegó a ${o.place} ${haciaLas(o.time)} `,
      clock(o.time, o.zone),
      `, rumbo al ${HEADING[o.heading]}.`,
    ],
    infrared: 'Aquí era de noche, así que esta imagen es infrarroja: los topes de las nubes, por temperatura; cuanto más fríos, más claros.',
  },

  // ── a pass with a picture ("Observada") ──────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `${o.sat} pasó`,
    ...where(o.altKm, o.offset),
    ` ${aLas(o.time)} `,
    clock(o.time, o.zone),
    `, rumbo al ${HEADING[o.heading]} a `,
    num(f.dec(o.speedKmS, 2), 'km/s'),
    '.',
  ],
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Su sensor ${o.sensor} escaneó ${o.place} para el mosaico diario en color real de la NASA, a `,
    num(f.int(o.gsdM), 'm'),
    ' por píxel.',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Su radar, que miraba de lado a ',
    num(f.dec(o.deg, 1), '°'),
    ` de la vertical, tomó una imagen de ${o.place} a `,
    num(f.int(o.gsdM), 'm'),
    o.dark ? ' por píxel, a oscuras.' : ' por píxel.',
  ],
  lookingDown: 'Miraba directamente hacia abajo.',
  lookingOff: (deg: number): Rich => ['Miraba a ', num(f.dec(deg, 1), '°'), ' de la vertical.'],
  cloudCover: (pct: number): Rich => ['Nubosidad en toda la escena: ', num(f.int(pct), '%'), '.'],

  // ── "Probablemente observada" ────────────────────────────────────────────────────────────
  likely: {
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `${o.sat} pasó`,
      ...where(o.altKm, o.offset),
      ` ${aLas(o.time)} `,
      clock(o.time, o.zone),
      ...(o.swathKm ? [', dentro de su franja de ', km(o.swathKm), '.'] : ['.']),
    ],
    archiveFailed: 'Era de día, así que habría registrado este lugar. Ahora mismo no se puede consultar el archivo.',
    noScene:
      'No existe ninguna escena de esta pasada. Sentinel-2 solo registra tierra firme y aguas costeras, y puede que no tuviera programado este lugar.',
    notYet:
      'Era de día, así que casi con seguridad registró este lugar. ' +
      'Aún no se ha publicado ninguna escena de esta pasada; los archivos pueden tardar un día o más.',
    dark: 'Aquí era de noche. Los sensores meteorológicos siguen escaneando en infrarrojo: vio tus nubes, no tus calles.',
    mosaicUnconfirmed: 'El mosaico diario de la NASA de esta pasada no se pudo confirmar en el punto exacto.',
    notPublished: 'Sus imágenes alimentan los pronósticos meteorológicos; no se publican de forma que podamos mostrarlas.',
  },

  // ── "Pudo haber apuntado aquí" ───────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${o.sat} tuvo este lugar a su alcance ${aLas(o.time)} `,
      clock(o.time, o.zone),
      ...(o.offset ? [', a ', km(o.offset.km), ` al ${SIDE[o.offset.dir]}.`] : [', justo encima.']),
    ],
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'Su franja de ',
      km(o.swathKm),
      ` cubría ${o.place}. Su operador no publica dónde tomó imágenes, así que no podemos saber si lo hizo.`,
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'El radar ve a través de las nubes y en la oscuridad. ',
      ...(o.deg === undefined ? [] : ['Apuntando de lado a ', num(f.dec(o.deg, 1), '°'), ' de la vertical, ']),
      `${o.deg === undefined ? 'Pudo' : 'pudo'} haber tomado una imagen de ${o.place}.`,
      o.openArchive ? ' No encontramos ninguna imagen publicada de este lugar en esta pasada.' : ' No podemos saber si lo hizo.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['Con la cámara mirando directamente hacia abajo, '] : ['Con la cámara a ', num(f.dec(o.deg, 1), '°'), ' de la vertical, ']),
      `pudo haber observado ${o.place}. No podemos saber si lo hizo.`,
    ],
  },

  // ── "Pasó por encima" ────────────────────────────────────────────────────────────────────
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat} pasó a `,
    km(o.altKm),
    ` de altura ${aLas(o.time)} `,
    clock(o.time, o.zone),
    ', a ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' sobre tu horizonte, casi justo encima de ti.' : ` sobre tu horizonte, hacia el ${SIDE[o.toward]}.`,
  ],
  darkStation: 'Donde estás era de noche. Si la estación seguía iluminada por el sol, cruzó tu cielo como un punto brillante que no parpadea.',
}

export default pass
