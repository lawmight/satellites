/**
 * German copy for the time-lapse, *Zeitraffer*: the player, its waiting screen, its share and video buttons, and the
 * words the MP4 draws (see src/i18n/en/timelapse.ts for where each message shows; docs/i18n/de.md §3.8 is the
 * authority on every line here).
 *
 * Why it reads this way:
 *  - A frame is a *Bild* (never *Frame*), a clear look a *klarer Blick*, and a count is the whole phrase in each plural
 *    form, adjective endings included: *1 klarer Blick*, *11 klare Blicke*, zero *Kein klarer Blick* (de.md §5.3).
 *  - The caption states the method and stops: *jeweils im Herbst*. Nothing names a war or a glacier's loss (§8). Photos
 *    here are Sentinel-2 photographs, so *wie jedes Foto hier* is honest.
 *  - The waiting steps are an instrument log, so noun style is right there (*Archivsuche*, *Auswahl klarer Blicke*,
 *    *Entwicklung der Bilder*, §2.5). Buttons are infinitives or nouns sized to the one 132 px video button (*Video*,
 *    *Rendern 42 %*, *Fehlgeschlagen*, *Speichern*, §7).
 *  - Dates arrive as instants at UTC midnight and are written by CLDR `de` at zone 'UTC': numeric in mono (*22.10.2015*,
 *    *22.10.*), the month in full when read aloud (*22. Oktober 2015*). A year never goes through fmt('de'), which
 *    would group it (*2.015*): it is written as its digits. The video uppercases these words itself, ß as SS.
 *  - The note says *Quadrat von 10 km Seitenlänge*: a number compound (*10-km-Quadrat*) in plain body text would break
 *    at its hyphen (§6.1).
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('de')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** "22.10." */
const dayMonth = (ms: number) => formatDate('de', ms, 'UTC', { day: '2-digit', month: '2-digit' })
/** "22.10.2015" */
const day = (ms: number) => formatDate('de', ms, 'UTC', { day: '2-digit', month: '2-digit', year: 'numeric' })
/** "22. Oktober 2015": read aloud, the month in full */
const spokenDay = (ms: number) => formatDate('de', ms, 'UTC', { day: 'numeric', month: 'long', year: 'numeric' })
/** "1 klarer Blick", "11 klare Blicke" */
const looks = (n: number) => f.plural(n, { one: `${f.int(n)} klarer Blick`, other: `${f.int(n)} klare Blicke` })
/** Each season as a whole phrase */
const EACH: Record<SeasonName, string> = {
  winter: 'jeweils im Winter',
  spring: 'jeweils im Frühling',
  summer: 'jeweils im Sommer',
  autumn: 'jeweils im Herbst',
}
/** The first sentence of both notes */
const square = (km: number) =>
  `Jedes Bild zeigt dasselbe Quadrat von ${f.int(km)}\u00a0km Seitenlänge, aufgenommen von Sentinel-2 und farblich so abgestimmt wie jedes Foto hier.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  // A colon frame keeps the place bare (de.md §5.1).
  dialog: (place: string) => `Zeitraffer: ${place}`,
  title: 'Zeitraffer',
  close: 'Schließen',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Abspielen',
  pause: 'Anhalten',
  slider: 'Bild',
  frameList: 'Bilder',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Bild ${f.int(index)} von ${f.int(total)}: ${spokenDay(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  // *einer* is *ein klarer Blick* (masculine).
  captionYearly: (count: number) => `${looks(count)} · einer pro Jahr`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Ein klarer Blick pro Jahr · seit ${String(since)}`,
  captionShort: 'Kein Zeitraffer für diesen Ort',
  captionError: 'Das Archiv hat nicht geantwortet',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) => `${square(km)} Jedes Jahr zielt auf eine andere Jahreszeit; ein Jahr ohne klaren Blick fällt weg.`,
  noteOneSeason: (km: number) =>
    `${square(km)} Alle Bilder stammen aus derselben Jahreszeit; ein Jahr ohne klaren Blick in dieser Jahreszeit fällt weg.`,
  // The names stay; only *über* is ours.
  source: 'Copernicus Sentinel-2, über Planetary Computer',

  // ── The waiting screen (log style, de.md §2.5) ────────────────────────────────────────────
  listing: 'Archivsuche',
  choosing: 'Auswahl klarer Blicke',
  developing: 'Entwicklung der Bilder',
  // Read aloud: no padding needed (*3 von 12*).
  choosingProgress: (done: number, total: number) => `Auswahl klarer Blicke, ${f.int(done)} von ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Entwicklung der Bilder, ${f.int(done)} von ${f.int(total)}`,
  tooCloudy: 'Zu bewölkt für einen Zeitraffer.',
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'Kein klarer Blick' : looks(count)} seit ${String(since)} · ${f.int(needed)} nötig`,
  noAnswer: 'Das Archiv hat nicht geantwortet.',
  unreachable: 'Planetary Computer war nicht erreichbar',
  retry: 'Erneut versuchen',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Teilen',
  linkCopied: 'Link kopiert',
  shareTitle: (place: string) => `${place}, Jahr für Jahr`,
  video: 'Video',
  // Padded to two digits, so the label keeps its width as it counts (95 of the button's 132 px).
  rendering: (pct: number) => `Rendern ${pad2(pct)}\u00a0%`,
  videoFailed: 'Fehlgeschlagen',
  saveVideo: 'Speichern',
  noH264: 'Dieser Browser hat keinen H.264-Encoder: Die Datei lässt sich in Chrome und Firefox abspielen',
  fileNamePlace: 'ort',
}

export default timelapse
