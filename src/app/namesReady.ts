/**
 * What a report waits for before it shows its place's name (src/app/controller.ts runReport): the visitor's place
 * names, if the language's table is still on its way (src/imagery/exonyms.ts), and for a link's place, the country the
 * offline list gives its name at its point (imagery waitForLinkCountry). A name shown before either would be shown one
 * way and then another, which the owner rule forbids; its own module so a test can hold each back.
 *
 * Both at once, and each EXONYM_WAIT_MS at most: a request that stalls (a tile, the table) must not hold the report,
 * and the boot curtain over a link, for ever; past the wait the name is shown as far as it is known, and stays so.
 */
import { ensureExonyms, exonymsReady, needsLinkCountry, waitForLinkCountry } from '@/imagery'
import type { Place } from '@/types'

export async function placeNamesReady(place: Place): Promise<void> {
  const link = needsLinkCountry(place) ? waitForLinkCountry(place) : undefined
  const table = exonymsReady() ? undefined : ensureExonyms()
  // Nothing on its way (English, or the table in): the report goes on in this same task, as before any of this. A
  // wait of a few microtasks moved the search's back-button entry on a phone (src/lib/backStack.ts hands a layer over
  // within one microtask): the search's layer closed with history.go(-1) and the results pushed a new one.
  if (!link && !table) return
  await Promise.all([table, link])
}
