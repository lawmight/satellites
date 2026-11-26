/**
 * English copy for the HUD, the instrument chrome in the four corners (src/ui/hud): the About link, the clock's scene
 * line, the orbit catalog's status and the sub-solar readout. The language switcher has its own namespace.
 *
 * Every corner line is mono, uppercased by CSS (which follows `lang`), one nowrap line inside a corner capped at half
 * the screen: on a 375 px phone "How this works" (top left) and the sun or scene line (top right) already nearly touch,
 * so keep those about as long as the English. Some English below is stored in capitals ("SUN", "OBJECTS", "MIN") for
 * history; a translation can use sentence case. What stays as it is in every language: the brand ("Watched"),
 * coordinates ("16.6°S 007.1°E"), clocks, "UTC", ISO stamps.
 */
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import { ns } from '../ns'
import type { AgeUnit } from '@/ui/hud/readouts'

const en = fmt('en')

/** The catalog's compact age, English house style: "<1 MIN", "42 MIN", "5 H", "3 D". */
function ageEn(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1 MIN'
  if (unit === 'minute') return `${n} MIN`
  if (unit === 'hour') return `${n} H`
  return `${n} D`
}

export default ns('hud', {
  /** Top left: opens the About page (the "?" key cap follows on desktops). Keep it short (see above) */
  about: 'How this works',
  /**
   * After the language, on the same line (wide screens only; it hides itself where it would come close to a panel or
   * the top-right readout): a link to the project's code on GitHub, with a ↗ after it. Say that the project is open
   * source in the words your readers use; keep it about as short as the English
   */
  sourceLink: 'Open source',
  /** Its accessible name: the words above, first and unchanged, then where the link goes ("GitHub" as it is) */
  sourceLinkLabel: 'Open source: the code on GitHub',
  /** The wordmark's link to the landing (aria only). Keep the brand "Watched" as it is */
  home: 'Watched, home',
  /** The corner groups' accessible names (aria only) */
  regionTime: 'Time',
  regionCatalog: 'Orbit catalog',
  regionSun: 'Sun',

  /** Top right, during a replay: the scene's clock, then "Sun 1 Nov 11:21:13 EST" (the date is dropped on phones) */
  scene: 'Scene',
  /**
   * Where the sun is overhead now, right-aligned and fixed-width so it never jitters: `lat` and `lon` are zero-padded
   * coordinates ("16.2°S", "063.0°E"); keep them as they are and the word short. "SUN 16.2°S 063.0°E"
   */
  sun: (lat: string, lon: string) => `SUN ${lat} ${lon}`,
  /** Under it (wide screens): what that point is, then the sidereal clock */
  subsolar: 'Sub-solar point',
  /** Greenwich mean sidereal time, `time` "18:41:50". Keep the acronym unless your language has an established one */
  gmst: (time: string) => `GMST ${time}`,

  /** Bottom left: how many objects the orbit catalog holds, then its source ("16,893 OBJECTS · CELESTRAK GP") */
  objects: (n: number) => `${en.int(n)} ${en.plural(n, { one: 'OBJECT', other: 'OBJECTS' })}`,
  /**
   * The same while the catalog loads or after it failed: `count` is a placeholder ("—") standing where the number
   * goes, so put it where `objects` puts the count. "— Objects"
   */
  objectsPending: (count: string): Rich => [num(count), ' Objects'],
  /** The catalog's source when it has no name */
  catalog: 'CATALOG',
  /** Under it: when the catalog was fetched; `stamp` is an ISO time, "2026-11-08 03:34Z" (keep it as it is) */
  fetched: (stamp: string) => `Fetched ${stamp}`,
  /**
   * After "Fetched …": how old the catalog is, compact, as an instrument abbreviates: "<1 MIN ago", "42 MIN ago",
   * "5 H ago", "3 D ago". `unit` and `n`: 'underMinute' (n is 0: under a minute), 'minute' (1–89), 'hour' (2–47),
   * 'day' (2 or more). `stale` (over two days old, shown in the warning colour) puts "Stale, " first: "Stale, 3 D ago".
   * Count with your language's plural forms if its abbreviations change with the number.
   */
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Stale, ' : ''}${ageEn(unit, n)} ago`,
  /** In place of the fetch line when the catalog could not be loaded */
  catalogUnavailable: 'Catalog unavailable',
  /** While it loads (a blinking cursor follows) */
  catalogLoading: 'Loading catalog',
})
