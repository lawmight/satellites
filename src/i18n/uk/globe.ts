/**
 * Ukrainian copy for the globe's own words (see docs/i18n/uk.md §3.8, §8): the satellite callouts, the capture line,
 * the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why nouns: the pass sequence draws a crosshair and a shockwave over the reader's town, so its words are never a verb
 * of capture («зафіксовано», «захоплено» are the wording of strike reports). "Imaged", "acquired" and "acquisition"
 * are all «Знімок», closest approach «Зближення», the pin is «мітка». Stored in sentence case; CSS uppercases the
 * callouts. The altitude slot is handed back as the very part it was given (the frame loop finds it by identity). The
 * pin's place is only ever after a colon, where Ukrainian puts the nominative.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('uk')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0км'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0км', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, '\u00a0км'],
  imaged: (clock: string, zone: string) => `Знімок ${clock}\u00a0${zone}`,
  imagedAbout: (clock: string, zone: string) => `Знімок ≈ ${clock}\u00a0${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Знімок ${clock}\u00a0${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Знімок ≈ ${clock}\u00a0${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)}\u00a0м`,
  resolutionKm: (km: number) => `${f.int(km)}\u00a0км`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Знімок · ${satellite}`,
  closestApproachOf: (satellite: string) => `Зближення · ${satellite}`,
  acquiredNow: 'Знімок',
  closestApproachNow: 'Зближення',

  pin: {
    card: 'Поставлена мітка',
    naming: 'Визначаємо назву',
    noName: 'Поблизу немає назв',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Показати, що пролітало над цим місцем: ${place}`,
    searchTitle: 'Шукати тут (Enter)',
    removeAria: 'Прибрати мітку',
    removeTitle: 'Прибрати мітку (Esc)',
    moveHint: 'Утримуй глобус, щоб перенести мітку',
    droppedAt: (coords: string) => `Мітку поставлено: ${coords}.`,
    droppedIn: (place: string) => `Мітку поставлено: ${place}. Натисни Enter або стрілку, щоб побачити, що пролітало тут.`,
    droppedUnnamed: 'Мітку поставлено. Натисни Enter або стрілку, щоб побачити, що пролітало тут.',
  },

  noGl: {
    title: '3D-вигляд недоступний',
    reason: 'У цьому браузері вимкнено WebGL 2',
  },
}
export default globe
