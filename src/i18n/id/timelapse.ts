/**
 * Indonesian copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words the
 * MP4 draws (see src/i18n/en/timelapse.ts; docs/i18n/id.md §3.8 is the authority on every line here).
 *
 * Why it reads this way: the feature keeps the loan *time-lapse*, upright and hyphenated (never *selang waktu*, "time
 * interval"; id.md §4.1). A frame is a *bingkai*, a clear look a *citra cerah*, and the note may say *foto* because
 * every frame is certainly a Sentinel-2 photograph (§4.1). Dates arrive as instants at UTC midnight and are written in
 * CLDR `id` at zone 'UTC' ("22 Okt 2015"; spoken "22 Oktober 2015"), never with a hand-made month table; a year is
 * never grouped. Counts take one noun form ("1 citra cerah", "11 citra cerah"), and zero is its own phrase.
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('id')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** "22 Okt" */
const dayMonth = (ms: number) => formatDate('id', ms, 'UTC', { day: 'numeric', month: 'short' })
/** "22 Okt 2015" */
const day = (ms: number) => formatDate('id', ms, 'UTC', { day: 'numeric', month: 'short', year: 'numeric' })
/** "22 Oktober 2015": read aloud, the month in full */
const spokenDay = (ms: number) => formatDate('id', ms, 'UTC', { day: 'numeric', month: 'long', year: 'numeric' })
/** "1 citra cerah", "11 citra cerah" */
const looks = (n: number) => f.plural(n, { other: `${f.int(n)} citra cerah` })
const EACH: Record<SeasonName, string> = {
  winter: 'satu tiap musim dingin',
  spring: 'satu tiap musim semi',
  summer: 'satu tiap musim panas',
  autumn: 'satu tiap musim gugur',
}

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Time-lapse ${place}`,
  title: 'Time-lapse',
  close: 'Tutup',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Putar',
  pause: 'Jeda',
  slider: 'Bingkai',
  frameList: 'Daftar bingkai',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Bingkai ${f.int(index)} dari ${f.int(total)}: ${spokenDay(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · satu per tahun`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Satu citra cerah per tahun · sejak ${since}`,
  captionShort: 'Tidak ada time-lapse untuk tempat ini',
  captionError: 'Arsip tidak merespons',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) =>
    `Setiap bingkai menampilkan persegi ${f.int(km)} km yang sama, diambil Sentinel-2 dan diolah warnanya seperti setiap foto di sini. Setiap tahun diusahakan dari musim yang berbeda; tahun tanpa citra cerah dilewati.`,
  noteOneSeason: (km: number) =>
    `Setiap bingkai menampilkan persegi ${f.int(km)} km yang sama, diambil Sentinel-2 dan diolah warnanya seperti setiap foto di sini. Setiap tahun berasal dari musim yang sama; tahun tanpa citra cerah pada musim itu dilewati.`,
  source: 'Copernicus Sentinel-2, melalui Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Membaca arsip',
  choosing: 'Memilih citra cerah',
  developing: 'Memproses bingkai',
  choosingProgress: (done: number, total: number) => `Memilih citra cerah, ${f.int(done)} dari ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Memproses bingkai, ${f.int(done)} dari ${f.int(total)}`,
  tooCloudy: 'Di sini terlalu berawan untuk time-lapse.',
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'Tidak ada citra cerah' : looks(count)} sejak ${since} · butuh ${f.int(needed)}`,
  noAnswer: 'Arsip tidak merespons.',
  unreachable: 'Planetary Computer tidak bisa dihubungi',
  retry: 'Coba lagi',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Bagikan',
  linkCopied: 'Tautan disalin',
  shareTitle: (place: string) => `${place}, dari tahun ke tahun`,
  video: 'Video',
  // Padded to two digits, as English, so the 132 px button never changes width while it counts.
  rendering: (pct: number) => `Memproses ${pad2(pct)}%`,
  videoFailed: 'Video gagal',
  saveVideo: 'Simpan video',
  noH264: 'Browser ini tidak punya encoder H.264: berkasnya bisa diputar di Chrome dan Firefox',
  fileNamePlace: 'tempat',
}

export default timelapse
