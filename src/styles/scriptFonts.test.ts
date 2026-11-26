/**
 * The faces a page sets each language's words in, held to the letters that language writes. A letter its faces lack
 * is drawn in a system face, in the middle of a word ("Việt" was V-i-t in Instrument Sans and ệ in a system face): this
 * resolves every role's stack (tokens.css, scripts.css) the way the browser does, over the real font files' cmaps
 * and the @font-face unicode-ranges, and fails on any letter that would fall through.
 *
 * - Vietnamese: every letter, digit and punctuation mark, upper and lower case, in the Vietnamese face of each role
 *   (the first in its stack): never half a word in a brand face.
 * - Russian and Ukrainian: every Cyrillic letter in the role's Cyrillic face (Martian Mono's own for mono).
 * - Persian and Arabic: every Arabic-script letter, both digit sets and the zero-width non-joiner in the role's Arabic
 *   face (ZWNJ from the same face as the letters it separates, or the run would break with a gap).
 * - English: its stacks list only the brand faces, so no other language's face is ever fetched for it.
 *
 * Each language's catalogs, where they exist (src/i18n/<locale>, api/_lib/i18n/card/<locale>.ts), add their own
 * letters, so a word a translator adds is checked too.
 */
import { describe, expect, it } from 'vitest'

// Node's file system and brotli, by a runtime specifier (the app's tsconfig has no Node types), as language.test.ts
// imports the server's modules.
interface NodeFs {
  readFileSync(path: string): Uint8Array
  readFileSync(path: string, encoding: 'utf8'): string
  existsSync(path: string): boolean
  readdirSync(path: string): string[]
}
const fs = (await import('node:fs' as string)) as NodeFs
const { brotliDecompressSync } = (await import('node:zlib' as string)) as { brotliDecompressSync(data: Uint8Array): Uint8Array }

const ROOT = new URL('../../', import.meta.url)
const at = (p: string, base: URL = ROOT) => decodeURIComponent(new URL(p, base).pathname)
const read = (p: string) => fs.readFileSync(at(p), 'utf8')

// ── Font files: WOFF2's character map ───────────────────────────────────────────────────────

/** The characters a WOFF2 file maps to a glyph (its cmap; the only table read, so no glyph transform is undone). */
function woff2Cmap(file: string): Set<number> {
  const bytes = fs.readFileSync(file)
  const b = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (b.getUint32(0) !== 0x774f4632) throw new Error(`${file}: not WOFF2`)
  const numTables = b.getUint16(12)
  let p = 48
  const base128 = () => {
    let v = 0
    for (let i = 0; i < 5; i++) {
      const byte = b.getUint8(p++)
      v = v * 128 + (byte & 0x7f)
      if (!(byte & 0x80)) return v
    }
    throw new Error('bad UIntBase128')
  }
  let offset = 0
  let cmap: [number, number] | undefined
  for (let i = 0; i < numTables; i++) {
    const flags = b.getUint8(p++)
    const known = flags & 0x3f
    if (known === 0x3f) p += 4
    const transform = flags >> 6
    const orig = base128()
    // glyf (10) and loca (11) are transformed unless their version is 3; any other table only when it is not 0
    const transformed = known === 10 || known === 11 ? transform !== 3 : transform !== 0
    const length = transformed ? base128() : orig
    if (known === 0) cmap = [offset, length]
    offset += length
  }
  if (!cmap) throw new Error(`${file}: no cmap`)
  const data = brotliDecompressSync(bytes.subarray(p, p + b.getUint32(20)))
  return cmapChars(new DataView(data.buffer, data.byteOffset + cmap[0], cmap[1]))
}

function cmapChars(t: DataView): Set<number> {
  const out = new Set<number>()
  const records = Array.from({ length: t.getUint16(2) }, (_, i) => ({ pid: t.getUint16(4 + i * 8), eid: t.getUint16(6 + i * 8), at: t.getUint32(8 + i * 8) }))
  const pick = records.find((r) => r.pid === 3 && r.eid === 10) ?? records.find((r) => r.pid === 0 && r.eid === 4) ?? records.find((r) => (r.pid === 3 && r.eid === 1) || r.pid === 0)
  if (!pick) return out
  const s = pick.at
  const format = t.getUint16(s)
  if (format === 12) {
    const groups = t.getUint32(s + 12)
    for (let g = 0; g < groups; g++) {
      const start = t.getUint32(s + 16 + g * 12)
      const end = t.getUint32(s + 20 + g * 12)
      for (let c = start; c <= end; c++) out.add(c)
    }
  } else if (format === 4) {
    const segs = t.getUint16(s + 6) / 2
    const ends = s + 14
    const starts = ends + segs * 2 + 2
    const deltas = starts + segs * 2
    const ranges = deltas + segs * 2
    for (let i = 0; i < segs; i++) {
      const end = t.getUint16(ends + i * 2)
      const start = t.getUint16(starts + i * 2)
      const delta = t.getInt16(deltas + i * 2)
      const ro = t.getUint16(ranges + i * 2)
      for (let c = start; c <= end && c !== 0xffff; c++) {
        const glyph = ro === 0 ? (c + delta) & 0xffff : t.getUint16(ranges + i * 2 + ro + (c - start) * 2)
        if (glyph !== 0) out.add(c)
      }
    }
  }
  return out
}

