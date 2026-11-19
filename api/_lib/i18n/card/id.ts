/**
 * Indonesian copy for the share card and the share page (see ./en.ts for where each message shows, its slots and its
 * constraints; docs/i18n/id.md §3.6 is the authority on every line here).
 *
 * Pure TypeScript with no DOM, Node or src/ imports, like ./en.ts: the server reads it through cardMessages('id'), and
 * the app's Indonesian bundle lists this same module as its 'card' namespace.
 *
 * Why it reads this way:
 *  - Every card leads with the week's N, "[NUM] satelit mengawasi", and the place (with its full stop, or "minggu
 *    ini.") is the serif block. Indonesian nouns do not inflect, so one form serves every count; zero is its own
 *    sentence, *Tak satu pun satelit yang kami lacak mengawasi* (id.md §3.3).
 *  - Names are inserted bare: no article before an ocean, no class noun, nothing attached to the slot, and a sentence
 *    never starts with the place ("Waterloo was inside its swath" → *Sapuannya mencakup Waterloo.*; §5.1). A nameless
 *    satellite is *Sebuah satelit* as a subject and *sebuah satelit* after *dari* (§5.2).
 *  - Dates are CLDR `id` at the place's zone (formatDate): prose has the full weekday ("Minggu, 1 Nov 2026"); a stamp
 *    that stands alone drops it, because in caps *MIN 1 NOV* reads "minus 1" (§3.6, §5.5). Clocks and zones arrive
 *    formatted and keep their colon.
 *  - Numbers take Indonesian grouping and the decimal comma (fmt('id'): "1.715", "7,46"); units are the SI symbols.
 */
import { fmt } from '../format.js'
import { formatDate } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('id')

// ── Days at the place's zone (CLDR `id`) ────────────────────────────────────────────────────────────────────────────

