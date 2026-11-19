/**
 * Italian copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words drawn
 * into the MP4 (see src/i18n/en/timelapse.ts; docs/i18n/it.md §3.7 "Time-lapse", §4, §5.5, §6, §8).
 *
 * Why it reads this way:
 *  - *time-lapse* is the Italian term (m., invariable), never *timelapse* or *ripresa accelerata*. A clear look is a
 *    *ripresa limpida* (f.: *1 ripresa limpida*, *11 riprese limpide*, *1.000.000 di riprese limpide*), a frame a
 *    *fotogramma*. Zero is its own phrase, *Nessuna ripresa limpida*.
 *  - Dates come from Intl at UTC (the frames' days arrive as UTC midnights): the readout's short month (*22 ott 2015*,
 *    uppercased by CSS and by the video), the full month in what a screen reader hears (*22 ottobre 2015*).
 *  - The single-season loop (war zones, glaciers) names its season as a whole phrase (*una ogni autunno*) and nothing
 *    more: no word on why (§8). Years after *dal* never elide, because every year from 2000 starts with a consonant
 *    sound (*dal 2015*), and are never grouped.
 *  - The place stands after a colon or before a middle dot (*Time-lapse: Kyiv*, *Kyiv · anno dopo anno*), never after
 *    *di* (§5.1). The waiting steps are nouns (*Lettura dell’archivio*), never the product speaking as *io* (§1).
 */
import type en from '../en/timelapse'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'
import type { SeasonName } from '@/imagery/seasonRegions'

const f = fmt('it')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** A frame's day, month and year at UTC from Intl's parts, joined by spaces: *22 ott*, *2015* */
function fields(ms: number, month: 'short' | 'long'): { dayMonth: string; year: string } {
  const parts = dateFormat('it', 'UTC', { day: 'numeric', month, year: 'numeric' }).formatToParts(ms)
  // Some ICU data ends an abbreviation with a full stop; the guide's readouts have none (§6), as the 'time' namespace's.
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
  return { dayMonth: `${get('day')} ${get('month')}`, year: get('year') }
}
/** *22 ott* */
const dayMonth = (ms: number) => fields(ms, 'short').dayMonth
/** *22 ott 2015* */
const day = (ms: number) => {
  const d = fields(ms, 'short')
  return `${d.dayMonth} ${d.year}`
}
/** *22 ottobre 2015* (spoken) */
const daySpoken = (ms: number) => {
  const d = fields(ms, 'long')
  return `${d.dayMonth} ${d.year}`
}
/** *1 ripresa limpida*, *11 riprese limpide*, *1.000.000 di riprese limpide* */
const looks = (n: number) =>
  f.plural(n, {
    one: `${f.int(n)} ripresa limpida`,
    many: `${f.int(n)} di riprese limpide`,
    other: `${f.int(n)} riprese limpide`,
  })
const EACH: Record<SeasonName, string> = {
  winter: 'una ogni inverno',
  spring: 'una ogni primavera',
  summer: 'una ogni estate',
  autumn: 'una ogni autunno',
}
/** *Ogni fotogramma è lo stesso quadrato di 10 km di lato…* */
const square = (km: number) =>
  `Ogni fotogramma è lo stesso quadrato di ${f.int(km)} km di lato, ripreso da Sentinel-2 e ritoccato come tutte le foto qui.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Time-lapse: ${place}`,
  title: 'Time-lapse',
  close: 'Chiudi',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Riproduci',
  pause: 'Pausa',
  slider: 'Fotogramma',
  frameList: 'Fotogrammi',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Fotogramma ${f.int(index)} di ${f.int(total)}: ${daySpoken(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · una all’anno`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Una ripresa limpida all’anno · dal ${since}`,
  captionShort: 'Nessun time-lapse per questo luogo',
  captionError: 'L’archivio non ha risposto',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) =>
    `${square(km)} Per ogni anno cerchiamo una stagione diversa; un anno senza riprese limpide resta fuori.`,
  noteOneSeason: (km: number) =>
    `${square(km)} Per ogni anno scegliamo la stessa stagione; un anno senza riprese limpide in quella stagione resta fuori.`,
  source: 'Copernicus Sentinel-2, via Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Lettura dell’archivio',
  // One nowrap line with its count, about 280 px on a phone: no article, as the readouts drop it (*Verifica mosaici
  // meteo NASA*, §3.7, §7).
  choosing: 'Scelta riprese limpide',
  developing: 'Sviluppo dei fotogrammi',
  // Spoken: the step as `choosing` says it, the counts unpadded (a screen reader would say «zero tre»).
  choosingProgress: (done: number, total: number) => `Scelta riprese limpide, ${f.int(done)} di ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Sviluppo dei fotogrammi, ${f.int(done)} di ${f.int(total)}`,
  tooCloudy: 'Qui è troppo nuvoloso per un time-lapse.',
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'Nessuna ripresa limpida' : looks(count)} dal ${since} · ${f.plural(needed, {
      one: `ne serve ${f.int(needed)}`,
      many: `ne servono ${f.int(needed)}`,
      other: `ne servono ${f.int(needed)}`,
    })}`,
  noAnswer: 'L’archivio non ha risposto.',
  // Never *Impossibile raggiungere…* (bureaucratic, §2).
  unreachable: 'Planetary Computer non è raggiungibile',
  retry: 'Riprova',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Condividi',
  linkCopied: 'Link copiato',
  shareTitle: (place: string) => `${place} · anno dopo anno`,
  video: 'Video',
  rendering: (pct: number) => `Rendering ${pad2(pct)}%`,
  // Fits the 132 px button (§7); *Video non riuscito* would not.
  videoFailed: 'Non riuscito',
  saveVideo: 'Salva video',
  noH264: 'Questo browser non ha un encoder H.264: il file funziona in Chrome e Firefox',
  // Lowercase a–z only: the file name's stand-in for a place with no Latin name.
  fileNamePlace: 'luogo',
}

export default timelapse
