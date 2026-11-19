/**
 * Turkish copy for the globe's own words (src/globe; see docs/i18n/tr.md §3.10, §4, §5.1, §6.3, §6.6): the satellite
 * callouts, the capture line, the acquisition countdown, the dropped pin's card and the note shown with no 3D view.
 *
 * Why it reads like this: the callouts and readouts are mono labels uppercased by CSS under `lang="tr"`, so they are
 * written in sentence case, units as lowercase symbols after a no-break space (`786 km`, still lowercase in the
 * capitals, §6.3). The words are the glossary's and keep the English pair apart: `Görüntülendi` is the callout's
 * instrument verb (IMAGED), `Alındı` the capture line's and the countdown's moment of the picture (ACQUIRED),
 * `Görüntü alımı` the acquisition (never bare *alım*, which reads "purchase", §9.1), `En yakın an` the closest approach
 * (§4). Every clock, zone, NORAD number and satellite name is a label value after a word or a middle dot, so none
 * takes a suffix (§5).
 *
 * The pin card's place is a geocoder name or coordinates, never inflected: it stands before the invariant *üzerinden*
 * (`Waterloo üzerinden ne geçtiğini göster`) or after a colon (`Raptiye bırakıldı: Waterloo.`, §5.1), and the spoken
 * hint refers back with *Üzerinden*, so no name needs a case ending. A name that already ends with a full stop
 * (`Washington, D.C.`) takes no second one. `Enter’a` and `oka` carry their suffixes on fixed words (§6.1). The unnamed
 * spot is `Çevrede yer adı yok` (*Yakında* also means "soon", §9.1); the move hint `Taşımak için küreye basılı tut`
 * (30 characters against the English 34: it must fit a 320 px phone).
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('tr')

/** The spoken hint after a dropped pin; *Üzerinden* refers back to the pin, so no name is inflected. */
const PRESS = 'Üzerinden ne geçtiğini görmek için Enter’a ya da oka bas.'

/** A clock and its zone, which never part: "11:21:13 EST", "07:49 UTC+9". */
const at = (clock: string, zone: string) => `${clock} ${zone}`

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => [
    'NORAD ',
    norad,
    ' · ',
    altitude,
    ' km',
    ' · ',
    imaged,
  ],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  imaged: (clock: string, zone: string) => `Görüntülendi ${at(clock, zone)}`,
  imagedAbout: (clock: string, zone: string) => `Görüntülendi ≈ ${at(clock, zone)}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Alındı ${at(clock, zone)} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Alındı ≈ ${at(clock, zone)} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Görüntü alımı · ${satellite}`,
  closestApproachOf: (satellite: string) => `En yakın an · ${satellite}`,
  acquiredNow: 'Alındı',
  closestApproachNow: 'En yakın an',

  pin: {
    card: 'Bırakılan raptiye',
    naming: 'Yer adı bulunuyor',
    noName: 'Çevrede yer adı yok',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `${place} üzerinden ne geçtiğini göster`,
    searchTitle: 'Burada ara (Enter)',
    removeAria: 'Raptiyeyi kaldır',
    removeTitle: 'Raptiyeyi kaldır (Esc)',
    moveHint: 'Taşımak için küreye basılı tut',
    droppedAt: (coords: string) => `Raptiye bırakıldı: ${coords}.`,
    droppedIn: (place: string) => `Raptiye bırakıldı: ${place}${place.endsWith('.') ? '' : '.'} ${PRESS}`,
    droppedUnnamed: `Raptiye bırakıldı. ${PRESS}`,
  },

  noGl: {
    title: '3B görünüm kullanılamıyor',
    reason: 'Bu tarayıcıda WebGL 2 kapalı',
  },
}
export default globe
