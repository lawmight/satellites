/**
 * Ukrainian copy for the HUD, the instrument chrome in the four corners (see docs/i18n/uk.md §3.8): the About link, the
 * scene line, the orbit catalog's status and the sub-solar readout.
 *
 * Why these words: every corner line is a mono label, so the words are nouns («Кадр», «Каталог», «Підсонячна точка»)
 * kept about as short as the English (on a 375 px phone «Як це працює» and the sun line nearly touch). Coordinates,
 * clocks, ISO stamps and "GMST" arrive as they are. Units are symbols that never inflect («хв», «год»); «дн.» keeps
 * its period, as Intl prints it, so the catalog's age needs no plural forms.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('uk')

/** The catalog's compact age: «<1 хв», «42 хв», «5 год», «3 дн.» */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1\u00a0хв'
  if (unit === 'minute') return `${f.int(n)}\u00a0хв`
  if (unit === 'hour') return `${f.int(n)}\u00a0год`
  return `${f.int(n)}\u00a0дн.`
}

const hud: typeof en = {
  about: 'Як це працює',
  home: 'Watched, на головну',
  regionTime: 'Час',
  regionCatalog: 'Каталог орбіт',
  regionSun: 'Сонце',

  scene: 'Кадр',
  sun: (lat: string, lon: string) => `Сонце ${lat} ${lon}`,
  subsolar: 'Підсонячна точка',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) =>
    `${Number.isInteger(n) ? f.int(n) : f.dec(n, 1)}\u00a0${f.plural(n, { one: 'об’єкт', few: 'об’єкти', many: 'об’єктів', other: 'об’єкта' })}`,
  objectsPending: (count: string): Rich => [num(count), '\u00a0Об’єкти'],
  catalog: 'Каталог',
  fetched: (stamp: string) => `Отримано ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Застарілий, ' : ''}${age(unit, n)} тому`,
  catalogUnavailable: 'Каталог недоступний',
  catalogLoading: 'Завантаження каталогу',
}
export default hud