/** "1 Nov 2026": a stamp that stands alone, no weekday */
const dayYear = (ms: number, timeZone: string) => formatDate('id', ms, timeZone, { day: 'numeric', month: 'short', year: 'numeric' })
/** "Minggu, 1 Nov 2026": a day in a sentence */
const proseDay = (ms: number, timeZone: string) =>
  formatDate('id', ms, timeZone, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
/** "3 Nov" */
const dayMonth = (ms: number, timeZone: string) => formatDate('id', ms, timeZone, { day: 'numeric', month: 'short' })

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** "31 satelit mengawasi" / "1 satelit mengawasi" / "Tak satu pun satelit yang kami lacak mengawasi" */
const watched = (n: number) =>
  n > 0 ? f.plural(n, { other: `${f.int(n)} satelit mengawasi` }) : 'Tak satu pun satelit yang kami lacak mengawasi'
/** The full stop after the place, unless the place was cut short ("…." reads as a typo). */
const stop = (cut: boolean, tail = '.') => (cut ? [] : [tail])

/** A nameless satellite as a subject, and after a preposition */
const A_SATELLITE = 'Sebuah satelit'
const named = (sat: SatName) => sat ?? A_SATELLITE
const namedObject = (sat: SatName) => sat ?? 'sebuah satelit'

const COMPASS = ['utara', 'timur laut', 'timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut']
/** " pukul 11:21 EST pada Minggu, 1 Nov 2026", *pukul* held to its clock by a no-break space (id.md §6) */
const at = (w?: CardWhen) => (w ? ` pukul ${w.clock} ${w.zone} pada ${proseDay(w.ms, w.timeZone)}` : '')
/** ", bergerak ke selatan" (nothing when the heading is unknown) */
const moving = (heading?: number) => {
  const word = heading !== undefined ? COMPASS[heading] : undefined
  return word ? `, bergerak ke ${word}` : ''
}

const card: CardMessages = {
  // ── The headline ──────────────────────────────────────────────────────────────────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut))],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} mengawasi`, accent(place, ...stop(cut))],
    likely: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} memindai`, accent(place, ...stop(cut))],
    could: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} mungkin mengarah ke`, accent(place, ...stop(cut))],
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} melintas di atas`, accent(place, ...stop(cut))],
  },
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut, ' minggu ini.'))],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  photos: (n: number, atLeast: boolean) =>
    n <= 0
      ? 'Tidak ada citra yang dipublikasikan.'
      : atLeast
        ? f.plural(n, { other: `Setidaknya ${f.int(n)} citra dipublikasikan.` })
        : f.plural(n, { other: `${f.int(n)} citra dipublikasikan.` }),
  archiveDown: 'Arsip citra tidak merespons, jadi saat ini kami tidak bisa menghitung citra publik.',
  archiveDownShort: 'Arsip citra tidak merespons.',
  cloud: {
    only: {
      sub: (_pct: number) => 'Tertutup awan. Yang terlihat hanya awan.',
      chip: (pct: number) => `Tertutup awan · ${f.int(pct)}%`,
      post: (_pct: number) => 'Yang terlihat hanya awan.',
      desc: (pct: number) => `Yang terlihat hanya awan (${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `Sebagian besar awan: ${f.int(pct)}% dari citra.`,
      chip: (pct: number) => `Sebagian besar awan · ${f.int(pct)}%`,
      post: (pct: number) => `Yang terlihat sebagian besar awan (${f.int(pct)}%).`,
      desc: (pct: number) => `Yang terlihat sebagian besar awan (${f.int(pct)}%).`,
    },
    spot: { sub: 'Awan tepat di atas titik ini.', chip: 'Awan di atas titik', post: 'Awan menutupi titik ini.', desc: 'Awan menutupi titik ini.' },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  weekTo: (ms: number, timeZone: string) => `7 hari hingga ${dayYear(ms, timeZone)}`,
  lastWeek: '7 hari terakhir',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'Ketinggian',
    elevation: 'Elevasi',
    speed: 'Kecepatan',
    offNadir: 'Miring',
    pixel: 'Piksel',
    mosaicPixel: 'Piksel mosaik',
    closest: 'Jarak terdekat',
  },
  lane: { imaged: 'Citra', likely: 'Tercakup', could: 'Mungkin', overhead: 'Melintas' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${f.int(km * 1000)} m`),
  geometry: 'Geometri lintasan · utara di atas',
  note: {
    imageInApp: 'Citra bisa dibuka di aplikasi',
    imageUnavailable: 'Citra tidak tersedia saat ini',
    commercial: 'Arsip komersial, tidak publik',
    inSwath: 'Dalam sapuan, belum ada citra publik',
    groundTrack: 'Jejak permukaan saat terdekat',
  },
  acquiring: 'Merekam…',
  noPublicPhoto: 'Tidak ada citra publik pekan ini',
  noPhoto: 'Tidak ada citra untuk ditampilkan',
  look: {
    closest: 'Paling rinci',
    lastClear: 'Cerah terakhir',
    clouded: 'Tertutup awan',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: A_SATELLITE,
  invite: 'Lihat apa yang mengawasimu',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // Four lines: "mengawasi kamu" (538 px at 88 px) does not fit the 466 px column on one line (id.md §3.1).
  hero: [['Sesuatu'], ['mengawasi'], [accent('kamu')], ['minggu ini.']] as Rich[],
  enterAnyPlace: 'Pilih tempat di Bumi',
  defaultPlace: 'Palm Jumeirah',
  defaultAlt:
    'Foto satelit Sentinel-2 asli dari Palm Jumeirah, Dubai, di samping kalimat: Sesuatu mengawasi kamu minggu ini. Pilih tempat di Bumi.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Sesuatu mengawasi kamu minggu ini.',
    description: 'Pilih tempat mana pun di Bumi. Lihat setiap satelit yang melintas di atasnya dalam 7 hari terakhir, beserta citra aslinya.',
    placeTitle: (place: string) => `Apa yang mengawasi ${place} minggu ini`,
    placeDescription: (place: string) =>
      `Setiap satelit yang melintas di atas ${place} dalam 7 hari terakhir, beserta citra aslinya. Apa yang mengawasimu minggu ini?`,
    opening: ['Membuka ', accent('Watched')] as Rich,
  },
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) =>
    `${named(o.sat)} melintas${o.altitudeKm !== undefined ? ` ${f.int(o.altitudeKm)} km` : ''} di atas ${o.place}${at(o.when)}${moving(o.heading)}.`,
  withinView: (o: PassFacts) => `${named(o.sat)} melintas dengan ${o.place} dalam jangkauannya${at(o.when)}${moving(o.heading)}.`,
  couldHave: 'Satelit ini bisa saja mengarah ke sini. Operatornya tidak menyebutkan apakah itu terjadi.',
  straightDown: 'Kameranya menghadap lurus ke bawah.',
  offNadir: (deg: number) => `Kameranya miring ${f.dec(deg, 1)}° dari arah lurus ke bawah.`,
  cloudCover: (pct: number) => `Tutupan awan: ${f.int(pct)}%.`,
  inSwath: (place: string) => `Sapuannya mencakup ${place}.`,
  bestFrom: {
    closest: (sat: SatName) => `Citra paling rinci berasal dari ${namedObject(sat)}.`,
    lastClear: (sat: SatName) => `Citra cerah terakhir berasal dari ${namedObject(sat)}.`,
    first: (sat: SatName) => `Citra pertama berasal dari ${namedObject(sat)}.`,
  },
  question: 'Apa yang mengawasimu minggu ini?',
  cardAlt: {
    withPhoto: (sat: SatName) => `Kartu Watched, dengan citra paling rinci minggu ini, dari ${namedObject(sat)}.`,
    plain: 'Kartu Watched.',
  },
}

export default card
