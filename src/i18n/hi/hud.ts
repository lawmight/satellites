/**
 * Hindi copy for the HUD, the instrument chrome in the four corners (see docs/i18n/hi.md §3.7, §7): the About link,
 * the scene line, the orbit catalog's status and the sub-solar readout.
 *
 * Why these words: every corner line is a mono label, so they are nouns kept about as short as the English («कैसे काम
 * करता है» beside «सूरज 16.2°S 063.0°E» on a 375 px phone). The replay's clock is labelled «रीप्ले», what it shows;
 * the archive's "scene" is «दृश्य» elsewhere, and one word must not mean two things. The catalog's age spells its
 * units as words («42 मिनट», «5 घंटे»: the hour count is always 2 or more, so always the plural), with no Hindi
 * abbreviation a reader would have to decode. «पुरानी» agrees with «सूची» (f), the catalog. Coordinates, clocks, ISO
 * stamps and "GMST" arrive as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('hi')
/** Hindi counts zero with the plural; Intl files 0 under `one` (docs/i18n/hi.md §5.3) */
const pl = <T,>(n: number, one: T, other: T): T => (n === 0 ? other : f.plural(n, { one, other }))

/** The catalog's compact age: «1 मिनट से कम», «42 मिनट», «5 घंटे», «3 दिन» */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1\u00a0मिनट'
  if (unit === 'minute') return `${f.int(n)}\u00a0मिनट`
  if (unit === 'hour') return `${f.int(n)}\u00a0${pl(n, 'घंटा', 'घंटे')}`
  return `${f.int(n)}\u00a0दिन`
}

const hud: typeof en = {
  about: 'कैसे काम करता है',
  sourceLink: 'ओपन सोर्स',
  sourceLinkLabel: 'ओपन सोर्स: GitHub पर प्रोजेक्ट का कोड',
  home: 'Watched, मुख्य पेज',
  regionTime: 'समय',
  regionCatalog: 'कक्षाओं की सूची',
  regionSun: 'सूरज',

  scene: 'रीप्ले',
  sun: (lat: string, lon: string) => `सूरज ${lat} ${lon}`,
  subsolar: 'सूरज के ठीक नीचे',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) => `${f.int(n)}\u00a0${pl(n, 'वस्तु', 'वस्तुएँ')}`,
  objectsPending: (count: string): Rich => [num(count), '\u00a0वस्तुएँ'],
  catalog: 'सूची',
  fetched: (stamp: string) => `प्राप्त ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'पुरानी, ' : ''}${age(unit, n)} पहले`,
  catalogUnavailable: 'सूची उपलब्ध नहीं',
  catalogLoading: 'सूची लोड हो रही है',
}
export default hud
