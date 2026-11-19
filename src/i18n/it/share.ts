/**
 * Italian copy for the share sheet, the post text it prefills and the PNG's file name (see src/i18n/en/share.ts;
 * docs/i18n/it.md §3.5, §5, §7). The card and the share page speak from api/_lib/i18n/card/it.ts.
 *
 * Why it reads this way:
 *  - Buttons are tu imperatives without articles, measured for the phone row (three across 360 px, about 12
 *    characters each): *Copia link*, *Posta su X* (X's own Italian verb), *Salva PNG*, *Copia immagine*; one *Copiato*
 *    serves both copy buttons, as an impersonal status (§4, §7). Waiting states are nouns (*Creazione del link…*).
 *  - The post states facts to strangers, in the third person about the satellite: its name is the bare subject of an
 *    *avere* verb or an imperfetto (*ha osservato*, *ha inquadrato*, *aveva a portata*, *ha sorvolato*), the place the
 *    bare object right after it, so nothing agrees with either name and no article or preposition touches them
 *    (§3.5, §5.1, §5.2). *ti* appears only in the closing hook.
 *  - The day is written in full, with its weekday and no article (*domenica 1 novembre alle 11:21 ora locale*), never
 *    the readout's *dom 1 nov* (§5.5). Numbers come from fmt('it') and are tied to their units with a no-break space.
 *  - File names stay lowercase ASCII words and hyphens; the week's PNG says *settimana*.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('it')

/** *786 km*: the satellite's altitude, whole kilometres */
const km = (altitudeKm: number) => `${f.int(altitudeKm)} km`
/** *10 m*, *2 km*: a pixel's size, whole metres, or whole kilometres from 1000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)} km` : `${f.int(m)} m`)
/** *domenica 1 novembre alle 11:21 ora locale* (a weekday takes no article; *alle* before every 24-hour clock) */
const when = (w: PostWhen) =>
  `${formatDate('it', w.ms, w.timeZone, { weekday: 'long', day: 'numeric', month: 'long' })} alle ${w.clock} ora locale`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Condividi questo passaggio',
  titleImage: 'Condividi questa immagine',
  titleWeek: 'Condividi questa settimana',
  close: 'Chiudi',
  closeTitle: 'Chiudi (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Condividi immagine',
  preparingImage: 'Preparazione immagine…',
  share: 'Condividi',
  copyLink: 'Copia link',
  copied: 'Copiato',
  postToX: 'Posta su X',
  copyImage: 'Copia immagine',
  savePng: 'Salva PNG',
  tryAgain: 'Riprova',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Link',
  directLink: 'Link diretto: per ora non siamo riusciti a creare il link breve',
  creatingLink: 'Creazione del link…',
  linkLater: 'Lo creiamo quando condividi',
  postLabel: 'Post',
  renderFailed: 'Qui non siamo riusciti a creare l’anteprima; il link funziona comunque.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat} ha osservato ${place} da ${km(altitudeKm)} di quota ${when(w)}. ${pixelM !== undefined ? `${pixel(pixelM)} per pixel: questa` : 'Questa'} è l’immagine vera.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat} ha osservato ${place} da ${km(altitudeKm)} di quota ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} ha inquadrato ${place} da ${km(altitudeKm)} di quota ${when(w)}. La fascia della sua fotocamera copriva il punto.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${sat} aveva a portata ${place} ${when(w)}. Poteva puntare qui. Il suo operatore non dice se l’ha fatto.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} ha sorvolato ${place} a ${km(altitudeKm)} di quota ${when(w)}.`,
  },
  // *anche te*: the stressed pronoun is why the hero ends on *te* (§3.1).
  hookWatched: 'Qualcosa, questa settimana, ha osservato anche te.',
  // Never *Cosa ti è passato sopra* ("what ran you over", §3.5).
  hookPassed: 'Cosa ti ha sorvolato questa settimana?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names ────────────────────────────────────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-settimana-${day}.png`,
}

export default share
