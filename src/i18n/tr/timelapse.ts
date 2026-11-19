/**
 * Turkish copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words drawn
 * into the MP4 (see docs/i18n/tr.md §3.9, §4, §5.3, §5.6, §8.2, §8.3).
 *
 * Why it is built this way:
 *  - Dates come from Intl at UTC (the frames' days arrive as UTC midnights), built from its parts in the Turkish order:
 *    the short month for the readout and the lists (`22 Eki 2015`, `22 Eki`), the full month for what a screen reader
 *    hears (`6 Ağustos 2019`). A trailing full stop some ICU versions put after a short month is dropped. The video
 *    uppercases them itself with Turkish rules (`22 EKİ 2015`).
 *  - `zaman atlamalı` is an adjective: alone only as a label (the bar, the button), `zaman atlamalı görüntüler` in a
 *    sentence (§4). A frame is a `kare`; the ground it shows is an `alan`, never a `kare` (§9.1). A clear look is a
 *    `bulutsuz görüntü`, singular after a number (`12 bulutsuz görüntü`).
 *  - A runtime year never takes a suffix: it stands before `yılından beri` (§5.3). Counts are mono, years never grouped.
 *  - The single-season loop (war zones, glaciers) names only its season, as a whole phrase (`her yıl sonbaharda`), and
 *    never why: no word the English does not have (§8.2, §8.3).
 *  - The place stands after a colon or before a comma, never inflected (`Zaman atlamalı: Waterloo`, `Waterloo, yıl yıl`).
 */
import type en from '../en/timelapse'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'
import type { SeasonName } from '@/imagery/seasonRegions'

const f = fmt('tr')
const pad2 = (n: number) => String(n).padStart(2, '0')

const SHORT: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
const LONG: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }

/** A frame's day, month and year at UTC from Intl's parts ("22", "Eki", "2015"), without a trailing full stop */
function fields(ms: number, opts: Intl.DateTimeFormatOptions): { dayMonth: string; year: string } {
  const parts = dateFormat('tr', 'UTC', opts).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
  return { dayMonth: `${get('day')} ${get('month')}`, year: get('year') }
}
/** "22 Eki" */
const dayMonth = (ms: number) => fields(ms, SHORT).dayMonth
/** "22 Eki 2015" */
const day = (ms: number) => {
  const d = fields(ms, SHORT)
  return `${d.dayMonth} ${d.year}`
}
/** "6 Ağustos 2019" (spoken) */
const daySpoken = (ms: number) => {
  const d = fields(ms, LONG)
  return `${d.dayMonth} ${d.year}`
}
/** "1 bulutsuz görüntü", "12 bulutsuz görüntü": the noun stays singular after a number */
const looks = (n: number) => `${f.int(n)} bulutsuz görüntü`
/** The season of a single-season loop, as a whole phrase (a southern glacier's February is still `yazın`) */
const EACH: Record<SeasonName, string> = {
  winter: 'her yıl kışın',
  spring: 'her yıl ilkbaharda',
  summer: 'her yıl yazın',
  autumn: 'her yıl sonbaharda',
}
/** "Her kare, Sentinel-2’nin aynı 10 × 10 km’lik alandan çektiği bir görüntü; …" (the suffix on the unit, not the number) */
const square = (km: number) =>
  `Her kare, Sentinel-2’nin aynı ${f.int(km)} × ${f.int(km)} km’lik alandan çektiği bir görüntü; renkleri buradaki bütün fotoğraflar gibi ayarlandı.`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Zaman atlamalı: ${place}`,
  title: 'Zaman atlamalı',
  close: 'Kapat',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Oynat',
  pause: 'Duraklat',
  slider: 'Kare',
  frameList: 'Kareler',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Kare ${f.int(index)}, toplam ${f.int(total)}: ${daySpoken(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · yılda bir`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Yılda bir bulutsuz görüntü · ${since} yılından beri`,
  captionShort: 'Bu yer için zaman atlamalı görüntü yok',
  captionError: 'Arşiv yanıt vermedi',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  // `hedeflenir`: a year aims for a season and falls back to any clear date, so `seçilir` would overclaim.
  note: (km: number) => `${square(km)} Her yıl için farklı bir mevsim hedeflenir; bulutsuz görüntüsü olmayan yıl atlanır.`,
  noteOneSeason: (km: number) =>
    `${square(km)} Her yıl aynı mevsimden; o mevsimde bulutsuz görüntüsü olmayan yıl atlanır.`,
  source: 'Copernicus Sentinel-2, Planetary Computer üzerinden',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Arşiv listeleniyor',
  // The generic singular of a running process: with `03 / 12` beside it the row fits the phone's ~280 px picture,
  // where the plural `görüntüler` (~301 px) was clipped at both ends.
  choosing: 'Bulutsuz görüntü seçiliyor',
  developing: 'Kareler işleniyor',
  // `3 tamam, toplam 12`: a slash would be read `bölü` (§5.3).
  choosingProgress: (done: number, total: number) => `Bulutsuz görüntü seçiliyor: ${f.int(done)} tamam, toplam ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Kareler işleniyor: ${f.int(done)} tamam, toplam ${f.int(total)}`,
  tooCloudy: 'Burası zaman atlamalı görüntüler için fazla bulutlu.',
  tooFew: (count: number, since: number, needed: number) =>
    `${since} yılından beri ${count === 0 ? 'bulutsuz görüntü yok' : looks(count)} · ${f.int(needed)} gerekli`,
  noAnswer: 'Arşiv yanıt vermedi.',
  unreachable: 'Planetary Computer’a ulaşılamadı',
  retry: 'Yeniden dene',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Paylaş',
  // `Bağlantı kopyalandı` overflows the button in mono caps (§3.9).
  linkCopied: 'Kopyalandı',
  shareTitle: (place: string) => `${place}, yıl yıl`,
  video: 'Video',
  // The sign before the number (§6.3); padded so the 132 px button never changes width as it counts.
  rendering: (pct: number) => `İşleniyor %${pad2(pct)}`,
  videoFailed: 'Video hatası',
  // The object dropped (§7.1): the same button said `Video` a moment before and carries the download glyph, and
  // `Videoyu kaydet` (~159 px) widened the 132 px button on the second press.
  saveVideo: 'Kaydet',
  // Media is played (`oynatılır`), it does not play (`oynar` is colloquial). A whole sentence after the colon starts
  // with a capital (TDK, §6.1).
  noH264: 'Bu tarayıcıda H.264 kodlayıcı yok: Dosya Chrome ve Firefox’ta oynatılır',
  // Lowercase a–z only: the file name's stand-in for a place with no Latin name.
  fileNamePlace: 'yer',
}
export default timelapse
