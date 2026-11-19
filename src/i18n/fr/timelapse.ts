/**
 * French copy for the time-lapse, *Au fil des ans*: the player, its waiting screen, its share and video buttons, and
 * the words the MP4 draws (see src/i18n/en/timelapse.ts for where each message shows; docs/i18n/fr.md §3.8 is the
 * authority on every line here).
 *
 * Why it reads this way:
 *  - The feature is *Au fil des ans*, never *time-lapse* (an anglicism) nor *accéléré* (a playback speed): it says what
 *    is on screen and stays neutral for war zones and glaciers, with no *évolution* or *transformation* (fr.md §3.8,
 *    §8). The caption states the method, never a reason: *une par an, en automne*.
 *  - A frame and a clear look are both a *vue* (f), so *prise* and *étalonnée* agree with it, and a count is the whole
 *    phrase in every plural form: *1 vue dégagée*, *11 vues dégagées*, *1 000 000 de vues dégagées* (§5.3).
 *  - Dates arrive as instants at UTC midnight and are written in CLDR `fr` at zone 'UTC': readouts as Intl abbreviates
 *    them (*22 oct. 2015*), the spoken date in full with *1er* for day 1 (*1er octobre 2015*; frDate from the card
 *    catalog). A year is never grouped (`String(since)`, §5.5). The video uppercases these words itself.
 *  - Buttons are infinitives or nouns sized to the one 132 px video button (*Vidéo*, *Création 42 %*, *Échec vidéo*,
 *    *Enregistrer*); the Escape key is *Échap* (§3.7).
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'
import { frDate } from '../../../api/_lib/i18n/card/fr'

const f = fmt('fr')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** "22 oct." */
const dayMonth = (ms: number) => formatDate('fr', ms, 'UTC', { day: 'numeric', month: 'short' })
/** "22 oct. 2015" */
const day = (ms: number) => formatDate('fr', ms, 'UTC', { day: 'numeric', month: 'short', year: 'numeric' })
/** "22 octobre 2015", "1er octobre 2015": read aloud, the month in full */
const spokenDay = (ms: number) => frDate(ms, 'UTC', { day: 'numeric', month: 'long', year: 'numeric' })
/** "1 vue dégagée", "11 vues dégagées" */
const looks = (n: number) =>
  f.plural(n, {
    one: `${f.int(n)}\u00a0vue dégagée`,
    many: `${f.int(n)}\u00a0de vues dégagées`,
    other: `${f.int(n)}\u00a0vues dégagées`,
  })
/** Each season a whole phrase with its own preposition (fr.md §5.5) */
const EACH: Record<SeasonName, string> = {
  winter: 'une par an, en hiver',
  spring: 'une par an, au printemps',
  summer: 'une par an, en été',
  autumn: 'une par an, en automne',
}
/** The first sentence of both notes */
const square = (km: number) => `Chaque vue est le même carré de ${f.int(km)}\u00a0km de côté, prise par Sentinel-2 et étalonnée comme toutes les photos ici.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  // The place heads the label, so it needs no article or contraction (fr.md §5.1).
  dialog: (place: string) => `${place} au fil des ans`,
  title: 'Au fil des ans',
  close: 'Fermer',
  escKey: 'Échap',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Lecture',
  pause: 'Pause',
  slider: 'Vue',
  frameList: 'Vues',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Vue ${f.int(index)} sur ${f.int(total)}\u00a0: ${spokenDay(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · une par an`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Une vue dégagée par an · depuis ${String(since)}`,
  captionShort: 'Pas assez de vues dégagées pour ce lieu',
  captionError: 'Les archives n’ont pas répondu',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) => `${square(km)} Chaque année vise une saison différente\u202f; une année sans vue dégagée est omise.`,
  noteOneSeason: (km: number) =>
    `${square(km)} Chaque année vient de la même saison\u202f; une année sans vue dégagée à cette saison est omise.`,
  source: 'Copernicus Sentinel-2, via Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Inventaire des archives',
  choosing: 'Choix des vues dégagées',
  developing: 'Développement des vues',
  choosingProgress: (done: number, total: number) => `Choix des vues dégagées, ${f.int(done)} sur ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Développement des vues, ${f.int(done)} sur ${f.int(total)}`,
  tooCloudy: 'Trop de nuages ici pour remonter les années.',
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'Aucune vue dégagée' : looks(count)} depuis ${String(since)} · ${f.plural(needed, {
      one: `${f.int(needed)}\u00a0nécessaire`,
      many: `${f.int(needed)}\u00a0nécessaires`,
      other: `${f.int(needed)}\u00a0nécessaires`,
    })}`,
  noAnswer: 'Les archives n’ont pas répondu.',
  unreachable: 'Planetary Computer est injoignable',
  retry: 'Réessayer',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Partager',
  linkCopied: 'Lien copié',
  shareTitle: (place: string) => `${place}, année après année`,
  video: 'Vidéo',
  // Padded to two digits, as English, so the 132 px button never changes width while it counts.
  rendering: (pct: number) => `Création ${pad2(pct)}\u00a0%`,
  videoFailed: 'Échec vidéo',
  saveVideo: 'Enregistrer',
  noH264: 'Ce navigateur n’a pas d’encodeur H.264\u00a0: le fichier se lit dans Chrome et Firefox',
  fileNamePlace: 'lieu',
}

export default timelapse
