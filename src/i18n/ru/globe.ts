/**
 * Russian copy for the globe's own words (see docs/i18n/ru.md §3.8, §8): the satellite callouts, the capture line,
 * the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why nouns: the pass sequence draws a crosshair and a shockwave over the reader's town, so its words are never a verb
 * of capture («зафиксировано», «захвачено» are the wording of strike reports). "Imaged", "acquired" and "acquisition"
 * are all «Снимок», closest approach «Сближение», the pin is a «метка». Stored in sentence case; CSS uppercases the
 * callouts. The altitude slot is handed back as the very part it was given (the frame loop finds it by identity). The
 * pin's place is only ever after a colon, where Russian puts the nominative.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('ru')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0км'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0км', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, '\u00a0км'],
  imaged: (clock: string, zone: string) => `Снимок ${clock}\u00a0${zone}`,
  imagedAbout: (clock: string, zone: string) => `Снимок ≈ ${clock}\u00a0${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Снимок ${clock}\u00a0${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Снимок ≈ ${clock}\u00a0${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)}\u00a0м`,
  resolutionKm: (km: number) => `${f.int(km)}\u00a0км`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Снимок · ${satellite}`,
  closestApproachOf: (satellite: string) => `Сближение · ${satellite}`,
  acquiredNow: 'Снимок',
  closestApproachNow: 'Сближение',

  pin: {
    card: 'Поставленная метка',
    naming: 'Определяем название',
    noName: 'Место без названия',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Показать, что пролетало над этим местом: ${place}`,
    searchTitle: 'Искать здесь (Enter)',
    removeAria: 'Убрать метку',
    removeTitle: 'Убрать метку (Esc)',
    // One mono line on a 320 px phone: «Зажми», the word for press-and-hold on a touch screen (34 characters, as English).
    moveHint: 'Зажми глобус, чтобы сдвинуть метку',
    droppedAt: (coords: string) => `Метка поставлена: ${coords}.`,
    droppedIn: (place: string) => `Метка поставлена: ${place}. Нажми Enter или стрелку, чтобы увидеть, что пролетало здесь.`,
    droppedUnnamed: 'Метка поставлена. Нажми Enter или стрелку, чтобы увидеть, что пролетало здесь.',
  },

  noGl: {
    title: '3D-вид недоступен',
    reason: 'В этом браузере отключён WebGL 2',
  },
}
export default globe
