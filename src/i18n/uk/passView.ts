/**
 * Ukrainian copy for the passes: the list grouped by verdict and the view of one pass (see docs/i18n/uk.md §3.5, §3.8,
 * §4.1, §4.2, §5.3, Appendix A).
 *
 * Why it is built this way:
 *  - Every verdict counts passes, so the unit is «проліт» in uk's four plural forms (1 проліт · 2 прольоти · 5 прольотів
 *    · 1,5 прольоту) whatever the group; satellites are counted in full words («12 супутників»), never «суп.».
 *  - Where English would write "all 31 satellites", the count goes in parentheses («Показати всі супутники (31)»), so
 *    «всі» never has to agree with a number.
 *  - Labels are nouns in sentence case (CSS uppercases them); readouts keep the international forms they arrive in
 *    (compass points «SSW», UTC clocks, NORAD ids), and the only abbreviations are units, «висх.» / «низх.».
 *  - Off-nadir is «від надиру» in labels and readouts; elevation is «над горизонтом», so the geostationary strip cell
 *    needs no unit after its degrees (the label already says "up").
 *  - Footnotes put an absent picture in the genitive of negation («немає знімка»), and the satellite after its head
 *    noun («У супутника Sentinel-2C немає знімка…»), so no name is ever inflected.
 */
import type en from '../en/passView'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'
import type { Verdict } from '@/ui/results/lib/meta'

const f = fmt('uk')

