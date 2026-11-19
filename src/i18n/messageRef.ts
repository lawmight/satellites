/**
 * MessageRefs (src/types.ts): how code that is not a React component (the report engine, the controller) says something
 * to a person without freezing it in one language.
 *
 * The contract, for producers and for the UI that shows them:
 *  - `id` is '<namespace>.<path>': the namespace's key (its file name in src/i18n/en/), then the dotted path to one
 *    message inside it. 'engine.note.archiveSlow' names `note.archiveSlow` in src/i18n/en/engine.ts.
 *  - `params` are the raw values of the message's slots, by name: numbers as numbers, names as they came. A message
 *    with slots is a function of ONE object, those params; a message without is a string.
 *  - A ref is rendered when it is SHOWN, never when it is made: `renderRef(ref, namespaces)` reads the active
 *    language's messages at call time (msgs()), so call it while rendering, in a component that subscribes to the
 *    language (useMsgs(enEngine) or useLocale()), and a language switch re-renders it in the new language.
 *  - `namespaces` must hold EVERY namespace the refs being shown can point into, by key. Which ones, today:
 *      report.notes, an imagery search's `degraded`   → `{ engine: enEngine }`
 *      store.progress (the computing readout)          → `{ app: enApp, engine: enEngine }`: the controller writes
 *                                                        'app.progress.*' rows (src/app/messageRefs.ts) between the
 *                                                        engine's 'engine.progress.*' ones
 *      store.error (the fault notice)                  → `{ app: enApp }`
 *    This is the one renderer for every namespace's refs (the app's included), and it only knows the namespaces it is
 *    handed: a missing one silently leaves its rows blank (next point).
 *  - A plain string where a ref is expected (a report cached before notes were refs, an older build's) renders as it is.
 *  - An id no namespace in the map knows (another namespace's ref, a newer build's) renders as undefined: show nothing.
 *  - Code that must tell WHICH message a ref is (e.g. "the archives failed") compares `ref.id`, never the rendered
 *    words: 'engine.note.archiveSlow' / 'engine.note.archiveDown' (or the report's `archiveFailed` flag).
 *  - The usage stats log a ref's English (`{ english: true }`), so what they record never depends on who reads it.
 *
 * Producers build refs with `refMaker`, typed against the English namespace through a type-only import: the engine
 * never loads copy, the id and its params are checked at compile time, and a renamed message is a type error.
 */
import type { MessageRef } from '@/types'
import { plain, type Rich } from '../../api/_lib/i18n/parts'
import { msgs } from './runtime'

/** Anything a ref can name: fixed text, or a function of the ref's params. */
type Message = string | readonly unknown[] | ((params: never) => unknown)

/** The dotted paths to every message in a namespace (its groups nest). */
export type RefPath<N> = {
  [K in keyof N & string]: N[K] extends Message ? K : N[K] extends object ? `${K}.${RefPath<N[K]>}` : never
}[keyof N & string]

type At<N, P extends string> = P extends `${infer H}.${infer R}`
  ? H extends keyof N
    ? At<N[H], R>
    : never
  : P extends keyof N
    ? N[P]
    : never

/** The params object of the message at `P` (undefined for fixed text). */
export type RefParams<N, P extends string> = At<N, P> extends (params: infer A) => unknown ? A : undefined

/**
 * A typed ref builder for one namespace: `const ref = refMaker<typeof enEngine>('engine')`, then
 * `ref('note.gibsSlowSome', { missing, total })` is `{ id: 'engine.note.gibsSlowSome', params: { missing, total } }`.
 * `key` is the namespace's key (its ns('…') name and file name).
 */
export function refMaker<N extends object>(key: string) {
  return <P extends RefPath<N>>(path: P, ...params: RefParams<N, P> extends undefined ? [] : [RefParams<N, P>]): MessageRef =>
    params.length ? { id: `${key}.${path}`, params: params[0] as MessageRef['params'] } : { id: `${key}.${path}` }
}

/** English namespaces by key, the ones a ref may point into: `{ engine: enEngine }`. */
export type RefNamespaces = Readonly<Record<string, object>>

/** `o[k]` when `o` has it itself (never an inherited 'constructor' or 'toString'). */
const own = (o: unknown, k: string): unknown =>
  o && typeof o === 'object' && Object.prototype.hasOwnProperty.call(o, k) ? (o as Record<string, unknown>)[k] : undefined

function lookup(messages: object, path: readonly string[]): unknown {
  let at: unknown = messages
  for (const k of path) at = own(at, k)
  return at
}

/**
 * The words of `ref` in the active language (or in English with `english: true`, for the usage stats): plain text, or
 * rich parts where the message mixes styles. Undefined when none of `namespaces` has the id. See the header for when
 * to call it.
 */
export function renderRef(
  ref: string | MessageRef | undefined,
  namespaces: RefNamespaces,
  opts: { english?: boolean } = {},
): string | Rich | undefined {
  if (ref === undefined || typeof ref === 'string') return ref
  const dot = ref.id.indexOf('.')
  const english = dot > 0 ? own(namespaces, ref.id.slice(0, dot)) : undefined
  if (!english || typeof english !== 'object') return undefined
  const path = ref.id.slice(dot + 1).split('.')
  // A translation lacking a message (a stale bundle) falls back to the English one, never to nothing.
  const msg = (opts.english ? undefined : lookup(msgs(english), path)) ?? lookup(english, path)
  if (typeof msg === 'string') return msg
  if (Array.isArray(msg)) return msg as Rich
  if (typeof msg === 'function') return (msg as (p: object) => string | Rich)(ref.params ?? {})
  return undefined
}

/** `renderRef` as plain text (rich parts flattened): aria labels, footnotes that show no styles, logs. */
export function refText(
  ref: string | MessageRef | undefined,
  namespaces: RefNamespaces,
  opts: { english?: boolean } = {},
): string | undefined {
  const out = renderRef(ref, namespaces, opts)
  return out === undefined || typeof out === 'string' ? out : plain(out)
}
