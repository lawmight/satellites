/**
 * The French bundle: every namespace of the fr copy in one module, so the language is ONE chunk that index.html's boot
 * script starts downloading beside the app (src/i18n/runtime.ts) and main.tsx awaits before the first render. A French
 * reader never sees English flash, and no message waits on a second request.
 *
 * Why one object keyed by namespace: the runtime answers `msgs(enX)` by the key the English namespace was declared with
 * (`ns('passView', …)` in src/i18n/en/*.ts), which is also the file's name, so each key here is that name. Every file
 * is typed against its English (`typeof en`), so a missing message or a changed parameter fails the typecheck here,
 * rather than falling back to English on screen.
 *
 * The card is the one namespace that lives outside this folder: the share card and the share page print the same words
 * as the share sheet's preview and PNG, and the server cannot import the app's catalogs, so the bundle lists the very
 * module the server reads (api/_lib/i18n/card/fr.ts) and the card is translated once. French needs no accent face of
 * its own (every letter it uses is in the latin subset the app already loads, docs/i18n/fr.md §6.8), so the bundle
 * exports nothing else. The style guide behind every word is docs/i18n/fr.md.
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
import card from '../../../api/_lib/i18n/card/fr'

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
