/**
 * <Hud/>: the instrument chrome, always mounted above the globe (DESIGN §4).
 *
 *   TL  wordmark + version, About link            TR  live UTC clock, 1 Hz signal dot
 *   BL  catalog: objects, source, fetch time      BR  sub-solar point + GMST, every second
 *
 * Stacked layouts (and short landscape phones) would collide the bottom corners with the landing
 * panel and the bottom sheet, so those are hidden and the sun joins the top-right block.
 * When the scene is not showing live time (replay / scrub), the TR block adds the scene time, in the
 * place's own zone like every other time on the pass (the live clock stays UTC).
 *
 * Over a scene (results, a pass) functional ink scrims sit behind the readouts so they stay legible
 * over bright cloud (decision 5); the landing keeps the pure view. The HUD publishes the height it
 * covers at the top (store.uiInsets.top) so the camera frames below it.
 *
 * Only the leaves that show time re-render, and only when their text changes (UtcClock and GmstLine
 * every second, SunValue every ~24 s, CatalogAge every minute); the shell renders when the phase, the
 * catalog or the clock mode changes (and the language: copy is the 'hud' namespace, src/i18n/en/hud.ts).
 */
import { memo, useLayoutEffect, useRef, type RefObject } from 'react'
import enHud from '@/i18n/en/hud'
import { Rich } from '@/i18n/Rich'
import { currentLocale, useLocale, useMsgs } from '@/i18n/runtime'
import { timeZoneAt, tzReady } from '@/imagery'
import { subsolarPoint } from '@/lib/geo'
import { sceneClock, useSceneFrame } from '@/state/sceneClock'
import { useApp } from '@/state/store'
import { Bezel, CornerReadout, Kbd, Reveal, ScrambleOnce, cx, fmtUtcDate, fmtUtcTime, useWallSecondSync, Wordmark } from '@/ui/system'
// The pure time module, never the lazy '@/ui/results' index (that would pull the results chunk in).
import { fmtLocalDay, fmtLocalTime, zoneAbbr } from '@/ui/results/lib/time'
import { useCatalogStatus } from './catalogStatus'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useSecondClock, useSecondDerived } from './clock'
import { fmtCatalogAge, fmtGmst, fmtObjects, fmtSource, fmtStampZ, fmtSun, isStale } from './readouts'
import s from './Hud.module.css'

export const VERSION = 'v0.1'

/** The brand: the top-left group's name, never translated (docs/I18N.md). */
const BRAND = 'Watched'

/** Space kept between the top readouts and what the camera frames below them. */
const TOP_GAP = 8

/**
 * Least clear space between "How this works · language" and the sun line beside it on a phone. Less, and the sun line
 * steps aside (useCrowdedSun): at 320 px they overlapped in English, at 360 px German and Polish left 6 px, Turkish 13.
 */
const MIN_ROW_GAP = 14

/**
 * After boot, the lines start wiping in this long after the loading screen starts to leave (src/app/bootCurtain.ts:
 * its wordmark glides 760 ms onto this one). The version and About lines wait for the logo to land (it passes
 * over their spot on its way in: they start at 780 / 820 ms, after the 760 ms glide, now that the wipes run on CSS
 * time from the curtain's first frame and are never late); the other corners start sooner.
 */
const AFTER_BOOT = 300

/**
 * The scene clock, when the globe isn't on live time (replay / scrub), at the place: the same clock and
 * date style as the pass header ("Scene Sun 1 Nov 11:21:13 EST"; phones drop the day so it clears the
 * top-left readout: "Scene 11:21:13 EST"). The zone always shows. UTC until the place's zone is known.
 *
 * Written straight into the DOM from the globe's per-frame clock (sceneClock), the one the replay
 * controls read, so its seconds turn on the same frame as theirs; text changes only when a second
 * does, and React never re-renders it for time (no 10 Hz store renders).
 */
