/**
 * Fonts for text the card's own fonts cannot draw: a place named in Japanese, Arabic, Devanagari and so on.
 *
 * satori names what a card lacks (ogRender.ts asks it in a first pass): the script (`ja-JP`, `ar-AR`, … or `unknown`)
 * and the exact characters. Google Fonts serves a Noto subset of just those characters, as TTF when asked with an
 * older browser's user agent (satori cannot read WOFF2). The cards relied on @vercel/og's loader for this before; this
 * is the same idea written for our renderer, so it runs on any host with `fetch`. A failure returns no font: satori
 * then draws the missing characters as boxes rather than failing the card.
 *
 * Every subset is registered under a name of its own: satori asks only the first face registered under a name (and
 * weight and style), and one card can need two subsets of one family (a Japanese card asks for its kana as `ja-JP`
 * and for its kanji as `ja-JP|zh-CN|zh-TW|zh-HK`, each with a Noto Sans JP subset).
 *
 * Each subset comes at 400 and 600 (one style sheet, both files fetched together): a card's headline is set at 600, and
 * a Chinese, Japanese or Korean card's headline is all fallback characters, which were drawn at 400 while the app's
 * preview and PNG set them at 600. The two families Google serves at one weight only are asked for at 400.
 *
 * Answers are cached by script and characters, a bounded number (CACHE_SIZE): a card asks for all it lacks at once, so
 * answers seldom repeat across cards, and the cache only spares the same card drawn twice (two edge locations asking)
 * and repeated emoji. Unbounded, it would keep every subset an instance ever fetched.
 */
import type { SatoriFont } from './fonts.js'

/** Families Google Fonts serves at 400 only: asking them for 600 fails the whole style sheet. */
const ONE_WEIGHT = new Set(['Noto Sans Symbols 2', 'Noto Sans Math'])

/** satori's script codes → Noto families that cover them. */
const NOTO: Record<string, string[]> = {
  'ja-JP': ['Noto Sans JP'],
  'ko-KR': ['Noto Sans KR'],
  'zh-CN': ['Noto Sans SC'],
  'zh-TW': ['Noto Sans TC'],
  'zh-HK': ['Noto Sans HK'],
  'th-TH': ['Noto Sans Thai'],
  'bn-IN': ['Noto Sans Bengali'],
  'ar-AR': ['Noto Sans Arabic'],
  'ta-IN': ['Noto Sans Tamil'],
  'ml-IN': ['Noto Sans Malayalam'],
  'he-IL': ['Noto Sans Hebrew'],
  'te-IN': ['Noto Sans Telugu'],
  devanagari: ['Noto Sans Devanagari'],
  kannada: ['Noto Sans Kannada'],
  symbol: ['Noto Sans Symbols', 'Noto Sans Symbols 2'],
  math: ['Noto Sans Math'],
  unknown: ['Noto Sans'],
}

/** An old Safari: Google Fonts then answers TrueType rather than WOFF2. */
const TTF_USER_AGENT =
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'
const TIMEOUT_MS = 4000

async function notoSubset(family: string, text: string): Promise<{ weight: 400 | 600; data: ArrayBuffer }[]> {
  const weights = ONE_WEIGHT.has(family) ? '' : ':wght@400;600'
  const css = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}${weights}&text=${encodeURIComponent(text)}`
  const sheet = await fetch(css, { headers: { 'user-agent': TTF_USER_AGENT }, signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!sheet.ok) return []
  // One @font-face per weight; a face that names no weight is 400.
  const faces = (await sheet.text()).split('@font-face').flatMap((face) => {
    const src = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(face)?.[1]
    return src ? [{ src, weight: /font-weight:\s*600/.test(face) ? (600 as const) : (400 as const) }] : []
  })
  const files = await Promise.all(
    faces.map(async ({ src, weight }) => {
      const font = await fetch(src, { signal: AbortSignal.timeout(TIMEOUT_MS) })
      return font.ok ? { weight, data: await font.arrayBuffer() } : null
    }),
  )
  return files.filter((f) => f !== null)
}

/** Twemoji's file name for an emoji: its code points in hex, dropping U+FE0F unless the sequence has a joiner. */
function twemojiName(emoji: string): string {
  const points = [...(emoji.includes('\u200d') ? emoji : emoji.replace(/\ufe0f/g, ''))].map((c) => c.codePointAt(0)!.toString(16))
  return points.join('-')
}

async function emojiDataUri(emoji: string): Promise<string | SatoriFont[]> {
  const res = await fetch(`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${twemojiName(emoji)}.svg`, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) return []
  return `data:image/svg+xml;base64,${btoa(await res.text())}`
}

/** Subsets loaded so far in this instance: each one's name (see above). */
let loaded = 0

async function load(code: string, text: string): Promise<string | SatoriFont[]> {
  if (code === 'emoji') return emojiDataUri(text)
  const out: SatoriFont[] = []
  for (const script of code.split('|')) {
    for (const family of NOTO[script] ?? []) {
      // Both weights of one subset share its name, so satori picks between them by weight.
      const name = `${family} (fallback ${++loaded})`
      for (const { weight, data } of await notoSubset(family, text))
        out.push({ name, data, weight, style: 'normal', ...(script === 'unknown' ? {} : { lang: script }) })
    }
  }
  return out
}

/** How many answers are kept (the least recently asked goes first). */
export const CACHE_SIZE = 32

const cache = new Map<string, Promise<string | SatoriFont[]>>()

/**
 * What satori names as missing (`loadAdditionalAsset`'s arguments): a data URI for an emoji, fonts otherwise (none when
 * nothing could be loaded).
 */
export function loadFallbackAsset(code: string, text: string): Promise<string | SatoriFont[]> {
  const key = `${code}\u0000${text}`
  let hit = cache.get(key)
  if (hit) {
    cache.delete(key) // the most recently asked, last in line to go
  } else {
    const promise = load(code, text).catch((err: unknown) => {
      console.error('[og] fallback font failed', code, err)
      if (cache.get(key) === promise) cache.delete(key) // a transient failure is retried by the next card
      return []
    })
    hit = promise
  }
  cache.set(key, hit)
  if (cache.size > CACHE_SIZE) cache.delete(cache.keys().next().value!)
  return hit
}
