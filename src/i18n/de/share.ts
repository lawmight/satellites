/**
 * German copy for the share sheet, the post it prefills and the PNG's file name (see src/i18n/en/share.ts for where
 * each message shows; docs/i18n/de.md §3.5 is the authority on every line here).
 *
 * Why it reads this way:
 *  - Buttons are infinitives or the verb alone, never an address (*Teilen*, *Kopieren*, *Speichern*): three of them
 *    share a phone's width, about 11 characters each, so the LINK field beside *Kopieren* names what it copies and the
 *    retry is *Noch mal* (de.md §3.5, §7). The card is *die Karte*, the post's label *Text* (the 48 px column).
 *  - The post keeps the satellite as the bare subject and the place as its accusative object, so nothing agrees with
 *    either: *Sentinel-2C beobachtete Waterloo am So., 1. Nov., um 11:21 Uhr Ortszeit aus 786 km Höhe.* Leads are the
 *    verdict verbs (*beobachtete*, *erfasste vermutlich*, *kam … in Sichtweite von*, *überflog*), the second sentence
 *    makes *die Kamera* or *der Betreiber* the subject, and a crewed station is *Die Raumstation ISS*. A curated place
 *    takes its article from the one German table (api/_lib/i18n/card/deNames.ts).
 *  - The day is Intl's short form with both commas (*am So., 1. Nov., um*), the clock in 24 hours with *Uhr Ortszeit*
 *    (no zone, so *Uhr* is right, §5.5). Altitudes and pixel sizes take fmt('de') and a no-break space before the unit.
 *  - The hooks echo the hero (*Etwas hat auch dich diese Woche beobachtet.*), and both stay under 45 characters.
 *  - File names stay lowercase ASCII: *woche* for the week.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'
import { accDe, subjectDe, vonDe } from '../../../api/_lib/i18n/card/deNames'

const f = fmt('de')

/** "795 km": the satellite's altitude in the post (whole km) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0km`
/** "10 m", "2 km": a pixel's size in the post, in whole metres or whole km */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0km` : `${f.int(m)}\u00a0m`)
/** "am So., 1. Nov., um 11:21 Uhr Ortszeit": weekday and date closed by a comma, then the clock (de.md §5.5) */
const when = (w: PostWhen) =>
  `am ${formatDate('de', w.ms, w.timeZone, { weekday: 'short', day: 'numeric', month: 'short' })}, um ${w.clock}\u00a0Uhr Ortszeit`
/** The place as an accusative object: "Waterloo", "den Central Park" */
const obj = (place: string) => `${accDe(place)}${place}`
/** A sentence's full stop, unless it already ends on one: "Washington, D.C." takes no second one (as ../card/de.ts) */
const end = (s: string) => (/[.…!?]$/u.test(s) ? s : `${s}.`)

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Überflug teilen',
  titleImage: 'Bild teilen',
  titleWeek: 'Diese Woche teilen',
  close: 'Schließen',
  closeTitle: 'Schließen (Esc)',

  // ── Buttons (one line each; about 11 characters on a phone) ──────────────────────────────────────────────────────
  shareImage: 'Bild teilen',
  preparingImage: 'Bild wird vorbereitet\u00a0…',
  share: 'Teilen',
  copyLink: 'Kopieren',
  copyLinkDesktop: 'Link kopieren',
  copied: 'Kopiert',
  postToX: 'Auf X',
  copyImage: 'Bild kopieren',
  savePng: 'Speichern',
  tryAgain: 'Noch mal',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Link',
  directLink: 'Direkter Link: Der Kurzlink ließ sich gerade nicht erstellen.',
  creatingLink: 'Link wird erstellt\u00a0…',
  linkLater: 'Entsteht beim Teilen',
  postLabel: 'Text',
  renderFailed: 'Die Karte ließ sich hier nicht zeichnen; der Link funktioniert trotzdem.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${subjectDe(sat)} beobachtete ${obj(place)} ${when(w)} aus ${km(altitudeKm)} Höhe. ${
        pixelM !== undefined ? `${pixel(pixelM)} pro Pixel; das` : 'Das'
      } ist das echte Bild.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${subjectDe(sat)} beobachtete ${obj(place)} ${when(w)} aus ${km(altitudeKm)} Höhe. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${subjectDe(sat)} erfasste vermutlich ${obj(place)} ${when(w)} aus ${km(altitudeKm)} Höhe. Der Aufnahmestreifen der Kamera deckte den Ort ab.`,
    // *sie* is *die Kamera*, our own noun; *von* becomes *vom* / *von der* / *der* for a curated place. The first
    // sentence ends on the place (the English puts the time after it), so a name that ends on a stop takes no second.
    could: (sat: string, place: string, w: PostWhen) =>
      `${end(`${subjectDe(sat)} kam ${when(w)} in Sichtweite ${vonDe(place)} ${place}`)} Die Kamera hätte hierher blicken können. Der Betreiber sagt nicht, ob sie es getan hat.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${subjectDe(sat)} überflog ${obj(place)} ${when(w)} in ${km(altitudeKm)} Höhe.`,
  },
  hookWatched: 'Etwas hat auch dich diese Woche beobachtet.',
  hookPassed: 'Was ist diese Woche über dich hinweggezogen?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII words and hyphens) ────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-woche-${day}.png`,
}

export default share
