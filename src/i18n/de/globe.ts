/**
 * German copy for the globe's own words (src/globe; see docs/i18n/de.md §3.9, §4.1, §5.1, §6.3, §7): the satellite
 * callouts, the capture line, the acquisition countdown, the dropped pin's card and the note shown with no 3D view.
 *
 * Why it reads like this: the callouts and readouts are mono labels uppercased by CSS, so they are written in sentence
 * case, with units as lowercase SI symbols after a no-break space (`786 km`, still lowercase in the capitals, §6.5).
 * The words are the guide's: `Erfasst` for the capture line and the countdown's moment of the picture, `Aufnahme` for
 * the acquisition, `Größte Annäherung` for closest approach (never *nächster …*, which reads as "next", §9.1), and
 * `Aufgenommen` for the callout's moment of the picture, the instrument's verb, kept apart from the capture line's word
 * as the English keeps IMAGED apart from ACQUIRED. A participle or a noun before a clock agrees with nothing, so no
 * satellite needs a gender (§5.2). Every `zone` slot goes through zoneDe (CET reads MEZ, §6.3); `≈` stays (DOM only, §6.7).
 *
 * The pin card's place is a geocoder name, often English and never inflected (§5.1), so it only follows a colon
 * (`Überflüge anzeigen: Waterloo`, `Pin gesetzt: Waterloo.`), and the spoken hint refers back with the gender-free
 * *darüber*, never a pronoun. The move hint is `Pin versetzen: Globus gedrückt halten` (283 px, it must fit a 320 px
 * phone) and the unnamed spot `Kein Ort in der Nähe` (120 of the column's 156 px at 13 px, §7). Coordinates, clocks,
 * NORAD numbers and satellite names arrive as they are.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import { zoneDe } from '../../../api/_lib/i18n/card/deZone'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('de')

/** The spoken hint after a dropped pin; *darüber* refers back without a gender. */
const PRESS = 'Drücke Enter oder den Pfeil, um zu sehen, was darüber hinwegzog.'

/** A clock and its zone, which never part: "11:21:13 EST", "07:49 MEZ". */
const at = (clock: string, zone: string) => `${clock} ${zoneDe(zone)}`

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
  imaged: (clock: string, zone: string) => `Aufgenommen ${at(clock, zone)}`,
  imagedAbout: (clock: string, zone: string) => `Aufgenommen ≈ ${at(clock, zone)}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Erfasst ${at(clock, zone)} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Erfasst ≈ ${at(clock, zone)} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Aufnahme · ${satellite}`,
  closestApproachOf: (satellite: string) => `Größte Annäherung · ${satellite}`,
  acquiredNow: 'Erfasst',
  closestApproachNow: 'Größte Annäherung',

  pin: {
    card: 'Gesetzter Pin',
    naming: 'Ort wird bestimmt …',
    noName: 'Kein Ort in der Nähe',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Überflüge anzeigen: ${place}`,
    searchTitle: 'Hier suchen (Enter)',
    removeAria: 'Pin entfernen',
    removeTitle: 'Pin entfernen (Esc)',
    moveHint: 'Pin versetzen: Globus gedrückt halten',
    droppedAt: (coords: string) => `Pin gesetzt bei ${coords}.`,
    /** A name that already ends with a full stop ("Washington, D.C.") takes no second one */
    droppedIn: (place: string) => `Pin gesetzt: ${place}${place.endsWith('.') ? '' : '.'} ${PRESS}`,
    droppedUnnamed: `Pin gesetzt. ${PRESS}`,
  },

  noGl: {
    title: '3D-Ansicht nicht verfügbar',
    reason: 'WebGL 2 ist in diesem Browser aus',
  },
}
export default globe
