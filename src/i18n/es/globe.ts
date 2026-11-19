/**
 * Spanish copy for the globe's own words (see docs/i18n/es.md §4, §5, §7, §9): the satellite callouts, the capture
 * line, the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why these words: the callouts are instrument readouts, so they are nouns with no verb. "Imaged", "acquired" and
 * "acquisition" are all *Captura* (the glossary's word, as in *CAPTURA 11:21:21 EST · 10 m*); the moment itself is
 * *Imagen captada*, so it does not repeat the label over it. Closest approach is *Máxima aproximación*. The pin is a
 * *marcador*, and the arrow says *Ver los satélites que pasaron sobre…*, never *qué pasó* (which means "what
 * happened"). Place names and coordinates go after *sobre* or *en*, bare: no article, no contraction, nothing that
 * agrees with them. Stored in sentence case; CSS uppercases the callouts. The altitude slot is handed back as the very
 * part it was given (the frame loop finds it by identity).
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('es')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, '\u00a0km'],
  imaged: (clock: string, zone: string) => `Captura ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `Captura ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Captura ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Captura ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)}\u00a0m`,
  resolutionKm: (km: number) => `${f.int(km)}\u00a0km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Captura · ${satellite}`,
  closestApproachOf: (satellite: string) => `Máxima aproximación · ${satellite}`,
  acquiredNow: 'Imagen captada',
  closestApproachNow: 'Máxima aproximación',

  pin: {
    card: 'Marcador colocado',
    naming: 'Buscando el nombre',
    noName: 'No hay nombres cerca',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Ver los satélites que pasaron sobre ${place}`,
    searchTitle: 'Buscar aquí (Enter)',
    removeAria: 'Quitar el marcador',
    removeTitle: 'Quitar el marcador (Esc)',
    moveHint: 'Mantén presionado para moverlo',
    droppedAt: (coords: string) => `Marcador colocado en ${coords}.`,
    droppedIn: (place: string) =>
      `Marcador colocado en ${place}. Presiona Enter o la flecha para ver los satélites que pasaron por aquí.`,
    droppedUnnamed: 'Marcador colocado. Presiona Enter o la flecha para ver los satélites que pasaron por aquí.',
  },

  noGl: {
    title: 'Vista 3D no disponible',
    reason: 'WebGL 2 desactivado en este navegador',
  },
}
export default globe
