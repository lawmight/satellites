/**
 * Russian copy for one pass's paragraph (see docs/i18n/ru.md §2.2, §3.5, §4.2, §5.1, §5.2, §5.5): the sentences under a
 * pass's picture or plan view, in the English order of facts (what crossed, when, where, how it moved → what that
 * means → what we can't know).
 *
 * Why it is built this way:
 *  - The satellite always follows its head noun («Спутник Sentinel-2C пролетел…»), so its verbs and «он / его» have a
 *    gender whatever the name. These messages get no satellite category, so a crewed station is «спутник» here too
 *    (true: a station is an artificial satellite); only «darkStation», which English words for stations, says
 *    «станция».
 *  - The place is never named: Russian would need a case for it. The sentences say «сюда», «это место», «эта точка»;
 *    straight over it is «прямо над этой точкой», never «над головой», which is the overhead verdict's name.
 *  - Directions have three tables: moving takes на + accusative («двигаясь на юг»), an offset from the place к +
 *    dative after «в N км» («в 61 км к западу»), a point in the sky на + prepositional («на северо-западе»). Readouts
 *    keep the Latin abbreviations (compass16).
 *  - A clock follows «в» right after the verb («пролетел в 16:14:21 UTC на высоте…»: time, then where, as Russian
 *    tells it), «около» when it is known to about a minute. A деепричастие always belongs
 *    to the sentence's subject («Спутник … пролетел…, двигаясь на юг»; «Линия … дошла сюда…, двигаясь на север»).
 *  - Off-nadir is «от вертикали» in prose (the label alone says «от надира»). "Passed within view" is «пролетел в зоне
 *    видимости»: it claims no more than the English (never «видел»).
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('ru')

/** Where something moves: на + accusative */
const TOWARD: Record<Compass8, string> = {
  n: 'север',
  ne: 'северо-восток',
  e: 'восток',
  se: 'юго-восток',
  s: 'юг',
  sw: 'юго-запад',
  w: 'запад',
  nw: 'северо-запад',
}
/** Where something lies from the place, after «в N км»: к + dative */
const OFF: Record<Compass8, string> = {
  n: 'северу',
  ne: 'северо-востоку',
  e: 'востоку',
  se: 'юго-востоку',
  s: 'югу',
  sw: 'юго-западу',
  w: 'западу',
  nw: 'северо-западу',
}
/** Where a point stands in the sky: на + prepositional */
const IN_SKY: Record<Compass8, string> = {
  n: 'севере',
  ne: 'северо-востоке',
  e: 'востоке',
  se: 'юго-востоке',
  s: 'юге',
  sw: 'юго-западе',
  w: 'западе',
  nw: 'северо-западе',
}

