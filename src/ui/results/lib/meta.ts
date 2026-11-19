/**
 * What the UI needs to know about a satellite. Resolved from the engine's catalog + profiles at
 * runtime (see ../sats.ts); kept as a plain interface here so the pure helpers stay testable.
 *
 * Also the way to the ONE verdict vocabulary (DESIGN §7): every word the product uses for a verdict
 * (summary readouts, lane labels, list groups, tooltips, About, share renderers) comes from the
 * 'verdicts' namespace (src/i18n/en/verdicts.ts). Never spell a verdict name anywhere else.
 *
 * Read it in the active language, at call time: React components `useMsgs(enVerdicts)[v]` (which re-renders them on
 * a language switch), other code `verdictWords(v)`. VERDICT_META, VERDICT_TITLE and VERDICT_TAG keep their old shape
 * for existing callers: each entry is a getter over the active language's namespace, so it is read when it is used,
 * never frozen at load (a component reading them must still subscribe to the language, through any useMsgs).
 */
import type { Pass, SatCategory, SatProfile } from '@/types'
import type { GlyphName } from '@/ui/system/Glyph'
import enVerdicts, { type VerdictWords } from '@/i18n/en/verdicts'
import { msgs } from '@/i18n/runtime'

export type { VerdictWords }

export interface SatMeta {
  norad: number
  name: string
  operator?: string
  category: SatCategory
  profile?: SatProfile
}

export type MetaFn = (norad: number) => SatMeta

export type Verdict = Pass['verdict']
export const VERDICTS: readonly Verdict[] = ['imaged', 'likely', 'could', 'overhead']

/** A verdict's words in the active language (read at call time). */
export const verdictWords = (v: Verdict): VerdictWords => msgs(enVerdicts)[v]

/** A record by verdict whose entries are read from the active language each time they are used. */
function live<T>(pick: (w: VerdictWords) => T): Readonly<Record<Verdict, T>> {
  const out = {} as Record<Verdict, T>
  for (const v of VERDICTS) Object.defineProperty(out, v, { enumerable: true, get: () => pick(verdictWords(v)) })
  return out
}

/** Every verdict's words, in the active language (getters: see the header). */
export const VERDICT_META: Readonly<Record<Verdict, VerdictWords>> = live((w) => w)

/** Count unit in the form the count takes, in the active language: "1 pass", "31 passes". */
export function verdictUnit(v: Verdict, n: number): string {
  return verdictWords(v).unit(n)
}

/** Group titles in the pass list (derived; kept as a record for existing call sites). */
export const VERDICT_TITLE: Readonly<Record<Verdict, string>> = live((w) => w.title)

/** Short words for tags and lane labels (derived). */
export const VERDICT_TAG: Readonly<Record<Verdict, string>> = live((w) => w.short)

/** Mark names: the system glyphs plus 'mosaic' (drawn locally by ../Mark.tsx until the shell adds it). */
export type MarkName = GlyphName | 'mosaic' | 'chevron-left' | 'chevron-right' | 'expand'

/** Mark for a whole verdict group (summary readouts, lane labels). */
export const VERDICT_GLYPH: Record<Verdict, GlyphName> = {
  imaged: 'imaged',
  likely: 'likely',
  could: 'commercial',
  overhead: 'crewed',
}

/**
 * Mark for one pass: form by category (DESIGN §2). The filled signal diamond is reserved for a
 * DETAILED capture (Sentinel-2 / Landsat, ≤ 30 m): an imaged weather satellite only has a daily
 * mosaic, which gets the bone 'mosaic' mark (decision: signal only where an image of YOU exists).
 */
export function glyphForPass(verdict: Verdict, category: SatCategory): MarkName {
  if (verdict === 'imaged') return category === 'weather-leo' ? 'mosaic' : 'imaged'
  switch (category) {
    case 'open-optical':
      return 'likely'
    case 'commercial-optical':
      return 'commercial'
    case 'radar':
      return 'radar'
    case 'weather-leo':
      return 'weather-leo'
    case 'weather-geo':
      return 'weather-geo'
    case 'crewed':
      return 'crewed'
    default:
      return 'other'
  }
}

/** CSS colour token for a pass mark: signal = a detailed image exists; ice = radar (DESIGN §2). */
export function markColorVar(verdict: Verdict, category: SatCategory): string {
  if (verdict === 'imaged') return category === 'weather-leo' ? 'var(--bone)' : 'var(--signal)'
  if (category === 'radar') return 'var(--ice)'
  return 'var(--bone)'
}
