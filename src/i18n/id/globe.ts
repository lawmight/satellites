/**
 * Indonesian copy for the globe's own words (see docs/i18n/id.md §4.1, §7). The callouts and readouts are mono labels
 * uppercased by CSS, so they are stored in sentence case and units in their SI symbols (*km*, *m*, never uppercased).
 *
 * The instrument keeps the English pair apart: the satellite's callout labels the picture with a noun, *Citra
 * 11:21:13 WIB* ("IMAGED", the imaged lane's `CITRA`, §3.7), because *Merekam* is the gallery's live "Acquiring"
 * state on the same screen and *Direkam* would be a near-twin of the capture line. The capture line under the place
 * says what happened to the place, *Terekam 11:21:13 WIB · 10 m* ("ACQUIRED", the glossary's *terekam*). Neither is
 * the product verb *mengawasi*, which the prose keeps. The countdown counts to *Perekaman* (acquisition) or to *Saat
 * terdekat* (the glossary's "closest").
 *
 * The pin card's lines were measured with the app's own fonts: *Tidak ada nama tempat* is 140 px of the 156 px column
 * at 13 px; the move hint *Pindahkan pin: tahan di mana pun* (269 px with its padding, the English 285 px) keeps
 * "anywhere" and leaves the globe to context (the hint sits under the pin card on it), where the literal *Tahan bola
 * dunia di mana pun untuk memindahkannya* would overflow a 320 px phone.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('id')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  /** "CITRA 11:21:13 WIB" (a noun label: never *Merekam*, the gallery's loading state) */
  imaged: (clock: string, zone: string) => `Citra ${clock} ${zone}`,
  /** "CITRA ≈ 11:21 WIB" */
  imagedAbout: (clock: string, zone: string) => `Citra ≈ ${clock} ${zone}`,

  // ── The capture line ──
  /** "TEREKAM 11:21:13 WIB · 10 m" */
  acquired: (clock: string, zone: string, resolution: string) => `Terekam ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Terekam ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Perekaman · ${satellite}`,
  closestApproachOf: (satellite: string) => `Saat terdekat · ${satellite}`,
  acquiredNow: 'Terekam',
  closestApproachNow: 'Saat terdekat',

  pin: {
    card: 'Pin yang ditaruh',
    /** A dropped pin is a spot: *titik*, never *tempat* (the searched place) */
    naming: 'Menamai titik ini',
    noName: 'Tidak ada nama tempat',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Tampilkan apa yang melintas di atas ${place}`,
    searchTitle: 'Cari di sini (Enter)',
    removeAria: 'Hapus pin',
    removeTitle: 'Hapus pin (Esc)',
    moveHint: 'Pindahkan pin: tahan di mana pun',
    droppedAt: (coords: string) => `Pin ditaruh di ${coords}.`,
    /** *di atasnya* points back at the place (a preposition, never a suffix on the slot itself) */
    droppedIn: (place: string) => `Pin ditaruh di ${place}. Tekan Enter atau tombol panah untuk melihat apa yang melintas di atasnya.`,
    droppedUnnamed: 'Pin ditaruh. Tekan Enter atau tombol panah untuk melihat apa yang melintas di atasnya.',
  },

  noGl: {
    title: 'Tampilan 3D tidak tersedia',
    reason: 'WebGL 2 nonaktif di browser ini',
  },
}
export default globe
