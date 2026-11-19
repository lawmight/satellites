/**
 * The Simplified Chinese bundle: every zh-Hans namespace in one module, the chunk index.html's boot script preloads
 * for a zh-Hans visitor and runtime.ts awaits before the first render (see docs/i18n/zh-Hans.md, docs/I18N.md).
 *
 * Why one module and not a namespace per screen: English ships each namespace with the code that shows it, but every
 * other language is a single chunk (~10–20 kB compressed) fetched in parallel with the app, so no screen ever waits on
 * a second request and no English flashes first. Each key is the English namespace's name (its file name, the key
 * `ns()` declared it with), which is how `msgs()` finds the translation; a namespace missing here falls back to
 * English on its own. The card is the very module the server reads (api/_lib/i18n/card/zh-Hans.ts), never a copy, so
 * the share sheet's preview and PNG speak exactly what the Open Graph card and the share page speak.
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
import card from '../../../api/_lib/i18n/card/zh-Hans'

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
export { default as accentFont } from './accentFont.gen'
