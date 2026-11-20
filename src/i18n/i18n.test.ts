import { afterEach, describe, expect, it } from 'vitest'
import { LOCALES, LOCALE_INFO, localeForTag, matchLocale, type Locale } from '../../api/_lib/i18n/locales'
import { PLURALS, fmt } from '../../api/_lib/i18n/format'
import { accent, num, numText, plain, strong } from '../../api/_lib/i18n/parts'
import { bootLocale, type BootData } from './boot'
import enApp from './en/app'

const TAGS = [
  'en', 'en-US', 'en-GB', 'EN_us', 'es', 'es-MX', 'es-419', 'fr-CA', 'fr', 'de-AT', 'de-CH', 'pt', 'pt-BR', 'pt-PT', 'pt_br',
  'it', 'nl-BE', 'pl', 'tr', 'id', 'in', 'in-ID', 'uk', 'uk-UA', 'ru', 'ru-UA', 'be', 'ja', 'ja-JP', 'ko-KR', 'zh', 'zh-CN',
  'zh-SG', 'zh-Hans', 'zh-Hans-CN', 'zh-TW', 'zh-HK', 'zh-MO', 'zh-Hant', 'zh-Hant-HK', 'ZH-tw', 'zh-Hans-HK', 'zh-Hans-TW', 'zh-Hans-MO', 'zh-Hant-CN', 'yue', 'yue-HK', 'ar', 'ar-SA', 'ar-EG',
  'he', 'hi-IN', 'vi', 'th', 'sv', '', ' ', 'x-pseudo', 'enx',
]

describe('locale matching', () => {
  it('maps tags the way the product promises', () => {
    expect(localeForTag('zh-CN')).toBe('zh-Hans')
    expect(localeForTag('zh-SG')).toBe('zh-Hans')
    expect(localeForTag('zh')).toBe('zh-Hans')
    expect(localeForTag('zh-HK')).toBe('zh-Hant')
    expect(localeForTag('zh-Hant-HK')).toBe('zh-Hant')
    expect(localeForTag('zh-TW')).toBe('zh-Hant')
    // A named script wins over the region
    expect(localeForTag('zh-Hans-HK')).toBe('zh-Hans')
    expect(localeForTag('zh-Hans-TW')).toBe('zh-Hans')
    expect(localeForTag('zh-Hant-CN')).toBe('zh-Hant')
    expect(localeForTag('pt-PT')).toBe('pt-BR')
    expect(localeForTag('in')).toBe('id')
    // Cantonese: Traditional Chinese, the one neighbour chosen over English
    expect(localeForTag('yue')).toBe('zh-Hant')
    expect(localeForTag('yue-Hant-HK')).toBe('zh-Hant')
    expect(localeForTag('ru')).toBeUndefined()
    expect(localeForTag('enx')).toBeUndefined()
  })
  it('takes the first language we speak, English when none', () => {
    expect(matchLocale(['ru-RU', 'uk-UA', 'en'])).toBe('uk')
    expect(matchLocale(['en-US', 'ja'])).toBe('en')
    expect(matchLocale(['ru', 'he'])).toBe('en')
    expect(matchLocale([])).toBe('en')
  })
})

/** Run index.html's boot script against fake globals and read what it decided. */
function boot(langs: readonly string[], search = '', saved: string | null = null) {
  const store = new Map<string, string>(saved ? [['watched.lang', saved]] : [])
  const attrs: Record<string, string> = {}
  const links: { rel: string; href: string }[] = []
  const g = globalThis as Record<string, unknown>
  const keep = { localStorage: g.localStorage, location: g.location, navigator: g.navigator, document: g.document }
  Object.assign(g, {
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => store.set(k, v), removeItem: (k: string) => store.delete(k) },
    location: { search },
    document: {
      documentElement: { lang: '', dir: '', setAttribute: (k: string, v: string) => (attrs[k] = v) },
      head: { appendChild: (l: { rel: string; href: string }) => links.push(l) },
      createElement: () => ({}),
    },
  })
  Object.defineProperty(g, 'navigator', { value: { languages: langs, language: langs[0] }, configurable: true, writable: true })
  const data: BootData = {
    locales: Object.fromEntries(Object.values(LOCALE_INFO).map((l) => [l.code, [l.script, l.dir, l.listed ? 1 : 0]])),
    preload: { de: ['/assets/de.js'] },
  }
  try {
    bootLocale(data)
    const root = (g.document as { documentElement: { lang: string; dir: string } }).documentElement
    return { lang: root.lang, dir: root.dir, attrs, links, saved: store.get('watched.lang') }
  } finally {
    Object.defineProperty(g, 'navigator', { value: keep.navigator, configurable: true, writable: true })
    Object.assign(g, { localStorage: keep.localStorage, location: keep.location, document: keep.document })
  }
}

