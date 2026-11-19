/**
 * Place names in the visitor's language, for display only (src/imagery/exonyms.ts reads it): the name a German, an
 * Italian or a Ukrainian map gives a town or region that the place data (GeoNames, and the geocoders asked in English)
 * names in English, and the Korean names of four places Korean readers know by another name. English has none: an
 * English page shows every name exactly as it came, and downloads no table.
 *
 * TRANSLATORS: not written by hand, except Korean's four (src/i18n/ko/exonyms.ts, the owner's). German, Italian and
 * Ukrainian are generated from GeoNames by scripts/build-exonyms.ts (src/i18n/<locale>/exonyms.gen.ts, never edited):
 * a wrong name is fixed in that script's overrides, then the table is generated again.
 *
 * Usage stats, record_lookup, links and shares keep the English name (Place.label, canonicalLabel), so one town is one
 * row in every language.
 */
import { ns } from '../ns'

export default ns('exonyms', {
  /**
   * The table: countries apart by `|`, each `<ISO code>:` then its names apart by `;`, each `<English name>=<shown
   * name>`, a first-level region's starting with `*`. The English name is matched as typed in a search (case, accents
   * and punctuation aside). A country code of nothing (`:Sea of Japan=동해`) holds names for places that have no
   * country (a sea). No name may hold `|`, `;`, `=` or `:`, nor start with `*`.
   * E.g. `DE:Munich=München;Cologne=Köln;*Bavaria=Bayern|AT:Vienna=Wien`.
   */
  names: '',
})
