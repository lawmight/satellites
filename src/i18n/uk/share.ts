/**
 * Ukrainian copy for the share sheet, the post text it prefills and the PNG's file name (see docs/i18n/uk.md §3.7, §7,
 * Appendix A). The card and the share page speak from api/_lib/i18n/card/uk.ts.
 *
 * Why it is built this way:
 *  - Buttons are infinitives measured for the phone row (three in 360 px, ≤ 11 characters each): «Копіювати» sits
 *    right above the link field, so it needs no object; «Зберегти» without «PNG», which would not fit.
 *  - The post opens on the place, alone and closed by a full stop, the one position where Ukrainian needs no case for
 *    a name it cannot inflect; the sentence after it says «сюди» / «це місце». The satellite always follows its head
 *    noun «супутник», so its verbs have a gender. The post gets no satellite category, so a crewed station is
 *    «супутник» too (true: a station is an artificial satellite).
 *  - The day is Intl's genitive («1 листопада»), never a weekday after a preposition; «о» / «об» is chosen from the
 *    clock's hour (об 1:xx and 11:xx); «за місцевим часом» stands for "local".
 *  - File names stay ASCII and English-worded («watched-…-week-…»): they travel through every app and file system.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('uk')

/** «786 км»: the satellite's altitude, whole kilometres */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0км`
/** «10 м», «2 км»: a pixel's size, whole metres or whole kilometres from 1 000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0км` : `${f.int(m)}\u00a0м`)
/** «о» before a clock, «об» when the hour is read «одна» or «одинадцята» */
const at = (clock: string) => {
  const h = parseInt(clock, 10)
  return h === 1 || h === 11 ? 'об' : 'о'
}
/** «1 листопада о 10:41 за місцевим часом» (no weekday: it would need a case Intl does not give) */
const when = (w: PostWhen) =>
  `${formatDate('uk', w.ms, w.timeZone, { day: 'numeric', month: 'long' }).replace(/(\d) /, '$1\u00a0')} ${at(w.clock)} ${w.clock} за місцевим часом`
/** The place as a title: «Waterloo.» (no second stop after a name that already ends on one, or on «…») */
const title = (place: string) => (/[.…!?]$/u.test(place) ? place : `${place}.`)

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Поділитися прольотом',
  titleImage: 'Поділитися знімком',
  titleWeek: 'Поділитися тижнем',
  close: 'Закрити',
  closeTitle: 'Закрити (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Поділитися карткою',
  preparingImage: 'Підготовка картки…',
  share: 'Поділитися',
  copyLink: 'Копіювати',
  copyLinkDesktop: 'Копіювати посилання',
  copied: 'Скопійовано',
  // «в», not «у»: X is read «ікс», a vowel.
  postToX: 'Допис в X',
  copyImage: 'Копіювати картку',
  savePng: 'Зберегти',
  tryAgain: 'Повторити',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'URL',
  directLink: 'Пряме посилання: коротке зараз не вдалося створити',
  creatingLink: 'Створення посилання…',
  linkLater: 'З’явиться, коли поділишся',
  postLabel: 'Допис',
  renderFailed: 'Тут не вдалося створити картку, але посилання працює.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${title(place)} Сюди дивився супутник ${sat} з висоти ${km(altitudeKm)}, ${when(w)}.${pixelM !== undefined ? ` ${pixel(pixelM)} на піксель.` : ''} Це справжній знімок.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${title(place)} Сюди дивився супутник ${sat} з висоти ${km(altitudeKm)}, ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${title(place)} Супутник ${sat} пролетів на висоті ${km(altitudeKm)}, ${when(w)}. Це місце потрапило в смугу огляду його камери.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${title(place)} Супутник ${sat} мав це місце в полі зору ${when(w)}. Він міг дивитися сюди. Оператор не повідомляє, чи так було.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${title(place)} Над цим місцем на висоті ${km(altitudeKm)} пролетів супутник ${sat}, ${when(w)}.`,
  },
  hookWatched: 'Цього тижня щось дивилося й на тебе.',
  hookPassed: 'Що пролітало над тобою цього тижня?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names ────────────────────────────────────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}
export default share
