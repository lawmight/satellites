/**
 * Italian copy for the globe's own words (src/globe; see docs/i18n/it.md §3.7, §4, §5.1, §7): the satellite callouts,
 * the capture line, the acquisition countdown, the dropped pin's card and the note shown with no 3D view.
 *
 * Why it reads like this: the callouts and readouts are mono labels uppercased by CSS, so they are written in sentence
 * case and keep their accents in caps. "Imaged" is the noun *Ripresa* (the glossary's word for a satellite's look at
 * the place), "acquired" is *Acquisita*, agreeing with *immagine*, never with the satellite, whose gender the code
 * cannot know (§5.2); the countdown's labels are nouns (*Acquisizione*, *Massimo avvicinamento*). Units are lowercase
 * symbols joined to the number by U+00A0 (CSS prints them in caps, as English does). The pin is a *segnaposto* (m.,
 * invariable). Its move hint says where to press (*dove vuoi spostarlo*): a held press anywhere on the globe re-drops
 * the pin there (pin.ts), and holding the pin itself does nothing, so a bare *Tieni premuto* would send a touch visitor
 * to the pin. Its place is a geocoder name, often English, so it only ever follows a colon (*Segnaposto inserito:
 * [PLACE]*, *…sopra questo luogo: [PLACE]*) and is never resumed by a pronoun: the spoken hint says *cosa è passato
 * sopra questo luogo*, which agrees with nothing. Keys are *Invio* and *Esc*, as Italian keyboards label them.
 * Coordinates, clocks, zones, NORAD numbers and satellite names arrive as they are; the altitude slot is handed back as
 * the very part it was given (the frame loop finds it by identity).
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('it')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  imaged: (clock: string, zone: string) => `Ripresa ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `Ripresa ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Acquisita ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Acquisita ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Acquisizione · ${satellite}`,
  closestApproachOf: (satellite: string) => `Massimo avvicinamento · ${satellite}`,
  acquiredNow: 'Acquisita',
  closestApproachNow: 'Massimo avvicinamento',

  pin: {
    card: 'Segnaposto inserito',
    naming: 'Ricerca del nome…',
    noName: 'Nessun nome qui vicino',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Mostra cosa è passato sopra questo luogo: ${place}`,
    searchTitle: 'Cerca qui (Invio)',
    removeAria: 'Rimuovi il segnaposto',
    removeTitle: 'Rimuovi il segnaposto (Esc)',
    moveHint: 'Tieni premuto dove vuoi spostarlo',
    droppedAt: (coords: string) => `Segnaposto inserito in ${coords}.`,
    droppedIn: (place: string) =>
      `Segnaposto inserito: ${place}. Premi Invio o la freccia per vedere cosa è passato sopra questo luogo.`,
    droppedUnnamed: 'Segnaposto inserito. Premi Invio o la freccia per vedere cosa è passato sopra questo luogo.',
  },

  noGl: {
    title: 'Vista 3D non disponibile',
    reason: 'WebGL 2 è disattivato in questo browser',
  },
}
export default globe
