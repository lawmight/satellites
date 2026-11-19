/**
 * Ukrainian copy for the share card and the share page (see docs/i18n/uk.md §3.1, §3.3, §3.4, §3.6, §3.7, §4.2, §5):
 * every word the card prints and every word the server writes around it. Pure TypeScript, no DOM, Node or src/
 * imports: the server reads it through cardMessages('uk'), and the app's uk bundle lists this very module.
 *
 * Why it is built this way:
 *  - Ukrainian cannot inflect an inserted name, so the place stands only where the nominative is grammatical: first, as
 *    a title closed by its full stop (the accent block, «*Waterloo.*»), or after a colon («Waterloo: що дивилося сюди
 *    цього тижня»). The lead after it points back with «сюди» / «це місце» / «над цим місцем», and is its own block.
 *  - The satellite always follows its head noun «супутник» (oblique cases fall on it: «смугу огляду супутника
 *    Sentinel-2C»), and a nameless one is «невідомий супутник» in the case each sentence needs. These frames get no
 *    satellite category, so a crewed station is «супутник» too (true: a station is an artificial satellite).
 *  - Counts wrap their verb (21 → «дивився 21 супутник», 22 → «дивилися 22 супутники»); zero is its own sentence
 *    («жоден відомий нам супутник», «жодного знімка»). Numbers and units are tied with a no-break space.
 *  - Dates come from Intl's parts at the place's zone, without Intl's «р.» in stamps («нд, 1 лист. 2026»); in prose the
 *    genitive month and «року» («1 листопада 2026 року»), never a weekday after a preposition. «о» / «об» is chosen from
 *    the clock's hour (об 1:xx and 11:xx).
 *  - Prose compass words are Ukrainian (на + accusative: «рухаючись на південний захід»).
 */
import { fmt } from '../format.js'
import { dateFormat } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('uk')

// ── Days at the place, from Intl's parts ────────────────────────────────────────────────────────────────────────────

const SHORT_DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
const LONG_DAY: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

function dayParts(ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions) {
  const parts = dateFormat('uk', timeZone, opts).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? ''
  return { weekday: get('weekday'), day: get('day'), month: get('month'), year: get('year') }
}
/** «нд, 1 лист. 2026»: the card is the one place a short date carries the year (no «р.») */
const dayYear = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone, SHORT_DAY)
  return `${d.weekday}, ${d.day}\u00a0${d.month} ${d.year}`
}
/** «1 лист. 2026» */
const dateYear = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone, SHORT_DAY)
  return `${d.day}\u00a0${d.month} ${d.year}`
}
/** «3 лист.» */
const dayMonth = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone, SHORT_DAY)
  return `${d.day}\u00a0${d.month}`
}
/** «1 листопада 2026 року» (prose) */
const dateProse = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone, LONG_DAY)
  return `${d.day}\u00a0${d.month} ${d.year} року`
}

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** «о» before a clock, «об» when its hour is read «одна» or «одинадцята» */
const o = (clock: string) => {
  const h = parseInt(clock, 10)
  return h === 1 || h === 11 ? 'об' : 'о'
}
/** The full stop after the place, unless it was cut short or already ends on a stop («…», «D.C.») */
const stop = (cut: boolean, place: string) => (cut || /[.…!?]$/u.test(place) ? [] : ['.'])
/** The headline's serif block: the place and its full stop */
const head = (place: string, cut: boolean) => accent(place, ...stop(cut, place))
/** The place as the title of a prose sentence: «Waterloo.» */
const title = (place: string) => (/[.…!?]$/u.test(place) ? place : `${place}.`)

/** «супутник Sentinel-2C» / «невідомий супутник» (nominative and accusative alike) */
const sat = (s: SatName) => (s !== undefined ? `супутник ${s}` : 'невідомий супутник')
/** «Супутник Sentinel-2C» / «Невідомий супутник», opening a sentence */
const Sat = (s: SatName) => (s !== undefined ? `Супутник ${s}` : 'Невідомий супутник')
/** «супутника Sentinel-2C» / «невідомого супутника» (genitive) */
const satGen = (s: SatName) => (s !== undefined ? `супутника ${s}` : 'невідомого супутника')

