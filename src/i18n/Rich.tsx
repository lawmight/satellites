/**
 * Renders rich copy (api/_lib/i18n/parts.ts) as React: text, mono numbers with their dimmer units, the serif accent and
 * emphasis. The caller passes its own CSS-module classes, so a sentence keeps the exact look of the place that shows it
 * (the results prose, the headline, the hero) whatever order the language puts its parts in.
 *
 * Numbers are isolated (`<bdi>` semantics through `unicode-bidi: isolate` in base.css's [dir=rtl] rules): in Arabic a
 * "7.46 km/s" or "16:14:21" never gets reordered by the surrounding right-to-left text.
 *
 * Units keep their case in mono caps rows ("786 km", never "786 KM": api/_lib/i18n/units.ts). Each unit symbol is set
 * in a [data-unit] span, which base.css keeps out of its row's `text-transform`: a NumPart's unit here, and the units
 * inside a finished string through `withUnits` (React) or `writeUnits` (text written outside React, per frame).
 *
 * Rich sets a number as text (an inline span), so a no-break space beside it holds as anywhere else. A caller that sets
 * a number as a box of its own (an atomic inline: <Count>'s animated digits) splits its parts with `holdNum` first: a line
 * may break on either side of such a box even against a no-break space (CSS Text's "web compatibility" rule, which
 * Chrome follows), so "1 037 снимков" ended a line at the count on a 360 px phone.
 */
import { Fragment, type ReactNode } from 'react'
import { LOCALE_INFO } from '../../api/_lib/i18n/locales'
import { isAccent, isNum, isStrong, percentFirst, percentGapBefore, strong, tightUnit, type Part, type PercentStyle } from '../../api/_lib/i18n/parts'
import { isUnitSymbol, unitRuns } from '../../api/_lib/i18n/units'
import { useLocale } from './runtime'

export interface RichClasses {
  /** a number (mono, tabular) */
  num?: string
  /** a number's unit (smaller, bone-3) */
  unit?: string
  /** the serif accent */
  accent?: string
  /** emphasis */
  strong?: string
}

/** Wrap each accent in this element (e.g. 'em' for the hero, the headline's serif span); default <span>. */
type AccentTag = 'em' | 'span' | 'b' | 'strong'

export function Rich({ parts, classes = {}, accentAs = 'span', strongAs = 'strong' }: { parts: readonly Part[]; classes?: RichClasses; accentAs?: AccentTag; strongAs?: AccentTag }): ReactNode {
  const style = LOCALE_INFO[useLocale()]
  return parts.map((p, i) => <Fragment key={i}>{renderPart(p, classes, accentAs, strongAs, style)}</Fragment>)
}

function renderPart(p: Part, c: RichClasses, accentAs: AccentTag, strongAs: AccentTag, style: PercentStyle): ReactNode {
  if (typeof p === 'string') return p
  if (isNum(p))
    return (
      <span className={c.num} data-num="">
        {percentFirst(p, style) ? '%' + p.n : p.n}
        {!p.u || percentFirst(p, style) ? null : tightUnit(p.u) ? (
          percentGapBefore(p.u, style) + p.u
        ) : (
          // A count's word ("31 passes") is uppercased with its row; a unit symbol ("km") never is.
          <span className={c.unit} data-unit={isUnitSymbol(p.u) ? '' : undefined}>
            {p.u}
          </span>
        )}
      </span>
    )
  const Tag = isAccent(p) ? accentAs : strongAs
  const inner = isAccent(p) ? p.accent : p.strong
  return <Tag className={isAccent(p) ? c.accent : c.strong}>{inner.map((q, i) => <Fragment key={i}>{renderPart(q, c, accentAs, strongAs, style)}</Fragment>)}</Tag>
}

/**
 * A finished mono string ("Sentinel-2 L2A · 10 m", "Closest 3 km") with each unit symbol in a [data-unit] span, so the
 * row's CSS capitals stop at it. A string without a unit comes back as it is. `afterNumber`: the string follows a
 * number set apart from it (a callout's " km" after its live altitude).
 */
export function withUnits(text: string, afterNumber = false): ReactNode {
  const runs = unitRuns(text, afterNumber)
  if (runs.length === 1 && !runs[0].unit) return text
  // One inline box around the runs: in a flex row (the viewer's chips) each run would be a flex item of its own, and
  // the space before the unit would be dropped at the item's edge.
  return (
    <span>
      {runs.map((r, i) =>
        r.unit ? (
          <span key={i} data-unit="">
            {r.text}
          </span>
        ) : (
          <Fragment key={i}>{r.text}</Fragment>
        ),
      )}
    </span>
  )
}

