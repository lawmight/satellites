/**
 * Dutch copy for the share sheet, the post text it prefills and the PNG's file name (see docs/i18n/nl.md §3.6 "The
 * post" and "The sheet", §5, §7). The card and the share page speak from api/_lib/i18n/card/nl.ts.
 *
 * Why it is built this way:
 *  - Buttons are infinitives with no pronoun, measured for the phone row (three in 360 px, about 11 characters each):
 *    `Kopiëren` sits right under the field labelled LINK, so it needs no object; `Op X zetten`, `PNG opslaan`, and the
 *    sheet's retry is `Opnieuw` (§7, one key, one context).
 *  - The post is prose, so its day is written in full and lowercase (`op zondag 1 november`, Intl `weekday: 'long'`)
 *    and its clock, which carries no zone here, is followed by `plaatselijke tijd` (the one place that phrase stands,
 *    §3.4). The time phrase comes before the altitude and the place: Dutch middle-field order, the sentence ending on
 *    the place (§2).
 *  - The satellite is the bare subject with a singular verb and no pronoun back to it: the second sentence makes the
 *    camera the subject (`De camera kon hierheen kijken.`). Verbs are the verdicts' own: `keek naar`, `streek over`,
 *    `had … binnen bereik`, `vloog over` (§3.5). `kon`, never `had … kunnen`.
 *  - Numbers go through fmt('nl') (`35.786 km`). The post travels as plain text through other apps, so its spaces are
 *    ordinary ones.
 *  - File names stay ASCII and English-worded (`watched-…-week-…`): they travel through every app and file system.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('nl')

/** "786 km": the satellite's altitude, whole kilometres */
const km = (altitudeKm: number) => `${f.int(altitudeKm)} km`
/** "10 m", "2 km": a pixel's size, whole metres, or whole kilometres from 1000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)} km` : `${f.int(m)} m`)
/** "zondag 1 november om 11:21 plaatselijke tijd" */
const when = (w: PostWhen) =>
  `${formatDate('nl', w.ms, w.timeZone, { weekday: 'long', day: 'numeric', month: 'long' })} om ${w.clock} plaatselijke tijd`
/** A sentence's closing full stop after the place, unless the name already ends on one ("Washington D.C.") */
const end = (place: string) => (/[.…!?]$/u.test(place) ? place : `${place}.`)

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Deze overvlucht delen',
  titleImage: 'Dit beeld delen',
  titleWeek: 'Deze week delen',
  close: 'Sluiten',
  closeTitle: 'Sluiten (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Beeld delen',
  preparingImage: 'Beeld klaarmaken…',
  share: 'Delen',
  copyLink: 'Kopiëren',
  copyLinkDesktop: 'Link kopiëren',
  copied: 'Gekopieerd',
  postToX: 'Op X zetten',
  copyImage: 'Beeld kopiëren',
  savePng: 'PNG opslaan',
  tryAgain: 'Opnieuw',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Link',
  directLink: 'Directe link: de korte link kon nu niet worden gemaakt',
  creatingLink: 'Link maken…',
  linkLater: 'Wordt gemaakt als je deelt',
  postLabel: 'Tekst',
  renderFailed: 'De kaart kon hier niet worden getekend; de link werkt nog steeds.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat} keek op ${when(w)} vanaf ${km(altitudeKm)} hoogte naar ${end(place)} ${pixelM !== undefined ? `${pixel(pixelM)} per pixel; dit` : 'Dit'} is het echte beeld.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat} keek op ${when(w)} vanaf ${km(altitudeKm)} hoogte naar ${end(place)} ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} streek op ${when(w)} vanaf ${km(altitudeKm)} hoogte over ${end(place)} De opnamestrook van de camera bedekte de plek.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${sat} had ${place} op ${when(w)} binnen bereik. De camera kon hierheen kijken. De exploitant zegt niet of dat ook gebeurd is.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} vloog op ${when(w)} op ${km(altitudeKm)} hoogte over ${end(place)}`,
  },
  hookWatched: 'Iets keek deze week ook naar jou.',
  hookPassed: 'Wat vloog er deze week over je heen?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names ────────────────────────────────────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-week-${day}.png`,
}
export default share
