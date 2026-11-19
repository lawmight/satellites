/**
 * Dutch copy for the globe's own words (src/globe; see docs/i18n/nl.md §3.7, §4.1, §5): the satellite callouts, the
 * capture line, the acquisition countdown, the dropped pin's card and the note shown with no 3D view.
 *
 * Why it reads like this: the callouts and readouts are mono labels uppercased by CSS, so they are written in sentence
 * case. They are the glossary's globe words: `Opgenomen` for the callout's moment of the picture, `Vastgelegd` for the
 * capture line and the countdown's moment, `Opname` for the acquisition, `Dichtste nadering` for closest approach (a
 * real moment, never the lead photo's `Scherpst`). A participle or a noun before a clock agrees with nothing, so no
 * satellite needs a gender (§5). Units are lowercase symbols after a no-break space (CSS prints them in caps, as
 * English does), and a clock never parts from its zone. `≈` is kept. The pin card's place is a geocoder name, often
 * English: it only follows a preposition that takes any name (`bij`, `boven`, §5), and the spoken hint refers back to
 * it with the gender-free `er` (`wat er overheen vloog`), never `erover`, which reads as "about it". The unnamed-spot
 * line is shortened from the guide's `Geen plaatsnaam in de buurt` (171 px) to `Geen plaatsnaam vlakbij` (145 px),
 * because the card's text column is a fixed 156 px and the line must fit whole. Coordinates, clocks, zones, NORAD
 * numbers and satellite names arrive as they are.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('nl')

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
  imaged: (clock: string, zone: string) => `Opgenomen ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `Opgenomen ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Vastgelegd ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Vastgelegd ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Opname · ${satellite}`,
  closestApproachOf: (satellite: string) => `Dichtste nadering · ${satellite}`,
  acquiredNow: 'Vastgelegd',
  closestApproachNow: 'Dichtste nadering',

  pin: {
    card: 'Geplaatste speld',
    naming: 'Naam opzoeken',
    noName: 'Geen plaatsnaam vlakbij',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Overvluchten boven ${place} tonen`,
    searchTitle: 'Hier zoeken (Enter)',
    removeAria: 'Speld verwijderen',
    removeTitle: 'Speld verwijderen (Esc)',
    moveHint: 'Houd de bol vast om te verplaatsen',
    droppedAt: (coords: string) => `Speld geplaatst op ${coords}.`,
    droppedIn: (place: string) =>
      `Speld geplaatst bij ${place}. Druk op Enter of op de pijl om te zien wat er overheen vloog.`,
    droppedUnnamed: 'Speld geplaatst. Druk op Enter of op de pijl om te zien wat er overheen vloog.',
  },

  noGl: {
    title: '3D-weergave niet beschikbaar',
    reason: 'WebGL 2 staat uit in deze browser',
  },
}
export default globe
