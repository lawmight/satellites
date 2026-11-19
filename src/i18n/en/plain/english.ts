/**
 * English grammar that the English catalogs share (../pass.ts, ../results.ts): the article some place names take in
 * running text, and the capital a sentence starts with.
 *
 * Why it lives with the English copy, never in code: it is English. Code hands every message the bare place label (as
 * the geocoder or the curated list wrote it), and each language writes its own frame around it: an article, a case
 * ending, a particle, or nothing at all. A translation does not import this module. Not a namespace: nothing here is
 * translated.
 */
import { accent, type Part } from '../../../../api/_lib/i18n/parts'

/** Water bodies and deserts take an article in English prose: "it could have watched the Pacific Ocean". */
const NEEDS_ARTICLE = /(Ocean|Sea|Gulf|Bay|Strait|Desert)$/
const takesArticle = (label: string) => NEEDS_ARTICLE.test(label) && !/^the\s/i.test(label)

/** The place as it reads mid-sentence: "Waterloo", "the Pacific Ocean". */
export function placeInProse(label: string): string {
  return takesArticle(label) ? `the ${label}` : label
}

/** The article and the name apart, for the headline, where only the name is set in the serif: ["the ", "Pacific Ocean"]. */
export function placeParts(label: string): [string, string] {
  return takesArticle(label) ? ['the ', label] : ['', label]
}

/** The headline's place: the article as plain text, the name as the serif accent. */
export function placeAccent(label: string): Part[] {
  const [article, name] = placeParts(label)
  return article ? [article, accent(name)] : [accent(name)]
}

/** A sentence that starts with a place: "The Pacific Ocean was inside…", "Waterloo was inside…". */
export const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
