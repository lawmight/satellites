/**
 * Ukrainian copy for one pass's paragraph (see docs/i18n/uk.md §2.2, §3.5, §4.2, §5.1, §5.2, §5.5): the sentences
 * under a pass's picture or plan view, in the English order of facts (what crossed, when, where, how it moved → what
 * that means → what we can't know).
 *
 * Why it is built this way:
 *  - The satellite always follows its head noun («Супутник Sentinel-2C пролетів…»), so its verbs and «він / його»
 *    have a gender whatever the name. These messages get no satellite category, so a crewed station is «супутник» here
 *    too (true: a station is an artificial satellite); only «darkStation», which English words for stations, says
 *    «станція».
 *  - The place is never named: Ukrainian would need a case for it. The sentences say «сюди», «це місце», «ця точка».
 *  - Directions have two tables: moving or offset takes на + accusative («рухаючись на південь», «за 61 км на захід»),
 *    a point in the sky на + locative («на північному заході»). Readouts keep the Latin abbreviations (compass16).
 *  - «о» / «об» before a clock is chosen from its hour (об 1:xx and 11:xx); a participle always belongs to the
 *    sentence's subject.
 *  - Off-nadir is «від вертикалі» in prose (the label alone says «від надиру»).
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('uk')

/** Where something moves, or where it lies from the place: на + accusative */
const TOWARD: Record<Compass8, string> = {
  n: 'північ',
  ne: 'північний схід',
  e: 'схід',
  se: 'південний схід',
  s: 'південь',
  sw: 'південний захід',
  w: 'захід',
  nw: 'північний захід',
}
/** Where a point stands in the sky: на + locative */
const IN_SKY: Record<Compass8, string> = {
  n: 'півночі',
  ne: 'північному сході',
  e: 'сході',
  se: 'південному сході',
  s: 'півдні',
  sw: 'південному заході',
  w: 'заході',
  nw: 'північному заході',
}

