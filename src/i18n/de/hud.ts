/**
 * German copy for the HUD, the instrument chrome in the four corners (src/ui/hud; see docs/i18n/de.md §3.7, §6.3, §7).
 *
 * Why these forms: every corner line is a mono readout, uppercased by CSS, on one nowrap line, and on a 375 px phone
 * the top corners nearly touch. So the About link is `Funktionsweise` (112 px at 11 px, the English width) and the sun
 * line `Sonne` before the coordinates, which stay exactly as they arrive (`SONNE 16.2°S 063.0°E`). `Szene` mirrors the
 * English: it is the replay's scene clock, not the archive's scene. Labels are nouns without articles (§6.5):
 * `Subsolarpunkt`, `Katalog`, `Bahnkatalog`. The catalog's age is built by hand with *vor* and the dative, the minutes
 * and hours as SI symbols (`vor <1 min`, `vor 42 min`, `vor 5 h`) and the days always spelled out (`vor 3 Tagen`,
 * never `3 T`); stale puts `Veraltet, ` first. A number never parts from its unit (U+00A0). The object count is
 * grouped by fmt('de') (`16.893 Objekte`) and a zero says `Keine Objekte` (§5.3). GMST, ISO stamps, coordinates and
 * the brand stay as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('de')

/** The catalog's compact age after *vor*: "<1 min", "42 min", "5 h", "1 Tag", "3 Tagen" (dative after *vor*). */
function ageDe(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1 min'
  if (unit === 'minute') return `${f.int(n)} min`
  if (unit === 'hour') return `${f.int(n)} h`
  return f.plural(n, { one: `${f.int(n)} Tag`, other: `${f.int(n)} Tagen` })
}

const hud: typeof en = {
  about: 'Funktionsweise',
  sourceLink: 'Open Source',
  sourceLinkLabel: 'Open Source: der Code auf GitHub',
  home: 'Watched, Startseite',
  regionTime: 'Zeit',
  regionCatalog: 'Bahnkatalog',
  regionSun: 'Sonne',

  scene: 'Szene',
  sun: (lat: string, lon: string) => `Sonne ${lat} ${lon}`,
  subsolar: 'Subsolarpunkt',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) =>
    n === 0 ? 'Keine Objekte' : f.plural(n, { one: `${f.int(n)} Objekt`, other: `${f.int(n)} Objekte` }),
  objectsPending: (count: string): Rich => [num(count), ' Objekte'],
  catalog: 'Katalog',
  fetched: (stamp: string) => `Abgerufen ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Veraltet, ' : ''}vor ${ageDe(unit, n)}`,
  catalogUnavailable: 'Katalog nicht verfügbar',
  catalogLoading: 'Katalog wird geladen',
}
export default hud
