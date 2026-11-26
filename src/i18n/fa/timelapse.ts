/**
 * Persian copy for the time-lapse (see src/i18n/en/timelapse.ts for where each message shows; docs/i18n/fa.md §4.1,
 * §6.4): the player, its waiting screen, its share and video buttons, and the words drawn into the MP4.
 *
 * Why it reads this way:
 *  - The feature's name is «گذر سال‌ها», "the passing of years": one clear look a year. «تایم‌لپس» is a loanword and
 *    «گذر زمان» vaguer. As a title or a button it stands alone; inside a sentence it is quoted and carried by a verb
 *    («ساختن «گذر سال‌ها»»), or it reads as the everyday phrase («برای این مکان گذر سال‌ها نیست» would say the years
 *    do not pass here).
 *  - Each year is chosen («انتخاب می‌شود»): a year does not "aim" in Persian. "Here" in "every photo here" is the
 *    site («این سایت»): «این‌جا» would be the place.
 *  - "Since 2015" is «از سال 2015»: a bare «از 2015» can read "out of 2015". The counted noun replaces the spoken
 *    counter «تا» («3 نما لازم است»).
 *  - Dates are Intl's, Gregorian («22 اکتبر 2015»), because the big year over each frame is the frame's Gregorian year,
 *    drawn by the component: a Solar Hijri date under it would contradict it (fa.md §6.4). Persian months have no
 *    abbreviation, so the date is short as it is.
 *  - A "clear look" is «نمای بی‌ابر»; a frame is «قاب»; "developing" is «ظاهر کردن», the darkroom's verb.
 *  - The share sheet's title is plain text and starts with a Persian word («گذر سال‌ها در [PLACE]»).
 *  - The readout is drawn into the video by a canvas, so it holds no bidi controls; the DOM-only progress label keeps
 *    its percentage in an island, or «%06» would show after the Persian word.
 *  - The video button keeps one width (132 px): «ویدیو», «ساخت 06%», «خطای ویدیو», «ذخیرهٔ ویدیو».
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('fa')
const nb = '\u00a0'
const pad2 = (n: number) => String(n).padStart(2, '0')
const dayMonth = (ms: number) => formatDate('fa', ms, 'UTC', { calendar: 'gregory', day: 'numeric', month: 'long' })
const day = (ms: number) => formatDate('fa', ms, 'UTC', { calendar: 'gregory', day: 'numeric', month: 'long', year: 'numeric' })
/** «یک نمای بی‌ابر» · «11 نمای بی‌ابر» (a counted noun is singular) */
const looks = (n: number) => (n === 1 ? 'یک نمای بی‌ابر' : `${f.int(n)}${nb}نمای بی‌ابر`)
const EACH: Record<SeasonName, string> = {
  winter: 'یکی در هر زمستان',
  spring: 'یکی در هر بهار',
  summer: 'یکی در هر تابستان',
  autumn: 'یکی در هر پاییز',
}
const square = (km: number) =>
  `هر قاب همان مربع ${f.int(km)}${nb}کیلومتری است که ماهواره‌های Sentinel-2 گرفته‌اند و رنگ و نورش مثل همهٔ تصویرهای این سایت تنظیم شده است.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `گذر سال‌ها: ${place}`,
  title: 'گذر سال‌ها',
  close: 'بستن',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'پخش',
  pause: 'مکث',
  slider: 'قاب',
  frameList: 'قاب‌ها',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `قاب ${f.int(index)} از ${f.int(total)}: ${day(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · یکی در هر سال`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `هر سال یک نمای بی‌ابر · از سال ${since}`,
  captionShort: 'برای این مکان «گذر سال‌ها» ساخته نمی‌شود',
  captionError: 'آرشیو پاسخ نداد',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) =>
    `${square(km)} برای هر سال، تا جای ممکن، نمایی از فصلی دیگر انتخاب می‌شود؛ سالی که نمای بی‌ابر ندارد کنار گذاشته می‌شود.`,
  noteOneSeason: (km: number) =>
    `${square(km)} همهٔ سال‌ها از یک فصل‌اند؛ سالی که در آن فصل نمای بی‌ابر ندارد کنار گذاشته می‌شود.`,
  // The service's name never breaks (it wrapped inside the 248 px side column)
  source: 'Copernicus Sentinel-2، از طریق Planetary\u00a0Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'فهرست‌برداری از آرشیو',
  choosing: 'انتخاب نماهای بی‌ابر',
  developing: 'ظاهر کردن قاب‌ها',
  // Spoken, so the counts are not padded.
  choosingProgress: (done: number, total: number) => `انتخاب نماهای بی‌ابر، ${f.int(done)} از ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `ظاهر کردن قاب‌ها، ${f.int(done)} از ${f.int(total)}`,
  tooCloudy: 'این‌جا برای ساختن «گذر سال‌ها» بیش از حد ابری است.',
  // «هیچ نمای بی‌ابری از سال 2015 · 3 نما لازم است»: zero is handled first (CLDR's one also holds 0)
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'هیچ نمای بی‌ابری' : looks(count)} از سال ${since} · ${f.int(needed)}${nb}نما لازم است`,
  noAnswer: 'آرشیو پاسخ نداد.',
  unreachable: 'دسترسی به Planetary Computer ممکن نشد',
  retry: 'تلاش دوباره',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'اشتراک‌گذاری',
  linkCopied: 'پیوند کپی شد',
  shareTitle: (place: string) => `گذر سال‌ها در ${place}`,
  video: 'ویدیو',
  // The percentage is a left-to-right island, or «06%» draws «%06» after the Persian word
  rendering: (pct: number) => `ساخت \u2066${pad2(pct)}%\u2069`,
  videoFailed: 'خطای ویدیو',
  saveVideo: 'ذخیرهٔ ویدیو',
  // A video encoder is «کدگذار»; «رمزگذار» is an encryptor
  noH264: 'این مرورگر کدگذار H.264 ندارد: فایل در Chrome و Firefox پخش می‌شود',
  fileNamePlace: 'place',
}
export default timelapse
