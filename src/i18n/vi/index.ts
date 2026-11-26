/**
 * The Vietnamese bundle: every namespace of `vi` in one chunk, which index.html's boot script starts downloading beside
 * the app and main.tsx awaits before the first render (src/i18n/runtime.ts), so a Vietnamese reader never sees English
 * flash before *Tuần này, có thứ gì đó quan sát bạn*, and no message waits on a second request.
 *
 * Why one object keyed by namespace: the runtime answers `msgs(enX)` by looking up the key the English namespace was
 * declared with (`ns('passView', …)`), so each key here is that name, which is also the file's; a missing key would
 * fall back to English for that namespace only. The share card's copy is not a file of this folder: it lives with the
 * server (api/_lib/i18n/card/vi.ts), because the Open Graph card and the share page print the same words as the share
 * sheet's preview, and this bundle lists that very module as `card`, so the card is translated once. Every namespace is
 * typed against its English file, so a missing or changed message fails the typecheck here. `exonyms` names places in
 * Vietnamese (Hà Nội, Luân Đôn, Biển Đông: docs/i18n/vi.md §8), a chunk of its own (./exonyms.ts, `ready`).
 * docs/i18n/vi.md is the authority on the words.
 */
import type { Bundle } from '../runtime'
import switcher from './switcher'
import landing from './landing'
import hud from './hud'
import system from './system'
import time from './time'
import app from './app'
import globe from './globe'
import geo from './geo'
import gallery from './gallery'
import lightbox from './lightbox'
import passView from './passView'
import share from './share'
import timelapse from './timelapse'
import about from './about'
import sats from './sats'
import places from './places'
import results from './results'
import verdicts from './verdicts'
import pass from './pass'
import engine from './engine'
import exonyms from './exonyms'
import card from '../../../api/_lib/i18n/card/vi'

export default {
  switcher,
  landing,
  hud,
  system,
  time,
  app,
  globe,
  geo,
  gallery,
  lightbox,
  passView,
  share,
  timelapse,
  about,
  sats,
  places,
  results,
  verdicts,
  pass,
  engine,
  exonyms,
  card,
} satisfies Bundle
/** Before a switch to this language shows it: its place names (./exonyms.ts, a chunk of its own). */
export const ready = (): Promise<void> => exonyms.load?.() ?? Promise.resolve()
