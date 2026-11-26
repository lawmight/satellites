/**
 * Hindi's type on the page (src/styles/scripts.css, scripts/build-devanagari-fonts.py): no tracking anywhere on a
 * Devanagari page (it cuts the headline stroke between letters), its faces named only behind the brand faces and
 * declared for the Devanagari block, and every Devanagari letter the Hindi copy prints in both subset files the page
 * downloads. Read from the files themselves (here rather than in the app's suite, which has no file system and blanks
 * CSS): the WOFF2's character map is decoded (Brotli, then the cmap table), so a rebuild that dropped a letter fails
 * before a Hindi page draws it in a system face.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { brotliDecompressSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'

const ROOT = new URL('../../', import.meta.url)
const font = (file: string) => readFileSync(new URL(`src/assets/fonts/${file}`, ROOT))
const css = readFileSync(new URL('src/styles/scripts.css', ROOT), 'utf8')

/** The rule for a selector, as written (the first match). */
function rule(selector: string): string {
  const at = css.indexOf(`${selector} {`)
  if (at < 0) throw new Error(`no rule ${selector}`)
  return css.slice(at, css.indexOf('}', at))
}

/** Every @font-face of a family prefix: its family, src and unicode-range. */
function faces(prefix: string) {
  return [...css.matchAll(/@font-face\s*{([^}]*)}/g)]
    .map((m) => m[1])
    .filter((b) => b.includes(`font-family: '${prefix}`))
    .map((b) => ({
      family: /font-family: '([^']+)'/.exec(b)![1],
      src: /url\('([^']+)'\)/.exec(b)![1],
      range: /unicode-range: ([^;]+);/.exec(b)![1],
    }))
}


/** The code points a WOFF2 file maps to a glyph (its cmap's format 4 subtable: the BMP, all Devanagari needs). */
function woff2Cmap(buf: Buffer): Set<number> {
  const v = new DataView(buf.buffer, buf.byteOffset, buf.byteLength)
  if (v.getUint32(0) !== 0x774f4632) throw new Error('not WOFF2') // 'wOF2'
  const numTables = v.getUint16(12)
  const compressed = v.getUint32(20)
  let p = 48
  const base128 = () => {
    let n = 0
    for (let i = 0; i < 5; i++) {
      const b = v.getUint8(p++)
      n = n * 128 + (b & 0x7f)
      if (!(b & 0x80)) return n
    }
    throw new Error('bad UIntBase128')
  }
  // The table directory: a known tag's index (cmap is 0) or an explicit tag, its length, and a transformed length for
  // glyf / loca (version 0) and hmtx (version 1); the tables follow one another in one Brotli stream, in this order.
  let offset = 0
  let cmap: [number, number] | undefined
  for (let i = 0; i < numTables; i++) {
    const flags = v.getUint8(p++)
    const known = flags & 0x3f
    if (known === 63) p += 4
    const version = flags >> 6
    const orig = base128()
    const transformed = known === 10 || known === 11 ? version === 0 : version !== 0
    const length = transformed ? base128() : orig
    if (known === 0) cmap = [offset, length]
    offset += length
  }
  if (!cmap) throw new Error('no cmap')
  const data = brotliDecompressSync(buf.subarray(p, p + compressed))
  const t = new DataView(data.buffer, data.byteOffset + cmap[0], cmap[1])
  const out = new Set<number>()
  for (let i = 0, n = t.getUint16(2); i < n; i++) {
    const sub = t.getUint32(4 + i * 8 + 4)
    if (t.getUint16(sub) !== 4) continue
    const segs = t.getUint16(sub + 6) / 2
    const ends = sub + 14
    const starts = ends + segs * 2 + 2
    const deltas = starts + segs * 2
    const ranges = deltas + segs * 2
    for (let s = 0; s < segs; s++) {
      const end = t.getUint16(ends + s * 2)
      const start = t.getUint16(starts + s * 2)
      const delta = t.getInt16(deltas + s * 2)
      const range = t.getUint16(ranges + s * 2)
      for (let c = start; c <= end && c !== 0xffff; c++) {
        const g = range ? t.getUint16(ranges + s * 2 + range + (c - start) * 2) : c
        if (g && (g + delta) & 0xffff) out.add(c)
      }
    }
  }
  return out
}

