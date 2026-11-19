/**
 * French copy for the share sheet, the post it prefills and the PNG's file name (see src/i18n/en/share.ts for where
 * each message shows; docs/i18n/fr.md §3.5 and §3.9 are the authority on every line here).
 *
 * Why it reads this way:
 *  - Buttons are infinitives (*Partager*, *Copier*, *Enregistrer*), never *vous* imperatives, which read like an
 *    advert (fr.md §1.1). *Copié* is the one form the sheet has for both copies (the glossary's *Copiée* needs a key of
 *    its own).
 *  - *Copier le lien*, not a bare *Copier* beside *Copier l’image*: two buttons named *Copier* in one row leave the
 *    reader to guess which copies what. The row makes room for its labels (ShareSheet.tsx useFitRow): one line on a
 *    laptop, the first button over the other two on a phone. X's own French verb gives *Poster sur X* (*Publier sur
 *    X* ran past its borders at 360 px, before the row fitted its labels).
 *  - The post keeps the satellite as the bare subject of an *avoir* verb and the place as its object, so nothing agrees
 *    with either (*Sentinel-2C a observé Waterloo depuis 795 km d’altitude*, §1.3, §5.1); *son opérateur* and *sa
 *    caméra* carry the rest, and *elle* is the camera, never the satellite. A commercial pass says *avait [PLACE] à
 *    portée*, a whole sentence (§3.6). A sentence never starts with a numeral: the pixel size is *Résolution : 10 m par
 *    pixel.* (§2.2).
 *  - The day is the full weekday with *1er* for day 1 and the local 24-hour clock: *le dimanche 1er novembre à 11:21,
 *    heure locale* (frDate from the card catalog, the one place French writes a day in a sentence). Altitudes and pixel
 *    sizes take fmt('fr') grouping and a no-break space before the unit.
 *  - File names stay lowercase ASCII: *semaine* for the week.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { frDate } from '../../../api/_lib/i18n/card/fr'

const f = fmt('fr')

/** "795 km": the satellite's altitude in the post (whole km) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0km`
/** "10 m", "2 km": a pixel's size in the post, in whole metres or whole km */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0km` : `${f.int(m)}\u00a0m`)
/** "le dimanche 1er novembre à 11:21, heure locale" */
const when = (w: PostWhen) => `le ${frDate(w.ms, w.timeZone, { weekday: 'long', day: 'numeric', month: 'long' })} à ${w.clock}, heure locale`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Partager ce passage',
  titleImage: 'Partager cette image',
  titleWeek: 'Partager cette semaine',
  close: 'Fermer',
  closeTitle: 'Fermer (Échap)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Partager l’image',
  preparingImage: 'Préparation de l’image…',
  share: 'Partager',
  copyLink: 'Copier le lien',
  copied: 'Copié',
  postToX: 'Poster sur X',
  copyImage: 'Copier l’image',
  savePng: 'Enregistrer',
  tryAgain: 'Réessayer',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Lien',
  directLink: 'Lien direct\u00a0: le lien court n’a pas pu être créé pour l’instant',
  creatingLink: 'Création du lien…',
  linkLater: 'Créé au moment du partage',
  postLabel: 'Texte',
  renderFailed: 'La carte n’a pas pu être générée ici\u202f; le lien fonctionne toujours.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat} a observé ${place} depuis ${km(altitudeKm)} d’altitude, ${when(w)}.${
        pixelM !== undefined ? ` Résolution\u00a0: ${pixel(pixelM)} par pixel.` : ''
      } C’est l’image réelle.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat} a observé ${place} depuis ${km(altitudeKm)} d’altitude, ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} a balayé ${place} depuis ${km(altitudeKm)} d’altitude, ${when(w)}. La fauchée de sa caméra couvrait l’endroit même.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${sat} avait ${place} à portée ${when(w)}. Sa caméra aurait pu viser ici. Son opérateur ne dit pas si elle l’a fait.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) => `${sat} a survolé ${place} à ${km(altitudeKm)} d’altitude, ${when(w)}.`,
  },
  // *vous aussi* set apart: *aussi* alone would read "also this week" (fr.md §3.5).
  hookWatched: 'Quelque chose vous observait, vous aussi, cette semaine.',
  hookPassed: 'Et au-dessus de chez vous, cette semaine\u202f?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII words and hyphens) ────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-semaine-${day}.png`,
}

export default share
