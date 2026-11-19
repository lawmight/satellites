/**
 * Dutch copy for the HUD, the instrument chrome in the four corners (src/ui/hud; see docs/i18n/nl.md §3.7, §6, §7).
 *
 * Why these forms: every corner line is a mono readout, uppercased by CSS, on one line that shares a 375 px phone's top
 * row with the sun or replay line, so the About link is `Hoe het werkt` (13 characters, the English is 14) and the
 * replay's clock is `Toen` (`TOEN zo 1 nov 11:21:13 EST`): it is the replay's moment, not an image, and `Herhaling`
 * would collide with the top-left link (§7). Readouts are nouns (§1): `Zon`, `Subsolair punt`, `Catalogus`. The
 * catalog's age is built by hand, `<1 min geleden`, `42 min geleden`, `5 uur geleden`, `3 dagen geleden`, never Intl's
 * short forms (`12 min. geleden`, `3 dgn geleden`) and never `u`, `h` or `d`: `u` reads as the formal pronoun (§6).
 * `uur` never changes after a number; `dag` / `dagen` does. A count and its unit never part (U+00A0); the object
 * count is grouped by fmt('nl') (`16.893 objecten`). GMST, coordinates, ISO stamps and the brand stay as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('nl')

/** The catalog's compact age: "<1 min", "42 min", "5 uur", "3 dagen" (no abbreviation but the unit symbol `min`). */
function ageNl(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1 min'
  if (unit === 'minute') return `${f.int(n)} min`
  if (unit === 'hour') return `${f.int(n)} uur`
  return f.plural(n, { one: `${f.int(n)} dag`, other: `${f.int(n)} dagen` })
}

const hud: typeof en = {
  about: 'Hoe het werkt',
  home: 'Watched, beginpagina',
  regionTime: 'Tijd',
  regionCatalog: 'Baancatalogus',
  regionSun: 'Zon',

  scene: 'Toen',
  sun: (lat: string, lon: string) => `Zon ${lat} ${lon}`,
  subsolar: 'Subsolair punt',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) => f.plural(n, { one: `${f.int(n)} object`, other: `${f.int(n)} objecten` }),
  objectsPending: (count: string): Rich => [num(count), ' Objecten'],
  catalog: 'Catalogus',
  fetched: (stamp: string) => `Opgehaald ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Verouderd, ' : ''}${ageNl(unit, n)} geleden`,
  catalogUnavailable: 'Catalogus niet beschikbaar',
  catalogLoading: 'Catalogus laden',
}
export default hud
