/**
 * Dutch copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words drawn into
 * the MP4 (see docs/i18n/nl.md §3.7 "Time-lapse", §4.1, §5, §6, §8).
 *
 * Why it is built this way:
 *  - Dates come from Intl at UTC (the frames' days arrive as UTC midnights), built from its parts: the short month for
 *    the readout and the lists (`22 okt 2015`, `22 okt`), the full month for what a screen reader hears
 *    (`22 oktober 2015`). A trailing full stop some ICU versions put after a short month is dropped, so a mono readout
 *    never prints `okt.`. The video uppercases them itself (`22 OKT 2015`).
 *  - A frame is a `frame` (het), never `beeld`, which is taken by image; a clear look is a `heldere opname` (pl.
 *    `heldere opnamen`, never `opnames`). `timelapse` is one word.
 *  - The single-season loop (war zones, glaciers) names only its season, as a whole phrase (`elke herfst`), and never
 *    the reason (§8). `lente`, not `voorjaar`, so the four seasons read alike.
 *  - No mono caps line opens on `Eén` (CSS would print `EÉN`): `Elk jaar één heldere opname`, `één per jaar`.
 *  - The place follows `van`, or opens a title (`Waterloo, jaar na jaar`), never a sentence (§5). Years are never
 *    grouped. A count never parts from its noun (`11 heldere opnamen`, U+00A0), as in the results panel.
 */
import type en from '../en/timelapse'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'
import type { SeasonName } from '@/imagery/seasonRegions'

const f = fmt('nl')
const pad2 = (n: number) => String(n).padStart(2, '0')

const SHORT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
const LONG: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

/** A frame's day, month and year at UTC from Intl's parts ("22", "okt", "2015"), without a trailing full stop */
function fields(ms: number, opts: Intl.DateTimeFormatOptions): { dayMonth: string; year: string } {
  const parts = dateFormat('nl', 'UTC', opts).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
  return { dayMonth: `${get('day')} ${get('month')}`, year: get('year') }
}
/** "22 okt" */
const dayMonth = (ms: number) => fields(ms, SHORT).dayMonth
/** "22 okt 2015" */
const day = (ms: number) => {
  const d = fields(ms, SHORT)
  return `${d.dayMonth} ${d.year}`
}
/** "22 oktober 2015" (spoken) */
const daySpoken = (ms: number) => {
  const d = fields(ms, LONG)
  return `${d.dayMonth} ${d.year}`
}
/** "1 heldere opname", "11 heldere opnamen" */
const looks = (n: number) => f.plural(n, { one: `${f.int(n)} heldere opname`, other: `${f.int(n)} heldere opnamen` })
const EACH: Record<SeasonName, string> = {
  winter: 'elke winter',
  spring: 'elke lente',
  summer: 'elke zomer',
  autumn: 'elke herfst',
}
/** "Elk frame is hetzelfde vierkant van 10 km, …" */
const square = (km: number) =>
  `Elk frame is hetzelfde vierkant van ${f.int(km)} km, gemaakt door Sentinel-2 en bewerkt zoals elke foto hier.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Timelapse van ${place}`,
  title: 'Timelapse',
  close: 'Sluiten',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Afspelen',
  pause: 'Pauzeren',
  slider: 'Frame',
  frameList: 'Frames',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Frame ${f.int(index)} van ${f.int(total)}: ${daySpoken(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · één per jaar`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Elk jaar één heldere opname · sinds ${since}`,
  captionShort: 'Geen timelapse voor deze plek',
  captionError: 'Het archief gaf geen antwoord',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  // `We zoeken`: each year aims for a season and falls back to any clear date, so `komt uit` would overclaim.
  note: (km: number) => `${square(km)} We zoeken voor elk jaar een ander seizoen; een jaar zonder heldere opname valt weg.`,
  noteOneSeason: (km: number) =>
    `${square(km)} Elk jaar komt uit hetzelfde seizoen; een jaar zonder heldere opname in dat seizoen valt weg.`,
  source: 'Copernicus Sentinel-2, via Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Archief doorzoeken',
  choosing: 'Heldere opnamen kiezen',
  developing: 'Frames ontwikkelen',
  choosingProgress: (done: number, total: number) => `Heldere opnamen kiezen, ${f.int(done)} van ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Frames ontwikkelen, ${f.int(done)} van ${f.int(total)}`,
  tooCloudy: 'Te bewolkt voor een timelapse.',
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'Geen heldere opname' : looks(count)} sinds ${since} · ${f.int(needed)} nodig`,
  noAnswer: 'Het archief gaf geen antwoord.',
  unreachable: 'Planetary Computer was niet bereikbaar',
  retry: 'Opnieuw proberen',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Delen',
  // The share sheet's word for the same moment: `Link gekopieerd` pushes the row 63 px past the laptop's 248 px column.
  linkCopied: 'Gekopieerd',
  // A title may open on the place; a sentence may not (§5).
  shareTitle: (place: string) => `${place}, jaar na jaar`,
  video: 'Video',
  rendering: (pct: number) => `Renderen ${pad2(pct)}%`,
  videoFailed: 'Video mislukt',
  // The file is always an MP4 (video.ts), as the sheet's `PNG opslaan` names its file; `Video opslaan` widens the
  // 132 px button to 151 px and the laptop row past its column.
  saveVideo: 'MP4 opslaan',
  noH264: 'Deze browser heeft geen H.264-encoder: het bestand speelt af in Chrome en Firefox',
  // Lowercase a–z only: the file name's stand-in for a place with no Latin name.
  fileNamePlace: 'plek',
}
export default timelapse
