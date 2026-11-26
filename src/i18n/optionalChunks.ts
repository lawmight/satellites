/**
 * Chunks the page works without: a language's place-name table (src/i18n/<locale>/exonyms.gen.ts) and the search
 * through it (src/imagery/exonymSearch.ts). Without them the names show as they came, so a failure to load one must
 * never reload the page (src/lib/staleBuild.ts reloads once for any other missing chunk, which would lose what the
 * visitor typed, or the language they were switching to).
 *
 * Chrome's error names the chunk's URL, which staleBuild.ts knows by its name; Safari's names no module ("Importing a
 * module script failed."), so it lets such a failure through only while a quiet download runs: one whose chunk name is
 * in a set shared by Symbol.for (the share card's measure, src/ui/share/measure.ts, puts its own there). Every quiet
 * download goes through quietImport, so the name is in the set whoever asked: a search, a pin, a report
 * (imagery/exonyms.ts ensureExonyms) or a switch to the language (its `ready`, which calls the table's `load`, made by
 * tableChunk). Counted per chunk, so a download that ends never takes a name another one still needs out of the set.
 *
 * In the i18n core (vite.config.ts I18N_CORE): the language chunks and the imagery code both import it, and either
 * importing the other would pull one into the other's chunk.
 */
import type { ExonymsNamespace } from './en/exonyms'

/** The built chunks' names start so (src/lib/staleBuild.ts OPTIONAL matches the same). */
export const TABLE_CHUNK = 'exonyms.gen-'
export const SEARCH_CHUNK = 'exonymSearch-'

const QUIET = Symbol.for('watched.quietChunks')
const running = new Map<string, number>()

/** `load()` (an import of a chunk whose name starts with `chunk`), its failure kept from reloading while it runs. */
export function quietImport<T>(chunk: string, load: () => Promise<T>): Promise<T> {
  const set = ((globalThis as { [QUIET]?: Set<string> })[QUIET] ??= new Set())
  running.set(chunk, (running.get(chunk) ?? 0) + 1)
  set.add(chunk)
  const done = () => {
    const left = (running.get(chunk) ?? 1) - 1
    if (left > 0) running.set(chunk, left)
    else {
      running.delete(chunk)
      set.delete(chunk)
    }
  }
  const download = load()
  download.then(done, done)
  return download
}

/**
 * `ns` (a language's 'exonyms' namespace) with the `load` of a table that is a chunk of its own: it fetches the chunk
 * once, quietly, and fills `names` in; after a failure (offline, a stale build) the next call tries again.
 */
export function tableChunk<T extends ExonymsNamespace>(ns: T, chunk: () => Promise<{ default: string }>): T & Loaded {
  let loading: Promise<void> | undefined
  const load = () =>
    (loading ??= quietImport(TABLE_CHUNK, chunk).then(
      (m) => void (ns.names = m.default),
      (err: unknown) => {
        loading = undefined
        throw err
      },
    ))
  return Object.assign(ns, { load })
}

type Loaded = Required<Pick<ExonymsNamespace, 'load'>>
