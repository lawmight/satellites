/**
 * Russian copy for the share sheet, the post text it prefills and the PNG's file name (see docs/i18n/ru.md §3.7, §7,
 * Appendix A). The card and the share page speak from api/_lib/i18n/card/ru.ts.
 *
 * Why it is built this way:
 *  - Buttons are infinitives measured for the phone row (three in 360 px, ≤ 11 characters each): «Копировать» for the
 *    link, since «Копировать ссылку» (17) does not fit; on laptops it stands beside «Копировать карточку», where only a
 *    desktop key of its own could say «Копировать ссылку» (reported). «Сохранить» without «PNG», which would not fit.
 *  - The post opens on the place, alone and closed by a full stop, the one position where Russian needs no case for a
 *    name it cannot inflect; the sentence after it says «сюда» / «это место». The satellite always follows its head
 *    noun «спутник», so its verbs have a gender. The post gets no satellite category, so a crewed station is «спутник»
 *    too (true: a station is an artificial satellite).
 *  - The day is Intl's genitive («1 ноября»), never a weekday after a preposition; the clock follows «в»; «по местному
 *    времени» stands for "local".
 *  - File names stay ASCII and English-worded («watched-…-week-…»): they travel through every app and file system.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('ru')

/** «786 км»: the satellite's altitude, whole kilometres */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0км`
/** «10 м», «2 км»: a pixel's size, whole metres or whole kilometres from 1 000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0км` : `${f.int(m)}\u00a0м`)
/** «1 ноября в 10:41 по местному времени» (no weekday: it would need a case Intl does not give) */
const when = (w: PostWhen) =>
  `${formatDate('ru', w.ms, w.timeZone, { day: 'numeric', month: 'long' }).replace(/(\d) /, '$1\u00a0')} в ${w.clock} по местному времени`
/** The place as a title: «Waterloo.» (no second stop after a name that already ends on one, or on «…») */
const title = (place: string) => (/[.…!?]$/u.test(place) ? place : `${place}.`)

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Поделиться пролётом',
  titleImage: 'Поделиться снимком',
  titleWeek: 'Поделиться неделей',
  close: 'Закрыть',
  closeTitle: 'Закрыть (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Поделиться карточкой',
  preparingImage: 'Готовим карточку…',
  share: 'Поделиться',
  copyLink: 'Копировать',
  copyLinkDesktop: 'Копировать ссылку',
  copied: 'Скопировано',
  postToX: 'Пост в X',
  copyImage: 'Копировать карточку',
  savePng: 'Сохранить',
  tryAgain: 'Повторить',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Ссылка',
  directLink: 'Прямая ссылка: короткую сейчас не удалось создать',
  creatingLink: 'Создаём ссылку…',
  linkLater: 'Появится, когда поделишься',
  postLabel: 'Пост',
  renderFailed: 'Здесь не удалось нарисовать карточку, но ссылка работает.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${title(place)} Сюда смотрел спутник ${sat} с высоты ${km(altitudeKm)}, ${when(w)}.${pixelM !== undefined ? ` ${pixel(pixelM)} на пиксель.` : ''} Это настоящий снимок.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${title(place)} Сюда смотрел спутник ${sat} с высоты ${km(altitudeKm)}, ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${title(place)} Спутник ${sat} пролетел здесь на высоте ${km(altitudeKm)}, ${when(w)}. Это место попало в полосу обзора его камеры.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${title(place)} Спутник ${sat} пролетел в зоне видимости этого места ${when(w)}. Он мог смотреть сюда. Оператор не сообщает, так ли это было.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${title(place)} Над этим местом на высоте ${km(altitudeKm)} пролетел спутник ${sat}, ${when(w)}.`,
  },
  hookWatched: 'На этой неделе что-то смотрело и на тебя.',
  hookPassed: 'Что пролетало над тобой на этой неделе?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names ────────────────────────────────────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}
export default share
