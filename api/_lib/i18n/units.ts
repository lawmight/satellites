/**
 * Units keep their case (owner, 2026-11-19): a mono caps row reads "786 km", "10 m", "7.46 km/s", never "786 KM" or
 * "10 M", in every language, English included. A unit symbol is not a word: it is written one way only (m is the
 * metre, M is mega), so the row's capitals stop at it. Cyrillic units stay lowercase too (км, м, км/с), and Turkish
 * writes km/sn; the words around them keep their language's casing (Turkish i → İ). Arabic letters have no case and
 * Chinese, Japanese and Korean pages use the Latin symbols, so nothing else is needed for them.
 *
 * Where a unit is its own part (a NumPart's `u` in rich copy, a readout's unit, the pass strip's unit slot), the
 * renderer simply leaves it alone, if it is one of the symbols below: a slot can also hold a word ("day", "scene",
 * "up"), which is uppercased with its row. Where only a finished string exists ("Sentinel-2 L2A · 10 m", "Closest
 * 3 km", a scale bar's "500 m"), `unitRuns` finds its units narrowly: a digit, at most one space (plain, no-break,
 * narrow or thin), then one of the symbols, with no Latin, Cyrillic or Greek letter or digit right after it. So
 * "Sentinel-2 L2A", "Landsat C2 L2", "10 min" and "Mosaic" are never touched, nor is anything already in capitals.
 *
 * Pure TypeScript, shared by the app (CSS keeps a [data-unit] span out of `text-transform`) and the card's canvas,
 * satori and the time-lapse's video (which uppercase in JS: `capsExceptUnits`).
 */

/** The unit symbols that keep their case, longest first (km/sn before km/s before km before m): Latin, then Cyrillic. */
export const UNIT_SYMBOLS = ['km/sn', 'km/s', 'km', 'cm', 'm', 'км/с', 'км', 'см', 'м'] as const

const SYMBOL = UNIT_SYMBOLS.map((u) => u.replace('/', '\\/')).join('|')
/** At most one space between a number and its unit: plain, no-break (U+00A0), narrow no-break (U+202F), thin (U+2009). */
const GAP = '[ \\u00a0\\u202f\\u2009]?'
/** What may not follow a unit: a letter of a cased script, a combining mark or a digit ("10 min", "2 mosaics", "m²"). */
const AFTER = '(?![\\p{Script=Latin}\\p{Script=Cyrillic}\\p{Script=Greek}\\p{M}\\p{N}_])'
const IN_TEXT = new RegExp(`(\\d${GAP})(${SYMBOL})${AFTER}`, 'gu')
const AT_START = new RegExp(`^(${GAP})(${SYMBOL})${AFTER}`, 'u')

/** A piece of a finished mono string: words (uppercased with their row) or one unit symbol (left as it is). */
export interface UnitRun {
  text: string
  unit?: true
}

/**
 * A finished string cut into runs, each unit symbol after a number a run of its own: "Sentinel-2 L2A · 10 m" →
 * ["Sentinel-2 L2A · 10 ", {m}]. `afterNumber`: the string follows a number set apart from it (a callout's " km" after
 * its live altitude), so a unit at its very start counts too. A string with no unit is one run.
 */
export function unitRuns(text: string, afterNumber = false): UnitRun[] {
  const out: UnitRun[] = []
  const words = (t: string) => t && out.push({ text: t })
  let from = 0
  const lead = afterNumber ? AT_START.exec(text) : null
  if (lead) {
    words(lead[1])
    out.push({ text: lead[2], unit: true })
    from = lead[0].length
  }
  IN_TEXT.lastIndex = from
  for (let m = IN_TEXT.exec(text); m; m = IN_TEXT.exec(text)) {
    const at = m.index + m[1].length
    words(text.slice(from, at))
    out.push({ text: m[2], unit: true })
    from = at + m[2].length
  }
  words(text.slice(from))
  return out.length ? out : [{ text }]
}

/** Is this unit slot's text one of the symbols ("km", "м", "km/sn"), rather than a word ("day", "scene")? */
export const isUnitSymbol = (u: string): boolean => (UNIT_SYMBOLS as readonly string[]).includes(u.trim())

/**
 * A mono row in capitals by its language's rules (`intl`, as LOCALE_INFO gives it: Turkish i → İ), except its unit
 * symbols: what CSS `text-transform: uppercase` and a [data-unit] span do in the app, for the renderers with no CSS
 * (the card's canvas and satori, the time-lapse's video).
 */
export function capsExceptUnits(text: string, intl: string, afterNumber = false): string {
  return unitRuns(text, afterNumber)
    .map((r) => (r.unit ? r.text : r.text.toLocaleUpperCase(intl)))
    .join('')
}