const DEVANAGARI = /[\u0900-\u097f]/gu

/** Every file of Hindi copy there is: the app's namespaces (their loading-screen words too) and the card's. */
function hindiCopy(): string {
  const dir = new URL('src/i18n/hi/', ROOT)
  const card = new URL('api/_lib/i18n/card/hi.ts', ROOT)
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.ts')).map((f) => new URL(f, dir)) : []
  return [...files, ...(existsSync(card) ? [card] : [])].map((f) => readFileSync(f, 'utf8')).join('')
}

describe('the Devanagari subset files', () => {
  const sans = woff2Cmap(font('noto-sans-devanagari-wght400-700-wdth75-100.woff2'))
  const serif = woff2Cmap(font('noto-serif-devanagari-350-87.woff2'))

  it('hold the whole Devanagari block, the joiners and the dotted circle', () => {
    for (const cmap of [sans, serif]) {
      const missing = []
      for (let c = 0x0900; c <= 0x097f; c++) if (!cmap.has(c)) missing.push(c.toString(16))
      expect(missing).toEqual([])
      for (const c of [0x200c, 0x200d, 0x25cc, 0x20, 0xa0]) expect(cmap.has(c)).toBe(true)
    }
    // and nothing the brand faces draw (Latin, digits, punctuation stay Instrument's and Martian Mono's)
    expect([...sans].filter((c) => c < 0x0900 && c !== 0x20 && c !== 0xa0)).toEqual([])
  })

  it('draw every Devanagari letter the Hindi copy prints', () => {
    const text = hindiCopy()
    const used = new Set([...text.matchAll(DEVANAGARI)].map((m) => m[0].codePointAt(0)!))
    const missing = [...used].filter((c) => !sans.has(c) || !serif.has(c)).map((c) => String.fromCodePoint(c))
    expect(missing).toEqual([])
  })
})

describe('a Devanagari page', () => {
  const row = rule(":root[data-script='devanagari']")

  it('tracks nothing: the tokens are zero lengths, and literal letter-spacing is overruled', () => {
    // A length, never a unitless 0: components add the tokens inside calc(), where `1ch + 0` is invalid.
    expect(row).toMatch(/--track-display: 0em;/)
    expect(row).toMatch(/--track-label: 0em;/)
    expect(rule(":root[data-script='devanagari'] :where(*)")).toMatch(/letter-spacing: 0 !important;/)
    expect(row).toMatch(/font-synthesis-style: none;/)
    // and no script's tracking token is ever unitless
    expect([...css.matchAll(/--track-[a-z]+: ([^;]+);/g)].map((m) => m[1]).filter((v) => !/^-?[\d.]+em$/.test(v))).toEqual([])
  })

  it('names its faces only behind the brand faces, so Latin, digits and units stay the English ones', () => {
    expect(row).toMatch(/--font-sans: 'Instrument Sans Variable', 'Instrument Sans', 'Watched Devanagari',/)
    expect(row).toMatch(/--font-mono: 'Watched Devanagari Space', 'Martian Mono Variable', 'Martian Mono', 'Watched Devanagari Label',/)
    expect(row).toMatch(/--font-serif: 'Instrument Serif', 'Watched Devanagari Serif',/)
  })

  it('declares each face for the Devanagari block (the space face for the two spaces), from the subset files', () => {
    const all = faces('Watched Devanagari')
    expect(all.map((f) => f.family)).toEqual(['Watched Devanagari', 'Watched Devanagari Label', 'Watched Devanagari Space', 'Watched Devanagari Serif'])
    for (const f of all) {
      expect(f.src).toMatch(/^\.\.\/assets\/fonts\/noto-(sans|serif)-devanagari-[\w-]+\.woff2$/)
      expect(f.range).toBe(f.family.endsWith('Space') ? 'U+0020, U+00A0' : 'U+0900-097F, U+200C-200D, U+25CC')
    }
  })
})