// ── Stylesheets: the faces and the stacks ───────────────────────────────────────────────────

interface Face {
  family: string
  italic: boolean
  ranges: [number, number][]
  chars: Set<number>
}

const unquote = (s: string) => s.trim().replace(/^['"]|['"]$/g, '')

function faces(css: string, base: URL): Face[] {
  return [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map(([, body]) => {
    const get = (prop: string) => new RegExp(`(?:^|;|\\s)${prop}:\\s*([^;]+);`).exec(body)?.[1]
    const url = /url\(['"]?([^'")]+\.woff2)['"]?\)/.exec(body)![1]
    const range = get('unicode-range') ?? 'U+0-10FFFF'
    return {
      family: unquote(get('font-family')!),
      italic: get('font-style')?.trim() === 'italic',
      ranges: range.split(',').map((r) => {
        const [a, z = a] = r.trim().replace(/^U\+/i, '').split('-')
        return [parseInt(a, 16), parseInt(z, 16)] as [number, number]
      }),
      chars: woff2Cmap(at(url, base)),
    }
  })
}

/** Every face a page can use: the brand faces fonts.css imports from Fontsource, then scripts.css's own. */
const FACES: Face[] = [
  ...[...read('src/styles/fonts.css').matchAll(/@import '([^']+)'/g)].flatMap(([, pkg]) => faces(read(`node_modules/${pkg}`), new URL(`node_modules/${pkg}`, ROOT))),
  ...faces(read('src/styles/scripts.css'), new URL('src/styles/scripts.css', ROOT)),
]

/** The custom properties of every top-level block with exactly this selector, later ones winning. */
function vars(css: string, selector: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (let at = css.indexOf(`\n${selector} {`); at >= 0; at = css.indexOf(`\n${selector} {`, at + 1)) {
    const body = css.slice(at, css.indexOf('}', at))
    for (const [, k, v] of body.matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[k] = v.trim()
  }
  if (!Object.keys(out).length) throw new Error(`no ${selector} block`)
  return out
}

const TOKENS = vars(read('src/styles/tokens.css'), ':root')
const SCRIPTS = read('src/styles/scripts.css')

type Role = 'sans' | 'mono' | 'serif' | 'card-display'
const ROLES: Role[] = ['sans', 'mono', 'serif', 'card-display']

/** A page's stack for each role: tokens.css, then the language's or script's block in scripts.css. */
function stacks(...selectors: string[]): Record<Role, string[]> {
  const v = Object.assign({}, TOKENS, ...selectors.map((s) => vars(SCRIPTS, s)))
  const list = (role: Role) => {
    const value = v[`--font-${role}`] ?? v['--font-sans']
    return value.split(',').map(unquote)
  }
  return Object.fromEntries(ROLES.map((r) => [r, list(r)])) as Record<Role, string[]>
}

/**
 * The family that draws `c` in `stack`: in each family in turn, its faces whose unicode-range holds `c`, the last
 * declared first; the first whose font has the character. 'system' when none does.
 */
function drawnBy(stack: string[], c: number, italic: boolean): string {
  for (const family of stack) {
    const own = FACES.filter((f) => f.family === family && f.italic === italic && f.ranges.some(([a, z]) => c >= a && c <= z)).reverse()
    if (own.some((f) => f.chars.has(c))) return family
  }
  return 'system'
}

/** Every role's misses: the characters not drawn by a family its check accepts, by role. */
function misses(stack: Record<Role, string[]>, text: string, ok: (role: Role, family: string) => boolean): Partial<Record<Role, string>> {
  const out: Partial<Record<Role, string>> = {}
  for (const role of ROLES) {
    const bad = [...new Set(text)].filter((ch) => !ok(role, drawnBy(stack[role], ch.codePointAt(0)!, role === 'serif')))
    if (bad.length) out[role] = bad.map((ch) => `${ch} U+${ch.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')} (${drawnBy(stack[role], ch.codePointAt(0)!, role === 'serif')})`).join(', ')
  }
  return out
}

/** The letters of a language's catalogs that match `re`, in both cases (labels are set in capitals). */
function catalogLetters(locale: string, re: RegExp): string {
  const dir = `src/i18n/${locale}/`
  const card = `api/_lib/i18n/card/${locale}.ts`
  const files = [...(fs.existsSync(at(dir)) ? fs.readdirSync(at(dir)).map((f) => dir + f) : []), ...(fs.existsSync(at(card)) ? [card] : [])]
  const text = files.map(read).join('')
  const letters = [...new Set(text.match(re) ?? [])].join('')
  return letters + letters.toLocaleUpperCase(locale) + letters.toLocaleLowerCase(locale)
}

const range = (a: number, z: number) => String.fromCodePoint(...Array.from({ length: z - a + 1 }, (_, i) => a + i))

// ── The checks ──────────────────────────────────────────────────────────────────────────────

describe('a Vietnamese page', () => {
  const stack = stacks(':root:lang(vi)')
  const own: Record<Role, string> = { sans: 'Watched Vietnamese', mono: 'Watched Vietnamese Mono', serif: 'Watched Vietnamese Serif', 'card-display': 'Watched Vietnamese Display' }
  const vietnamese = 'aăâbcdđeêghiklmnoôơpqrstuưvxyàáãảạằắẵẳặầấẫẩậèéẽẻẹềếễểệìíĩỉịòóõỏọồốỗổộờớỡởợùúũủụừứữửựỳýỹỷỵ'
  const text =
    vietnamese +
    vietnamese.toLocaleUpperCase('vi') +
    range(0x21, 0x7e) +
    '“”‘’–—…·°×€₫«» ' +
    'ŁłŚśŹźŻżĄąĘęŃńŇňŘřŠšŽžČčĞğİıŞşȘșȚț' + // a Polish, Czech, Turkish or Romanian place name
    catalogLetters('vi', /[\p{Script=Latin}\p{N}]/gu)

  it('sets every letter, digit and mark in each role’s Vietnamese face, so no word is half in a brand face', () => {
    expect(misses(stack, text, (role, family) => family === own[role])).toEqual({})
    for (const role of ROLES) expect(stack[role][0]).toBe(own[role])
  })

  it('keeps the brand faces after its own, for a symbol they lack, as an English page has them', () => {
    expect(stack.sans).toContain('Instrument Sans Variable')
    expect(stack.mono).toContain('Martian Mono Variable')
    expect(stack.serif).toContain('Instrument Serif')
  })
})

describe('a Russian or Ukrainian page', () => {
  const stack = stacks(":root[data-script='cyrillic']")
  const own: Record<Role, string> = { sans: 'Watched Cyrillic', mono: 'Martian Mono Variable', serif: 'Watched Cyrillic Serif', 'card-display': 'Watched Cyrillic Display' }
  const text = range(0x0410, 0x044f) + 'ЁёҐґЄєІіЇї№' + catalogLetters('ru', /\p{Script=Cyrillic}/gu) + catalogLetters('uk', /\p{Script=Cyrillic}/gu)

  it('sets every Cyrillic letter (ё ы э ъ, ґ є і ї) in each role’s Cyrillic face', () => {
    expect(misses(stack, text, (role, family) => family === own[role])).toEqual({})
  })
})

describe('a Persian or Arabic page', () => {
  const stack = stacks(":root[data-script='arabic']")
  const own: Record<Role, string[]> = {
    sans: ['Watched Arabic'],
    mono: ['Watched Arabic Label'],
    serif: ['Watched Arabic Serif'],
    'card-display': ['Watched Arabic'],
  }
  const persian = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهیآأإؤئءةۀكيـ'
  const digits = '۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩٪٫٬،؛؟'
  const text = persian + digits + '‌' + catalogLetters('fa', /[\p{Script=Arabic}‌]/gu) + catalogLetters('ar', /[\p{Script=Arabic}‌]/gu)

  it('sets every letter (پ چ ژ گ ک ی), both digit sets and the non-joiner in each role’s Arabic face', () => {
    expect(misses(stack, text, (role, family) => own[role].includes(family))).toEqual({})
  })

  it('takes a mono label’s spaces from the Arabic face, not Martian Mono’s full cell', () => {
    expect(drawnBy(stack.mono, 0x20, false)).toBe('Watched Arabic Space')
  })
})

describe('an English page', () => {
  it('lists only the brand faces, so no other language’s face is fetched for it', () => {
    const stack = stacks()
    const brand = new Set(FACES.filter((f) => /^(Instrument|Martian)/.test(f.family)).map((f) => f.family))
    for (const role of ROLES) for (const family of stack[role]) expect(brand.has(family) || !FACES.some((f) => f.family === family)).toBe(true)
    expect(drawnBy(stack.sans, 'W'.codePointAt(0)!, false)).toBe('Instrument Sans Variable')
    expect(drawnBy(stack.mono, '7'.codePointAt(0)!, false)).toBe('Martian Mono Variable')
    expect(drawnBy(stack.serif, 'y'.codePointAt(0)!, true)).toBe('Instrument Serif')
  })
})
