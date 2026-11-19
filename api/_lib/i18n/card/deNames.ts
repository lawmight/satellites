/**
 * How a German sentence takes an inserted name it cannot inflect (docs/i18n/de.md §4.3, §5.1, §5.2): the article a
 * curated place needs before it, and the classifier a crewed station takes as a subject. Shared by the share card's
 * copy (./de.ts) and the app's German catalog (src/i18n/de/*), so a headline, a post and a page description write the
 * same place the same way.
 *
 * Why it lives here: the card is built on the server, which never imports the app (src/), while the app may import
 * api/_lib/i18n; so the one table both speak sits beside the card's copy, like ./deZone.ts. Pure TypeScript, no imports.
 *
 *  - Curated places (the landing's chips and the Surprise me pool) are copy, and German says *den Central Park*, *die
 *    Niagarafälle*. The table maps each German label that needs an article, which also covers an English label that is
 *    spelt the same (a link or share made by its English name, *Central Park*), to its accusative article and the form
 *    it takes after *in Sichtweite*. The article is plain text before the name, never inside the serif. Gazetteer labels
 *    are never looked up or guessed: a name that is not in the table stays bare (*… beobachteten 256 Satelliten
 *    Waterloo.*), and code never adds an article to one.
 *  - The table matches the label alone and cannot tell a chip from a search result, so a curated label that a town
 *    in the offline list also carries, far from the curated place, is left out and stays bare: *Golden Gate* (a town
 *    in Florida), *Fuji* (cities in Shizuoka and Sichuan), *Kīlauea* (a town on Kauai). With the article the headline
 *    would name the strait, the mountain or the volcano instead of the town searched. *Central Park* (a town in
 *    Washington) and *Grand Canyon* (the village on the rim) keep theirs: the name reads as the park or the canyon
 *    either way. Check a new entry against `public/places/<version>/s/` before adding it (de.md §4.3).
 *  - After *in Sichtweite* a plural place takes the genitive *der* (*in Sichtweite der Niagarafälle*): the dative *von
 *    den* would need the uninflected label to end in -n (*von den Niagarafällen*), which only some of them do. Singular
 *    places take *vom* / *von der*, which leave the name as it is.
 *  - Every German writes *die ISS*: in a sentence (not a headline lead) a crewed station is *Die Raumstation ISS*. The
 *    English messages carry no crewed flag, so the station is known by the display names the catalog gives the crewed
 *    profiles (src/engine/profiles.ts: ISS, Tiangong).
 */

interface Article {
  /** Accusative, before the object: *den*, *die*, *das* */
  acc: string
  /** After *in Sichtweite*: *vom*, *von der*, or the genitive plural *der* */
  von: string
}

const M: Article = { acc: 'den', von: 'vom' }
const F: Article = { acc: 'die', von: 'von der' }
const N: Article = { acc: 'das', von: 'vom' }
const PL: Article = { acc: 'die', von: 'der' }

/**
 * German curated labels (src/i18n/de/places.ts, de.md §4.3) that take an article. Labels without one are absent, and so
 * are the three a town shares (see above).
 */
const ARTICLES: Record<string, Article> = {
  'Area 51': F,
  'Central Park': M,
  'Pyramiden von Gizeh': PL,
  Uluru: M,
  'Inselgruppe The World': F,
  'Grand Canyon': M,
  'Barringer-Krater': M,
  'Las Vegas Strip': M,
  'Hoover-Damm und Lake Mead': M,
  'Kennedy Space Center': N,
  'Mount St. Helens': M,
  Niagarafälle: PL,
  Panamakanal: M,
  Vesuv: M,
  Tafelberg: M,
  Kilimandscharo: M,
  'Mount Everest': M,
  'Hafen von Sydney': M,
  'Richat-Struktur': F,
  'Great Blue Hole': N,
  'Hardy Reef': N,
  'Salzbecken am Toten Meer': PL,
  'Bingham-Canyon-Mine': F,
  'Mount-Whaleback-Mine': F,
  Ätna: M,
  Teide: M,
  'Crater Lake': M,
  'Glen-Canyon-Talsperre': F,
  'Bewässerungskreise von Garden City': PL,
  'Gewächshäuser von Almería': PL,
  Suezkanal: M,
  'Assuan-Staudamm': M,
  'Wadi Rum': N,
  Sossusvlei: N,
  Victoriafälle: PL,
  'Drei-Schluchten-Talsperre': F,
  'Itaipú-Talsperre': F,
}

/**
 * The article for a place, if it is a curated label that takes one. A place cut short on the card ("Bewässerungskreise
 * von Gard…") is matched by what is left of it, so the article does not vanish with the end of the name.
 */
export function articleDe(place: string): Article | undefined {
  const hit = ARTICLES[place]
  if (hit || !place.endsWith('…')) return hit
  const stem = place.slice(0, -1).trimEnd()
  if (stem.length < 6) return undefined
  const key = Object.keys(ARTICLES).find((k) => k.startsWith(stem))
  return key ? ARTICLES[key] : undefined
}

/** The words before a place as an accusative object: "den " for *den Central Park*, "" for a bare name. */
export const accDe = (place: string): string => {
  const a = articleDe(place)
  return a ? `${a.acc} ` : ''
}

/** The words after *in Sichtweite*: "von" for a bare name, "vom", "von der" or "der" for a curated one. */
export const vonDe = (place: string): string => articleDe(place)?.von ?? 'von'

/** Display names of the crewed stations (src/engine/profiles.ts), as the catalog writes them. */
const CREWED = /^(ISS|Tiangong)\b/

/** True for a crewed station's name. */
export const isStationDe = (sat: string): boolean => CREWED.test(sat)

/** A satellite as the subject of a sentence: *Die Raumstation ISS* for a crewed station, else the name as it came. */
export const subjectDe = (sat: string): string => (isStationDe(sat) ? `Die Raumstation ${sat}` : sat)