const km = (n: number) => num(f.int(n), 'км')
const deg1 = (n: number) => num(f.dec(n, 1), '°')
const clock = (time: string, zone: string) => num(time, zone)
/** «о» before a clock, «об» when its hour is read «одна» or «одинадцята» */
const at = (time: string) => {
  const h = parseInt(time, 10)
  return h === 1 || h === 11 ? 'об' : 'о'
}
/** «на висоті 786 км просто над головою» / «на висоті 786 км, за 61 км на захід,» */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? ['на висоті ', km(altKm), ', за ', km(offset.km), ` на ${TOWARD[offset.dir]},`] : ['на висоті ', km(altKm), ' просто над головою']

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
    // «щохвилини» for 1; «кожну 21 хв» agrees with uk's `one`; «кожні 10 хв» otherwise («хв» never inflects).
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `Супутник ${o.sat} не пролітає. Він нерухомо висить на висоті `,
      km(o.altKm),
      o.seat !== undefined ? ` над екватором (${o.seat})` : ' над екватором',
      ...(o.cadenceMin === 1
        ? [' і щохвилини сканує весь бік Землі під собою.']
        : o.cadenceMin
          ? [
              f.category(o.cadenceMin) === 'one' ? ' і кожну ' : ' і кожні ',
              num(f.int(o.cadenceMin), 'хв'),
              ' сканує весь бік Землі під собою.',
            ]
          : [' і сканує весь бік Землі під собою.']),
    ],
    // The line is the subject, so «рухаючись» is the line's; the place is «сюди».
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      'Лінія цього сканування дійшла сюди близько ',
      clock(o.time, o.zone),
      `, рухаючись на ${TOWARD[o.heading]}.`,
    ],
    infrared: 'Тут була ніч, тож це інфрачервоний знімок: верхівки хмар за температурою, що холодніше, то світліше.',
  },

  // ── a pass with a picture («Побачено») ───────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `Супутник ${o.sat} пролетів `,
    ...where(o.altKm, o.offset),
    ` ${at(o.time)} `,
    clock(o.time, o.zone),
    `, рухаючись на ${TOWARD[o.heading]} зі швидкістю `,
    num(f.dec(o.speedKmS, 2), 'км/с'),
    '.',
  ],
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Його сенсор ${o.sensor} додав це місце до добової мозаїки NASA в природних кольорах: `,
    num(f.int(o.gsdM), 'м'),
    ' на піксель.',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Його радар, дивлячись на ',
    deg1(o.deg),
    ' убік, отримав знімок цього місця: ',
    num(f.int(o.gsdM), 'м'),
    o.dark ? ' на піксель, у темряві.' : ' на піксель.',
  ],
  lookingDown: 'Він дивився прямо вниз.',
  lookingOff: (deg: number): Rich => ['Він дивився вниз із відхиленням ', deg1(deg), ' від вертикалі.'],
  cloudCover: (pct: number): Rich => ['Хмарність кадру: ', num(f.int(pct), '%'), '.'],

  // ── «Імовірно побачено» ──────────────────────────────────────────────────────────────────
  likely: {
    // The swath gets its own sentence about the place: «і» or «та» beside the zone slot would read either way.
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `Супутник ${o.sat} пролетів `,
      ...where(o.altKm, o.offset),
      ` ${at(o.time)} `,
      clock(o.time, o.zone),
      ...(o.swathKm ? ['. Це місце потрапило в його смугу огляду шириною ', km(o.swathKm), '.'] : ['.']),
    ],
    archiveFailed: 'Був день, тож ця точка потрапила б у кадр. Архів зараз не вдалося переглянути.',
    noScene:
      'Кадру з цього прольоту не існує. Sentinel-2 знімає лише суходіл і прибережні води. Можливо, цієї точки не було в плані зйомки.',
    notYet:
      'Був день, тож ця точка майже напевно потрапила в кадр. ' +
      'Знімка з цього прольоту ще не оприлюднено. Архіви можуть запізнюватися на добу й більше.',
    dark: 'Тут була ніч. Метеосупутники сканують і вночі, в інфрачервоному діапазоні, тож цей супутник бачив твої хмари, а не вулиці.',
    mosaicUnconfirmed: 'Не вдалося підтвердити, що добова мозаїка NASA з цього прольоту охоплює твою точку.',
    notPublished: 'Його знімки йдуть у прогнози погоди. Їх не публікують як зображення, які ми могли б показати.',
  },

  // ── «Могли дивитися сюди» ────────────────────────────────────────────────────────────────
  could: {
    // «пролітаючи» belongs to the subject, the satellite.
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `Супутник ${o.sat} мав це місце в полі зору ${at(o.time)} `,
      clock(o.time, o.zone),
      ...(o.offset ? [', пролітаючи за ', km(o.offset.km), ` на ${TOWARD[o.offset.dir]}.`] : [', пролітаючи просто над головою.']),
    ],
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'Це місце потрапило в його смугу огляду шириною ',
      km(o.swathKm),
      '. Оператор не повідомляє, що саме знімав супутник. Ми не можемо знати, чи він дивився сюди.',
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Радар бачить крізь хмари й темряву. ',
      ...(o.deg === undefined ? ['Він міг зняти це місце.'] : ['Дивлячись на ', deg1(o.deg), ' убік, він міг зняти це місце.']),
      o.openArchive ? ' Ми не знайшли оприлюдненого знімка з цього прольоту.' : ' Ми не можемо знати, чи так було.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined
        ? ['Він міг дивитися прямо вниз, сюди.']
        : ['Він міг дивитися сюди з відхиленням ', deg1(o.deg), ' від вертикалі.']),
      ' Ми не можемо цього знати.',
    ],
  },

  // ── «Над головою» ────────────────────────────────────────────────────────────────────────
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `Супутник ${o.sat} пролетів на висоті `,
    km(o.altKm),
    ` ${at(o.time)} `,
    clock(o.time, o.zone),
    ', на ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' над твоїм горизонтом, майже в зеніті.' : ` над твоїм горизонтом, на ${IN_SKY[o.toward]}.`,
  ],
  darkStation: 'Там, де ти, було темно. Якщо станцію ще освітлювало сонце, вона пролетіла твоїм небом яскравою точкою, що не блимає.',
}
export default pass
