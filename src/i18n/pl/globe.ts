/**
 * Polish copy for the globe's own words (see docs/i18n/pl.md §3.7, §6.4): the satellite callouts, the capture line,
 * the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why nouns: the callouts are mono labels on the scene (uppercased by CSS, so stored in sentence case), and one event
 * gets one noun: the moment of the picture is «Ujęcie» in the callout, the capture line and the countdown alike, the
 * moment it happens «Zarejestrowano» (impersonal, so nothing agrees with the satellite), closest approach «Najbliżej».
 * Units are symbols («km», «m»). Never a strike word («cel», «namierzać»). The altitude slot is handed back as the
 * very part it was given (the frame loop finds it by identity). The pin's place only ever follows a colon, where any
 * name stays in the nominative; in prose the spot is «to miejsce». The pin is «pinezka» (f.), as the landing's «Postaw
 * pinezkę».
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('pl')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, '\u00a0km'],
  imaged: (clock: string, zone: string) => `Ujęcie ${clock}\u00a0${zone}`,
  imagedAbout: (clock: string, zone: string) => `Ujęcie ≈ ${clock}\u00a0${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Ujęcie ${clock}\u00a0${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Ujęcie ≈ ${clock}\u00a0${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)}\u00a0m`,
  resolutionKm: (km: number) => `${f.int(km)}\u00a0km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Ujęcie · ${satellite}`,
  closestApproachOf: (satellite: string) => `Najbliżej · ${satellite}`,
  acquiredNow: 'Zarejestrowano',
  closestApproachNow: 'Najbliżej',

  pin: {
    card: 'Pinezka',
    naming: 'Ustalanie nazwy…',
    noName: 'Brak nazwy w\u00a0pobliżu',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Pokaż, co przeleciało nad tym miejscem: ${place}`,
    searchTitle: 'Szukaj tutaj (Enter)',
    removeAria: 'Usuń pinezkę',
    removeTitle: 'Usuń pinezkę (Esc)',
    moveHint: 'Przytrzymaj globus, by ją przesunąć',
    droppedAt: (coords: string) => `Pinezka postawiona: ${coords}.`,
    droppedIn: (place: string) =>
      `Pinezka postawiona: ${place}. Naciśnij Enter lub strzałkę, by zobaczyć, co przeleciało nad tym miejscem.`,
    droppedUnnamed: 'Pinezka postawiona. Naciśnij Enter lub strzałkę, by zobaczyć, co przeleciało nad tym miejscem.',
  },

  noGl: {
    title: 'Widok 3D niedostępny',
    reason: 'WebGL 2 jest wyłączony w\u00a0tej przeglądarce',
  },
}
export default globe
