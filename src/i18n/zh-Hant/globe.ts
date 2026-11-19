/**
 * Traditional Chinese copy for the globe's own words (see docs/i18n/zh-Hant.md §4.1, §5.1, §6.1, §6.7, Appendix A):
 * the satellite callouts, the capture line, the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why it reads this way: the callouts are instrument readouts, so the words are the glossary's nouns, never a verb of
 * watching: "IMAGED" and "ACQUISITION" are 成像, "ACQUIRED" 已成像 (never 擷取, which reads as a screen capture in
 * Taiwan), "CLOSEST APPROACH" 最接近. Units are written in normal case (`km`, `m`) and uppercased by CSS like the
 * English; the altitude part is handed back as the very part it was given (the frame loop finds it by identity). The pin
 * is 圖釘 and the globe 地球 (never 地球儀). Place names and coordinates are data, inserted bare (no suffix, no measure
 * word), with their spaces from `gap` at both edges: `從 Waterloo 上空`, but `從九龍上空`; never a space before 。.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('zh-Hant')

// ── Spacing between Han and inserted names (zh-Hant.md §5.1, §6.2, Appendix B.4) ──

const HAN = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}々ー]/u
/** A character of a script written with spaces: a letter or digit (Latin, Cyrillic, Hangul…), or an ASCII symbol */
const SPACED = /[\p{L}\p{N}\p{M}\p{Sm}\p{Sc}]|[\x21-\x7e]/u

/**
 * One ASCII space where Han meets a letter, digit or symbol of a script written with spaces, nothing otherwise (two Han,
 * or a space or full-width punctuation at either edge). Local until parts.ts has its shared `cjkGap`.
 */
function gap(before: string, after: string): string {
  const a = Array.from(before).pop()
  const b = Array.from(after)[0]
  if (!a || !b) return ''
  const ha = HAN.test(a)
  if (ha === HAN.test(b)) return ''
  return SPACED.test(ha ? b : a) ? ' ' : ''
}

/** A name between two pieces of Chinese, spaced at both edges. */
const slot = (before: string, name: string, after: string) => `${before}${gap(before, name)}${name}${gap(name, after)}${after}`

const SEE = '按 Enter 或箭頭，查看從這裡上空經過的衛星。'

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  imaged: (clock: string, zone: string) => `成像 ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `成像 ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `已成像 ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `已成像 ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `成像 · ${satellite}`,
  closestApproachOf: (satellite: string) => `最接近 · ${satellite}`,
  acquiredNow: '已成像',
  closestApproachNow: '最接近',

  pin: {
    card: '已放置的圖釘',
    naming: '正在查詢地名',
    /** 10 Han: fits the 156 px column at 13 px. */
    noName: '附近沒有已命名的地點',
    /** Both parts are data ("Waterloo", "Ontario，加拿大"), joined as geo.where joins its own: a full-width comma beside Han. */
    placeTitle: (name: string, area: string) => `${name}${HAN.test(name + area) ? '，' : ', '}${area}`,
    searchAria: (place: string) => slot('顯示從', place, '上空經過的衛星'),
    searchTitle: '搜尋這裡（Enter）',
    removeAria: '移除圖釘',
    removeTitle: '移除圖釘（Esc）',
    moveHint: '按住地球任意位置即可移動圖釘',
    droppedAt: (coords: string) => slot('圖釘已放在', coords, '。'),
    droppedIn: (place: string) => `${slot('圖釘已放在', place, '。')}${SEE}`,
    droppedUnnamed: `圖釘已放置。${SEE}`,
  },

  noGl: {
    title: '無法顯示 3D 地球',
    reason: '這個瀏覽器已關閉 WebGL 2',
  },
}
export default globe
