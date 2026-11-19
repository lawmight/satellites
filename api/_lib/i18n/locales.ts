/**
 * The languages Watched speaks, defined once for the app, the server (share pages and cards) and the build (the boot
 * script in index.html). Pure TypeScript with no DOM or Node APIs, like cardSpec.ts: the browser app imports it by
 * relative path, the serverless functions and vite.config.ts import it directly.
 *
 * Why a hand-made matcher and not the browser's: the choice has to be made before any script but the inline boot one
 * runs (so the right glyphs, direction and preload start with the first paint), and it must agree to the letter with the
 * server and the tests. Chinese is matched by script, not region: zh-CN / zh-SG / zh-Hans read Simplified, zh-TW /
 * zh-HK / zh-MO / zh-Hant read Traditional. A language we don't speak never picks a neighbour: a browser asking for
 * Russian gets English, not Ukrainian.
 */

export const LOCALES = ['en', 'es', 'fr', 'de', 'pt-BR', 'it', 'nl', 'pl', 'tr', 'id', 'uk', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'ar'] as const
export type Locale = (typeof LOCALES)[number]

/** Writing systems the design tunes type for (html[data-script]: fonts, leading, tracking, label sizes). */
export type Script = 'latin' | 'cyrillic' | 'cjk' | 'arabic'

/** CLDR cardinal plural categories (Intl.PluralRules), the keys a translation must supply for a count. */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'

export interface LocaleInfo {
  code: Locale
  /** The language's own name, as the switcher lists it */
  native: string
  /** Its English name (aria descriptions, docs) */
  english: string
  script: Script
  dir: 'ltr' | 'rtl'
  /** BCP 47 tag for Intl (numbers, dates, plurals, lists). Arabic keeps Western digits: the mono face has no others. */
  intl: string
  /** Every category Intl.PluralRules(intl) can answer (a test holds this to the runtime's ICU) */
  plurals: readonly PluralCategory[]
  /** Listed in the switcher and chosen automatically. A locale still being finished stays reachable by ?hl= only. */
  listed: boolean
  /** What separates two sentences in running text: a space, or nothing (Chinese and Japanese end with 。) */
  sentenceGap: '' | ' '
  /** A no-break space before % ("25 %": French, German), where English writes "25%" */
  percentGap?: boolean
  /** The percent sign before the number, with no space ("%25": Turkish) */
  percentFirst?: boolean
  /** The digit-group separator, where the language's typography differs from Intl's default (Spanish: a no-break space) */
  group?: string
}

const L = (
  code: Locale,
  native: string,
  english: string,
  script: Script,
  plurals: readonly PluralCategory[],
  extra: Partial<Pick<LocaleInfo, 'dir' | 'intl' | 'listed' | 'sentenceGap' | 'percentGap' | 'percentFirst' | 'group'>> = {},
): LocaleInfo => ({ code, native, english, script, dir: 'ltr', intl: code, plurals, listed: true, sentenceGap: ' ', ...extra })

export const LOCALE_INFO: Record<Locale, LocaleInfo> = {
  en: L('en', 'English', 'English', 'latin', ['one', 'other']),
  es: L('es', 'Español', 'Spanish', 'latin', ['one', 'many', 'other'], { group: '\u00a0' }),
  // Groups with a no-break space: Intl's narrow one (U+202F) is 0.1 em in Instrument Sans, so 2 330 read as 2330.
  fr: L('fr', 'Français', 'French', 'latin', ['one', 'many', 'other'], { percentGap: true, group: '\u00a0' }),
  de: L('de', 'Deutsch', 'German', 'latin', ['one', 'other'], { percentGap: true }),
  'pt-BR': L('pt-BR', 'Português', 'Portuguese', 'latin', ['one', 'many', 'other']),
  it: L('it', 'Italiano', 'Italian', 'latin', ['one', 'many', 'other']),
  nl: L('nl', 'Nederlands', 'Dutch', 'latin', ['one', 'other']),
  pl: L('pl', 'Polski', 'Polish', 'latin', ['one', 'few', 'many', 'other']),
  tr: L('tr', 'Türkçe', 'Turkish', 'latin', ['one', 'other'], { percentFirst: true }),
  id: L('id', 'Bahasa Indonesia', 'Indonesian', 'latin', ['other']),
  uk: L('uk', 'Українська', 'Ukrainian', 'cyrillic', ['one', 'few', 'many', 'other']),
  ja: L('ja', '日本語', 'Japanese', 'cjk', ['other'], { sentenceGap: '' }),
  ko: L('ko', '한국어', 'Korean', 'cjk', ['other']),
  'zh-Hans': L('zh-Hans', '简体中文', 'Chinese (Simplified)', 'cjk', ['other'], { sentenceGap: '' }),
  'zh-Hant': L('zh-Hant', '繁體中文', 'Chinese (Traditional)', 'cjk', ['other'], { sentenceGap: '' }),
  ar: L('ar', 'العربية', 'Arabic', 'arabic', ['zero', 'one', 'two', 'few', 'many', 'other'], { dir: 'rtl', intl: 'ar-u-nu-latn' }),
}

export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(v: unknown): v is Locale {
  return typeof v === 'string' && (LOCALES as readonly string[]).includes(v)
}

/**
 * The locale for one BCP 47 tag, or undefined when we don't speak it. Case and `_` are forgiven ("pt_br", "ZH-tw").
 * `listedOnly` (the default) ignores locales not yet listed, so automatic choice never lands on an unfinished one.
 */
export function localeForTag(tag: string, listedOnly = true): Locale | undefined {
  const t = tag.trim().replace(/_/g, '-').toLowerCase()
  if (!t) return undefined
  const [lang, ...rest] = t.split('-')
  let hit: Locale | undefined
  if (lang === 'zh') {
    // By script when the tag names one (zh-Hans-HK is Simplified, zh-Hant-CN Traditional), else by region
    const traditional = rest.includes('hant') || (!rest.includes('hans') && rest.some((s) => s === 'tw' || s === 'hk' || s === 'mo'))
    hit = traditional ? 'zh-Hant' : 'zh-Hans'
  } else if (lang === 'pt') hit = 'pt-BR'
  else if (lang === 'in') hit = 'id' // the old code for Indonesian, still sent by some Android browsers
  // Cantonese reads standard written Traditional Chinese every day: the one neighbour we choose over English (owner)
  else if (lang === 'yue') hit = 'zh-Hant'
  else hit = LOCALES.find((l) => l.toLowerCase() === lang)
  if (!hit) return undefined
  return !listedOnly || LOCALE_INFO[hit].listed ? hit : undefined
}

/**
 * The first language in the visitor's preference list that we speak; English when none. English named before any
 * other language wins (a Japanese reader who put English first asked for English).
 */
export function matchLocale(tags: readonly string[]): Locale {
  for (const tag of tags) {
    const hit = localeForTag(tag)
    if (hit) return hit
  }
  return DEFAULT_LOCALE
}
