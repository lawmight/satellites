/**
 * Simplified Chinese copy for the globe's own words (see docs/i18n/zh-Hans.md §4.1, §5.1, §6.1, §6.7, Appendix A):
 * the satellite callouts, the capture line, the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why it reads this way: the callouts are instrument readouts, so the words are the glossary's nouns, never a verb of
 * watching: "IMAGED" and "ACQUISITION" are 成像, "ACQUIRED" 已获取, "CLOSEST APPROACH" 最接近. Units stay Latin and
 * lower case (`786 km`, `10 m`), and CSS uppercases them as it does the English; the altitude slot is handed back as
 * the very part it was given (the frame loop finds it by identity). Satellite and place names are data: never a
 * suffix, a measure word or quotes around them, and their spaces come from cjkGap (through withName), the helper every
 * zh-Hans catalog shares: Han beside Latin or a digit takes one ASCII space, Han beside Han or full-width punctuation
 * (… included) none, so `从 Waterloo 上空` but `从北京上空`. A place is 那里, never 它.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'
import { withName } from '../../../api/_lib/i18n/card/zh-Hans'

const f = fmt('zh-Hans')

const SEE = '按 Enter 或箭头按钮，查看从那里上空经过的卫星。'

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  imaged: (clock: string, zone: string) => `成像 ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `成像 ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `已获取 ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `已获取 ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `成像 · ${satellite}`,
  closestApproachOf: (satellite: string) => `最接近 · ${satellite}`,
  acquiredNow: '已获取',
  closestApproachNow: '最接近',

  pin: {
    card: '已放置的标记',
    naming: '正在识别地名',
    noName: '附近没有地名',
    /** Both parts are the geocoder's data ("Waterloo", "Ontario, Canada"): the area goes in full-width parentheses. */
    placeTitle: (name: string, area: string) => `${name}（${area}）`,
    searchAria: (place: string) => withName('显示从', place, '上空经过的卫星'),
    searchTitle: '在这里搜索（Enter）',
    removeAria: '移除标记',
    removeTitle: '移除标记（Esc）',
    moveHint: '按住地球任意处即可移动标记',
    droppedAt: (coords: string) => withName('标记已放在', coords, '。'),
    droppedIn: (place: string) => `${withName('标记已放在', place, '。')}${SEE}`,
    droppedUnnamed: `标记已放置。${SEE}`,
  },

  noGl: {
    title: '3D 视图不可用',
    reason: '此浏览器未开启 WebGL 2',
  },
}
export default globe