function SceneTime() {
  // Re-renders on a language switch: the layout effect below rewrites the day in the new language.
  const m = useMsgs(enHud)
  const dayRef = useRef<HTMLSpanElement>(null)
  const timeRef = useRef<HTMLSpanElement>(null)
  const last = useRef({ sec: NaN, key: '', tz: 'UTC', day: '', time: '' })
  const write = () => {
    const st = useApp.getState()
    const ms = sceneClock.mode === st.timeMode ? sceneClock.simTime : st.simTime
    const L = last.current
    const place = st.place
    const ready = tzReady()
    // The language is part of the key: the day's words change with it.
    const key = `${place ? `${place.lat},${place.lon},${ready ? 1 : 0}` : ''}|${currentLocale()}`
    const sec = Math.floor(ms / 1000)
    if (sec === L.sec && key === L.key) return
    if (key !== L.key) {
      L.key = key
      L.tz = place && ready ? timeZoneAt(place.lat, place.lon) : 'UTC'
    }
    L.sec = sec
    const t = sec * 1000
    const day = `${fmtLocalDay(t, L.tz)} `
    const time = `${fmtLocalTime(t, L.tz, true)} ${zoneAbbr(t, L.tz)}`
    if (day !== L.day && dayRef.current) dayRef.current.textContent = L.day = day
    if (time !== L.time && timeRef.current) timeRef.current.textContent = L.time = time
  }
  // First text before the first paint; then once per frame (a no-op unless the second turned).
  useLayoutEffect(write)
  useSceneFrame(write)
  return (
    <span className={cx(s.line, s.dim)}>
      {m.scene}
      <span className={s.sceneValue}>
        <span ref={dayRef} className={s.desk} />
        <span ref={timeRef} />
      </span>
    </span>
  )
}

/** "2026-11-08 03:31:07 UTC" (the date is dropped on phones). */
function UtcClock() {
  const now = useSecondClock()
  return (
    <time dateTime={new Date(now).toISOString()} className={s.clock}>
      <span className={cx(s.dim, s.desk)}>{fmtUtcDate(now)} </span>
      {fmtUtcTime(now)} UTC
    </time>
  )
}

const sunText = (now: number) => fmtSun(subsolarPoint(now))

/** "SUN 16.6°S 007.1°E" (re-renders when the text changes, ~every 24 s); scrambles once when `scramble` is set. */
function SunValue({ scramble }: { scramble?: boolean }) {
  useLocale() // the word before the coordinates follows the language
  const sun = useSecondDerived(sunText)
  return scramble ? <ScrambleOnce text={sun} delay={120} className={s.value} /> : <>{sun}</>
}

function GmstLine() {
  const m = useMsgs(enHud)
  const now = useSecondClock()
  return <>{m.gmst(fmtGmst(now))}</>
}

/** "Fetched 2026-11-08 03:34Z · 4 h ago" (warn-coloured once the catalog is stale; re-renders when the age text changes). */
function CatalogAge({ fetchedAt }: { fetchedAt: string }) {
  const m = useMsgs(enHud) // also re-renders on a language switch, which re-reads the age below in the new language
  const stale = useSecondDerived((now) => isStale(fetchedAt, now))
  const age = useSecondDerived((now) => fmtCatalogAge(Date.parse(fetchedAt), now, isStale(fetchedAt, now)))
  return (
    <span className={stale ? s.warn : undefined}>
      {m.fetched(fmtStampZ(fetchedAt))}
      <span className={s.sep}>·</span>
      {age}
    </span>
  )
}

/**
 * Memoised on whether there is an About action, not on its identity: the app re-renders (and passes a
 * fresh callback) for reasons that change nothing here. The latest callback is always the one called.
 */
export const Hud = memo(HudImpl, (a, b) => !!a.onAbout === !!b.onAbout && !!a.onHome === !!b.onHome)

