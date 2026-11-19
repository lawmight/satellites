/**
 * Locale-bound formatting for numbers, counts and lists: one cached set of Intl objects per locale, shared by the app,
 * the share-card renderers and the server. Pure (Intl only, no DOM).
 *
 * Why every number goes through here: the readouts and prose set numbers in the mono face (DESIGN §3), and each
 * language groups and separates digits its own way ("1,715" / "1.715" / "1 715"; "7.46" / "7,46"). English keeps the
 * en-US forms it has always printed. Digits are always Western (Arabic too: see locales.ts `intl`).
 *
 * `plural` is typed per locale: a translation must supply every CLDR category its language has (Polish one/few/many/
 * other, Arabic six), so a missing form is a compile error, not a wrong word at runtime.
 */
import { LOCALE_INFO, type Locale, type PluralCategory } from './locales.js'
import { numText } from './parts.js'

/** The plural categories of a locale, as a type. */
export type PluralsOf<L extends Locale> = (typeof PLURALS)[L][number]

/** Mirrors LOCALE_INFO[*].plurals as literal types (a test keeps the two equal). */
export const PLURALS = {
  en: ['one', 'other'],
  es: ['one', 'many', 'other'],
  fr: ['one', 'many', 'other'],
  de: ['one', 'other'],
  'pt-BR': ['one', 'many', 'other'],
  it: ['one', 'many', 'other'],
  nl: ['one', 'other'],
  pl: ['one', 'few', 'many', 'other'],
  tr: ['one', 'other'],
  id: ['other'],
  uk: ['one', 'few', 'many', 'other'],
  ja: ['other'],
  ko: ['other'],
  'zh-Hans': ['other'],
  'zh-Hant': ['other'],
  ar: ['zero', 'one', 'two', 'few', 'many', 'other'],
} as const satisfies Record<Locale, readonly PluralCategory[]>

export interface Fmt<L extends Locale = Locale> {
  locale: L
  /** BCP 47 tag the Intl objects were built with */
  intl: string
  /** Whole number, grouped: 1,715 · 1.715 · 1 715 */
  int(n: number): string
  /** Fixed decimals: dec(7.456, 2) → 7.46 · 7,46 */
  dec(n: number, digits: number): string
  /** The CLDR category of a count */
  category(n: number): PluralCategory
  /** Pick a form for a count: plural(n, { one: 'satellite', other: 'satellites' }) */
  plural<T>(n: number, forms: Record<PluralsOf<L>, T>): T
  /** "A, B and C" in the locale's own words and punctuation */
  list(items: readonly string[]): string
  /** A whole percentage as the language writes it: 25% · 25 % · %25 */
  pct(n: number): string
}

const cache = new Map<Locale, Fmt>()

/** The English list keeps its house style: no serial comma ("Umbra, Capella and 7 other radar satellites"). */
const LIST_TAG: Partial<Record<Locale, string>> = { en: 'en-GB' }

export function fmt<L extends Locale>(locale: L): Fmt<L> {
  let f = cache.get(locale) as Fmt<L> | undefined
  if (f) return f
  const intl = locale === 'en' ? 'en-US' : LOCALE_INFO[locale].intl
  const intFmt = new Intl.NumberFormat(intl, { maximumFractionDigits: 0 })
  const decs = new Map<number, Intl.NumberFormat>()
  // A language whose typography groups digits otherwise than Intl does (Spanish: a no-break space, from 5 digits).
  const group = LOCALE_INFO[locale].group
  const out = (nf: Intl.NumberFormat, n: number) =>
    group === undefined ? nf.format(n) : nf.formatToParts(n).map((p) => (p.type === 'group' ? group : p.value)).join('')
  const rules = new Intl.PluralRules(intl)
  const list = new Intl.ListFormat(LIST_TAG[locale] ?? intl, { style: 'long', type: 'conjunction' })
  f = {
    locale,
    intl,
    int: (n) => out(intFmt, Math.round(n)),
    dec(n, digits) {
      let d = decs.get(digits)
      if (!d) decs.set(digits, (d = new Intl.NumberFormat(intl, { minimumFractionDigits: digits, maximumFractionDigits: digits })))
      return out(d, n)
    },
    category: (n) => rules.select(n) as PluralCategory,
    plural<T>(n: number, forms: Record<PluralsOf<L>, T>): T {
      const all = forms as Partial<Record<PluralCategory, T>>
      return all[rules.select(n) as PluralCategory] ?? all.other!
    },
    list: (items) => list.format(items),
    pct: (n) => numText({ n: out(intFmt, Math.round(n)), u: '%' }, LOCALE_INFO[locale]),
  }
  cache.set(locale, f)
  return f
}
