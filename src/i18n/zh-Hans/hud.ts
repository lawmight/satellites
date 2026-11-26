/**
 * Simplified Chinese copy for the HUD, the instrument chrome in the four corners (see docs/i18n/zh-Hans.md §4.1, §5.5,
 * §6.7, Appendix A): the About link, the scene clock's label, the orbit catalog's status and the sub-solar readout.
 *
 * Why it reads this way: every corner line is a mono readout, so the words are noun phrases (工作原理, 场景时间,
 * 太阳直射点), as short as the English or shorter, because the top corners nearly touch on a 375 px phone. 场景 is right
 * here and only here (the 3D view's time). Han settles at once when a line scrambles, so the object count can be
 * `16,917 个在轨物体`. Ages are Han units after a digit, tied with U+00A0 (`42 分钟前`); coordinates, clocks, "UTC",
 * GMST and the ISO stamp stay as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('zh-Hans')

/** The catalog's age: "<1 分钟前", "42 分钟前", "5 小时前", "3 天前". */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1\u00a0分钟前'
  if (unit === 'minute') return `${f.int(n)}\u00a0分钟前`
  if (unit === 'hour') return `${f.int(n)}\u00a0小时前`
  return `${f.int(n)}\u00a0天前`
}

const hud: typeof en = {
  about: '工作原理',
  sourceLink: '开源',
  sourceLinkLabel: '开源：GitHub 上的源代码',
  home: 'Watched 首页',
  regionTime: '时间',
  regionCatalog: '轨道目录',
  regionSun: '太阳',

  scene: '场景时间',
  sun: (lat: string, lon: string) => `太阳 ${lat} ${lon}`,
  subsolar: '太阳直射点',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) => `${f.int(n)}\u00a0个在轨物体`,
  objectsPending: (count: string): Rich => [num(count), '\u00a0在轨物体'],
  catalog: '目录',
  fetched: (stamp: string) => `获取于 ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? '已过时，' : ''}${age(unit, n)}`,
  catalogUnavailable: '目录不可用',
  catalogLoading: '正在加载目录',
}
export default hud
