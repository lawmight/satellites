/**
 * Arabic copy for the time-lapse, «عبر السنين»: the player, its waiting screen, its share and video buttons, and the
 * words the MP4 draws (see src/i18n/en/timelapse.ts for where each message shows; docs/i18n/ar.md §3.7 "timelapse"
 * and §8 are the authority on every line here).
 *
 * Why it reads this way:
 *  - The feature is «عبر السنين» everywhere (bar, aria, button, share title), never «فاصل زمني» ("time interval") or a
 *    transliteration (ar.md §4.1). A frame is «إطار»; a clear look «نظرة صافية» (f), counted in all six CLDR forms
 *    («نظرة صافية واحدة»، «نظرتان صافيتان»، «3 نظرات صافية»، «11 نظرة صافية»).
 *  - The caption states the method and never a reason: «واحدة كل خريف» for a war zone or a glacier, with no word for
 *    war, destruction or loss (ar.md §8). The place only ever follows a colon: it takes no attached preposition.
 *  - Making the frames is «تحميض» (developing, the darkroom word, on purpose). Steps and buttons are masdars.
 *  - Dates come from Intl in CLDR `ar` at zone 'UTC' (Gregorian, «22 أكتوبر 2015»; Arabic has no short month), and a
 *    year is never grouped («منذ 2015»). No bidi control characters: the video draws these words on a canvas.
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('ar')
const nb = '\u00a0'
const pad2 = (n: number) => String(n).padStart(2, '0')
/** «22 أكتوبر» */
const dayMonth = (ms: number) => formatDate('ar', ms, 'UTC', { day: 'numeric', month: 'long' })
/** «22 أكتوبر 2015» */
const day = (ms: number) => formatDate('ar', ms, 'UTC', { day: 'numeric', month: 'long', year: 'numeric' })
/** «نظرة صافية واحدة» · «نظرتان صافيتان» · «3 نظرات صافية» · «11 نظرة صافية» · «100 نظرة صافية» */
const looks = (n: number) =>
  f.plural(n, {
    zero: 'لا نظرة صافية',
    one: 'نظرة صافية واحدة',
    two: 'نظرتان صافيتان',
    few: `${f.int(n)}${nb}نظرات صافية`,
    many: `${f.int(n)}${nb}نظرة صافية`,
    other: `${f.int(n)}${nb}نظرة صافية`,
  })
/** «واحدة» agrees with «نظرة» (f); the season stays indefinite after «كل» */
const EACH: Record<SeasonName, string> = {
  winter: 'واحدة كل شتاء',
  spring: 'واحدة كل ربيع',
  summer: 'واحدة كل صيف',
  autumn: 'واحدة كل خريف',
}
/** The first sentence of both notes */
const square = (km: number) =>
  `كل إطار هو المربع نفسه بضلع ${f.int(km)}${nb}كم، التقطته أقمار Sentinel-2، وضُبطت ألوانه كسائر الصور هنا.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `عبر السنين: ${place}`,
  title: 'عبر السنين',
  close: 'إغلاق',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'تشغيل',
  pause: 'إيقاف مؤقت',
  slider: 'الإطار',
  frameList: 'الإطارات',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `الإطار ${f.int(index)} من ${f.int(total)}: ${day(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · واحدة كل عام`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `نظرة صافية كل عام · منذ ${since}`,
  captionShort: 'لا عرض عبر السنين لهذا المكان',
  captionError: 'لم يستجب الأرشيف',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) => `${square(km)} يستهدف كل عام موسمًا مختلفًا؛ ويُستبعد العام الذي لا نظرة صافية فيه.`,
  noteOneSeason: (km: number) =>
    `${square(km)} كل الأعوام من الموسم نفسه؛ ويُستبعد العام الذي لا نظرة صافية فيه في ذلك الموسم.`,
  // The service's name never breaks (it wrapped inside the 248 px side column)
  source: 'Copernicus Sentinel-2، عبر Planetary\u00a0Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'جارٍ البحث في الأرشيف',
  choosing: 'جارٍ اختيار النظرات الصافية',
  developing: 'جارٍ تحميض الإطارات',
  // Spoken, so the counts are not padded.
  choosingProgress: (done: number, total: number) => `جارٍ اختيار النظرات الصافية، ${f.int(done)} من ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `جارٍ تحميض الإطارات، ${f.int(done)} من ${f.int(total)}`,
  tooCloudy: 'سحب هذا المكان أكثف من أن تسمح بعرض عبر السنين.',
  // «لا نظرة صافية منذ 2015 · يلزم 3»: label and value after the dot, so `needed` takes no counted noun.
  tooFew: (count: number, since: number, needed: number) => `${looks(count)} منذ ${since} · يلزم ${f.int(needed)}`,
  noAnswer: 'لم يستجب الأرشيف.',
  unreachable: 'تعذّر الوصول إلى Planetary Computer',
  retry: 'إعادة المحاولة',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'مشاركة',
  linkCopied: 'تم نسخ الرابط',
  shareTitle: (place: string) => `عبر السنين: ${place}`,
  video: 'فيديو',
  // The percentage is a left-to-right island, or «06%» draws «%06» after the Arabic words
  rendering: (pct: number) => `جارٍ الإنشاء \u2066${pad2(pct)}%\u2069`,
  videoFailed: 'فشل الفيديو',
  saveVideo: 'حفظ الفيديو',
  // «مرمّز» (encoder) takes the shadda only: a damma is for passives (ar.md §6.6).
  noH264: 'لا يوجد في هذا المتصفح مرمّز H.264: يعمل الملف في Chrome وFirefox',
  fileNamePlace: 'place',
}
export default timelapse