function HudImpl({ onAbout, onHome }: { onAbout?: () => void; onHome?: () => void }) {
  const m = useMsgs(enHud)
  const aboutRef = useRef(onAbout)
  aboutRef.current = onAbout
  const homeRef = useRef(onHome)
  homeRef.current = onHome
  const live = useApp((st) => st.timeMode === 'live')
  const scene = useApp((st) => (st.selectedPassId ? 'pass' : st.phase === 'computing' || st.phase === 'results' ? 'results' : undefined))
  const catalog = useCatalogStatus()
  // Every blink in the chrome (the live dot, the pending cursor) is on for the first half of each UTC
  // second, the same frame the clock digits change.
  const rootRef = useRef<HTMLDivElement>(null)
  useWallSecondSync(rootRef)
  const topLeft = useRef<HTMLDivElement>(null)
  const topRight = useRef<HTMLDivElement>(null)
  useTopInset(topLeft, topRight)
  useCrowdedSun(topLeft, topRight)
  // The stacked sun line gives way to the scene time during a replay and comes back after it: its
  // wipe plays with the HUD's first entrance only, never again on its return (one entrance per element).
  // Set during the render that unmounts it, so its `skip` never changes while it is mounted.
  const sunReturns = useRef(false)
  if (!live) sunReturns.current = true
  // Under the loading screen the lines sit settled and unseen; when boot ends they remount (new key) and wipe in
  // while the loading screen's wordmark glides onto this one (bootCurtain), which is hidden until it lands.
  const booting = useApp((st) => st.phase === 'boot')
  const k = booting ? 'boot' : 'live'
  const at = (ms: number) => (booting ? 0 : AFTER_BOOT + ms)

  return (
    <div ref={rootRef} className={s.hud} data-scene={scene}>
      <Bezel />

      <CornerReadout corner="tl" label={BRAND} ref={topLeft}>
        <div className={s.line}>
          <span className={s.mark} data-hud-wordmark>
            {onHome ? (
              // Back to the landing (a real link: a new tab or a copied address opens the home page).
              <a
                href="/"
                className={s.home}
                aria-label={m.home}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
                  e.preventDefault()
                  homeRef.current?.()
                }}
              >
                <Wordmark height={17} className={s.wordmark} />
              </a>
            ) : (
              <Wordmark height={17} className={s.wordmark} />
            )}
          </span>
        </div>
        <Reveal key={`${k}-about`} skip={booting} axis="x" duration={480} delay={at(520)} as="div" className={cx(s.line, s.aboutLine)}>
          {onAbout ? (
            <button type="button" className={s.about} onClick={() => aboutRef.current?.()} aria-keyshortcuts="?">
              <span className={s.aboutText}>{m.about}</span>
              <Kbd className={s.desk}>?</Kbd>
            </button>
          ) : null}
          <LanguageSwitcher />
        </Reveal>
      </CornerReadout>

      <CornerReadout corner="tr" label={m.regionTime} ref={topRight}>
        <Reveal key={`${k}-clock`} skip={booting} axis="x" duration={480} delay={at(0)} as="div" className={s.line}>
          <UtcClock />
        </Reveal>
        {live ? null : <SceneTime />}
        {/* stacked: the sun joins the clock (bottom corners are hidden); a replay's scene time takes its place */}
        {live ? (
          <Reveal key={`${k}-sun`} skip={booting || sunReturns.current} axis="x" duration={480} delay={at(60)} as="div" className={cx(s.line, s.mob, s.sunLine)}>
            <SunValue />
          </Reveal>
        ) : null}
      </CornerReadout>

      <CornerReadout corner="bl" label={m.regionCatalog} className={s.wideOnly}>
        <Reveal key={`${k}-objects`} skip={booting} axis="x" duration={480} delay={at(120)} as="div" className={s.line}>
          {catalog.state === 'ready' ? (
            <>
              <ScrambleOnce text={fmtObjects(catalog.count)} className={s.value} />
              <span className={s.sep}>·</span>
              {fmtSource(catalog.source)}
            </>
          ) : (
            // One span, so the space beside the placeholder stays (a bare text node at the inline-flex line's edge
            // dropped it: "—OBJECTS"); each language puts the placeholder where its count goes ("物体数 —").
            <span>
              <Rich parts={m.objectsPending('—')} classes={{ num: s.value }} />
            </span>
          )}
        </Reveal>
        <Reveal key={`${k}-age`} skip={booting} axis="x" duration={480} delay={at(180)} as="div" className={cx(s.line, s.dim)}>
          {catalog.state === 'ready' ? (
            <CatalogAge fetchedAt={catalog.fetchedAt} />
          ) : catalog.state === 'error' ? (
            <span className={s.warn}>{m.catalogUnavailable}</span>
          ) : (
            <span className={s.pending} data-blink>
              {m.catalogLoading}
            </span>
          )}
        </Reveal>
      </CornerReadout>

      <CornerReadout corner="br" label={m.regionSun} className={s.wideOnly}>
        <Reveal key={`${k}-subsolar`} skip={booting} axis="x" duration={480} delay={at(200)} as="div" className={s.line}>
          <SunValue scramble={!booting} />
        </Reveal>
        <Reveal key={`${k}-gmst`} skip={booting} axis="x" duration={480} delay={at(260)} as="div" className={cx(s.line, s.dim)}>
          {m.subsolar}
          <span className={s.sep}>·</span>
          <GmstLine />
        </Reveal>
      </CornerReadout>
    </div>
  )
}

