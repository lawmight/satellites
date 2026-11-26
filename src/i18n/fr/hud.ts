/**
 * French copy for the HUD, the instrument chrome in the four corners (src/ui/hud; see docs/i18n/fr.md §3.7, §6.3).
 *
 * Why these forms: every corner line is a mono readout, uppercased by CSS, on one line that shares a 375 px phone's
 * top row with the sun readout, so the About link is «À propos» (8 characters), not «Comment ça marche». Readouts are
 * nouns (§1.1): «Soleil», «Point subsolaire», «Récupéré». The catalog's age is an instrument's abbreviation,
 * «il y a 42 min», «il y a 5 h», «il y a 3 j»: French unit symbols never change with the count, so no plural is
 * needed there; «Périmé» and «Récupéré» agree with *catalogue* (masculine), which is what they describe. A count and
 * its unit never part (U+00A0); the object count is grouped by fmt('fr') («16 893 objets», U+202F). GMST, coordinates,
 * ISO stamps and the brand stay as they are.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('fr')

/** The catalog's compact age: "< 1 min", "42 min", "5 h", "3 j" (unit symbols are invariable). */
function ageFr(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<\u00a01\u00a0min'
  if (unit === 'minute') return `${f.int(n)}\u00a0min`
  if (unit === 'hour') return `${f.int(n)}\u00a0h`
  return `${f.int(n)}\u00a0j`
}

const hud: typeof en = {
  about: 'À propos',
  sourceLink: 'Code source',
  sourceLinkLabel: 'Code source\u00a0: le projet sur GitHub',
  home: 'Watched, accueil',
  regionTime: 'Heure',
  regionCatalog: 'Catalogue d’orbites',
  regionSun: 'Soleil',

  scene: 'Scène',
  sun: (lat: string, lon: string) => `Soleil ${lat} ${lon}`,
  subsolar: 'Point subsolaire',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) => {
    const c = Math.round(n) // the form follows the number as shown
    return f.plural(c, { one: `${f.int(c)}\u00a0objet`, many: `${f.int(c)}\u00a0d’objets`, other: `${f.int(c)}\u00a0objets` })
  },
  objectsPending: (count: string): Rich => [num(count), '\u00a0Objets'],
  catalog: 'Catalogue',
  fetched: (stamp: string) => `Récupéré ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${stale ? 'Périmé, ' : ''}il y a ${ageFr(unit, n)}`,
  catalogUnavailable: 'Catalogue indisponible',
  catalogLoading: 'Chargement du catalogue',
}
export default hud
