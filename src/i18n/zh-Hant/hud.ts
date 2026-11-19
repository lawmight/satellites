/**
 * Traditional Chinese copy for the HUD, the instrument chrome in the four corners (see docs/i18n/zh-Hant.md §4.1,
 * §5.5, §6.4, §6.7, Appendix A): the About link, the replay's scene line, the orbit catalog's status and the sub-solar
 * readout.
 *
 * Why it reads this way: every corner line is a mono readout, so the words are short nouns from the glossary (運作原理,
 * 太陽直射點, 物體 counted with 個), no longer than the English, because the top corners nearly touch on a 375 px
 * phone. During a replay the scene clock is labelled 重播, the guide's word for "Scene" there (場景 is a film scene).
 * The catalog's age is written in Han units after the digit (`42 分鐘前`, `已過時，3 天前`), never a Latin abbreviation;
 * coordinates, clocks, GMST, "UTC" and the ISO stamp stay as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('zh-Hant')

/** The catalog's age: "<1 分鐘前", "42 分鐘前", "5 小時前", "3 天前". */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1 分鐘前'
  if (unit === 'minute') return `${f.int(n)} 分鐘前`
  if (unit === 'hour') return `${f.int(n)} 小時前`
  return `${f.int(n)} 天前`
}

const hud: typeof en = {
  about: '運作原理',
  home: 'Watched，首頁',
  regionTime: '時間',
  regionCatalog: '軌道目錄',
  regionSun: '太陽',

  scene: '重播',
  sun: (lat: string, lon: string) => `太陽 ${lat} ${lon}`,
  subsolar: '太陽直射點',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) => `${f.int(n)} 個物體`,
  objectsPending: (count: string): Rich => [num(count), ' 物體'],
  catalog: '目錄',
  fetched: (stamp: string) => `更新於 ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? '已過時，' : ''}${age(unit, n)}`,
  catalogUnavailable: '目錄無法使用',
  catalogLoading: '正在載入目錄',
}
export default hud
