/**
 * Korean copy for the HUD, the instrument chrome in the four corners (see docs/i18n/ko.md §3.7 hud, §4, §6.3, §6.4):
 * the About link, the scene clock's label, the orbit catalog's status and the sub-solar readout.
 *
 * Why it reads this way: every corner line is a mono readout, so each word is a short Sino-Korean noun before its value
 * (태양 16.2°S 063.0°E, 수신 2026-11-08 03:34Z), and a count keeps its counter attached as text (물체 16,893개), never
 * a clipped English unit. The top corners nearly touch on a 375 px phone, so 작동 방식 (4 syllables) stays shorter than
 * "How this works". Ages read exactly as the relative times elsewhere do (42분 전, 5시간 전, 3일 전: the counter attached,
 * a space before 전), and under a minute is 방금, never "1분 미만 전". Coordinates, clocks, "UTC", GMST, the brand and
 * the ISO stamp stay as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('ko')

/** The catalog's age: "방금", "42분 전", "5시간 전", "3일 전". */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '방금'
  if (unit === 'minute') return `${f.int(n)}분 전`
  if (unit === 'hour') return `${f.int(n)}시간 전`
  return `${f.int(n)}일 전`
}

const hud: typeof en = {
  about: '작동 방식',
  home: 'Watched, 처음으로',
  regionTime: '시각',
  regionCatalog: '궤도 카탈로그',
  regionSun: '태양',

  scene: '장면',
  sun: (lat: string, lon: string) => `태양 ${lat} ${lon}`,
  subsolar: '태양 직하점',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) => `물체 ${f.int(n)}개`,
  objectsPending: (count: string): Rich => ['물체 ', num(count)],
  catalog: '카탈로그',
  fetched: (stamp: string) => `수신 ${stamp}`,
  /** "오래됨, 3일 전" when stale (the warning colour covers the whole line). */
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? '오래됨, ' : ''}${age(unit, n)}`,
  catalogUnavailable: '카탈로그를 불러오지 못함',
  catalogLoading: '카탈로그 불러오는 중',
}
export default hud
