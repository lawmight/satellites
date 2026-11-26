/**
 * Spanish copy for the HUD, the instrument chrome in the four corners (see docs/i18n/es.md §4, §6, §7): the About link,
 * the scene line, the orbit catalog's status and the sub-solar readout.
 *
 * Why these words: every corner line is a mono readout, so the words are nouns with no article (*Escena*, *Catálogo*,
 * *Punto subsolar*), kept about as long as the English (on a 375 px phone *Cómo funciona* and the sun line nearly
 * touch). The catalog's age is the instrument's compact form with SI symbols that never pluralise (*hace 42 min*,
 * *hace 5 h*, *hace 3 d*: *d* is allowed here only), so it needs no plural forms; *Descargado* and *Desactualizado*
 * agree with *catálogo*, never with the reader. The object count's digits come grouped from `fmt('es')`, with a
 * no-break space from five digits (*16 917 objetos*, §6), so no reader takes it for a decimal; it keeps a plain space
 * before its noun: the line never wraps, and the scramble that writes it leaves only plain spaces in place.
 * Coordinates, clocks, ISO stamps and "GMST" arrive as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('es')

/** The catalog's compact age after "hace": "<1 min", "42 min", "5 h", "3 d" */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1\u00a0min'
  if (unit === 'minute') return `${f.int(n)}\u00a0min`
  if (unit === 'hour') return `${f.int(n)}\u00a0h`
  return `${f.int(n)}\u00a0d`
}

const hud: typeof en = {
  about: 'Cómo funciona',
  sourceLink: 'Código abierto',
  sourceLinkLabel: 'Código abierto: el proyecto en GitHub',
  home: 'Watched, inicio',
  regionTime: 'Hora',
  regionCatalog: 'Catálogo de órbitas',
  regionSun: 'Sol',

  scene: 'Escena',
  sun: (lat: string, lon: string) => `Sol ${lat} ${lon}`,
  subsolar: 'Punto subsolar',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) => `${f.int(n)} ${f.plural(n, { one: 'objeto', many: 'objetos', other: 'objetos' })}`,
  objectsPending: (count: string): Rich => [num(count), ' Objetos'],
  catalog: 'Catálogo',
  fetched: (stamp: string) => `Descargado ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Desactualizado, ' : ''}hace ${age(unit, n)}`,
  catalogUnavailable: 'Catálogo no disponible',
  catalogLoading: 'Cargando catálogo',
}
export default hud
