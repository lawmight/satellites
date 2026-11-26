/**
 * The maker's thanks: "Help keep Watched free :)", itself the link to the maker's Buy Me a Coffee page (src/lib/maker.ts,
 * a new tab; owner, 2026-11-23: the ask is the link, no "buy me a coffee"). The row that closes the results has room to
 * say where it goes ("A small tip, on Buy Me a Coffee"), so the page is no surprise. Every press is counted by where it was (`support_click`, its `from`; migration 0029), so the owner can see
 * which place brings people to it.
 *
 * Where it is, and where it is not (owner, 2026-11-23):
 *  - Kept off the screens people screenshot and record to post (the headline, the photos, the globe, the time-lapse
 *    loop): an ask there would travel with every post. The one exception is <ColophonBar/> (below), and only for the
 *    people who keep searching: from a browser's third result, until they close it.
 *  - <ColophonLine/> sits at the foot of the share sheet: the people who open it have just decided the site was worth
 *    showing someone, and what they post is the card, drawn on its own, never the sheet.
 *  - <ColophonText/> stands in for the time-lapse's note while its video is made and saved (src/ui/timelapse): a file
 *    is being exported, not the screen recorded.
 *  - <Colophon/> closes the results overview, after the caveats, for whoever reads to the end; About's intro and
 *    credits, and the landing's foot on wide screens, have the same link.
 *
 * How it looks: the instrument's own parts (a 1px mark, mono caps, a hairline, the external arrow), quieter than the
 * rows around it; the arrow takes the signal colour only on hover (DESIGN §1). The class names say nothing about
 * donating or sponsors, which generic cosmetic filters in blocker lists hide.
 */
import { useState } from 'react'
import enResults from '@/i18n/en/results'
import { useMsgs } from '@/i18n/runtime'
import { SUPPORT_URL, readAsk, writeAsk } from '@/lib/maker'
import { track, type SupportFrom } from '@/lib/telemetry'
import { Glyph, cx } from '@/ui/system'
import s from './Colophon.module.css'

/**
 * A press of the link from `from`, counted. Only the bar's own press (or its ×) ends the bar: a press anywhere else
 * leaves it to come (owner, 2026-11-23; a press of the closing row on a browser's first result had kept the bar from
 * ever showing).
 */
export function pressedSupport(from: SupportFrom) {
  track('support_click', { from })
  if (from === 'bar') finishBar()
}

/** The row that closes the results overview: the ask as its title, where it goes under it. */
export function Colophon() {
  const m = useMsgs(enResults).colophon
  return (
    <a className={s.row} href={SUPPORT_URL} target="_blank" rel="noopener" onClick={() => pressedSupport('results')}>
      <Glyph name="cup" size={16} className={s.mark} />
      <span className={s.text}>
        <span className={s.title}>{m.ask}</span>
        <span className={s.sub}>{m.via}</span>
      </span>
      <Glyph name="arrow-up-right" size={12} className={s.arrow} />
    </a>
  )
}

/** The ask as a link, in its parent's type (the time-lapse's note, the share sheet's line). */
export function ColophonText({ from }: { from: SupportFrom }) {
  const m = useMsgs(enResults).colophon
  return (
    <span>
      <a className={s.lineLink} href={SUPPORT_URL} target="_blank" rel="noopener" onClick={() => pressedSupport(from)}>
        {m.ask}
        <Glyph name="arrow-up-right" size={10} className={s.lineArrow} />
      </a>
    </span>
  )
}

/** One quiet line with its mark (the share sheet's foot). */
export function ColophonLine({ from, className }: { from: SupportFrom; className?: string }) {
  return (
    <p className={cx(s.line, className)}>
      <Glyph name="cup" size={14} className={s.mark} />
      <ColophonText from={from} />
    </p>
  )
}

// ── The bar: for people who keep searching ────────────────────────────────────────────────────────────────────────────

/**
 * The one ask on the results screen itself, for the people who use the site most (owner, 2026-11-23):
 *  - from a browser's third result on (places and windows; a first search's screenshots, the ones most often posted,
 *    never have it), on phones the first thing under the headline (the half-open sheet shows it), on laptops after the
 *    photos and the time-lapse row (still the first screen, never ahead of the headline);
 *  - gone for good once its × or its own link is pressed, in every later visit too (a press of the link anywhere else is
 *    counted, and leaves the bar to come);
 *  - never beside the shared-link invite (one bar at a time);
 *  - decided once per place and window, when its overview first shows (Back from a pass, a partial report turning
 *    final: the same answer), so it never appears under a reader.
 */
const FROM_RESULT = 3

const decided = new Map<string, boolean>()

/** Whether the overview of `placeKey` shows the bar (decided once per key; `blocked`: another bar is up). */
export function decideBar(placeKey: string, blocked: boolean): boolean {
  const known = decided.get(placeKey)
  // (a press elsewhere, the landing's, ends it for places already decided too)
  if (known !== undefined) return known && !readAsk().done
  const st = readAsk()
  st.results += 1
  writeAsk(st)
  const show = !blocked && !st.done && st.results >= FROM_RESULT
  decided.set(placeKey, show)
  return show
}

/** Closed or pressed: never again, here (every place this tab decided, so a remounted overview stays without it) or later. */
export function finishBar() {
  writeAsk({ ...readAsk(), done: true })
  for (const k of decided.keys()) decided.set(k, false)
}

/** Tests: forget this tab's decisions. */
export function resetBarForTests() {
  decided.clear()
}

export function ColophonBar({ placeKey, blocked }: { placeKey: string; blocked: boolean }) {
  const all = useMsgs(enResults)
  const m = all.colophon
  const [closed, setClosed] = useState(false)
  if (closed || !decideBar(placeKey, blocked)) return null
  return (
    <div className={s.bar}>
      <Glyph name="cup" size={16} className={s.mark} />
      <p className={s.barText}>
        <a className={s.barLink} href={SUPPORT_URL} target="_blank" rel="noopener" onClick={() => pressedSupport('bar')}>
          {m.ask}
          <Glyph name="arrow-up-right" size={10} className={s.barArrow} />
        </a>
      </p>
      <button
        type="button"
        className={s.barClose}
        onClick={() => {
          finishBar()
          setClosed(true)
        }}
        aria-label={all.invite.dismiss}
      >
        <Glyph name="close" size={12} />
      </button>
    </div>
  )
}
