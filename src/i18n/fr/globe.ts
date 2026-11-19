/**
 * French copy for the globe's own words (src/globe; see docs/i18n/fr.md §3.9, §5.1, §6.5, §6.8): the satellite
 * callouts, the capture line, the acquisition countdown, the dropped pin's card and the note shown with no 3D view.
 *
 * Why it reads like this: the callouts and readouts are mono labels uppercased by CSS, so they are written in sentence
 * case and keep their accents in caps. They are nouns, never participles (§1.1): «Image 11:21:13 EST»,
 * «Acquisition · SENTINEL-2C», «Au plus près» (closest approach, never «vue rapprochée», which is the closest look):
 * a noun agrees with nothing, whatever the satellite. Units are lowercase symbols (CSS prints them in caps, as English
 * does), joined to the number by U+00A0, as is a time to its zone. «≈» is kept: these are web readouts (§6.8). The pin
 * card's place is a geocoder name, often English: it only ever follows a colon or a transitive verb («Repère posé :
 * [PLACE]», «Voir ce qui a survolé [PLACE]», §5.1), and the spoken hint says «ce qui est passé au-dessus» rather than
 * a pronoun that would have to agree with the place. Coordinates, clocks, zones, NORAD numbers and satellite names
 * arrive as they are.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('fr')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, '\u00a0km'],
  imaged: (clock: string, zone: string) => `Image ${clock}\u00a0${zone}`,
  imagedAbout: (clock: string, zone: string) => `Image ≈\u00a0${clock}\u00a0${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Acquisition ${clock}\u00a0${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Acquisition ≈\u00a0${clock}\u00a0${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)}\u00a0m`,
  resolutionKm: (km: number) => `${f.int(km)}\u00a0km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Acquisition · ${satellite}`,
  closestApproachOf: (satellite: string) => `Au plus près · ${satellite}`,
  acquiredNow: 'Image prise',
  closestApproachNow: 'Au plus près',

  pin: {
    card: 'Repère posé',
    naming: 'Recherche du nom',
    noName: 'Aucun lieu nommé ici',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Voir ce qui a survolé ${place}`,
    searchTitle: 'Rechercher ici (Entrée)',
    removeAria: 'Retirer le repère',
    removeTitle: 'Retirer le repère (Échap)',
    moveHint: 'Appui long où vous voulez le repère',
    droppedAt: (coords: string) => `Repère posé\u00a0: ${coords}.`,
    droppedIn: (place: string) =>
      `Repère posé\u00a0: ${place}. Appuyez sur Entrée ou sur la flèche pour voir ce qui est passé au-dessus.`,
    droppedUnnamed: 'Repère posé. Appuyez sur Entrée ou sur la flèche pour voir ce qui est passé au-dessus.',
  },

  noGl: {
    title: 'Vue 3D indisponible',
    reason: 'WebGL 2 est désactivé dans ce navigateur',
  },
}
export default globe
