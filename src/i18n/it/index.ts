/**
 * The Italian bundle: every namespace of `it` in one module, which is one chunk (see src/i18n/runtime.ts). index.html's
 * boot script starts downloading it beside the app when a visitor reads Italian, and main.tsx awaits it before the
 * first render, so no English flashes and no request waits on another.
 *
 * Why one bundle and these keys: English ships each namespace with the code that shows it, but a translation is fetched
 * once, whole, so an Italian visitor makes one request for all of it. The runtime finds a namespace by the key its
 * English object was declared with (`ns('passView', …)`), which is always the English file's name, so each key here is
 * the name of the file it comes from. The share card's words are not a file here: they live with the server
 * (api/_lib/i18n/card/it.ts), which prints the same card and page, and the bundle lists that very module as `card`, so
 * the card is translated once. One `it` serves it-IT (docs/i18n/it.md); a namespace missing here would fall back to
 * English, never to a blank.
 */
import type { Bundle } from '../runtime'
import about from './about'
import app from './app'
import engine from './engine'
import gallery from './gallery'
import geo from './geo'
import globe from './globe'
import hud from './hud'
import landing from './landing'
import lightbox from './lightbox'
import pass from './pass'
import passView from './passView'
import places from './places'
import results from './results'
import sats from './sats'
import share from './share'
import switcher from './switcher'
import system from './system'
import time from './time'
import timelapse from './timelapse'
import verdicts from './verdicts'
import card from '../../../api/_lib/i18n/card/it'

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
