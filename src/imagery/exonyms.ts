/**
 * Place names as the visitor reads them: München for a German, Monaco di Baviera for an Italian, Київ for a Ukrainian,
 * 동해 for a Korean, where the place data says Munich, Kyiv or Sea of Japan. Display only (geocode.ts displayLabel and
 * displaySublabel, ui/results/placeName.ts): a Place keeps its English label and sublabel, which the usage stats,
 * record_lookup, links and shares carry, so one town is one row in every language.
 *
 * The names come from the active language's 'exonyms' namespace (src/i18n/en/exonyms.ts gives its format), so each
 * language's table ships in that language's chunk only; English has none, and an English page shows every name as it
 * came. A table is parsed once, on the first name shown in that language.
 *
 * Why by country: the same English name is many places (London, Ontario is never Londra; Kyiv the city is Київ, Kyiv
 * the oblast's sublabel is Київська область), so a name is looked up in the place's own country, among towns first
 * for a label and among regions first for a part of the where line. A place with no country code (a sea; a place
 * opened from a link) is looked up among the table's countryless names only, so a link to "London" shows London.
 */
import enExonyms from '@/i18n/en/exonyms'
import { msgs } from '@/i18n/runtime'
import { placeKey } from './placeKey'

export interface ExonymTable {
  /** `<CC>|<placeKey of the English name>` → the name shown, for towns (and anything not a region) */
  towns: Map<string, string>
  /** The same, for first-level regions */
  regions: Map<string, string>
}

export function parseExonyms(src: string): ExonymTable {
  const towns = new Map<string, string>()
  const regions = new Map<string, string>()
  for (const group of src.split('|')) {
    const at = group.indexOf(':')
    if (at < 0) continue
    const cc = group.slice(0, at).trim().toUpperCase()
    for (const entry of group.slice(at + 1).split(';')) {
      const eq = entry.indexOf('=')
      const region = entry.startsWith('*')
      const english = entry.slice(region ? 1 : 0, eq)
      const shown = entry.slice(eq + 1)
      if (eq < 0 || !placeKey(english) || !shown) continue
      ;(region ? regions : towns).set(`${cc}|${placeKey(english)}`, shown)
    }
  }
  return { towns, regions }
}

let parsed: { src: string; table: ExonymTable } | undefined

/** The active language's table, or undefined for one that has none (English). */
function activeTable(): ExonymTable | undefined {
  const src = msgs(enExonyms).names
  if (!src) return undefined
  if (parsed?.src !== src) parsed = { src, table: parseExonyms(src) }
  return parsed.table
}

/**
 * `name` as the visitor's language names that place in country `cc` (ISO, any case; undefined: no country), or `name`
 * itself. `as` says what the name is: a place's own name ('label': towns first) or a part of its where line ('where':
 * regions first). Read at call time.
 */
export function exonym(name: string, cc: string | undefined, as: 'label' | 'where'): string {
  const t = activeTable()
  if (!t) return name
  const key = `${(cc ?? '').toUpperCase()}|${placeKey(name)}`
  const [first, then] = as === 'label' ? [t.towns, t.regions] : [t.regions, t.towns]
  return first.get(key) ?? then.get(key) ?? name
}
