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
 */
import { Fragment, type ReactNode } from 'react'
import { LOCALE_INFO } from '../../api/_lib/i18n/locales'
import { isAccent, isNum, percentFirst, percentGapBefore, tightUnit, type Part, type PercentStyle } from '../../api/_lib/i18n/parts'
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
