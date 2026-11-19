/**
 * The language switcher: a quiet mono line in the top-left readout (after "How this works") that opens a hairline
 * menu of the languages, each written in its own script, the current one marked with the signal diamond ("you are
 * here", DESIGN §2). Most visitors never need it (index.html chooses from the browser); it is for the reader whose
 * browser speaks a language they don't want here, so it is always visible but never loud.
 *
 * The menu is a portal on <body> above the panels (the bottom sheet can cover the HUD's corner), placed from the
 * trigger's box when it opens. It is a back-stack layer (a phone's Back closes it), closes on Esc (capture phase,
 * so the app's own Esc handler never sees it), on a pick and on a press outside. Arrow keys move through the
 * languages; Enter or Space picks. Picking switches the page in place (src/i18n/runtime.ts setLocale).
 */
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { LOCALE_INFO, type Locale } from '../../../api/_lib/i18n/locales'
import enSwitcher from '@/i18n/en/switcher'
import { setLocale, useLocale, useMsgs } from '@/i18n/runtime'
import { useBackLayer } from '@/lib/backStack'
import s from './LanguageSwitcher.module.css'

/** English first, then the Latin-script languages by their own names, then the others by script. */
/** Least distance from the menu to the viewport's edges. */
const EDGE = 12

const ORDER: readonly Locale[] = ['en', 'id', 'de', 'es', 'fr', 'it', 'nl', 'pl', 'pt-BR', 'tr', 'uk', 'ar', 'ja', 'ko', 'zh-Hans', 'zh-Hant']

/**
 * The name the trigger shows, on every screen: the language's own name, as the list writes it ("English", "Deutsch",
 * "日本語"), never a code (owner, 2026-11-19: "EN" said less than "English"). Indonesian's is shortened (the list
 * keeps "Bahasa Indonesia"). On a narrow phone the sun line beside it steps aside (Hud.tsx useCrowdedSun).
 */
const SHORT: Partial<Record<Locale, string>> = { id: 'Indonesia' }

export function LanguageSwitcher({ className }: { className?: string }) {
  const m = useMsgs(enSwitcher)
  const locale = useLocale()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<Locale | null>(null)
  const [at, setAt] = useState<{ left: number; top: number; maxHeight: number } | null>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const listed = ORDER.filter((l) => LOCALE_INFO[l].listed || l === locale)
  const close = (focus = true) => {
    setOpen(false)
    if (focus) trigger.current?.focus({ preventScroll: true })
  }
  useBackLayer('language', open, () => close(false))

  // Place the menu under the trigger, kept inside the viewport (measured hidden first, then shown in place).
  useLayoutEffect(() => {
    if (!open) return setAt(null)
    if (!trigger.current || !menu.current) return
    const r = trigger.current.getBoundingClientRect()
    const w = menu.current.offsetWidth
    const top = Math.round(r.bottom + 10)
    // Its edge on the trigger's reading side: the left one, or the right one in a right-to-left page (the trigger
    // is then in the top-right corner).
    const rtl = getComputedStyle(trigger.current).direction === 'rtl'
    const want = rtl ? r.right + 16 - w : r.left - 16
    const left = Math.round(Math.max(EDGE, Math.min(want, window.innerWidth - w - EDGE)))
    setAt({ left, top, maxHeight: Math.max(160, window.innerHeight - top - EDGE) })
  }, [open])

  // Focus the current language once the menu is placed and shown: it is measured under visibility: hidden first, and
  // nothing under it takes focus (keyboard users were left on the trigger, the arrows doing nothing).
  useEffect(() => {
    if (open && at) menu.current?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus({ preventScroll: true })
  }, [open, at])
  // Close on Esc (capture) and on a press outside.
  useEffect(() => {
    if (!open) return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.preventDefault()
      e.stopPropagation()
      close()
    }
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (menu.current?.contains(t) || trigger.current?.contains(t)) return
      close(false)
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onDown, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onDown, true)
    }
  }, [open])

  const pick = async (l: Locale) => {
    if (l === locale) return close()
    setBusy(l)
    try {
      await setLocale(l)
    } finally {
      setBusy(null)
      close()
    }
  }

  const onMenuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const items = [...(menu.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    const go = (j: number) => items[(j + items.length) % items.length]?.focus({ preventScroll: true })
    // Two columns: Left/Right move across, Up/Down within the reading order. Right to left, the first column is
    // the right one, so the keys that go to the second swap.
    const half = Math.ceil(items.length / 2)
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl'
    const toSecond = rtl ? 'ArrowLeft' : 'ArrowRight'
    const toFirst = rtl ? 'ArrowRight' : 'ArrowLeft'
    if (e.key === 'ArrowDown') go(i + 1)
    else if (e.key === 'ArrowUp') go(i - 1)
    else if (e.key === toSecond) go(i < half ? Math.min(i + half, items.length - 1) : i)
    else if (e.key === toFirst) go(i >= half ? i - half : i)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(items.length - 1)
    // Tab leaves the menu where it opened: on the trigger (the focused item unmounts with the menu, which dropped
    // focus to the page), so the next Tab goes on from there.
    else if (e.key === 'Tab') close()
    else return
    e.preventDefault()
  }

  const info = LOCALE_INFO[locale]
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className={`${s.trigger}${className ? ` ${className}` : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={m.trigger(info.native)}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={s.rule} aria-hidden="true" />
        <span lang={locale} className={s.full}>
          {SHORT[locale] ?? info.native}
        </span>
      </button>
      {open
        ? createPortal(
            <div
              ref={menu}
              className={s.menu}
              role="menu"
              aria-label={m.title}
              style={at ? { left: at.left, top: at.top, maxHeight: at.maxHeight } : { left: 0, top: 0, visibility: 'hidden' }}
              onKeyDown={onMenuKey}
            >
              <div className={s.title} aria-hidden="true">
                {m.title}
              </div>
              <div className={s.grid}>
                {listed.map((l) => {
                  const li = LOCALE_INFO[l]
                  return (
                    <button
                      key={l}
                      type="button"
                      role="menuitemradio"
                      aria-checked={l === locale}
                      tabIndex={l === locale ? 0 : -1}
                      className={s.item}
                      lang={l}
                      data-busy={busy === l ? '' : undefined}
                      onClick={() => void pick(l)}
                    >
                      <span className={s.mark} aria-hidden="true" />
                      <span className={s.name} dir={li.dir}>
                        {li.native}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
