/**
 * The maker's support page, and what this browser remembers about asking for it.
 *
 * One constant so every place links the same page. It is a plain link, opened in a new tab: no widget, no script and
 * no request from Buy Me a Coffee until someone presses it (the site loads nothing from third parties it does not
 * need, and a blocker list that hides the widget leaves a link alone).
 *
 * The memory is here, not with the results, because the landing reads it too (a first-screen chunk that must not
 * pull in the results): how many results this browser has seen, and whether the ask is done (the results' bar closed,
 * or its own link pressed; a press of the link anywhere else does not end it). localStorage `watched.colophon`; where
 * storage throws (a private window), this tab's memory only. The rules that read it are in src/ui/results/Colophon.tsx (the bar) and src/ui/landing/Landing.tsx.
 */
export const SUPPORT_URL = 'https://buymeacoffee.com/armaangupt0'

const STORE_KEY = 'watched.colophon'

export interface AskState {
  /** Overviews this browser has shown (places and windows) */
  results: number
  /** The results' bar closed, or its own link pressed: the bar and the landing's link stop asking */
  done: boolean
}

let memory: AskState = { results: 0, done: false }

export function readAsk(): AskState {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const v = JSON.parse(raw) as Partial<AskState>
      return { results: Number(v.results) || 0, done: !!v.done }
    }
  } catch {
    // no storage: this tab's memory
  }
  return { ...memory }
}

export function writeAsk(next: AskState) {
  memory = next
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next))
  } catch {
    // kept in memory only
  }
}

/** Tests: forget this tab's memory. */
export function resetAskForTests() {
  memory = { results: 0, done: false }
}
