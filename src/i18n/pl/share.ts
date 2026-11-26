/**
 * Polish copy for the share sheet, the post text it prefills and the PNG's file name (see docs/i18n/pl.md §3.5, §5.1,
 * §5.2, §5.5, §7). The card and the share page speak from api/_lib/i18n/card/pl.ts.
 *
 * Why it is built this way:
 *  - Buttons are the 2nd-person imperative, measured for the phone row (three in 360 px, about 12 characters each):
 *    «Kopiuj link» as the OS says «Kopiuj», «Wpis na X» (the width of «Post to X»), «Ponów» where «Spróbuj ponownie»
 *    would not fit. States in progress are the imperfective verbal noun («Przygotowywanie obrazu…», «Tworzenie linku…»).
 *  - The post opens on the place as the nominative subject of a verbless frame, the one position where Polish needs no
 *    case for a name it cannot inflect: «Waterloo pod okiem satelity Sentinel-2C…», «…w kadrze satelity…», «…w zasięgu
 *    satelity…», «Waterloo: przelot satelity…». The satellite follows its classifier «satelity», so no name is declined
 *    and no verb shows its gender. The post gets no satellite category, so a crewed station is «satelita» too (true: a
 *    station is an artificial satellite).
 *  - Height is always «z wysokości 786 km» / «na wysokości 420 km», never «786 km» alone (it would read as a distance
 *    flown). The day is Intl's genitive («1 listopada»), never a weekday after a preposition; «czasu lokalnego» stands
 *    for "local", after the clock.
 *  - File names stay lowercase ASCII («watched-…-tydzien-…»): they travel through every app and file system.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('pl')

/** «786 km», «35 786 km»: the satellite's altitude, whole kilometres (Polish groups from five digits) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0km`
/** «10 m», «2 km»: a pixel's size, whole metres or whole kilometres from 1000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0km` : `${f.int(m)}\u00a0m`)
/** Display names of the crewed stations (src/engine/profiles.ts): «stacji ISS», never «satelity ISS» (§5.2) */
const CREWED = /^(ISS|Tiangong)\b/
/** «1 listopada o 11:21 czasu lokalnego» (no weekday: after a preposition it would need a case Intl does not give) */
const when = (w: PostWhen) => `${formatDate('pl', w.ms, w.timeZone, { day: 'numeric', month: 'long' })} o\u00a0${w.clock} czasu lokalnego`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Udostępnij ten przelot',
  titleImage: 'Udostępnij ten obraz',
  titleWeek: 'Udostępnij ten tydzień',
  close: 'Zamknij',
  closeTitle: 'Zamknij (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Udostępnij obraz',
  preparingImage: 'Przygotowywanie obrazu…',
  share: 'Udostępnij',
  copyLink: 'Kopiuj link',
  copyLinkDesktop: 'Kopiuj link',
  copied: 'Skopiowano',
  // «Wpis na X» (72 px, as «Post to X»); «Opublikuj na X» (112 px) overflows a third of the row.
  postToX: 'Wpis na X',
  copyImage: 'Kopiuj obraz',
  savePng: 'Zapisz PNG',
  tryAgain: 'Ponów',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Link',
  directLink: 'Link bezpośredni: nie udało się teraz utworzyć krótkiego linku',
  creatingLink: 'Tworzenie linku…',
  linkLater: 'Powstanie po udostępnieniu',
  postLabel: 'Wpis',
  renderFailed: 'Nie udało się utworzyć karty w\u00a0tej przeglądarce; link działa.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${place} pod okiem satelity ${sat} z\u00a0wysokości ${km(altitudeKm)}, ${when(w)}. ${pixelM !== undefined ? `${pixel(pixelM)} na piksel; to` : 'To'} prawdziwy obraz.`,
    // `cloud` is the card's own sentence for it («Widać głównie chmury (81%).»)
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${place} pod okiem satelity ${sat} z\u00a0wysokości ${km(altitudeKm)}, ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${place} w\u00a0kadrze satelity ${sat} z\u00a0wysokości ${km(altitudeKm)}, ${when(w)}. Pas obrazowania jego kamery objął ten punkt.`,
    // «Mógł» runs only for commercial and radar satellites (masculine «satelita» before it), never for a station.
    could: (sat: string, place: string, w: PostWhen) =>
      `${place} w\u00a0zasięgu satelity ${sat}, ${when(w)}. Mógł tu spojrzeć. Operator nie podaje, czy tak było.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${place}: przelot ${CREWED.test(sat) ? 'stacji' : 'satelity'} ${sat} na wysokości ${km(altitudeKm)}, ${when(w)}.`,
  },
  // The stressed «Ciebie też» is "you too"; the reader is the object, so nothing shows a gender.
  hookWatched: 'Ciebie też coś obserwowało w\u00a0tym tygodniu.',
  hookPassed: 'Co przeleciało nad tobą w\u00a0tym tygodniu?',
  // «via» is normal on Polish X.
  credit: (handle: string) => `via ${handle}`,

  // ── File names ────────────────────────────────────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-tydzien-${day}.png`,
}
export default share
