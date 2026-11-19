/**
 * The German bundle: every namespace of `de` in one chunk, which index.html's boot script starts downloading beside
 * the app and main.tsx awaits before the first render (src/i18n/runtime.ts), so no English flashes before the German.
 *
 * Why one object keyed by namespace: the runtime answers `msgs(enX)` by looking up the key the English namespace was
 * declared with (`ns('passView', …)`), so each key here is that name, which is also the file's. The share card's copy
 * is not a file of this folder: it lives with the server (api/_lib/i18n/card/de.ts), because the Open Graph card and
 * the share page print the same words as the share sheet's preview, and this bundle lists that very module as `card`,
 * so the card is translated once. The two small tables German needs on both sides, the MEZ/MESZ zone names
 * (card/deZone.ts) and the curated places' articles with the crewed stations' classifier (card/deNames.ts), live
 * beside it for the same reason, and the namespaces here import them from there, so the app and the card can never
 * write a zone or a place two ways. Every namespace is typed against its English file, so a missing or changed message
 * fails the typecheck here rather than falling back to English at runtime. docs/i18n/de.md is the authority on the
 * words.
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
import card from '../../../api/_lib/i18n/card/de'

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
  card,
} satisfies Bundle
