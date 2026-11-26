/**
 * Indonesian copy for the share sheet, the post it prefills and the PNG's file name (see src/i18n/en/share.ts;
 * docs/i18n/id.md §3.6 is the authority on every line here).
 *
 * Why it reads this way: the card file is a *gambar* (*Bagikan gambar*, *Salin gambar*), the picture a pass took a
 * *citra*; the week is shared as *ringkasan pekan ini*, never *Bagikan minggu ini* ("share it this week"). The post
 * keeps the satellite first and the place bare (no article, no suffix), and its day is the full weekday with a short
 * month ("Minggu, 1 Nov", formatDate in CLDR `id`) before a 24 h clock as it arrives: *pada Minggu, 1 Nov pukul 11:21
 * waktu setempat*. Numbers take Indonesian grouping and decimals (fmt('id'): "35.786 km"). The post label is *Teks*:
 * *Unggahan* does not fit the 48 px column (§7).
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('id')

/** "795 km": the satellite's altitude in the post (whole km), held to its unit by a no-break space (id.md §6) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)} km`
/** "10 m", "2 km": a pixel's size in the post, in whole metres or whole km */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)} km` : `${f.int(m)} m`)
/** "Minggu, 1 Nov pukul 11:21 waktu setempat", *pukul* held to its clock by a no-break space */
const when = (w: PostWhen) =>
  `${formatDate('id', w.ms, w.timeZone, { weekday: 'long', day: 'numeric', month: 'short' })} pukul ${w.clock} waktu setempat`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Bagikan lintasan ini',
  titleImage: 'Bagikan citra ini',
  titleWeek: 'Bagikan ringkasan pekan ini',
  close: 'Tutup',
  closeTitle: 'Tutup (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Bagikan gambar',
  preparingImage: 'Menyiapkan gambar…',
  share: 'Bagikan',
  copyLink: 'Salin tautan',
  copyLinkDesktop: 'Salin tautan',
  copied: 'Disalin',
  postToX: 'Unggah ke X',
  copyImage: 'Salin gambar',
  savePng: 'Simpan PNG',
  tryAgain: 'Coba lagi',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Tautan',
  directLink: 'Tautan langsung: tautan pendek belum bisa dibuat saat ini',
  creatingLink: 'Membuat tautan…',
  linkLater: 'Dibuat saat kamu berbagi',
  postLabel: 'Teks',
  renderFailed: 'Kartu tidak bisa dibuat di sini; tautannya tetap berfungsi.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat} mengawasi ${place} dari ketinggian ${km(altitudeKm)} pada ${when(w)}. ${
        pixelM !== undefined ? `${pixel(pixelM)} per piksel; ini` : 'Ini'
      } citra aslinya.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat} mengawasi ${place} dari ketinggian ${km(altitudeKm)} pada ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} memindai ${place} dari ketinggian ${km(altitudeKm)} pada ${when(w)}. Sapuan kameranya mencakup titik ini.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${sat} melintas dengan ${place} dalam jangkauannya pada ${when(w)}. Satelit ini bisa saja mengarah ke sini. Operatornya tidak menyebutkan apakah itu terjadi.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) => `${sat} melintas ${km(altitudeKm)} di atas ${place} pada ${when(w)}.`,
  },
  hookWatched: 'Sesuatu mengawasi kamu juga minggu ini.',
  hookPassed: 'Apa yang melintas di atasmu minggu ini?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII words and hyphens) ────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-pekan-${day}.png`,
}

export default share
