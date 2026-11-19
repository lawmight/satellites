/**
 * Indonesian copy for one pass's paragraph (see src/i18n/en/pass.ts; docs/i18n/id.md §3.5 holds every frame below).
 *
 * Why the sentences are built this way: the order is fixed by the guide (what crossed, when, how high, where from you,
 * how it moved), with the clock before the altitude so two mono spans never touch. "Overhead" is *tepat di atasmu*,
 * whose *-mu* closes the phrase so *tepat* never reads as "sharp" beside the clock. A pass is in the past, so its
 * conditions are anchored with *saat itu*, never *sedang*. Satellites get no pronoun: *Kameranya*, *Radarnya*,
 * *Sapuannya*, *Operatornya* or *satelit ini*; a station is *stasiun itu*. The place slot stays bare (no article, no
 * suffix, no class noun) and never starts a sentence: "Waterloo was inside its swath" becomes *Sapuannya … mencakup
 * Waterloo.*
 *
 * Indonesian words a direction two ways, so there are two tables: where the satellite moved (*bergerak ke selatan*,
 * *di sebelah barat*) and where it was from you, with the enclitic joined to the last word (*di sebelah barat dayamu*).
 * Readouts use the 16 Indonesian abbreviations (§4.2), never English letters. *pukul* is held to its clock by a
 * no-break space (§6).
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('id')

/** Where it moved, and the side of the sky: "bergerak ke barat daya", "di sebelah barat daya" */
const WORDS: Record<Compass8, string> = {
  n: 'utara',
  ne: 'timur laut',
  e: 'timur',
  se: 'tenggara',
  s: 'selatan',
  sw: 'barat daya',
  w: 'barat',
  nw: 'barat laut',
}

/** Where it was from you: "61 km di sebelah barat dayamu" (the enclitic joins the last word, id.md §1.2) */
const FROM_YOU: Record<Compass8, string> = {
  n: 'utaramu',
  ne: 'timur lautmu',
  e: 'timurmu',
  se: 'tenggaramu',
  s: 'selatanmu',
  sw: 'barat dayamu',
  w: 'baratmu',
  nw: 'barat lautmu',
}

const km = (n: number) => num(f.int(n), 'km')
/** "10 menit": a cadence, its unit set like a number's */
const minutes = (n: number) => num(f.int(n), 'menit')
const clock = (time: string, zone: string) => num(time, zone)

/**
 * "… melintas tepat di atasmu pukul 16:14:21 UTC pada ketinggian 786 km" / "… melintas pukul 16:14:21 UTC pada
 * ketinggian 786 km, 61 km di sebelah baratmu": the clause shared by the watched and likely sentences.
 */
const crossedAt = (sat: string, altKm: number, time: string, zone: string, offset?: Offset): Part[] => [
  offset ? `${sat} melintas pukul ` : `${sat} melintas tepat di atasmu pukul `,
  clock(time, zone),
  ' pada ketinggian ',
  km(altKm),
  ...(offset ? [', ', km(offset.km), ` di sebelah ${FROM_YOU[offset.dir]}`] : []),
]

