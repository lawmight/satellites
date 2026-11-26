/**
 * English copy for places (src/imagery/geocode.ts): how a place's "where" line is put together on screen.
 *
 * What is NOT here, on purpose:
 *  - Place names. The geocoders (asked in English) and the offline place list name places, and those names are data:
 *    shown as they came, stored and counted in the usage stats as they came, so one town is one row whatever the
 *    visitor's language. Only the country at the end of the "where" line is shown in the visitor's language (from the
 *    browser's own country names), joined to the rest by `where` below.
 *  - The kind of place that tells two same-named search results apart ("Bus stop, Ushuaia, Tierra del Fuego,
 *    Argentina"): the code writes it in English from OpenStreetMap's tag ('bus_stop') into the place's "where" line,
 *    which is data (the stats and lookups keep it), and a place does not carry the tag itself, so on screen it stays
 *    English in every language for now. It is expected, and rare (two search results that read exactly alike).
 *  - Why "Use my location" failed: that notice is the landing's (landing.ts `locateErrors`), the only one shown.
 *  - Coordinates ("43.4723°N 80.5449°W"): international notation, the same in every language (a Vietnamese page shows
 *    its own hemisphere letters, locales.ts `hemispheres`; a place's label keeps N S E W, geocode.ts coordinateLabel).
 */
import { ns } from '../ns'

/** The namespace: `where`, and how the where line's own parts are joined once they are named in the language. */
export interface GeoNamespace {
  where: (rest: string | undefined, country: string) => string
  /**
   * The separator between the where line's own parts once the page names them in your language (a place-name table:
   * "Одеса, Одеська область"), so the line is one list in it: Persian «، ». Default ", ". Never used while `rest` is
   * the geocoder's data as it came.
   */
  parts?: string
}

export default ns<GeoNamespace>('geo', {
  /**
   * A place's "where" line under its name (search results, the dropped pin, the results' place), when it ends with
   * the place's country: `rest` is everything before the country as the geocoder wrote it ("Ontario", "Paris,
   * Île-de-France", "Bus stop, Ushuaia, Tierra del Fuego"), ONE opaque piece of data: keep it whole and exactly as it
   * is, never split, reorder or re-punctuate it. Undefined when the line is the country alone. `country` is the
   * country's name in your language (the browser's). Join them your language's way. English: "Ontario, Canada".
   */
  where: (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`),
})
