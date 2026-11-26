/**
 * Russian copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words drawn
 * into the MP4 (see docs/i18n/ru.md §4.1, §5.5, §8, Appendix A).
 *
 * Why it is built this way:
 *  - Dates come from Intl at UTC (the frames' days arrive as UTC midnights): the short month for the readout and the
 *    lists («22 окт. 2015», built from Intl's parts without its «г.»), the genitive month and «года» for what a screen
 *    reader hears («22 октября 2015 года»). The video uppercases them itself («22 ОКТ. 2015»).
 *  - A frame is a «кадр»; a clear look is a «ясный кадр» (1 ясный кадр · 2 ясных кадра · 5 ясных кадров), never
 *    «взгляд».
 *  - The single-season loop (war zones, glaciers) names its season as a whole phrase chosen here («по одному каждую
 *    осень»), never an inserted noun, and says nothing more about why: the season line stays a season (§8).
 *  - The place is inserted only after a colon («Таймлапс: Waterloo»), where no case is needed. Years are never grouped,
 *    and «с 2015 года» keeps «с» (read «с две тысячи…»).
 */
import type en from '../en/timelapse'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'
import type { SeasonName } from '@/imagery/seasonRegions'

const f = fmt('ru')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** A whole count, or a fraction kept (its plural form is `other`) */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))

const SHORT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
const LONG: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

/** A frame's day, month and year at UTC from Intl's parts: «22 окт.», «2015» (no «г.»), the number tied to its month */
function fields(ms: number, opts: Intl.DateTimeFormatOptions): { dayMonth: string; year: string } {
  const parts = dateFormat('ru', 'UTC', opts).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? ''
  return { dayMonth: `${get('day')}\u00a0${get('month')}`, year: get('year') }
}
/** «22 окт.» */
const dayMonth = (ms: number) => fields(ms, SHORT).dayMonth
/** «22 окт. 2015» */
const day = (ms: number) => {
  const d = fields(ms, SHORT)
  return `${d.dayMonth} ${d.year}`
}
/** «22 октября 2015 года» (spoken) */
const daySpoken = (ms: number) => {
  const d = fields(ms, LONG)
  return `${d.dayMonth} ${d.year} года`
}
/** «1 ясный кадр», «2 ясных кадра», «11 ясных кадров» */
const looks = (n: number) =>
  `${count(n)}\u00a0${f.plural(n, { one: 'ясный кадр', few: 'ясных кадра', many: 'ясных кадров', other: 'ясного кадра' })}`
const EACH: Record<SeasonName, string> = {
  winter: 'по одному каждую зиму',
  spring: 'по одному каждую весну',
  summer: 'по одному каждое лето',
  autumn: 'по одному каждую осень',
}
/** «Каждый кадр — один и тот же квадрат 10 × 10 км…»: «обработанный», never «тонированный» (tinted glass, sepia) */
const square = (km: number) =>
  `Каждый кадр\u00a0— один и тот же квадрат ${f.int(km)}\u00a0×\u00a0${f.int(km)}\u00a0км, снятый спутником Sentinel-2 и обработанный так же, как все фото здесь.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Таймлапс: ${place}`,
  title: 'Таймлапс',
  close: 'Закрыть',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Воспроизвести',
  pause: 'Пауза',
  slider: 'Кадр',
  frameList: 'Кадры',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Кадр ${f.int(index)} из ${f.int(total)}: ${daySpoken(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (n: number) => `${looks(n)} · по одному в год`,
  captionSeason: (n: number, season: SeasonName) => `${looks(n)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Один ясный кадр в год · с ${since} года`,
  captionShort: 'Для этого места таймлапса нет',
  captionError: 'Архив не ответил',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  // "aims for": the picker tries the next quarter and may fall back to any clear date, so the season is sought, not sure.
  note: (km: number) => `${square(km)} Для каждого года мы ищем кадр другого сезона. Год без ясного кадра пропущен.`,
  noteOneSeason: (km: number) =>
    `${square(km)} Все кадры сняты в одном и том же сезоне. Год без ясного кадра в этом сезоне пропущен.`,
  source: 'Copernicus Sentinel-2, через Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Просмотр архива',
  choosing: 'Выбор ясных кадров',
  developing: 'Проявка кадров',
  choosingProgress: (done: number, total: number) => `Выбор ясных кадров: ${f.int(done)} из ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Проявка кадров: ${f.int(done)} из ${f.int(total)}`,
  tooCloudy: 'Здесь слишком облачно для таймлапса.',
  tooFew: (n: number, since: number, needed: number) =>
    `${n === 0 ? 'Ни одного ясного кадра' : looks(n)} с ${since} года · нужно ${f.int(needed)}`,
  noAnswer: 'Архив не ответил.',
  unreachable: 'Не удалось связаться с Planetary Computer',
  retry: 'Повторить',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Поделиться',
  linkCopied: 'Ссылка скопирована',
  shareTitle: (place: string) => `${place}: год за годом`,
  video: 'Видео',
  rendering: (pct: number) => `Создание ${pad2(pct)}%`,
  // The button keeps its 132 px through its labels: the button itself says these are about the video.
  videoFailed: 'Не удалось',
  saveVideo: 'Сохранить',
  noH264: 'В этом браузере нет кодировщика H.264: файл воспроизводится в Chrome и Firefox',
  // Latin only (a–z, digits, hyphens): the file name's stand-in for a place with no Latin name.
  fileNamePlace: 'place',
}
export default timelapse
