/**
 * Ukrainian copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words drawn
 * into the MP4 (see docs/i18n/uk.md §4.1, §5.5, §8, Appendix A).
 *
 * Why it is built this way:
 *  - Dates come from Intl at UTC (the frames' days arrive as UTC midnights): the short month for the readout and the
 *    lists («22 жовт. 2015», built from Intl's parts without its «р.»), the genitive month for what a screen reader
 *    hears («22 жовтня 2015 року»). The video uppercases them itself («22 ЖОВТ. 2015»).
 *  - A frame is a «кадр»; a clear look is a «ясний кадр» (ясний кадр · ясні кадри · ясних кадрів · ясного кадру),
 *    never «погляд».
 *  - The single-season loop (war zones, glaciers) names its season as a whole adverb chosen here («по одному щоосені»),
 *    never an inserted noun, and says nothing more about why: the season line stays a season (§8).
 *  - The place is inserted only after a colon («Таймлапс: Київ»), where no case is needed. Years are never grouped.
 */
import type en from '../en/timelapse'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'
import type { SeasonName } from '@/imagery/seasonRegions'

const f = fmt('uk')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))

const SHORT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
const LONG: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

/** A frame's day, month and year at UTC from Intl's parts: «22 жовт.», «2015» (no «р.»), the number tied to its month */
function fields(ms: number, opts: Intl.DateTimeFormatOptions): { dayMonth: string; year: string } {
  const parts = dateFormat('uk', 'UTC', opts).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? ''
  return { dayMonth: `${get('day')}\u00a0${get('month')}`, year: get('year') }
}
/** «22 жовт.» */
const dayMonth = (ms: number) => fields(ms, SHORT).dayMonth
/** «22 жовт. 2015» */
const day = (ms: number) => {
  const d = fields(ms, SHORT)
  return `${d.dayMonth} ${d.year}`
}
/** «22 жовтня 2015 року» (spoken) */
const daySpoken = (ms: number) => {
  const d = fields(ms, LONG)
  return `${d.dayMonth} ${d.year} року`
}
/** «1 ясний кадр», «2 ясні кадри», «11 ясних кадрів» */
const looks = (n: number) =>
  `${count(n)}\u00a0${f.plural(n, { one: 'ясний кадр', few: 'ясні кадри', many: 'ясних кадрів', other: 'ясного кадру' })}`
const EACH: Record<SeasonName, string> = {
  winter: 'по одному щозими',
  spring: 'по одному щовесни',
  summer: 'по одному щоліта',
  autumn: 'по одному щоосені',
}
/** «Кожен кадр — той самий квадрат 10 × 10 км…» */
const square = (km: number) =>
  `Кожен кадр\u00a0— той самий квадрат ${f.int(km)}\u00a0×\u00a0${f.int(km)}\u00a0км, знятий супутником Sentinel-2 та тонований, як і всі фото тут.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Таймлапс: ${place}`,
  title: 'Таймлапс',
  close: 'Закрити',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Відтворити',
  pause: 'Пауза',
  slider: 'Кадр',
  frameList: 'Кадри',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Кадр ${f.int(index)} з ${f.int(total)}: ${daySpoken(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (n: number) => `${looks(n)} · по одному на рік`,
  captionSeason: (n: number, season: SeasonName) => `${looks(n)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Один ясний кадр на рік · з ${since} року`,
  captionShort: 'Для цього місця таймлапсу немає',
  captionError: 'Архів не відповів',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  // "aims for": the picker tries the next quarter and may fall back to any clear date, so the season is sought, not sure.
  note: (km: number) => `${square(km)} Для кожного року шукаємо кадр іншого сезону. Рік без ясного кадру пропущено.`,
  noteOneSeason: (km: number) =>
    `${square(km)} Кожен рік\u00a0— з того самого сезону. Рік без ясного кадру в цьому сезоні пропущено.`,
  source: 'Copernicus Sentinel-2, через Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Перегляд архіву',
  choosing: 'Вибір ясних кадрів',
  developing: 'Проявлення кадрів',
  choosingProgress: (done: number, total: number) => `Вибір ясних кадрів: ${f.int(done)} з ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Проявлення кадрів: ${f.int(done)} з ${f.int(total)}`,
  tooCloudy: 'Тут забагато хмар для таймлапсу.',
  // «із» after a consonant (кадр, кадрів) before the year (read «дві тисячі…»), «з» after a vowel (кадру, кадри).
  tooFew: (n: number, since: number, needed: number) =>
    `${n === 0 ? 'Жодного ясного кадру з' : `${looks(n)} ${f.plural(n, { one: 'із', few: 'з', many: 'із', other: 'з' })}`} ${since} року · потрібно ${f.int(needed)}`,
  noAnswer: 'Архів не відповів.',
  unreachable: 'Не вдалося з’єднатися з Planetary Computer',
  retry: 'Повторити',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Поділитися',
  linkCopied: 'Посилання скопійовано',
  shareTitle: (place: string) => `${place}: рік за роком`,
  video: 'Відео',
  rendering: (pct: number) => `Створення ${pad2(pct)}%`,
  // The button keeps its 132 px through its labels: the button itself says these are about the video.
  videoFailed: 'Не вдалося',
  saveVideo: 'Зберегти',
  noH264: 'У цьому браузері немає кодера H.264: файл відтворюється в Chrome і Firefox',
  // Latin only (a–z, digits, hyphens): the file name's stand-in for a place with no Latin name.
  fileNamePlace: 'place',
}
export default timelapse