/**
 * On a phone the sun joins the top right, on the same line as "How this works" and the language on the left. Where the
 * two would come closer than MIN_ROW_GAP (narrow phones, longer languages) the sun line is hidden, never the About
 * link or the language switcher (the sun's readout is the extra one; wide screens show it in its own corner). It is
 * hidden, not removed: it keeps its box, so it is still measured as the screen or the words change, and nothing in
 * the corner moves (the top left's two lines set the top inset either way). Written to the DOM, not React state: the
 * line remounts after a replay and on boot, which the observers below see.
 */
function useCrowdedSun(topLeft: RefObject<HTMLDivElement | null>, topRight: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const tl = topLeft.current
    const tr = topRight.current
    if (!tl || !tr || typeof ResizeObserver === 'undefined') return
    const watched = new WeakSet<Element>()
    const watch = (el: Element) => {
      if (watched.has(el)) return
      watched.add(el)
      ro.observe(el)
    }
    const check = () => {
      const about = tl.querySelector<HTMLElement>(`.${s.aboutLine}`)
      const sun = tr.querySelector<HTMLElement>(`.${s.sunLine}`)
      if (!about || !sun) return
      watch(about)
      watch(sun)
      const a = about.getBoundingClientRect()
      const b = sun.getBoundingClientRect()
      if (!a.width || !b.width) return // the sun line is not shown here (wide screens, a replay)
      // Right to left the corners swap: the language line is at the right, the sun at the left.
      const rtl = getComputedStyle(tr).direction === 'rtl'
      const gap = rtl ? a.left - b.right : b.left - a.right
      sun.toggleAttribute('data-crowded', gap < MIN_ROW_GAP)
    }
    const ro = new ResizeObserver(check)
    ro.observe(tl)
    ro.observe(tr)
    // A remounted line (the boot entrance, the sun's return after a replay) is a new element.
    const mo = new MutationObserver(check)
    mo.observe(tr, { childList: true })
    mo.observe(tl, { childList: true })
    window.addEventListener('resize', check)
    check()
    return () => {
      ro.disconnect()
      mo.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [topLeft, topRight])
}

/** Publish store.uiInsets.top = the lower of the two top readouts' bottoms + TOP_GAP. */
function useTopInset(topLeft: RefObject<HTMLDivElement | null>, topRight: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const tl = topLeft.current
    const tr = topRight.current
    const publish = () => {
      const b = Math.max(tl?.getBoundingClientRect().bottom ?? 0, tr?.getBoundingClientRect().bottom ?? 0)
      if (b > 0) useApp.getState().setUiInsets({ top: Math.ceil(b + TOP_GAP) })
    }
    if (typeof ResizeObserver === 'undefined') {
      publish()
      return
    }
    // Seeded here, in the layout effect (one layout read at mount): the observer's first delivery is then a no-op.
    // Published from that first delivery instead, the store write moved other observed UI inside the observer's own
    // loop on a loaded phone ("ResizeObserver loop completed with undelivered notifications" in WebKit, at frames 2–3
    // of a deep-link load). Later corner changes still publish from the observer.
    publish()
    const ro = new ResizeObserver(publish)
    if (tl) ro.observe(tl)
    if (tr) ro.observe(tr)
    window.addEventListener('resize', publish)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', publish)
    }
  }, [topLeft, topRight])
}
