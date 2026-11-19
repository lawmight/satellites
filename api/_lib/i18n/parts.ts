/**
 * Rich copy as data: a message returns an array of parts, and each renderer (React, the share card's canvas, satori,
 * plain text for aria labels and share posts) decides how a part looks. That is what lets every language order its own
 * sentence while the design rules hold everywhere: numbers are always set in the mono face (DESIGN §3), the one serif
 * accent per screen stays one phrase, emphasis stays on the phrase that carries the meaning in that language.
 *
 *   'text'                       plain text
 *   { n: '7.46', u: 'km/s' }     a number (mono), with an optional unit (smaller, dimmer; '%', '°' attach tight)
 *   { accent: [...] }            the serif accent: the hero's "you", the headline's place name
 *   { strong: [...] }            emphasis: the headline's count phrase
 *
 * Pure TypeScript, shared by the app and the server like cardSpec.ts.
 */

export interface NumPart {
  n: string
  u?: string
}
export interface AccentPart {
  accent: Part[]
}
export interface StrongPart {
  strong: Part[]
}
export type Part = string | NumPart | AccentPart | StrongPart
export type Rich = Part[]

export const num = (n: string, u?: string): NumPart => (u ? { n, u } : { n })
export const accent = (...parts: Part[]): AccentPart => ({ accent: parts })
export const strong = (...parts: Part[]): StrongPart => ({ strong: parts })

export const isNum = (p: Part): p is NumPart => typeof p === 'object' && 'n' in p
export const isAccent = (p: Part): p is AccentPart => typeof p === 'object' && 'accent' in p
export const isStrong = (p: Part): p is StrongPart => typeof p === 'object' && 'strong' in p

/** Units that attach without a space: 5.3°, 25%, 12′. */
export const tightUnit = (u: string) => /^[°%′″٪]/.test(u)

/** How a language writes a percentage (LocaleInfo): "25%", "25 %" (French, German), "%25" (Turkish). */
export interface PercentStyle {
  percentGap?: boolean
  percentFirst?: boolean
}

/** French and German write "25 %": a no-break space before a percent sign (LocaleInfo.percentGap). */
export const percentGapBefore = (u: string, style?: PercentStyle) => (style?.percentGap && u.startsWith('%') ? '\u00a0' : '')

/** Turkish writes "%25": the sign comes first (LocaleInfo.percentFirst). Only a bare "%" moves. */
export const percentFirst = (p: NumPart, style?: PercentStyle) => !!style?.percentFirst && p.u === '%'

/** A number with its unit as plain text: "7.46 km/s", "25%" ("25 %", "%25" in the languages that write them so). */
export const numText = (p: NumPart, style?: PercentStyle) =>
  !p.u
    ? p.n
    : percentFirst(p, style)
      ? `%${p.n}`
      : tightUnit(p.u)
        ? `${p.n}${percentGapBefore(p.u, style)}${p.u}`
        : `${p.n} ${p.u}`

/**
 * Flatten to plain text (aria labels, share posts, tests). Several sentences join with `gap`: a space, or nothing in
 * Chinese and Japanese (LocaleInfo.sentenceGap).
 */
export function plain(parts: Rich | Rich[], gap = ' '): string {
  if (parts.length && Array.isArray(parts[0])) return (parts as Rich[]).map((s) => plain(s)).join(gap)
  let out = ''
  for (const p of parts as Rich) {
    if (typeof p === 'string') out += p
    else if (isNum(p)) out += numText(p)
    else if (isAccent(p)) out += plain(p.accent)
    else out += plain(p.strong)
  }
  return out
}
