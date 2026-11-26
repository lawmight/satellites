/**
 * Vietnamese copy for the share card and the share page (see ./en.ts for where each message shows, its slots and its
 * constraints; docs/i18n/vi.md §3.1, §3.4 and §3.6 are the authority on every line here).
 *
 * Pure TypeScript with no DOM, Node or src/ imports, like ./en.ts: the server reads it through cardMessages('vi'), and
 * the app's Vietnamese bundle lists this same module as its 'card' namespace.
 *
 * Why it reads this way:
 *  - Every card leads with the week's N, "[NUM] vệ tinh đã quan sát", and the place (with its full stop, or "tuần
 *    này.") is the serif block. Vietnamese nouns do not inflect and take no plural, so one form serves every count;
 *    zero is its own sentence, "Không vệ tinh nào trong danh mục của chúng tôi quan sát" (vi.md §3.3: the limit is our
 *    catalog, and a negated past takes no *đã*).
 *  - Names are inserted bare: no class noun before the place, nothing attached to it. A nameless satellite is "Một vệ
 *    tinh" as a subject and "một vệ tinh" after a preposition (vi.md §5.2).
 *  - Dates are digits, day before month, as Vietnamese writes them ("CN, 1/11/2026"), built from the place's civil date
 *    (Intl's numeric parts at its zone), never CLDR's "thg" month; prose takes CLDR's full weekday ("Chủ Nhật
 *    1/11/2026") after the clock, the order Vietnamese says a moment in (vi.md §5.5). Clocks and zones arrive formatted.
 *  - Numbers take Vietnamese grouping and the decimal comma (fmt('vi'): "1.715", "7,46"); units are the SI symbols.
 *  - Images are "ảnh" whatever made them (radar, mosaics), "bức ảnh" after a count in a sentence, and a satellite
 *    "ghi lại" (records) rather than "chụp" (photographs) them, so radar is never overclaimed (vi.md §0).
 */
import { fmt } from '../format.js'
import { dateFormat } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('vi')

// ── Days at the place's zone (digits, day before month) ──────────────────────────────────────────────────────────────

/** The calendar's short weekdays and CLDR `vi`'s long ones, Sunday first (as Date.getUTCDay counts). */
const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
const WEEKDAY_LONG = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

const NUMERIC: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric' }

/** The instant's civil date at the zone, and its weekday (read off that date, so no second zone lookup can differ). */
function civil(ms: number, timeZone: string): { day: number; month: number; year: number; dow: number } {
  const parts = dateFormat('vi', timeZone, NUMERIC).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  const day = get('day')
  const month = get('month')
  const year = get('year')
  return { day, month, year, dow: new Date(Date.UTC(year, month - 1, day)).getUTCDay() }
}

/** "1/11/2026" */
const dmy = (ms: number, timeZone: string) => {
  const d = civil(ms, timeZone)
  return `${d.day}/${d.month}/${d.year}`
}
/** "CN, 1/11/2026": a stamp that stands alone, with its weekday (unambiguous in caps) */
const dayYear = (ms: number, timeZone: string) => `${WEEKDAY_SHORT[civil(ms, timeZone).dow]}, ${dmy(ms, timeZone)}`
/** "Chủ Nhật 1/11/2026": a day in a sentence, after its clock */
const proseDay = (ms: number, timeZone: string) => `${WEEKDAY_LONG[civil(ms, timeZone).dow]} ${dmy(ms, timeZone)}`
/** "3/11" */
const dayMonth = (ms: number, timeZone: string) => {
  const d = civil(ms, timeZone)
  return `${d.day}/${d.month}`
}

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/**
 * A compound word held together: the card's lead wraps at spaces, and Vietnamese has a space between a word's
 * syllables, so a line could end on *vệ* with *tinh* on the next (vi.md §6.5). The card's fonts draw U+00A0.
 */
const bind = (s: string) => s.replace(/ /g, '\u00a0')

/** "31 vệ tinh đã quan sát" / "1 vệ tinh đã quan sát" / "Không vệ tinh nào trong danh mục của chúng tôi quan sát" */
const watched = (n: number) =>
  n > 0
    ? f.plural(n, { other: `${f.int(n)}\u00a0${bind('vệ tinh')} ${bind('đã quan sát')}` })
    : `Không ${bind('vệ tinh')} nào trong ${bind('danh mục')} của ${bind('chúng tôi')} ${bind('quan sát')}`
/** The full stop after the place, unless the place was cut short ("…." reads as a typo). */
const stop = (cut: boolean, tail = '.') => (cut ? [] : [tail])

