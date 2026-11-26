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
 * Devanagari is set as the page sets Hindi (src/styles/scripts.css), a face per role rather than one fallback for all
 * of them: Noto Sans Devanagari condensed for the display, at full width for the sans and, 20% larger, for the mono's
 * labels (the page's size-adjust, baked in by shrinking the em), and Noto Serif Devanagari for the serif accent. Each
 * is registered under the name its role's stack lists (fonts.ts DEVANAGARI_NAME), without a script: satori finds a
 * stack's faces by name only when they carry none. Google serves named instances only (weights by the hundred, widths
 * by keyword), so the display is 600 where the page sets 560 and the serif 400 where it sets 350. satori asks for all
 * of a card's Devanagari at once, so these are three style sheets and three files a card, the sans's shared.
 *
 * Answers are cached by script and characters, a bounded number (CACHE_SIZE): a card asks for all it lacks at once, so
 * answers seldom repeat across cards, and the cache only spares the same card drawn twice (two edge locations asking)
 * and repeated emoji. Unbounded, it would keep every subset an instance ever fetched.
 */
import { DEVANAGARI_NAME, FONT, type SatoriFont } from './fonts.js'

/** Families Google Fonts serves at 400 only: asking them for 600 fails the whole style sheet. */
const ONE_WEIGHT = new Set(['Noto Sans Symbols 2', 'Noto Sans Math'])

/** satori's script codes → Noto families that cover them (Devanagari: ROLE_FACES). */
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
  kannada: ['Noto Sans Kannada'],
  symbol: ['Noto Sans Symbols', 'Noto Sans Symbols 2'],
  math: ['Noto Sans Math'],
  unknown: ['Noto Sans'],
}

/** An old Safari: Google Fonts then answers TrueType rather than WOFF2. */
const TTF_USER_AGENT =
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1'
const TIMEOUT_MS = 4000

/** A face of a script for one role of the card (see the top of this file). */
interface RoleFace {
  family: string
  /** The instance asked for, in the style sheet's axis syntax ("wdth,wght@75,600") */
  axes: string
  /** The name its role's stack lists (fonts.ts FAMILY) */
  name: string
  weight: 400 | 600
  style?: 'italic'
  /** The page's size-adjust (1.2: drawn 20% larger) */
  scale?: number
}

/** The scripts set a face per role, in the order they are registered (the sans first: any other role falls to it). */
const ROLE_FACES: Record<string, RoleFace[]> = {
  devanagari: [
    { family: 'Noto Sans Devanagari', axes: 'wght@400', name: DEVANAGARI_NAME(FONT.sans), weight: 400 },
    { family: 'Noto Sans Devanagari', axes: 'wdth,wght@75,600', name: DEVANAGARI_NAME(FONT.display), weight: 600 },
    { family: 'Noto Sans Devanagari', axes: 'wght@400', name: DEVANAGARI_NAME(FONT.mono), weight: 400, scale: 1.2 },
    // Declared italic as the page's is (scripts.css): the serif role asks for italic, and Devanagari is drawn upright.
    { family: 'Noto Serif Devanagari', axes: 'wdth,wght@87.5,400', name: DEVANAGARI_NAME(FONT.serif), weight: 400, style: 'italic' },
  ],
}

/** A family's subset of `text`, at 400 and 600 unless `axes` names an instance. */
async function notoSubset(family: string, text: string, axes?: string): Promise<{ weight: 400 | 600; data: ArrayBuffer }[]> {
  axes ??= ONE_WEIGHT.has(family) ? '' : 'wght@400;600'
  const css = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}${axes ? `:${axes}` : ''}&text=${encodeURIComponent(text)}`
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

/**
 * A copy of a TrueType font drawn `k` times larger at the same size: its em (head.unitsPerEm) shrunk by k, which scales
 * outlines, advances, kerning and line metrics alike, as CSS's size-adjust does. satori and its HarfBuzz both read the
 * em from there; neither checks the table's checksum.
 */
export function scaledFont(data: ArrayBuffer, k: number): ArrayBuffer {
  const copy = data.slice(0)
  const v = new DataView(copy)
  for (let i = 0, n = v.getUint16(4); i < n; i++) {
    const rec = 12 + i * 16
    if (v.getUint32(rec) !== 0x68656164) continue // 'head'
    const head = v.getUint32(rec + 8)
    v.setUint16(head + 18, Math.round(v.getUint16(head + 18) / k))
    break
  }
  return copy
}

/** A script's faces per role (ROLE_FACES), each one asked for once however many roles share it. */
async function roleFaces(faces: RoleFace[], text: string): Promise<SatoriFont[]> {
  const sheets = new Map<string, Promise<{ weight: 400 | 600; data: ArrayBuffer }[]>>()
  for (const f of faces) {
    const key = `${f.family}:${f.axes}`
    if (!sheets.has(key)) sheets.set(key, notoSubset(f.family, text, f.axes))
  }
  const out: SatoriFont[] = []
  for (const f of faces) {
    const file = (await sheets.get(`${f.family}:${f.axes}`)!)[0]
    if (file) out.push({ name: f.name, data: f.scale ? scaledFont(file.data, f.scale) : file.data, weight: f.weight, style: f.style ?? 'normal' })
  }
  return out
}

/** Subsets loaded so far in this instance: each one's name (see above). */
let loaded = 0

async function load(code: string, text: string): Promise<string | SatoriFont[]> {
  if (code === 'emoji') return emojiDataUri(text)
  const out: SatoriFont[] = []
  for (const script of code.split('|')) {
    const roles = ROLE_FACES[script]
    if (roles) {
      out.push(...(await roleFaces(roles, text)))
      continue
    }
    for (const family of NOTO[script] ?? []) {
      // Both weights of one subset share its name, so satori picks between them by weight.
      const name = `${family} (fallback ${++loaded})`
      for (const { weight, data } of await notoSubset(family, text))
        out.push({ name, data, weight, style: 'normal', ...(script === 'unknown' ? {} : { lang: script }) })
    }
  }
  return out
}

/**
 * satori names a character several scripts share under all of them: the danda «।» of every Hindi sentence comes as
 * `bn-IN|ta-IN|ml-IN|te-IN|devanagari|kannada`, which cost a Hindi card five subsets of other scripts for one bar, drawn
 * in Bengali's. When the card already asks for one of those scripts, and that script is set a face per role
 * (ROLE_FACES), the character joins that script's request: it is drawn in the role's own face, and nothing else is
 * fetched. Other shared characters (Han in a Japanese card: `ja-JP|zh-CN|…`) are left as satori names them.
 */
export function mergeShared(missing: readonly { code: string; text: string }[]): { code: string; text: string }[] {
  const out = missing.map((m) => ({ ...m }))
  const host = new Map(out.filter((m) => ROLE_FACES[m.code]).map((m) => [m.code, m]))
  return out.filter((m) => {
    if (!m.code.includes('|')) return true
    const into = m.code.split('|').find((c) => host.has(c))
    if (!into) return true
    host.get(into)!.text += m.text
    return false
  })
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
