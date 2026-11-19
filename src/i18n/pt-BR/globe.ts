/**
 * Brazilian Portuguese copy for the globe's own words (see docs/i18n/pt-BR.md §1.1, §4, §5, §7): the satellite
 * callouts, the capture line, the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why these words: the callouts are instrument readouts, so they are nouns with no verb and nothing that agrees with a
 * satellite whose gender is unknown (*a ISS*, *o Sentinel-2C*). "Imaged" and "acquired" before a time are *Imagem*
 * (the image's time: *Imagem 11:21:13 EST · 10 m*), the generic word for any picture, radar and full-disc frames
 * included; the countdown's label is *Captação*, the noun of *captar*, the guide's verb for an instrument making an
 * image, and the moment itself *Imagem captada*. Closest approach is *Máxima aproximação* (the glossary's moment).
 * The pin is a *ponto* (*Marcar ponto*, *Ponto marcado*, never *alfinete*); a place or coordinates follow *sobre* or a
 * colon, bare: no article, no contracting *de / em*, nothing that agrees with them, and *ele* refers back to *ponto*,
 * never to the slot. Stored in sentence case; CSS uppercases the callouts. The altitude slot is handed back as the very
 * part it was given (the frame loop finds it by identity).
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('pt-BR')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  imaged: (clock: string, zone: string) => `Imagem ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `Imagem ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Imagem ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Imagem ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Captação · ${satellite}`,
  closestApproachOf: (satellite: string) => `Máxima aproximação · ${satellite}`,
  acquiredNow: 'Imagem captada',
  closestApproachNow: 'Máxima aproximação',

  pin: {
    card: 'Ponto marcado',
    naming: 'Identificando o local',
    noName: 'Sem nome por perto',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Mostrar o que passou sobre ${place}`,
    searchTitle: 'Buscar aqui (Enter)',
    removeAria: 'Remover o ponto',
    removeTitle: 'Remover o ponto (Esc)',
    moveHint: 'Segure o globo para mover o ponto',
    droppedAt: (coords: string) => `Ponto marcado em ${coords}.`,
    droppedIn: (place: string) => `Ponto marcado: ${place}. Pressione Enter ou a seta para ver o que passou sobre ele.`,
    droppedUnnamed: 'Ponto marcado. Pressione Enter ou a seta para ver o que passou sobre ele.',
  },

  noGl: {
    title: 'Visualização 3D indisponível',
    // A nowrap mono line, nominal like the title: the guide's *O WebGL 2 está desativado neste navegador* is 324 px at
    // 11 px (English 235 px), past a 320 px phone's room; this is 269 px.
    reason: 'WebGL 2 desativado neste navegador',
  },
}
export default globe