/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** «проліт · прольоти · прольотів · прольоту»: the form a number takes (every verdict counts passes, DESIGN §7) */
const passes = (n: number) => f.plural(n, { one: 'проліт', few: 'прольоти', many: 'прольотів', other: 'прольоту' })
/** «1 проліт», «31 проліт», «12 прольотів» */
const passCount = (n: number) => `${count(n)}\u00a0${passes(n)}`
/** «25 відсотків» (spoken: a screen reader would read «%» without its case) */
const percentSpoken = (p: number) => {
  const r = Math.round(p)
  return `${f.int(r)}\u00a0${f.plural(r, { one: 'відсоток', few: 'відсотки', many: 'відсотків', other: 'відсотка' })}`
}
/** «Sentinel-2C, нд, 1 лист., 16:14»: the day already holds a comma, so the clock gets one too */
const who = (sat: string, day: string, time: string) => `${sat}, ${day}, ${time}`
/** «щохвилини», «раз на 10 хвилин», «раз на 2 хвилини», «раз на 21 хвилину» (на + accusative) */
const cadence = (min?: number) =>
  !min
    ? 'раз на кілька хвилин'
    : min === 1
      ? 'щохвилини'
      : `раз на ${count(min)}\u00a0${f.plural(min, { one: 'хвилину', few: 'хвилини', many: 'хвилин', other: 'хвилини' })}`

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'За цей час над цим місцем не пролетів жоден відомий нам супутник. Таке буває рідко. Якщо якесь джерело даних не працювало, про це сказано в примітках вище.',
  imagedOrder: 'кадр зблизька, далі найновіші',
  count: (n: number, _verdict: Verdict) => passCount(n),
  countStack: (n: number, _verdict: Verdict): NumPart => num(count(n), passes(n)),
  sats: (n: number) => `${count(n)}\u00a0${f.plural(n, { one: 'супутник', few: 'супутники', many: 'супутників', other: 'супутника' })}`,
  showAllSats: (n: number) => `Показати всі супутники (${f.int(n)})`,
  showAllRows: (n: number) => `Показати всі рядки (${f.int(n)})`,
  showMore: (n: number) => `Показати ще ${f.int(n)}`,
  left: (n: number) => `ще ${f.int(n)}`,
  showFewer: 'Згорнути',
  tag: {
    mosaic: 'Мозаїка',
    radar: 'Радар',
    cloudedPct: (pct: number) => `Хмарно · ${f.int(pct)}%`,
    cloudedAtSpot: 'Хмари в точці',
  },
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day}, ${o.time}\u00a0${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `хмарність ${percentSpoken(o.cloudPct)}` : undefined,
      o.clouded ? 'під хмарами' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `${f.dec(deg, 1)}° від надиру`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)}\u00a0км`,
  cloudPct: (pct: number) => `хмарність ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `Розгорнути знімок: ${who(sat, day, time)}`,
  expandTitle: 'Розгорнути знімок',
  // The adverb «востаннє» agrees with nothing: «останній» beside «нд» (неділя) read as a broken "last Sunday".
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${passCount(o.passes)}, востаннє: ${o.day}, ${o.time}`,
  latest: 'Востаннє ',
  // The closest approach's label (never «найближчий», which reads "the next one" right under «Останній»).
  closest: 'Зближення ',
  cloudChip: 'Хмари',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Знімки',
  planSection: 'Схема прольоту',
  geometry: 'Геометрія',
  replay: 'Повтор',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Знімок повного диска: один кадр усього, що бачить супутник. Тут ${pixel} на піксель. Деталей мало, але знімок справжній і найновіший з оприлюднених. Такі знімки супутник робив увесь тиждень ${cadence(cadenceMin)}.`,
  mosaicNote: (gsdM: number) =>
    `Добова мозаїка: NASA щодня зшиває смуги огляду в один знімок, ${f.int(gsdM)}\u00a0м на піксель. Деталей мало, але мозаїка справжня й зроблена в день цього прольоту.`,
  radarNote:
    'Радарний знімок, а не фото: супутник Sentinel-1 посилає мікрохвилі й записує їхнє відлуння, тож хмари й темрява йому не заважають. Яскравість показує, як сильно поверхня відбиває їх: будівлі й нерівний ґрунт яскраві, спокійна вода темна.',
  noImage: {
    openArchive: (sat: string) => `У супутника ${sat} немає знімка цієї точки з цього прольоту. Схема прольоту.`,
    // The operator is the satellite's (a company), never «оператор радарів», a military job (§8).
    radarPrivate: 'Оприлюдненого знімка немає: архів оператора цього радарного супутника закритий. Схема прольоту.',
    commercialPrivate: 'Оприлюдненого знімка немає: комерційні архіви закриті. Схема прольоту.',
    noneToShow: 'З цього прольоту немає знімка, який можна показати. Схема прольоту.',
    archiveDown: 'Архів зараз не вдалося переглянути. Схема прольоту.',
    noScene: 'Кадру з цього прольоту не існує. Схема прольоту.',
    notYet: 'Оприлюдненого кадру з цього прольоту ще немає. Кадри Sentinel-2 та Landsat зазвичай з’являються протягом доби.',
    crewed: 'Пілотовані станції мають камери, але їхні фото не публікують із прив’язкою до місця й часу.',
    unavailable: 'Знімок цього прольоту недоступний.',
  },
  links: {
    openToSave: 'Відкрити знімок, щоб зберегти',
    downloading: 'Збереження…',
    download: 'Зберегти знімок',
    viewSource: (archive: string) => `Джерело · ${archive}`,
  },
  spot: {
    checking: 'Читаємо піксель у твоїй точці…',
    clear: 'Над твоєю точкою ясно.',
    cirrus: 'Над твоєю точкою позначено тонкі перисті хмари. Знімок може бути м’якшим.',
    cloud: 'Над твоєю точкою хмари.',
    shadow: 'Твоя точка була в тіні від хмар.',
  },

  // ── the readout strip ───────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Висота',
    elevation: 'Над горизонтом',
    offNadir: 'Від надиру',
    pixel: 'Піксель',
    band: 'Діапазон',
    sun: 'Сонце',
    cloud: 'Хмарність',
    // Strip labels wrap in a ~75 px cell: the no-break space keeps «в» with its word («ХМАРИ / В ТОЧЦІ»).
    cloudAtSpot: 'Хмари в\u00a0точці',
  },
  band: { infrared: 'Тепловий', visible: 'Видимий', colour: 'Колір' },
  spotValue: { clear: 'Ясно', cirrus: 'Перисті', cloud: 'Хмари', shadow: 'Тінь' },
  unit: {
    km: 'км',
    m: 'м',
    kmS: 'км/с',
    // The label «Над горизонтом» already says "up": nothing follows the degrees.
    up: '',
    mosaic: 'мозаїка',
    // «25% кадру»: the whole scene's share, in the genitive
    scene: 'кадру',
    sun: { day: 'день', twilight: 'сутінки', night: 'ніч' },
  },

  // ── 01 / Geometry ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'Зближення · UTC',
    // Nowrap labels in a ~153 px column: «місцевий» pairs with «UTC» in the cell beside it, as English "local" does.
    closestLocal: 'Зближення · місцевий',
    groundDistance: 'Відстань до траси',
    elevationFromYou: 'Над твоїм горизонтом',
    groundSpeed: 'Шляхова швидкість',
    heading: 'Курс',
    sunElevation: 'Висота Сонця',
    fieldOfRegard: 'Зона огляду',
    swath: 'Смуга огляду',
    inSwath: 'У смузі огляду',
    inView: 'У полі зору',
    window: 'Вікно',
    noradPass: 'NORAD · проліт',
    // «Лінія» alone, as in «Швидкість лінії тут» on the same screen: the full term would overflow its cell.
    scanUtc: 'Лінія тут · UTC',
    scanLocal: 'Лінія тут · місцевий',
    aboveEquator: 'Над екватором',
    inYourSky: 'У твоєму небі',
    scanDirection: 'Напрям сканування',
    lineSpeed: 'Швидкість лінії тут',
    coverage: 'Охоплення',
    thisScan: 'Це сканування',
    noradScan: 'NORAD · сканування',
  },
  northToSouth: 'Північ → південь',
  southToNorth: 'Південь → північ',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'День', twilight: 'Сутінки', night: 'Ніч' },
  fullDisc: 'Повний диск',
  // «щохвилини» for one minute: «кожні 1 хв» is not Ukrainian. «кожну 21 хв» agrees with uk's `one`, as the pass
  // paragraph and the geostationary row say it («хв» never inflects).
  everyMin: (n: number) =>
    n === 1 ? 'щохвилини' : `${f.category(n) === 'one' ? 'кожну' : 'кожні'} ${count(n)}\u00a0хв`,
  // The label «У твоєму небі» already says "up": the compass point alone (§4.2).
  upCompass: (compass: string) => compass,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'висх.' : 'низх.'}`,
}
export default passView