describe('boot script (index.html)', () => {
  afterEach(() => undefined)
  it('agrees with matchLocale on every tag', () => {
    for (const tag of TAGS) expect(boot([tag]).lang, tag).toBe(matchLocale([tag]))
    for (let i = 0; i < TAGS.length - 1; i++) expect(boot([TAGS[i], TAGS[i + 1]]).lang).toBe(matchLocale([TAGS[i], TAGS[i + 1]]))
  })
  it('sets direction and script, and preloads the bundle', () => {
    const ar = boot(['ar-SA'])
    expect([ar.lang, ar.dir, ar.attrs['data-script']]).toEqual(['ar', 'rtl', 'arabic'])
    const de = boot(['de-DE'])
    expect(de.links.map((l) => [l.rel, l.href])).toEqual([['modulepreload', '/assets/de.js']])
    expect(boot(['en-US']).links).toEqual([])
  })
  it('lets ?hl= and the saved choice win, and remembers ?hl=', () => {
    expect(boot(['en-US'], '?hl=ja')).toMatchObject({ lang: 'ja', saved: 'ja' })
    expect(boot(['en-US'], '', 'de').lang).toBe('de')
    expect(boot(['en-US'], '?hl=auto', 'de')).toMatchObject({ lang: 'en', saved: undefined })
    expect(boot(['fr'], '?hl=klingon').lang).toBe('fr')
  })
})

describe('formatting', () => {
  it('keeps the plural table equal to the runtime ICU', () => {
    for (const l of LOCALES) {
      const icu = new Intl.PluralRules(LOCALE_INFO[l].intl).resolvedOptions().pluralCategories
      expect([...icu].sort(), l).toEqual([...LOCALE_INFO[l].plurals].sort())
      expect([...PLURALS[l]].sort(), l).toEqual([...LOCALE_INFO[l].plurals].sort())
    }
  })
  it('formats numbers per locale, English as before', () => {
    expect(fmt('en').int(1715)).toBe('1,715')
    expect(fmt('en').dec(7.456, 2)).toBe('7.46')
    expect(fmt('de').int(1715)).toBe('1.715')
    expect(fmt('de').dec(7.456, 2)).toBe('7,46')
    expect(fmt('ar').int(1715)).toBe('1,715')
    expect(fmt('en').list(['Umbra', 'Capella', '7 other radar satellites'])).toBe('Umbra, Capella and 7 other radar satellites')
    // Spanish groups with a no-break space from 5 digits (its style guide).
    expect(fmt('es').int(35778)).toBe('35\u00a0778')
    expect(fmt('es').int(1715)).toBe('1715')
    expect(fmt('es').dec(12345.678, 2)).toBe('12\u00a0345,68')
    // French groups with a no-break space too: the sans draws U+202F at 0.1 em, so 2 330 read as 2330.
    expect(fmt('fr').int(35778)).toBe('35\u00a0778')
  })
  it('spaces a percent sign where the language does', () => {
    expect(numText({ n: '25', u: '%' })).toBe('25%')
    expect(numText({ n: '25', u: '%' }, LOCALE_INFO.fr)).toBe('25\u00a0%')
    expect(numText({ n: '5,3', u: '°' }, LOCALE_INFO.de)).toBe('5,3°')
    expect(numText({ n: '25', u: '%' }, LOCALE_INFO.tr)).toBe('%25')
    expect([fmt('en').pct(25), fmt('fr').pct(25), fmt('tr').pct(25), fmt('es').pct(12.4)]).toEqual(['25%', '25\u00a0%', '%25', '12%'])
  })
  it('picks plural forms', () => {
    const pl = fmt('pl')
    const forms = { one: 'satelita', few: 'satelity', many: 'satelitów', other: 'satelity' }
    expect([1, 2, 5, 22, 25].map((n) => pl.plural(n, forms))).toEqual(['satelita', 'satelity', 'satelitów', 'satelity', 'satelitów'])
  })
})

describe('rich parts', () => {
  it('flattens to text with the locale sentence gap', () => {
    const s = ['In the last 7 days, ', strong(num('256'), ' satellites watched'), ' ', accent('Waterloo'), '.']
    expect(plain(s)).toBe('In the last 7 days, 256 satellites watched Waterloo.')
    expect(plain([[num('25', '%')], [num('7.46', 'km/s')]])).toBe('25% 7.46 km/s')
    expect(plain([['今週。'], ['見ていた。']], '')).toBe('今週。見ていた。')
  })
})

describe('the tab title', () => {
  // src/app/head.ts sets app.documentTitle on the landing in every language, English included: English must be
  // index.html's title as it is, the one crawlers and link previews read.
  it('is index.html’s own in English', () => {
    const html = import.meta.glob<string>('../../index.html', { query: '?raw', import: 'default', eager: true })['../../index.html']
    expect(/<title>([^<]*)<\/title>/.exec(html)?.[1]).toBe(enApp.documentTitle)
  })
})

describe('catalog characters', () => {
  // The design's faces draw ’ (U+2019); they have no glyph for U+02BC ʼ, so a translation using it would print its
  // apostrophes in a system font (src/styles/scripts.css).
  it('uses ’ for apostrophes, never U+02BC', () => {
    const files = {
      ...import.meta.glob<string>(['./*/*.ts', '!./en/**'], { query: '?raw', import: 'default', eager: true }),
      ...import.meta.glob<string>('../../api/_lib/i18n/card/*.ts', { query: '?raw', import: 'default', eager: true }),
    }
    expect(Object.keys(files).length).toBeGreaterThan(100)
    expect(Object.keys(files).filter((f) => files[f].includes('\u02bc'))).toEqual([])
  })
})

export type { Locale }
