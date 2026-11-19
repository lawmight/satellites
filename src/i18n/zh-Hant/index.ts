/**
 * The Traditional Chinese bundle: every zh-Hant namespace in one chunk (see docs/i18n/zh-Hant.md and docs/I18N.md).
 *
 * Why one bundle and these keys: English ships each namespace with the code that shows it, but a translation is one
 * chunk that index.html's boot script starts downloading in parallel with the app (src/i18n/boot.ts), so no zh-Hant
 * visitor waits on a second request and no English flashes before the first render. The runtime finds a namespace by
 * the key its English file declared with ns() (msgs, src/i18n/runtime.ts), which is that file's name, so each key here
 * is the namespace's file name; a missing one falls back to English for that namespace only. The card namespace is the
 * server's own catalog (api/_lib/i18n/card/zh-Hant.ts), not a copy, so the share sheet's preview, the PNG, the post and
 * the Open Graph card print the same words.
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
import card from '../../../api/_lib/i18n/card/zh-Hant'

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