/** «сюди дивився 21 супутник» · «сюди дивилися 22 супутники» · «…7 супутників» · «…1,5 супутника»; zero: «жоден» */
const watchedHere = (n: number) =>
  n <= 0
    ? 'сюди не дивився жоден відомий нам супутник'
    : f.plural(n, {
        one: `сюди дивився ${count(n)}\u00a0супутник`,
        few: `сюди дивилися ${count(n)}\u00a0супутники`,
        many: `сюди дивилися ${count(n)}\u00a0супутників`,
        other: `сюди дивилися ${count(n)}\u00a0супутника`,
      })
const cap = (s: string) => s.charAt(0).toLocaleUpperCase('uk') + s.slice(1)
/** «знімок · знімки · знімків · знімка» */
const images = (n: number) => f.plural(n, { one: 'знімок', few: 'знімки', many: 'знімків', other: 'знімка' })

/** Moving or offset: на + accusative, 0 north … 7 northwest */
const COMPASS = ['північ', 'північний схід', 'схід', 'південний схід', 'південь', 'південний захід', 'захід', 'північний захід']
/** « об 11:21 EST, 1 листопада 2026 року» */
const at = (w?: CardWhen) => (w ? ` ${o(w.clock)} ${w.clock}\u00a0${w.zone}, ${dateProse(w.ms, w.timeZone)}` : '')
/** «, рухаючись на південь» (its subject is the sentence's satellite) */
const moving = (heading?: number) => (heading !== undefined && COMPASS[heading] ? `, рухаючись на ${COMPASS[heading]}` : '')

