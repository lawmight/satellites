/**
 * The Turkish bundle: every namespace of `tr` in one module, so the language is ONE chunk that index.html's boot script
 * starts downloading beside the app (src/i18n/runtime.ts) and main.tsx awaits before the first render. A Turkish reader
 * never sees English flash before *Bu hafta bir şey seni izledi.*, and no message waits on a second request.
 *
 * Why one object keyed by namespace: the runtime answers `msgs(enX)` by looking up the key the English namespace was
 * declared with (`ns('passView', …)`), so each key here is that name, which is also the file's; a missing key would fall
 * back to English for that namespace only. Every file is typed against its English (`typeof en`), so a missing message
 * or a changed parameter fails the typecheck here rather than printing English, or nothing, on a Turkish screen.
 *
 * The card is the one namespace that lives outside this folder: the share card and the share page print the same words
 * as the share sheet's preview and PNG, and the server cannot import the app's catalogs, so the app takes the very
 * module the server reads (api/_lib/i18n/card/tr.ts) and the card is translated once. docs/i18n/tr.md is the authority
 * on every word.
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
import card from '../../../api/_lib/i18n/card/tr'

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