const km = (n: number) => num(f.int(n), 'км')
const deg1 = (n: number) => num(f.dec(n, 1), '°')
const clock = (time: string, zone: string) => num(time, zone)
/** «прямо над этой точкой на высоте 786 км» / «на высоте 786 км, в 61 км к западу» (after the clock) */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? ['на высоте ', km(altKm), ', в ', km(offset.km), ` к ${OFF[offset.dir]}`] : ['прямо над этой точкой на высоте ', km(altKm)]
/** «каждую минуту», «каждую 21 минуту», «каждые 2 минуты», «каждые 10 минут»: the unit set with its number */
const everyMinutes = (n: number): Part[] =>
  n === 1
    ? ['каждую минуту']
    : [
        f.category(n) === 'one' ? 'каждую ' : 'каждые ',
        num(f.int(n), f.plural(n, { one: 'минуту', few: 'минуты', many: 'минут', other: 'минуты' })),
      ]

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
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `Спутник ${o.sat} не пролетает мимо, а неподвижно висит на высоте `,
      km(o.altKm),
      o.seat !== undefined ? ` над экватором (${o.seat}) и ` : ' над экватором и ',
      ...(o.cadenceMin ? [...everyMinutes(o.cadenceMin), ' снимает всю обращённую к нему сторону Земли.'] : ['снимает всю обращённую к нему сторону Земли.']),
    ],
    // The line is the subject, so «двигаясь» is the line's; the place is «сюда».
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      'Линия сканирования дошла сюда около ',
      clock(o.time, o.zone),
      `, двигаясь на ${TOWARD[o.heading]}.`,
    ],
    // «темно», as English says "dark": an infrared frame is chosen whenever the sun is below 6°, at dusk too. The
    // explanation is its own sentence, so «чем холоднее, тем светлее» takes the colon without a second one before it.
    infrared: 'Здесь было темно, поэтому это инфракрасный снимок. Яркость показывает температуру верхушек облаков: чем холоднее, тем светлее.',
  },

  // ── a pass with a picture («Увидено») ────────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `Спутник ${o.sat} пролетел в `,
    clock(o.time, o.zone),
    ' ',
    ...where(o.altKm, o.offset),
    `, двигаясь на ${TOWARD[o.heading]} со скоростью `,
    num(f.dec(o.speedKmS, 2), 'км/с'),
    '.',
  ],
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Его сенсор ${o.sensor} добавил это место в суточную мозаику NASA в естественных цветах: `,
    num(f.int(o.gsdM), 'м'),
    ' на пиксель.',
  ],
  // «вбок под углом 32,1°»: «глядя на 32,1°» reads first as "looking at". «в темноте» goes with «снял», not the pixel.
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Его радар смотрел вбок под углом ',
    deg1(o.deg),
    o.dark ? ' и снял это место в темноте: ' : ' и снял это место: ',
    num(f.int(o.gsdM), 'м'),
    ' на пиксель.',
  ],
  lookingDown: 'Он смотрел строго вниз.',
  lookingOff: (deg: number): Rich => ['Он смотрел вниз с отклонением ', deg1(deg), ' от вертикали.'],
  cloudCover: (pct: number): Rich => ['Облачность кадра: ', num(f.int(pct), '%'), '.'],

  // ── «Вероятно, увидено» ──────────────────────────────────────────────────────────────────
  likely: {
    // The swath gets its own sentence about the place, so nothing has to agree across the clock.
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `Спутник ${o.sat} пролетел в `,
      clock(o.time, o.zone),
      ' ',
      ...where(o.altKm, o.offset),
      ...(o.swathKm ? ['. Это место попало в его полосу обзора шириной ', km(o.swathKm), '.'] : ['.']),
    ],
    archiveFailed: 'Был день, так что эта точка попала бы в кадр. Архив сейчас не удалось проверить.',
    noScene:
      'Кадра с этого пролёта нет. Sentinel-2 снимает только сушу и прибрежные воды. Возможно, этой точки не было в плане съёмки.',
    notYet:
      'Был день, так что эта точка почти наверняка попала в кадр. ' +
      'Снимок с этого пролёта ещё не опубликован. Архивы могут запаздывать на сутки и больше.',
    // «темно», never «ночь»: this is said whenever the sun is below the horizon, civil twilight included.
    dark: 'Здесь было темно. Метеоспутники продолжают снимать и ночью, в инфракрасном диапазоне, так что этот спутник видел твои облака, а не улицы.',
    mosaicUnconfirmed: 'Не удалось подтвердить, что суточная мозаика NASA с этого пролёта покрывает твою точку.',
    notPublished: 'Его снимки используются в прогнозах погоды. В виде изображений, которые мы могли бы показать, их не публикуют.',
  },

  // ── «Могли смотреть сюда» ────────────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `Спутник ${o.sat} пролетел в `,
      clock(o.time, o.zone),
      ' в зоне видимости',
      ...(o.offset ? [', в ', km(o.offset.km), ` к ${OFF[o.offset.dir]}.`] : [', прямо над этой точкой.']),
    ],
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'Это место попало в его полосу обзора шириной ',
      km(o.swathKm),
      '. Оператор не сообщает, что именно снимал спутник, так что мы не можем знать, смотрел ли он сюда.',
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Радар видит сквозь облака и темноту. ',
      ...(o.deg === undefined ? ['Он мог снять это место.'] : ['Глядя вбок под углом ', deg1(o.deg), ', он мог снять это место.']),
      o.openArchive ? ' Мы не нашли опубликованного снимка с этого пролёта.' : ' Мы не можем знать, так ли это было.',
    ],
    // «отклонив» / «не отклоняя» belong to the subject, the satellite.
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined
        ? ['Не отклоняя камеру, он мог смотреть сюда.']
        : ['Отклонив камеру на ', deg1(o.deg), ' от вертикали, он мог смотреть сюда.']),
      ' Мы не можем знать, так ли это было.',
    ],
  },

  // ── «Над головой» ────────────────────────────────────────────────────────────────────────
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `Спутник ${o.sat} пролетел в `,
    clock(o.time, o.zone),
    ' на высоте ',
    km(o.altKm),
    ', на ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' над твоим горизонтом, почти в зените.' : ` над твоим горизонтом, на ${IN_SKY[o.toward]}.`,
  ],
  darkStation: 'Там, где ты, было темно. Если станцию ещё освещало солнце, она пролетела по твоему небу яркой немигающей точкой.',
}
export default pass
