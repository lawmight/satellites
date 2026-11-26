/**
 * Place names in the visitor's language, for display only (src/imagery/exonyms.ts reads it): the name a German, an
 * Italian, a Ukrainian, a Russian, a Vietnamese, a Persian or a Hindi map gives a town or region that the place data
 * (GeoNames, and the geocoders asked in English) names in English, and the Korean names of four places Korean readers
 * know by another name. The same names let a search typed in the visitor's language find the place offline (Москва,
 * Ha Noi, Mailand). English has none: an English page shows every name exactly as it came, and downloads no table.
 *
 * TRANSLATORS: not written by hand, except Korean's four (src/i18n/ko/exonyms.ts, the owner's). The other tables are
 * generated from GeoNames by scripts/build-exonyms.ts (src/i18n/<locale>/exonyms.gen.ts, never edited): a wrong name
 * is fixed in scripts/exonyms.ts (OVERRIDES), then the tables are generated again.
 *
 * Usage stats, record_lookup, links and shares keep the English name (Place.label, canonicalLabel), so one town is one
 * row in every language.
 */
import { ns } from '../ns'

/** A table's namespace: the names, and how a large one arrives (`load`) and whether countries are named (`countries`). */
export interface ExonymsNamespace {
  /**
   * The table: countries apart by `|`, each `<ISO code>:` then its names apart by `;`, each `<English name>=<shown
   * name>`, a first-level region's starting with `*`, and a landmark's or natural feature's starting with `^` where a
   * town has the same English name (`^White House=Nhà Trắng`: White House, Tennessee keeps its own), and a region's own
   * label starting with `#` where it differs from its name in a where line (a province named like its capital: `#Qom
   * Province=استان قم` beside `*Qom Province=قم`, so a search lists قم and استان قم, and a town there reads «… · قم،
   * ایران»). The English name is matched as typed in a search (case, accents and punctuation aside). A country code of
   * nothing (`:Sea of Japan=동해`) holds names for places that have no country (a sea). An entry starting with `~` is a
   * search name only, never shown (`~Ho Chi Minh City=Sài Gòn`; `~*` for a region's). Each country's names come largest
   * first, which is how a search through them ranks. No name may hold `|`, `;`, `=`, `:` or `~`, nor start with `*`,
   * `^` or `#`. E.g. `DE:Munich=München;Cologne=Köln;*Bavaria=Bayern|AT:Vienna=Wien`.
   */
  names: string
  /**
   * A large table ships as a chunk of its own: `names` stays '' until `load()` has filled it in (src/imagery/exonyms.ts
   * ensureExonyms calls it at idle, and before anything shows a place name). Without it, the table is in `names`.
   */
  load?: () => Promise<void>
  /**
   * A country found by search, or shown on its own, takes the browser's name for it in the language (Intl, as the
   * where line already does: Германия, not Germany), and a search typed as the language names a country finds it.
   */
  countries?: boolean
  /**
   * Other names a search finds a country by, never shown (the language's everyday names beside the browser's: Южная
   * Корея for Республика Корея, Белоруссия for Беларусь), by ISO code.
   */
  countryAliases?: Readonly<Record<string, readonly string[]>>
  /**
   * The language's own countries (ISO codes): where a name it gives a place there is also its name for a place abroad,
   * a search finds the one at home first (Thái Nguyên, the Vietnamese city, before Taiyuan, Thái Nguyên in China).
   * The generator's RULES name them (scripts/exonyms.ts), and src/imagery/exonymTables.test.ts holds the two equal.
   */
  home?: readonly string[]
  /**
   * The language types its umlauts as ae, oe, ue where a keyboard has none (Muenster, Luebeck: German), so a search
   * also reads a query so written as the letters, for the many towns the table has no entry for (their name is the
   * data's own).
   */
  umlauts?: boolean
  /**
   * The language writes another script than Latin and its table names the where line's regions (Ukrainian, Russian,
   * Persian, Hindi): under a label in its script, a part of the where line it has no name for is left out rather than
   * shown in Latin letters beside it. Korean's where line stays the data's (owner, ko/exonyms.ts).
   */
  ownScript?: boolean
  /**
   * The language writes the typographic apostrophe in every name (Italian: L’Aquila, Reggio nell’Emilia, it.md §0), so
   * a place name shown as the data writes it has its ' shown as ’ (display only, like the table's names).
   */
  apostrophes?: boolean
  /**
   * Areas the language's readers hold to be their own country's where the place data files places under another (the
   * Paracel and Spratly Islands, for Vietnamese readers: docs/i18n/vi.md §8), as [south, west, north, east] in degrees:
   * a place there that the data puts in a country other than the language's `home` shows no where line, as the
   * countryless ones there already do. Display only; the place keeps its country.
   */
  contested?: readonly (readonly [number, number, number, number])[]
}

const exonyms: ExonymsNamespace = { names: '' }
export default ns('exonyms', exonyms)
