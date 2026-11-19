/**
 * Indonesian copy for the passes: the list grouped by verdict and the view of one pass (see src/i18n/en/passView.ts;
 * docs/i18n/id.md is the authority on words).
 *
 * Why it reads this way: Indonesian has one plural category and one noun form for any count, so every count is
 * "[NUM] lintasan", "[NUM] satelit" (never reduplicated, no classifier; id.md §5.3), and the verdict a count arrives
 * with does not change the unit. A pass is in the past, so its conditions are anchored with *saat itu*, never *sedang*
 * (§2.1). Readout labels are the glossary's (§4.1), sized for the strip's four cells and the two-column grid (§7);
 * compass points, days, clocks and zones arrive written. Satellites get no pronoun: *-nya* on a noun or *satelit ini*.
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('id')
/** The unit of every verdict's count: a pass, the same form for 1 and 1.715 */
const PASS = 'lintasan'

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'Tak satu pun satelit yang kami lacak melintasi tempat ini dalam rentang waktu ini. Itu jarang terjadi; catatan di atas menyebutkan jika ada sumber data yang mati.',
  imagedOrder: 'paling rinci, lalu terbaru',
  count: (n: number, _verdict: Verdict) => `${f.int(n)} ${PASS}`,
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), PASS),
  sats: (n: number) => `${f.int(n)} satelit`,
  showAllSats: (n: number) => `Tampilkan semua ${f.int(n)} satelit`,
  showAllRows: (n: number) => `Tampilkan semua ${f.int(n)} baris`,
  showMore: (n: number) => `Tampilkan ${f.int(n)} lagi`,
  left: (n: number) => `sisa ${f.int(n)}`,
  // "Tampilkan lebih sedikit" overflows the one-line row beside "Tampilkan 40 lagi · sisa 12" (≈ 420 px of ≈ 340)
  showFewer: 'Ciutkan',
  tag: {
    mosaic: 'Mosaik',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Berawan · ${f.int(pct)}%`,
    cloudedAtSpot: 'Berawan · di titik',
  },
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [o.sat, o.verb, `${o.day} ${o.time} ${o.zone}`, o.ago, o.cloudPct !== undefined ? `awan ${f.int(o.cloudPct)} persen` : undefined, o.clouded ? 'tertutup awan' : undefined]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `miring ${f.dec(deg, 1)}°`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `awan ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `Perbesar citra: ${sat}, ${day} ${time}`,
  expandTitle: 'Perbesar citra',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${f.int(o.passes)} ${PASS}, terakhir ${o.day} ${o.time}`,
  latest: 'Terakhir ',
  closest: 'Terdekat ',
  cloudChip: 'Awan',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Citra',
  planSection: 'Tampak atas lintasan',
  geometry: 'Geometri',
  replay: 'Putar ulang',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Citra cakram penuh: satu gambar dari semua yang bisa dilihat satelit ini, pada ${pixel} per piksel di sini. Kasar, tetapi asli, dan ini citra terbaru yang dipublikasikan. Sepanjang minggu, satelit ini merekam citra serupa ${
      cadenceMin === 1 ? 'setiap menit' : cadenceMin ? `setiap ${f.int(cadenceMin)} menit` : 'setiap beberapa menit'
    }.`,
  mosaicNote: (gsdM: number) =>
    `Mosaik harian: NASA menggabungkan sapuan setiap hari menjadi satu gambar pada ${f.int(gsdM)} m per piksel. Kasar, tetapi asli, dan dari hari yang sama dengan lintasan ini.`,
  radarNote:
    'Citra radar, bukan foto: Sentinel-1 memancarkan gelombang mikro dan merekam pantulannya, jadi awan dan gelap tidak menghalanginya. Kecerahannya menunjukkan seberapa kuat permukaan memantulkan gelombang itu: bangunan dan tanah kasar tampak terang, air yang tenang tampak gelap.',
  noImage: {
    openArchive: (sat: string) => `Tidak ada citra ${sat} dari titik ini pada lintasan ini. Tampak atas lintasan.`,
    radarPrivate: 'Tidak ada citra publik: arsip operator radar ini bersifat privat. Tampak atas lintasan.',
    commercialPrivate: 'Tidak ada citra publik: arsip komersial bersifat privat. Tampak atas lintasan.',
    noneToShow: 'Tidak ada citra yang bisa ditampilkan untuk lintasan ini. Tampak atas lintasan.',
    archiveDown: 'Arsip tidak bisa ditelusuri saat ini. Tampak atas lintasan.',
    noScene: 'Tidak ada citra dari lintasan ini. Tampak atas lintasan.',
    notYet: 'Belum ada citra yang dipublikasikan untuk lintasan ini. Citra Sentinel-2 dan Landsat biasanya muncul dalam sehari.',
    crewed: 'Stasiun berawak membawa kamera, tetapi fotonya tidak dipublikasikan menurut tempat dan waktu.',
    unavailable: 'Citra untuk lintasan ini tidak tersedia.',
  },
  links: {
    openToSave: 'Buka citra untuk menyimpannya',
    downloading: 'Mengunduh…',
    download: 'Unduh citra',
    viewSource: (archive: string) => `Lihat sumber · ${archive}`,
  },
  spot: {
    checking: 'Membaca piksel di titikmu…',
    clear: 'Cerah di atas titikmu.',
    cirrus: 'Sirus tipis terdeteksi di atas titikmu; citranya bisa sedikit buram.',
    cloud: 'Awan di atas titikmu.',
    shadow: 'Titikmu berada dalam bayangan awan.',
  },

  // ── the readout strip ────────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Ketinggian',
    elevation: 'Elevasi',
    offNadir: 'Miring',
    pixel: 'Piksel',
    band: 'Kanal',
    sun: 'Matahari',
    cloud: 'Awan',
    cloudAtSpot: 'Awan di titik',
  },
  band: { infrared: 'Inframerah', visible: 'Tampak', colour: 'Warna' },
  spotValue: { clear: 'Cerah', cirrus: 'Sirus', cloud: 'Awan', shadow: 'Bayangan' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    up: 'di atas',
    mosaic: 'mosaik',
    scene: 'citra',
    sun: { day: 'siang', twilight: 'temaram', night: 'malam' },
  },

  // ── 01 / Geometri ────────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'Saat terdekat · UTC',
    closestLocal: 'Saat terdekat · setempat',
    groundDistance: 'Jarak permukaan',
    elevationFromYou: 'Elevasi dari tempatmu',
    groundSpeed: 'Kecepatan darat',
    heading: 'Arah',
    sunElevation: 'Elevasi matahari',
    fieldOfRegard: 'Rentang pandang',
    swath: 'Lebar sapuan',
    inSwath: 'Dalam sapuan',
    inView: 'Dalam jangkauan',
    window: 'Rentang waktu',
    noradPass: 'NORAD · lintasan',
    scanUtc: 'Garis pindai · UTC',
    // Without "di sini": with it the label overflows the column (id.md §4.1).
    scanLocal: 'Garis pindai · setempat',
    aboveEquator: 'Posisi di khatulistiwa',
    inYourSky: 'Di langitmu',
    scanDirection: 'Arah pindai',
    lineSpeed: 'Kecepatan garis di sini',
    coverage: 'Cakupan',
    thisScan: 'Pindaian ini',
    noradScan: 'NORAD · pindaian',
  },
  northToSouth: 'Utara → selatan',
  southToNorth: 'Selatan → utara',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Siang', twilight: 'Temaram', night: 'Malam' },
  fullDisc: 'Cakram penuh',
  everyMin: (n: number) => `setiap ${f.int(n)} mnt`,
  upCompass: (compass: string) => `di atas · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'Naik' : 'Turun'}`,
}

export default passView
