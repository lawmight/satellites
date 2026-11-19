/**
 * The messages the controller leaves in the store (store.error, store.progress) as MessageRefs into the 'app' namespace
 * (src/i18n/en/app.ts), never as sentences.
 *
 * Why refs: a sentence written into the store is frozen in the language it was written in; a ref is rendered when it is
 * shown (ErrorNotice, the computing readout), so a notice that is up follows a language switch. And the usage stats log
 * the ENGLISH text of the same ref (appRefText(ref, enApp), the English object read directly), which is exactly the
 * sentence they logged when the store held English, whatever language the visitor reads.
 *
 * An id is '<namespace>.<group>.<key>': 'app.faults.catalog' names enApp.faults.catalog. Every message a ref names here
 * is a plain string (no slots), so a ref carries no params.
 *
 * store.progress mixes these refs ('app.progress.*', written while a search starts and when it ends) with the
 * engine's ('engine.progress.*'), so every renderer of store.progress (the computing readout) must resolve BOTH
 * namespaces: `refText(e.message, { engine: enEngine, app: enApp })` (src/i18n/messageRef.ts), read at render time.
 * Given the engine's alone, the readout's first row would lose the controller's line.
 */
import type { MessageRef } from '@/types'
import enApp from '@/i18n/en/app'

/** The catalog loader's own failure, after its three tries: the only fault that names the catalog (CLAUDE.md). */
export const CATALOG_FAULT: MessageRef = { id: 'app.faults.catalog' }
/** Anything else that failed while a report was computed. */
export const COMPUTE_FAULT: MessageRef = { id: 'app.faults.compute' }
/** The computing readout's first line, before the engine's own. */
export const PROGRESS_CATALOG: MessageRef = { id: 'app.progress.catalog' }
/** The report is complete. */
export const PROGRESS_DONE: MessageRef = { id: 'app.progress.done' }

type AppMessages = typeof enApp
const GROUPS = ['faults', 'progress'] as const
type Group = (typeof GROUPS)[number]

/**
 * The text of an 'app.faults.*' or 'app.progress.*' ref in `m`: the active language's messages (msgs(enApp)) to show
 * it, or enApp itself for the stats. Undefined for a ref this module does not know (another namespace's, a stale id).
 */
export function appRefText(ref: MessageRef | undefined, m: AppMessages): string | undefined {
  const hit = ref ? /^app\.(\w+)\.(\w+)$/.exec(ref.id) : null
  if (!hit || !(GROUPS as readonly string[]).includes(hit[1])) return undefined
  const group = m[hit[1] as Group] as Record<string, unknown>
  const text = Object.prototype.hasOwnProperty.call(group, hit[2]) ? group[hit[2]] : undefined
  return typeof text === 'string' ? text : undefined
}

/**
 * A ref as the usage stats keep it (store.error in the fault event): its ENGLISH text, from the English namespace
 * itself (never msgs()), so the logged sentence is the same in every language.
 */
export const englishOf = (ref: MessageRef): string | undefined => appRefText(ref, enApp)