/** A nameless satellite as a subject, and after a preposition */
const A_SATELLITE = 'Một vệ tinh'
const named = (sat: SatName) => sat ?? A_SATELLITE
const namedObject = (sat: SatName) => sat ?? 'một vệ tinh'

const COMPASS = ['bắc', 'đông bắc', 'đông', 'đông nam', 'nam', 'tây nam', 'tây', 'tây bắc']
/** " lúc 11:21 EST, Chủ Nhật 1/11/2026": the clock first, then the day */
const at = (w?: CardWhen) => (w ? ` lúc ${w.clock} ${w.zone}, ${proseDay(w.ms, w.timeZone)}` : '')
/** ", di chuyển về hướng nam" (nothing when the heading is unknown); *hướng* is the satellite's motion (vi.md §3.5) */
const moving = (heading?: number, lead = ', di chuyển') => {
  const word = heading !== undefined ? COMPASS[heading] : undefined
  return word ? `${lead} về hướng ${word}` : ''
}

const card: CardMessages = {
  // ── The headline ──────────────────────────────────────────────────────────────────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut))],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} ${bind('đã quan sát')}`, accent(place, ...stop(cut))],
    likely: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} ${bind('đã quét qua')}`, accent(place, ...stop(cut))],
    could: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} ${bind('có thể đã hướng về')}`, accent(place, ...stop(cut))],
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} ${bind('đã bay qua')}`, accent(place, ...stop(cut))],
  },
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut, ` ${bind('tuần này')}.`))],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  /** "bức" is the count word for a picture in a sentence (vi.md §5.3) */
  photos: (n: number, atLeast: boolean) =>
    n <= 0
      ? 'Không có bức ảnh nào được công bố.'
      : atLeast
        ? f.plural(n, { other: `Ít nhất ${f.int(n)} bức ảnh đã được công bố.` })
        : f.plural(n, { other: `${f.int(n)} bức ảnh đã được công bố.` }),
  archiveDown: 'Các kho lưu trữ ảnh không phản hồi, nên hiện chúng tôi chưa thể đếm số ảnh công khai.',
  archiveDownShort: 'Các kho lưu trữ ảnh không phản hồi.',
  cloud: {
    only: {
      sub: (_pct: number) => 'Mây che kín. Chỉ thấy mây.',
      chip: (pct: number) => `Mây che kín · ${f.int(pct)}%`,
      post: (_pct: number) => 'Chỉ thấy mây.',
      desc: (pct: number) => `Chỉ thấy mây (${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `Phần lớn là mây: ${f.int(pct)}% cảnh ảnh.`,
      chip: (pct: number) => `Phần lớn là mây · ${f.int(pct)}%`,
      post: (pct: number) => `Phần lớn chỉ thấy mây (${f.int(pct)}%).`,
      desc: (pct: number) => `Phần lớn chỉ thấy mây (${f.int(pct)}%).`,
    },
    /** On the card the spot is in the picture (*điểm này*); a post or a description refers back to the place (*điểm đó*) */
    spot: { sub: 'Mây che ngay điểm này.', chip: 'Mây trên điểm này', post: 'Mây che đúng điểm đó.', desc: 'Mây che đúng điểm đó.' },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  /** "7 ngày tính đến 1/11/2026": *tính đến* is "up to and including" */
  weekTo: (ms: number, timeZone: string) => `7 ngày tính đến ${dmy(ms, timeZone)}`,
  lastWeek: '7 ngày qua',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  /** *Góc ngẩng* for the angle, so *Độ cao* stays the altitude's (vi.md §4.1) */
  readout: {
    altitude: 'Độ cao',
    elevation: 'Góc ngẩng',
    speed: 'Tốc độ',
    offNadir: 'Độ nghiêng',
    pixel: 'Điểm ảnh',
    mosaicPixel: 'Điểm ảnh ghép',
    closest: 'Gần nhất',
  },
  /** The results' lanes: the likely lane is its verb, *Quét qua* (vi.md §3.7) */
  lane: { imaged: 'Ảnh', likely: 'Quét qua', could: 'Có thể', overhead: 'Bay qua' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${f.int(km * 1000)} m`),
  geometry: 'Hình học lượt bay · bắc ở trên',
  note: {
    imageInApp: 'Xem ảnh trong ứng dụng',
    /** An image exists, the archive did not send it: *không tải được* (never *chưa có*, which says there is none yet) */
    imageUnavailable: 'Hiện không tải được ảnh',
    commercial: 'Kho thương mại, không công khai',
    inSwath: 'Trong dải quét, chưa có ảnh công khai',
    groundTrack: 'Vệt quỹ đạo lúc gần nhất',
  },
  acquiring: 'Đang thu nhận…',
  noPublicPhoto: 'Tuần này không có ảnh công khai',
  noPhoto: 'Không có ảnh để hiển thị',
  look: {
    closest: 'Chi tiết nhất',
    /** "Last" is the latest, *mới nhất*: *gần nhất* is the readout's "closest" */
    lastClear: 'Không mây mới nhất',
    clouded: 'Mây che kín',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: A_SATELLITE,
  /** The footer's invitation: the share hook's question, as short as the row allows */
  invite: 'Thứ gì đã quan sát bạn?',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // Four lines, the reader alone on the last: "quan sát bạn." (≈ 450 px at 88 px) would leave the 466 px column no margin (vi.md §3.1).
  hero: [['Tuần này,'], ['có thứ gì đó'], ['quan sát'], [accent('bạn'), '.']] as Rich[],
  enterAnyPlace: 'Chọn một nơi trên Trái Đất',
  defaultPlace: 'Palm Jumeirah',
  /** *thật* right after *ảnh*, the agent in *do … chụp* (an optical photograph, so *chụp*) */
  defaultAlt:
    'Ảnh thật của Palm Jumeirah, Dubai, do vệ tinh Sentinel-2 chụp, bên cạnh dòng chữ: Tuần này, có thứ gì đó quan sát bạn. Chọn một nơi trên Trái Đất.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Tuần này, có thứ gì đó quan sát bạn.',
    description:
      'Chọn một nơi bất kỳ trên Trái Đất. Xem mọi vệ tinh đã bay qua nơi đó trong 7\u00a0ngày qua, cùng những hình ảnh thật mà chúng đã ghi lại.',
    /** A heading without a question mark is a noun phrase, *Những gì …*: *Thứ gì …* would be a question cut short */
    placeTitle: (place: string) => `Những gì đã quan sát ${place} tuần này`,
    placeDescription: (place: string) =>
      `Mọi vệ tinh đã bay qua ${place} trong 7\u00a0ngày qua, cùng những hình ảnh thật mà chúng đã ghi lại. Tuần này, thứ gì đã quan sát bạn?`,
    opening: ['Đang mở ', accent('Watched')] as Rich,
  },
  /** "Sentinel-2C đã bay qua Waterloo ở độ cao 795 km lúc 11:21 EST, Chủ Nhật 1/11/2026, di chuyển về hướng nam." */
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) =>
    `${named(o.sat)} đã bay qua ${o.place}${o.altitudeKm !== undefined ? ` ở độ cao ${f.int(o.altitudeKm)} km` : ''}${at(o.when)}${moving(o.heading)}.`,
  /**
   * The place leads: "[SAT] passed within view of [PLACE]" has no natural Vietnamese verb, and Vietnamese may start a
   * sentence with a name (vi.md §3.6, §5.1 rule 3). The heading then needs its own subject: "khi vệ tinh di chuyển…".
   */
  withinView: (o: PassFacts) =>
    `${o.place} đã nằm trong tầm nhìn của ${namedObject(o.sat)}${at(o.when)}${moving(o.heading, ', khi vệ tinh di chuyển')}.`,
  couldHave: 'Vệ tinh này có thể đã hướng về đây. Nhà vận hành không cho biết điều đó có xảy ra hay không.',
  straightDown: 'Camera hướng thẳng xuống.',
  offNadir: (deg: number) => `Camera nghiêng ${f.dec(deg, 1)}° so với phương thẳng đứng.`,
  cloudCover: (pct: number) => `Lượng mây: ${f.int(pct)}%.`,
  inSwath: (place: string) => `${place} nằm trong dải quét.`,
  bestFrom: {
    closest: (sat: SatName) => `Ảnh chi tiết nhất do ${namedObject(sat)} ghi lại.`,
    lastClear: (sat: SatName) => `Ảnh không mây mới nhất do ${namedObject(sat)} ghi lại.`,
    first: (sat: SatName) => `Ảnh đầu tiên do ${namedObject(sat)} ghi lại.`,
  },
  question: 'Tuần này, thứ gì đã quan sát bạn?',
  cardAlt: {
    withPhoto: (sat: SatName) => `Thẻ chia sẻ của Watched, với ảnh chi tiết nhất trong tuần, do ${namedObject(sat)} ghi lại.`,
    plain: 'Thẻ chia sẻ của Watched.',
  },
}

export default card
