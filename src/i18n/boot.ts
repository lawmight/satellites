/**
 * The language choice made by index.html before anything else runs (vite.config.ts inlines `bootLocale` as a <script>
 * at the top of <head>, with the data below). It has to happen there, not in the app: the page's lang, direction and
 * script decide which glyphs, fonts and layout the very first paint uses, and the chosen language's messages can start
 * downloading in parallel with the app instead of after it (modulepreload), so no visitor waits for a second request.
 *
 * The function is serialised with Function.prototype.toString, so it must be self-contained: no imports, no closures,
 * no helpers outside its body, plain ES2018 syntax. It mirrors `localeForTag` / `matchLocale` in
 * api/_lib/i18n/locales.ts exactly (a test runs both over every tag shape we handle).
 *
 * Order of authority: `?hl=<locale>` (remembered, so a shared link with it keeps the visitor's pick across visits;
 * `?hl=auto` forgets), then the language the visitor picked in the switcher (localStorage `watched.lang`), then the
 * browser's preference list. `?hl=` may name a locale that is not listed yet (to review it); nothing else does.
 */

export interface BootData {
  /** locale → [script, dir, listed (1) or not (0)] */
  locales: Record<string, [string, string, number]>
  /** locale → module URLs to modulepreload (its messages chunk and what that imports); absent in dev */
  preload?: Record<string, string[]>
  /** script or locale → font URLs to preload (woff2): a non-Latin script's faces, a Latin language's latin-ext ones */
  fonts?: Record<string, string[]>
}

/** The browser globals the boot script touches (typed here so the node build of vite.config.ts needs no DOM lib). */
interface BootEl {
  lang: string
  dir: string
  setAttribute(name: string, value: string): void
}
interface BootLink {
  rel: string
  href: string
  as: string
  type: string
  crossOrigin: string | null
}
interface BootGlobals {
  localStorage: { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
  location: { search: string }
  navigator: { languages?: readonly string[]; language?: string }
  document: { documentElement: BootEl; head: { appendChild(n: BootLink): void }; createElement(tag: 'link'): BootLink }
}

export function bootLocale(d: BootData): void {
  var g = globalThis as unknown as BootGlobals
  var KEY = 'watched.lang'
  var codes = Object.keys(d.locales)
  var lower = function (s: string) {
    return s.toLowerCase()
  }
  var forTag = function (tag: string, listedOnly: boolean): string | undefined {
    var t = lower(String(tag).trim().replace(/_/g, '-'))
    if (!t) return undefined
    var parts = t.split('-')
    var lang = parts[0]
    var hit: string | undefined
    if (lang === 'zh') {
      // By script when the tag names one (zh-Hans-HK is Simplified), else by region (locales.ts localeForTag)
      var script = '',
        region = false
      for (var i = 1; i < parts.length; i++) {
        if (parts[i] === 'hant' || parts[i] === 'hans') script = parts[i]
        else if (parts[i] === 'tw' || parts[i] === 'hk' || parts[i] === 'mo') region = true
      }
      hit = script === 'hant' || (!script && region) ? 'zh-Hant' : 'zh-Hans'
    } else if (lang === 'pt') hit = 'pt-BR'
    else if (lang === 'in') hit = 'id'
    else if (lang === 'yue') hit = 'zh-Hant'
    else
      for (var j = 0; j < codes.length; j++)
        if (lower(codes[j]) === lang) {
          hit = codes[j]
          break
        }
    if (!hit || !d.locales[hit]) return undefined
    return !listedOnly || d.locales[hit][2] ? hit : undefined
  }
  var chosen: string | undefined
  var store: BootGlobals['localStorage'] | undefined
  try {
    store = g.localStorage
  } catch (e) {
    store = undefined
  }
  try {
    var hl = new URLSearchParams(g.location.search).get('hl')
    if (hl === 'auto') {
      if (store) store.removeItem(KEY)
    } else if (hl) {
      chosen = forTag(hl, false)
      if (chosen && store) store.setItem(KEY, chosen)
    }
    if (!chosen && store) {
      var saved = store.getItem(KEY)
      if (saved) chosen = forTag(saved, false)
    }
  } catch (e) {
    /* storage blocked (private mode, sandboxed frame): fall through to the browser's languages */
  }
  if (!chosen) {
    var nav = g.navigator
    var prefs = nav.languages && nav.languages.length ? nav.languages : [nav.language || 'en']
    for (var k = 0; k < prefs.length && !chosen; k++) chosen = forTag(prefs[k], true)
  }
  if (!chosen) chosen = 'en'
  var info = d.locales[chosen]
  var root = g.document.documentElement
  root.lang = chosen
  root.dir = info[1]
  root.setAttribute('data-locale', chosen)
  root.setAttribute('data-script', info[0])
  var head = g.document.head
  var add = function (rel: string, href: string, as?: string) {
    var l = g.document.createElement('link')
    l.rel = rel
    l.href = href
    if (as) {
      l.as = as
      l.type = 'font/woff2'
    }
    l.crossOrigin = 'anonymous'
    head.appendChild(l)
  }
  var mods = (d.preload && d.preload[chosen]) || []
  for (var m = 0; m < mods.length; m++) add('modulepreload', mods[m])
  var fonts = ((d.fonts && d.fonts[info[0]]) || []).concat((d.fonts && d.fonts[chosen]) || [])
  for (var f = 0; f < fonts.length; f++) add('preload', fonts[f], 'font')
}
