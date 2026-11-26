/**
 * Persian copy for the globe's own words (see docs/i18n/fa.md §3.7 "`globe`", §6.2): the satellite callouts, the
 * capture line, the acquisition countdown, the dropped pin's card and the note shown when there is no 3D view.
 *
 * Why it reads this way:
 *  - An instrument's terse nouns: «ثبت تصویر» for "IMAGED", «ثبت شد» for "ACQUIRED", «نزدیک‌ترین نقطه» for the
 *    closest approach. Arabic script has no case, so the CSS capitals change only the Latin names beside them.
 *  - Units are words («کیلومتر», «متر») after their number, outside the bold value part (inside it they would read
 *    before the number); a no-break space ties them.
 *  - "NORAD" and its number are one left-to-right island, and so is a clock with its zone («11:21:13 EST»): after
 *    a Persian word the digits would otherwise turn and the zone jump in front.
 *  - The pin card speaks in nouns and impersonal past («سنجاق در … گذاشته شد»); the instructions are polite
 *    imperatives («Enter یا پیکان را بزنید»).
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('fa')
const nb = '\u00a0'
const LRI = '\u2066'
const PDI = '\u2069'

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => [`${LRI}NORAD `, norad, `${PDI} · `, altitude, `${nb}کیلومتر`],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => [
    `${LRI}NORAD `,
    norad,
    `${PDI} · `,
    altitude,
    `${nb}کیلومتر`,
    ' · ',
    imaged,
  ],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, `${nb}کیلومتر`],
  imaged: (clock: string, zone: string) => `ثبت تصویر ${LRI}${clock}${nb}${zone}${PDI}`,
  imagedAbout: (clock: string, zone: string) => `ثبت تصویر ${LRI}≈ ${clock}${nb}${zone}${PDI}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `ثبت شد ${LRI}${clock}${nb}${zone}${PDI} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `ثبت شد ${LRI}≈ ${clock}${nb}${zone}${PDI} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)}${nb}متر`,
  resolutionKm: (km: number) => `${f.int(km)}${nb}کیلومتر`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `ثبت تصویر · ${satellite}`,
  closestApproachOf: (satellite: string) => `نزدیک‌ترین نقطه · ${satellite}`,
  acquiredNow: 'ثبت شد',
  closestApproachNow: 'نزدیک‌ترین نقطه',

  pin: {
    card: 'سنجاق',
    naming: 'یافتن نام این نقطه',
    noName: 'مکان نام‌داری در این نزدیکی نیست',
    placeTitle: (name: string, area: string) => `${name}، ${area}`,
    searchAria: (place: string) => `نمایش آنچه از فراز ${place} گذشت`,
    searchTitle: 'جستجو در این‌جا (Enter)',
    removeAria: 'برداشتن سنجاق',
    removeTitle: 'برداشتن سنجاق (Esc)',
    // The pin is named: «برای جابه‌جایی، کره را نگه دارید» reads as moving the globe
    moveHint: 'برای جابه‌جایی سنجاق، کره را نگه دارید',
    droppedAt: (coords: string) => `سنجاق در ${LRI}${coords}${PDI} گذاشته شد.`,
    droppedIn: (place: string) => `سنجاق در ${place} گذاشته شد. Enter یا پیکان را بزنید تا ببینید چه چیزی از فراز آن گذشت.`,
    droppedUnnamed: 'سنجاق گذاشته شد. Enter یا پیکان را بزنید تا ببینید چه چیزی از فراز آن گذشت.',
  },

  noGl: {
    title: 'نمای سه‌بعدی در دسترس نیست',
    reason: 'WebGL 2 در این مرورگر خاموش است',
  },
}
export default globe
