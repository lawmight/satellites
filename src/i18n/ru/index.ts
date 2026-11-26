/**
 * The Russian bundle: every namespace of the ru copy in one module, so the language is ONE chunk that index.html's
 * boot script starts downloading beside the app (src/i18n/runtime.ts) and main.tsx awaits before the first render.
 * A Russian reader never sees English flash before «На этой неделе что-то смотрело на тебя», and no message waits on
 * a second request.
 *
 * Each key is the namespace's file name, which is the key its English file declares with ns() (src/i18n/en/*.ts), so
 * runtime.msgs() finds a namespace by the same word in every language; a missing key would fall back to English for
 * that namespace only. Every file is typed against its English (`typeof en`), so a missing message or a changed
 * parameter is a compile error here, not a blank on screen. `exonyms` names places in Russian (Москва, Киев): its table
 * is a chunk of its own, which `ready` loads before a switch to Russian shows a place (./exonyms.ts).
 *
 * The card is the one namespace that lives outside this folder: the share card and share page print the same words as
 * the share sheet's preview and PNG, and the server cannot import the app's catalogs, so the app takes the very module
 * the server reads (api/_lib/i18n/card/ru.ts). The style guide behind every word is docs/i18n/ru.md.
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
import card from '../../../api/_lib/i18n/card/ru'

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
