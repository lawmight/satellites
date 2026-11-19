/**
 * Japanese copy for the HUD, the instrument chrome in the four corners (see docs/i18n/ja.md §3.7, §5.3, §6.3, §6.4):
 * the About link, the replay clock's label, the orbit catalog's status and the sub-solar readout.
 *
 * Why it reads this way: every corner line is a mono readout, so the words are short kanji nouns with the value after
 * them, as an instrument labels a field (物体数 16,893, 取得 2026-11-08 03:34Z, 太陽 16.2°S 063.0°E): Japanese
 * readouts put the label first, and a counter after the number (16,893個) would turn the readout into prose. The top
 * corners nearly touch on a 375 px phone, so 仕組み (3 glyphs) and リプレイ stay as short as the English. Ages are the
 * narrow relative forms with no space (42分前, 5時間前, 3日前), and under a minute is たった今, never 1分未満前.
 * Coordinates, clocks, "UTC", GMST and the ISO stamp stay as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('ja')

/** The catalog's age: "たった今", "42分前", "5時間前", "3日前". */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return 'たった今'
  if (unit === 'minute') return `${f.int(n)}分前`
  if (unit === 'hour') return `${f.int(n)}時間前`
  return `${f.int(n)}日前`
}

const hud: typeof en = {
  about: '仕組み',
  home: 'Watched、ホーム',
  regionTime: '時刻',
  regionCatalog: '軌道カタログ',
  regionSun: '太陽',

  scene: 'リプレイ',
  sun: (lat: string, lon: string) => `太陽 ${lat} ${lon}`,
  subsolar: '太陽直下点',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) => `物体数 ${f.int(n)}`,
  objectsPending: (count: string): Rich => ['物体数 ', num(count)],
  catalog: 'カタログ',
  fetched: (stamp: string) => `取得 ${stamp}`,
  /** "古い · 3日前" when stale: the warning word is a field of its own, set apart like the line's other fields. */
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? '古い · ' : ''}${age(unit, n)}`,
  catalogUnavailable: 'カタログ取得不可',
  catalogLoading: 'カタログを読み込み中',
}
export default hud