const pass: typeof en = {
  compass16: {
    n: 'U',
    nne: 'UTL',
    ne: 'TL',
    ene: 'TTL',
    e: 'T',
    ese: 'TTG',
    se: 'TG',
    sse: 'STG',
    s: 'S',
    ssw: 'SBD',
    sw: 'BD',
    wsw: 'BBD',
    w: 'B',
    wnw: 'BBL',
    nw: 'BL',
    nnw: 'UBL',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    /** No seat: drop *pada [LON]*; no cadence: end at *menghadapnya.* (id.md §3.5) */
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} tidak melintas. Satelit ini berada `,
      km(o.altKm),
      o.seat !== undefined ? ` di atas khatulistiwa pada ${o.seat}` : ' di atas khatulistiwa',
      ...(o.cadenceMin
        ? [' dan memindai seluruh sisi Bumi yang menghadapnya setiap ', minutes(o.cadenceMin), '.']
        : [' dan memindai seluruh sisi Bumi yang menghadapnya.']),
    ],
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `Garis pindaian ini mencapai ${o.place} sekitar pukul `,
      clock(o.time, o.zone),
      `, bergerak ke ${WORDS[o.heading]}.`,
    ],
    infrared: 'Saat itu di sini gelap, jadi ini citra inframerah: puncak awan menurut suhunya, makin dingin makin terang.',
  },

  // ── a pass with a picture ("Diawasi") ────────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    ...crossedAt(o.sat, o.altKm, o.time, o.zone, o.offset),
    `, bergerak ke ${WORDS[o.heading]} dengan kecepatan `,
    num(f.dec(o.speedKmS, 2), 'km/s'),
    '.',
  ],
  /** "Sensor VIIRS-nya": the sensor is an acronym, so *-nya* takes a hyphen (§5.2) */
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Sensor ${o.sensor}-nya merekam ${o.place} untuk mosaik harian warna asli NASA, pada `,
    num(f.int(o.gsdM), 'm'),
    ' per piksel.',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Radarnya, yang menghadap ',
    num(f.dec(o.deg, 1), '°'),
    ` ke samping, merekam ${o.place} pada `,
    num(f.int(o.gsdM), 'm'),
    o.dark ? ' per piksel, dalam gelap.' : ' per piksel.',
  ],
  lookingDown: 'Kameranya menghadap lurus ke bawah.',
  lookingOff: (deg: number): Rich => ['Kameranya miring ', num(f.dec(deg, 1), '°'), ' dari arah lurus ke bawah.'],
  cloudCover: (pct: number): Rich => ['Tutupan awan di seluruh citra: ', num(f.int(pct), '%'), '.'],

  // ── "Kemungkinan besar diawasi" ──────────────────────────────────────────────────────────
  likely: {
    /**
     * No swath known: the sentence ends after the place clause. *berada dalam*, not *berada di dalam*: with a two-word
     * direction (*barat dayamu*) the sentence stays at 20 words (id.md §2.1)
     */
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      ...crossedAt(o.sat, o.altKm, o.time, o.zone, o.offset),
      ...(o.swathKm ? [', dan titikmu berada dalam sapuannya yang selebar ', km(o.swathKm), '.'] : ['.']),
    ],
    archiveFailed: 'Saat itu siang, jadi titik ini seharusnya terekam. Arsipnya tidak bisa ditelusuri saat ini.',
    noScene:
      'Tidak ada citra dari lintasan ini. Sentinel-2 hanya merekam daratan dan perairan pesisir, dan mungkin tidak menjadwalkan titik ini.',
    notYet:
      'Saat itu siang, jadi titik ini hampir pasti terekam. ' +
      'Belum ada citra dari lintasan ini yang dipublikasikan; arsip bisa terlambat sehari atau lebih.',
    dark: 'Saat itu di sini gelap. Satelit cuaca terus memindai dengan inframerah pada malam hari, jadi yang terekam awanmu, bukan jalananmu.',
    mosaicUnconfirmed: 'Mosaik harian NASA untuk lintasan ini belum bisa dipastikan di titikmu.',
    notPublished: 'Citranya dipakai untuk prakiraan cuaca; citra itu tidak dipublikasikan sebagai gambar yang bisa kami tampilkan.',
  },

  // ── "Mungkin mengarah ke sini" ───────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${o.sat} melintas dalam jangkauan pukul `,
      clock(o.time, o.zone),
      ...(o.offset ? [', ', km(o.offset.km), ` di sebelah ${FROM_YOU[o.offset.dir]}.`] : [', tepat di atasmu.']),
    ],
    /** The English starts with the place; Indonesian never does (§5.1 rule 4): the swath is the subject */
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'Sapuannya yang selebar ',
      km(o.swathKm),
      ` mencakup ${o.place}. Operatornya tidak memublikasikan tempat yang direkamnya, jadi kami tidak bisa tahu apakah itu terjadi.`,
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Radar bisa menembus awan dan gelap. ',
      ...(o.deg === undefined ? ['Satelit ini'] : ['Dengan radar miring ', num(f.dec(o.deg, 1), '°'), ' ke samping, satelit ini']),
      ` bisa saja memetakan ${o.place}.`,
      o.openArchive ? ' Kami tidak menemukan citra yang dipublikasikan dari lintasan ini.' : ' Kami tidak bisa tahu apakah itu terjadi.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined
        ? ['Dengan kamera menghadap lurus ke bawah, ']
        : ['Dengan kamera miring ', num(f.dec(o.deg, 1), '°'), ' dari arah lurus ke bawah, ']),
      `satelit ini bisa saja mengawasi ${o.place}. Kami tidak bisa tahu apakah itu terjadi.`,
    ],
  },

  // ── "Melintas di atas" ───────────────────────────────────────────────────────────────────
  /** Near the zenith (80° and up, no direction): *hampir tepat di atasmu* */
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat} melintas pukul `,
    clock(o.time, o.zone),
    ' pada ketinggian ',
    km(o.altKm),
    ', ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' di atas cakrawalamu, hampir tepat di atasmu.' : ` di atas cakrawalamu di sebelah ${WORDS[o.toward]}.`,
  ],
  darkStation: 'Saat itu di tempatmu gelap. Jika masih terkena sinar matahari, stasiun itu melintasi langitmu sebagai titik terang yang tak berkedip.',
}
export default pass
