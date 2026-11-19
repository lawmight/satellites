/**
 * Dev only (`?hl=pseudo`): a pseudo-translation made from the English namespaces, to find copy that bypasses the
 * catalogs and layouts that only fit English. Every message reads "⟦Ŝéàŕćĥ ··· â þļàćé⟧": accented (so English that
 * was never extracted stands out), about 35% longer (German and French run 20–35% longer), and bracketed (so clipped
 * ends show). Numbers and units in rich parts are left alone, as a translation leaves them. Never in a build.
 */
import type { Bundle } from './runtime'
import { isAccent, isNum, type Part } from '../../api/_lib/i18n/parts'

const MAP: Record<string, string> = {
  a: 'à', b: 'ƀ', c: 'ć', d: 'ď', e: 'é', f: 'ƒ', g: 'ĝ', h: 'ĥ', i: 'î', j: 'ĵ', k: 'ķ', l: 'ļ', m: 'ɱ', n: 'ñ', o: 'ó', p: 'þ',
  q: 'ǫ', r: 'ŕ', s: 'š', t: 'ţ', u: 'û', v: 'ṽ', w: 'ŵ', x: 'ẋ', y: 'ý', z: 'ž', A: 'À', B: 'Ɓ', C: 'Ç', D: 'Ď', E: 'É', F: 'Ƒ',
  G: 'Ĝ', H: 'Ĥ', I: 'Î', J: 'Ĵ', K: 'Ķ', L: 'Ļ', M: 'Ṁ', N: 'Ñ', O: 'Ó', P: 'Þ', Q: 'Ǫ', R: 'Ŕ', S: 'Š', T: 'Ţ', U: 'Û', V: 'Ṽ',
  W: 'Ŵ', X: 'Ẋ', Y: 'Ý', Z: 'Ž',
}

export function pseudoText(s: string): string {
  if (!/[A-Za-z]/.test(s)) return s
  const accented = s.replace(/[A-Za-z]/g, (c) => MAP[c] ?? c)
  const letters = s.replace(/[^A-Za-z]/g, '').length
  const pad = letters > 3 ? ` ${'·'.repeat(Math.ceil(letters * 0.35))}` : ''
  return `⟦${accented}${pad}⟧`
}

function pseudoValue(v: unknown): unknown {
  if (typeof v === 'string') return pseudoText(v)
  if (typeof v === 'function') return (...args: unknown[]) => pseudoValue((v as (...a: unknown[]) => unknown)(...args))
  if (Array.isArray(v)) return v.map(pseudoValue)
  if (v && typeof v === 'object') {
    const p = v as Part
    // A number part has only `n` (and `u`): pass.ts compass16 has an `n` too ("N"), among fifteen other points.
    if (isNum(p) && Object.keys(p).every((k) => k === 'n' || k === 'u')) return p
    if (isAccent(p)) return { accent: p.accent.map(pseudoValue) }
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, pseudoValue(x)]))
  }
  return v
}

/** Every English namespace, pseudo-translated. */
export function pseudoBundle(english: Record<string, object>): Bundle {
  return Object.fromEntries(Object.entries(english).map(([k, v]) => [k, pseudoValue(v) as object]))
}