const uk: CardMessages = {
  // ── The headline: the place first, as a title, in the serif; the lead after it ─────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [head(place, cut), `${cap(watchedHere(satellites))}.`],
  headlineBy: {
    imaged: (s: SatName, place: string, cut: boolean): Rich => [head(place, cut), `Сюди дивився ${sat(s)}.`],
    // The lead wraps at about 24 characters: the no-break space keeps «в» with «смугу» (§6.3).
    likely: (s: SatName, place: string, cut: boolean): Rich => [head(place, cut), `Це місце потрапило в\u00a0смугу огляду ${satGen(s)}.`],
    could: (s: SatName, place: string, cut: boolean): Rich => [head(place, cut), `Сюди міг дивитися ${sat(s)}.`],
    overhead: (s: SatName, place: string, cut: boolean): Rich => [head(place, cut), `Над цим місцем пролетів ${sat(s)}.`],
  },
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [head(place, cut), `Цього тижня ${watchedHere(satellites)}.`],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  // «Оприлюднено» agrees with nothing, so only the noun changes; removing «щонайменше» changes no other word.
  photos: (n: number, atLeast: boolean) =>
    n <= 0 ? 'Не оприлюднено жодного знімка.' : `Оприлюднено ${atLeast ? 'щонайменше ' : ''}${count(n)}\u00a0${images(n)}.`,
  archiveDown: 'Архіви не відповіли, тож зараз ми не можемо порахувати оприлюднені знімки.',
  archiveDownShort: 'Архіви знімків не відповіли.',
  cloud: {
    only: {
      sub: (_pct: number) => 'Під хмарами. Видно лише хмари.',
      chip: (pct: number) => `Під хмарами · ${f.int(pct)}%`,
      post: (_pct: number) => 'Видно лише хмари.',
      desc: (pct: number) => `Видно лише хмари (${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `Переважно хмари: ${f.int(pct)}% кадру.`,
      chip: (pct: number) => `Переважно хмари · ${f.int(pct)}%`,
      post: (pct: number) => `Видно переважно хмари (${f.int(pct)}%).`,
      desc: (pct: number) => `Видно переважно хмари (${f.int(pct)}%).`,
    },
    // «закрили», never «накрили» (fire, §8)
    spot: { sub: 'Хмари над самою точкою.', chip: 'Хмари над точкою', post: 'Точку закрили хмари.', desc: 'Точку закрили хмари.' },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock}\u00a0${zone}`,
  weekTo: (ms: number, timeZone: string) => `7\u00a0днів до ${dateYear(ms, timeZone)}`,
  lastWeek: 'Останні 7\u00a0днів',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'Висота',
    elevation: 'Над горизонтом',
    speed: 'Швидкість',
    offNadir: 'Від надиру',
    pixel: 'Піксель',
    mosaicPixel: 'Піксель мозаїки',
    closest: 'До траси',
  },
  lane: { imaged: 'Знімок', likely: 'Імовірно', could: 'Можливо', overhead: 'У небі' },
  unit: { km: 'км', m: 'м', kmPerSecond: 'км/с' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) =>
    metres >= 1000 ? `${f.int(metres / 1000)}\u00a0км` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)}\u00a0м`,
  distance: (km: number) => `${f.int(km)}\u00a0км`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)}\u00a0км` : `${f.int(km * 1000)}\u00a0м`),
  geometry: 'Геометрія прольоту · північ угорі',
  note: {
    imageInApp: 'Знімок відкривається в застосунку',
    imageUnavailable: 'Знімок зараз недоступний',
    commercial: 'Комерційний архів, закритий',
    // "no public image yet": the image may exist and not be published, so «оприлюднено», not «знімка немає».
    inSwath: 'У смузі огляду, ще не оприлюднено',
    groundTrack: 'Траса в момент зближення',
  },
  acquiring: 'Зчитування…',
  // The week's lead can be radar, which is not a photo: «знімків».
  noPublicPhoto: 'Цього тижня знімків не оприлюднено',
  noPhoto: 'Немає знімка для показу',
  look: {
    closest: 'Кадр зблизька',
    lastClear: 'Останній ясний кадр',
    clouded: 'Під хмарами',
    radar: 'Радар',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  // A lone label (chips, the plan plate's callout); sentences say «невідомий супутник» themselves.
  aSatellite: 'Супутник',
  invite: 'Що дивилося на тебе?',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // Four lines at the card's 88 px: «щось дивилося» is wider than the column (§3.1). The accent ends the sentence.
  hero: [['Цього тижня'], ['щось'], ['дивилося'], ['на ', accent('тебе'), '.']] as Rich[],
  enterAnyPlace: 'Обери місце на Землі',
  defaultPlace: 'Пальма Джумейра',
  defaultAlt:
    'Справжній знімок Пальми Джумейра (Дубай) із супутника Sentinel-2, а поруч рядок «Цього тижня щось дивилося на тебе. Обери місце на Землі».',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Цього тижня щось дивилося на тебе.',
    description:
      'Введи будь-яке місце на Землі. Побачиш усі супутники, що пролітали над ним за останні 7\u00a0днів, і справжні знімки, які вони зробили.',
    placeTitle: (place: string) => `${place}: що дивилося сюди цього тижня`,
    placeDescription: (place: string) =>
      `${place}: усі супутники, що пролітали тут за останні 7\u00a0днів, і справжні знімки, які вони зробили. Що дивилося на тебе цього тижня?`,
    opening: ['Відкриваємо ', accent('Watched')] as Rich,
  },
  crossed: (p: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const alt = p.altitudeKm !== undefined ? ` на висоті ${f.int(p.altitudeKm)}\u00a0км` : ''
    // Overhead: the place is what it crossed («Над цим місцем пролетів…»); a picture's pass says how high it flew.
    const lead = p.verdict === 'overhead' ? `Над цим місцем${alt} пролетів ${sat(p.sat)}` : `${Sat(p.sat)} пролетів${alt || ' над цим місцем'}`
    return `${title(p.place)} ${lead}${at(p.when)}${moving(p.heading)}.`
  },
  // The satellite is the subject, so «рухаючись» says the satellite moved, not the place.
  withinView: (p: PassFacts) => `${title(p.place)} ${Sat(p.sat)} мав це місце в полі зору${at(p.when)}${moving(p.heading)}.`,
  couldHave: 'Він міг дивитися сюди. Оператор не повідомляє, чи так було.',
  straightDown: 'Він дивився прямо вниз.',
  offNadir: (deg: number) => `Він дивився вниз із відхиленням ${f.dec(deg, 1)}° від вертикалі.`,
  cloudCover: (pct: number) => `Хмарність: ${f.int(pct)}%.`,
  // The place cannot be the subject of a past tense («Одеса був» ✗): the sentence says «це місце» instead.
  inSwath: (_place: string) => 'Це місце потрапило в смугу огляду його камери.',
  bestFrom: {
    closest: (s: SatName) => `Кадр зблизька зробив ${sat(s)}.`,
    lastClear: (s: SatName) => `Останній ясний кадр зробив ${sat(s)}.`,
    first: (s: SatName) => `Перший знімок зробив ${sat(s)}.`,
  },
  question: 'Що дивилося на тебе цього тижня?',
  cardAlt: {
    withPhoto: (s: SatName) => `Картка для поширення з кадром зблизька цього тижня. Його зробив ${sat(s)}.`,
    plain: 'Картка для поширення.',
  },
}

export default uk