/** `withUnits` for text written outside React (a zoomed photo's scale bar, per frame): only when the text changes. */
export function writeUnits(el: HTMLElement, text: string): void {
  if (el.dataset.text === text) return
  el.dataset.text = text
  el.replaceChildren(
    ...unitRuns(text).map((r) => {
      if (!r.unit) return r.text
      const u = document.createElement('span')
      u.dataset.unit = ''
      u.textContent = r.text
      return u
    }),
  )
}

/** A no-break space, narrow no-break space, figure space or word joiner: a line never breaks on either side of one. */
const GLUE = /[\u00a0\u202f\u2007\u2060]/
/** Any other space: a line may break there. */
const BREAK = /[^\S\u00a0\u202f\u2007]/
/** Han and kana: each is a word of its own, so plain text may break before and after one (Japanese 枚, Chinese 张). */
const IDEOGRAPH = /[\u2e80-\u2fff\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/

/**
 * How many characters at the start of `text` must stay on the line of a number set just before it: a no-break space and
 * the word it ties ("\u00a0снимков.", "\u00a0bức\u00a0ảnh"), a word written with no space (Korean "장"), or one Han or kana
 * character, a counter (Japanese "枚", Chinese "\u00a0张"). Text that starts with a breaking space holds nothing.
 */
export function heldAfter(text: string): number {
  let i = 0
  while (i < text.length && GLUE.test(text[i])) i++
  if (i < text.length && IDEOGRAPH.test(text[i])) return i + 1
  while (i < text.length && !BREAK.test(text[i]) && !IDEOGRAPH.test(text[i])) i++
  return i
}

/**
 * How many characters at the end of `text` must stay on the line of a number set just after it: a no-break space and the
 * word before it (Turkish "En\u00a0az\u00a0"), or a word written with no space ("(", "№"). A Han or kana character holds
 * only through a no-break space: plain text breaks before a number there (Japanese "少なくとも|12,345枚。").
 */
export function heldBefore(text: string): number {
  let j = text.length
  while (j > 0 && GLUE.test(text[j - 1])) j--
  if (j > 0 && IDEOGRAPH.test(text[j - 1])) return j < text.length ? text.length - j + 1 : 0
  while (j > 0 && !BREAK.test(text[j - 1]) && !IDEOGRAPH.test(text[j - 1])) j--
  return text.length - j
}

/** A text part, or emphasis made only of text: words `holdNum` may split. */
const wordsOf = (p: Part | undefined): string | undefined =>
  typeof p === 'string' ? p : p && isStrong(p) && p.strong.every((q) => typeof q === 'string') ? p.strong.join('') : undefined
/** The same kind of part, with other words. */
const reword = (p: Part, text: string): Part => (typeof p === 'string' ? text : strong(text))

/**
 * `parts` split around the number at `at`, for a renderer that sets that number as a box of its own: `held` is the
 * number with the words that must share its line (heldBefore, heldAfter), to be set in one `white-space: nowrap` span,
 * and `before` and `after` are the rest, cut where those words were. Where nothing is held (English writes a plain space
 * on both sides of its counts), `held` is the number alone and `before` and `after` are the parts as they were.
 */
export function holdNum(parts: readonly Part[], at: number): { before: Part[]; held: Part[]; after: Part[] } {
  const before = parts.slice(0, at)
  const after = parts.slice(at + 1)
  const held: Part[] = [parts[at]]
  const prev = before[before.length - 1]
  const prevWords = wordsOf(prev)
  const b = prevWords === undefined ? 0 : heldBefore(prevWords)
  if (prevWords !== undefined && b > 0) {
    before.pop()
    if (b < prevWords.length) before.push(reword(prev, prevWords.slice(0, -b)))
    held.unshift(reword(prev, prevWords.slice(-b)))
  }
  const next = after[0]
  const nextWords = wordsOf(next)
  const a = nextWords === undefined ? 0 : heldAfter(nextWords)
  if (nextWords !== undefined && a > 0) {
    after.shift()
    if (a < nextWords.length) after.unshift(reword(next, nextWords.slice(a)))
    held.push(reword(next, nextWords.slice(0, a)))
  }
  return { before, held, after }
}
