/**
 * Arabic copy for the globe's own words (see docs/i18n/ar.md §3.7 "`globe`", §4.1, §6.2, §6.3): the satellite
 * callouts, the capture line, the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why it reads this way:
 *  - Instrument words are nouns: «التقاط» (imaged), «التُقطت» (acquired), «الالتقاط» (the acquisition), «أقرب نقطة»
 *    (closest approach); never «اكتساب» or «استحواذ». The prose elsewhere says «رصد»; these are the instrument's own
 *    words, as in English. Units are the symbols «كم» and «م» after a no-break space.
 *  - Direction: these lines sit in a right-to-left page and mix Latin, digits and Arabic. A number right after a Latin
 *    run ("NORAD 39634", a zone "EST") takes that run's direction and would drift away from its Arabic unit, so the one
 *    Latin run before it is isolated (LRI…PDI, allowed here: DOM-only, aria-hidden decoration, ar.md §6.2.7). The
 *    altitude slot is handed back as the very part it was given (the frame loop finds it by identity).
 *  - The pin card's help addresses the reader only through «يمكنك» + masdar (no gendered imperative, §1.2), and the
 *    place stays after a preposition («في», «فوق»), never a verb's subject (§5.1).
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('ar')

/** Left-to-right isolate: U+2066 … U+2069 */
const LRI = '\u2066'
const PDI = '\u2069'

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => [`${LRI}NORAD `, norad, `${PDI} · `, altitude, '\u00a0كم'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => [
    `${LRI}NORAD `,
    norad,
    `${PDI} · `,
    altitude,
    '\u00a0كم',
    ' · ',
    imaged,
  ],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, '\u00a0كم'],
  imaged: (clock: string, zone: string) => `التقاط ${LRI}${clock}\u00a0${zone}${PDI}`,
  imagedAbout: (clock: string, zone: string) => `التقاط ${LRI}≈ ${clock}\u00a0${zone}${PDI}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `التُقطت ${LRI}${clock}\u00a0${zone}${PDI} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `التُقطت ${LRI}≈ ${clock}\u00a0${zone}${PDI} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)}\u00a0م`,
  resolutionKm: (km: number) => `${f.int(km)}\u00a0كم`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `الالتقاط · ${satellite}`,
  closestApproachOf: (satellite: string) => `أقرب نقطة · ${satellite}`,
  acquiredNow: 'التُقطت',
  closestApproachNow: 'أقرب نقطة',

  pin: {
    card: 'الدبوس',
    naming: 'جارٍ تسمية هذه البقعة',
    noName: 'لا اسم لمكان قريب',
    placeTitle: (name: string, area: string) => `${name}، ${area}`,
    searchAria: (place: string) => `عرض ما مرّ فوق ${place}`,
    searchTitle: 'البحث هنا (Enter)',
    removeAria: 'إزالة الدبوس',
    removeTitle: 'إزالة الدبوس (Esc)',
    moveHint: 'الضغط المطوّل على الكرة ينقله',
    droppedAt: (coords: string) => `وُضع دبوس عند ${coords}.`,
    droppedIn: (place: string) => `وُضع دبوس في ${place}. يمكنك الضغط على Enter أو السهم لعرض ما مرّ فوق المكان.`,
    droppedUnnamed: 'وُضع دبوس. يمكنك الضغط على Enter أو السهم لعرض ما مرّ فوق المكان.',
  },

  noGl: {
    title: 'العرض ثلاثي الأبعاد غير متاح',
    reason: 'تقنية WebGL 2 معطّلة في هذا المتصفح',
  },
}
export default globe
