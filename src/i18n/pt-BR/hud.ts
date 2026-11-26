/**
 * Brazilian Portuguese copy for the HUD, the instrument chrome in the four corners (see docs/i18n/pt-BR.md §1.1, §4,
 * §6, §7): the About link, the scene line, the orbit catalog's status and the sub-solar readout.
 *
 * Why these words: every corner line is a mono readout, so the words are nouns with no article (*Cena*, *Catálogo*,
 * *Ponto subsolar*), kept about as long as the English (on a 375 px phone *Como funciona* and the sun line nearly
 * touch). The catalog's age is the instrument's compact form, *há* + an SI symbol that never pluralises (*há 42 min*,
 * *há 5 h*, *há 3 d*), never *atrás*; *Obtido* and *Desatualizado* agree with *catálogo* (m.), never with the reader.
 * The object count and the sun line keep plain spaces: the scramble that writes them leaves only plain spaces in
 * place (a no-break space would scramble into a glyph), and the line never wraps. Zero objects takes the plural (pt-BR
 * puts 0 in `one`). Coordinates, clocks, ISO stamps and "GMST" arrive as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('pt-BR')

/** The catalog's compact age after "há": "<1 min", "42 min", "5 h", "3 d" (a number never parts from its unit) */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1 min'
  if (unit === 'minute') return `${f.int(n)} min`
  if (unit === 'hour') return `${f.int(n)} h`
  return `${f.int(n)} d`
}

const hud: typeof en = {
  about: 'Como funciona',
  sourceLink: 'Código aberto',
  sourceLinkLabel: 'Código aberto: o projeto no GitHub',
  home: 'Watched, início',
  regionTime: 'Hora',
  regionCatalog: 'Catálogo de órbitas',
  regionSun: 'Sol',

  scene: 'Cena',
  sun: (lat: string, lon: string) => `Sol ${lat} ${lon}`,
  subsolar: 'Ponto subsolar',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) =>
    `${f.int(n)} ${n === 0 ? 'objetos' : f.plural(n, { one: 'objeto', many: 'objetos', other: 'objetos' })}`,
  objectsPending: (count: string): Rich => [num(count), ' Objetos'],
  catalog: 'Catálogo',
  fetched: (stamp: string) => `Obtido em ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Desatualizado, ' : ''}há ${age(unit, n)}`,
  catalogUnavailable: 'Catálogo indisponível',
  catalogLoading: 'Carregando catálogo',
}
export default hud
