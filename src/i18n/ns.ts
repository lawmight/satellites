/**
 * Declaring an English namespace, apart from the runtime: `ns(key, english)` only remembers which key an English
 * object answers to. It has no DOM, store or Vite dependency, so an English namespace can be imported by code that
 * runs under Node (scripts/fetch-catalog.ts reads the satellite profiles, whose blurbs live in en/sats.ts), and the
 * runtime (./runtime.ts) looks the key up when a translation is installed.
 */

const KEYS = new WeakMap<object, string>()

/** Declare an English namespace: the object is the English copy and the type every translation must match. */
export function ns<T extends object>(key: string, english: T): T {
  KEYS.set(english, key)
  return english
}

/** The namespace key an English object was declared with (undefined for anything else). */
export const nsKey = (english: object): string | undefined => KEYS.get(english)
