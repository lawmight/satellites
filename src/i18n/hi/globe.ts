/**
 * Hindi copy for the globe's own words (see docs/i18n/hi.md §3.7, §4.1): the satellite callouts, the capture line, the
 * acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why these words: the callouts and readouts are instrument labels, so they are nouns and short participles: «तस्वीर
 * ली» for IMAGED (the picture was taken: «ली» agrees with «तस्वीर», our own noun, and fits a radar image as well as a
 * photo), «प्राप्त» for ACQUIRED, «तस्वीर का समय» and «सबसे नज़दीकी पल» over the countdown. Units are Hindi's own
 * symbols, «किमी» and «मी», as Hindi papers print them. The pin's spoken lines are passives agreeing with «पिन» (m),
 * and the instruction is the polite imperative. NORAD numbers, coordinates, clocks and zones arrive as they are.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('hi')

const globe: typeof en = {
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0किमी'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, '\u00a0किमी', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, '\u00a0किमी'],
  imaged: (clock: string, zone: string) => `तस्वीर ली ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `तस्वीर ली ≈ ${clock} ${zone}`,

  acquired: (clock: string, zone: string, resolution: string) => `प्राप्त ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `प्राप्त ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)}\u00a0मी`,
  resolutionKm: (km: number) => `${f.int(km)}\u00a0किमी`,

  acquisitionOf: (satellite: string) => `तस्वीर का समय · ${satellite}`,
  closestApproachOf: (satellite: string) => `सबसे नज़दीकी पल · ${satellite}`,
  acquiredNow: 'तस्वीर ली गई',
  closestApproachNow: 'सबसे नज़दीक',

  pin: {
    card: 'लगाया गया पिन',
    naming: 'नाम ढूँढ रहे हैं',
    noName: 'आसपास कोई नाम नहीं',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `देखें कि ${place} के ऊपर से क्या गुज़रा`,
    searchTitle: 'यहाँ खोजें (Enter)',
    removeAria: 'पिन हटाएँ',
    removeTitle: 'पिन हटाएँ (Esc)',
    moveHint: 'पिन खिसकाने के लिए ग्लोब पर कहीं भी दबाए रखें',
    droppedAt: (coords: string) => `${coords} पर पिन लगाया गया।`,
    droppedIn: (place: string) => `${place} में पिन लगाया गया। उसके ऊपर से क्या गुज़रा, यह देखने के लिए Enter या तीर दबाएँ।`,
    droppedUnnamed: 'पिन लगाया गया। उसके ऊपर से क्या गुज़रा, यह देखने के लिए Enter या तीर दबाएँ।',
  },

  noGl: {
    title: '3D ग्लोब उपलब्ध नहीं',
    reason: 'इस ब्राउज़र में WebGL 2 बंद है',
  },
}
export default globe
