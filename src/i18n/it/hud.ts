/**
 * Italian copy for the HUD, the instrument chrome in the four corners (src/ui/hud; see docs/i18n/it.md §4, §6, §7):
 * the About link, the scene line, the orbit catalog's status and the sub-solar readout.
 *
 * Why these forms: every corner line is a mono readout uppercased by CSS, so the words are nouns with no article
 * (*Scena*, *Sole*, *Punto subsolare*), and the About link is *Come funziona* (13 characters against English's 14, on a
 * 375 px phone that shares the top row with the sun line). The catalog's age is an instrument's: SI symbols that never
 * change with the count for minutes and hours (*42 min fa*, *5 h fa*), and the word *giorni* for days (*giorno* for 1),
 * never *G*, which reads as the mobile network in caps (§6). *Aggiornato* and *Vecchio* agree with *catalogo*
 * (masculine), never with the reader. The object count and the sun line are scrambled on their first paint, which
 * keeps only plain spaces in place, so they use plain spaces; the age uses no-break spaces between a number and its
 * unit. Coordinates, clocks, ISO stamps and "GMST" arrive as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('it')

/** The catalog's compact age before "fa": "<1 min", "42 min", "5 h", "3 giorni" */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1 min'
  if (unit === 'minute') return `${f.int(n)} min`
  if (unit === 'hour') return `${f.int(n)} h`
  return f.plural(n, {
    one: `${f.int(n)} giorno`,
    many: `${f.int(n)} di giorni`,
    other: `${f.int(n)} giorni`,
  })
}

const hud: typeof en = {
  about: 'Come funziona',
  home: 'Watched, pagina iniziale',
  regionTime: 'Ora',
  regionCatalog: 'Catalogo delle orbite',
  regionSun: 'Sole',

  scene: 'Scena',
  sun: (lat: string, lon: string) => `Sole ${lat} ${lon}`,
  subsolar: 'Punto subsolare',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) =>
    f.plural(n, {
      one: `${f.int(n)} oggetto`,
      many: `${f.int(n)} di oggetti`,
      other: `${f.int(n)} oggetti`,
    }),
  objectsPending: (count: string): Rich => [num(count), ' Oggetti'],
  catalog: 'Catalogo',
  fetched: (stamp: string) => `Aggiornato ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Vecchio, ' : ''}${age(unit, n)} fa`,
  catalogUnavailable: 'Catalogo non disponibile',
  catalogLoading: 'Caricamento del catalogo',
}
export default hud
