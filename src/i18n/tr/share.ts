/**
 * Turkish copy for the share sheet, the post text it prefills and the PNG's file name (see docs/i18n/tr.md §3.5 "Share
 * post", §3.10, §5, §7). The card and the share page speak from api/_lib/i18n/card/tr.ts.
 *
 * Why it is built this way:
 *  - The post opens with a dateline (`1 Kasım Pazar, yerel saatle 11:21.`), the Turkish news convention, so the day
 *    and the clock never need a locative suffix (`11:21’de` would have to follow how the clock is read, §5.5). The day
 *    is written in full, from Intl's parts (`d MMMM EEEE`).
 *  - The place is the bare subject of a passive and the satellite the agent before `tarafından` (`Waterloo, 795 km
 *    irtifadan Sentinel-2C tarafından izlendi.`), so neither name takes a suffix (§5.1, §5.2); a comma follows the place
 *    because a number comes next. Where the satellite is the subject (`could`, `overhead`), the place stands before an
 *    invariant word (`geçerken … görüş alanındaydı`, `… üzerinden geçti`).
 *  - After a sentence whose subject is the place, the satellite is named again (`Uydu …`, `Uydunun …`): a bare verb or
 *    possessive there would attach to the place (§5.2).
 *  - Buttons are bare stems or nouns, measured for the phone row (three in 360 px): `Kopyala` sits under the field
 *    labelled ADRES, so it needs no object; `X’te paylaş`, `PNG kaydet` (§3.10, §7). Status lines are passive
 *    (`Bağlantı oluşturuluyor…`, `Kopyalandı`).
 *  - Numbers go through fmt('tr') (`35.786 km`). File names stay lowercase ASCII (`watched-…-hafta-…`).
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'

const f = fmt('tr')

const LONG_DAY: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }

/** "1 Kasım Pazar" at the place, from Intl's parts (day, month, weekday: the Turkish order, §6.4) */
function longDay(ms: number, timeZone: string): string {
  const parts = dateFormat('tr', timeZone, LONG_DAY).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
  return `${get('day')} ${get('month')} ${get('weekday')}`
}
/** "1 Kasım Pazar, yerel saatle 11:21.": the post's dateline, its own sentence */
const dateline = (w: PostWhen) => `${longDay(w.ms, w.timeZone)}, yerel saatle ${w.clock}.`
/** "795 km": the satellite's altitude, whole kilometres */
const km = (altitudeKm: number) => `${f.int(altitudeKm)}\u00a0km`
/** "10 m", "2 km": a pixel's size, whole metres, or whole kilometres from 1000 m */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)}\u00a0km` : `${f.int(m)}\u00a0m`)

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Bu geçişi paylaş',
  titleImage: 'Bu görüntüyü paylaş',
  titleWeek: 'Bu haftayı paylaş',
  close: 'Kapat',
  closeTitle: 'Kapat (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Görüntüyü paylaş',
  preparingImage: 'Görüntü hazırlanıyor…',
  share: 'Paylaş',
  copyLink: 'Kopyala',
  copied: 'Kopyalandı',
  postToX: 'X’te paylaş',
  copyImage: 'Görüntüyü kopyala',
  savePng: 'PNG kaydet',
  tryAgain: 'Yeniden dene',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Adres',
  // A whole sentence after the colon: a capital (TDK, §6.1).
  directLink: 'Doğrudan bağlantı: Kısa bağlantı şu an oluşturulamadı',
  creatingLink: 'Bağlantı oluşturuluyor…',
  linkLater: 'Paylaşınca oluşur',
  postLabel: 'Metin',
  renderFailed: 'Kart burada çizilemedi; bağlantı yine de çalışır.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${dateline(w)} ${place}, ${km(altitudeKm)} irtifadan ${sat} tarafından izlendi. ${pixelM !== undefined ? `Piksel başına ${pixel(pixelM)}; bu` : 'Bu'}, gerçek görüntünün kendisi.`,
    // `cloud` is the card's post sentence, which names the picture (`Görüntüde …`), never a bare `gördü`.
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${dateline(w)} ${place}, ${km(altitudeKm)} irtifadan ${sat} tarafından izlendi. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${dateline(w)} ${place}, ${km(altitudeKm)} irtifadan ${sat} tarafından tarandı. Uydunun tarama şeridi bu noktayı kapsadı.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${dateline(w)} ${sat} geçerken ${place} görüş alanındaydı. Uydu kamerasını buraya çevirmiş olabilir; operatörü çevirip çevirmediğini söylemiyor.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${dateline(w)} ${sat}, ${km(altitudeKm)} irtifadan ${place} üzerinden geçti.`,
  },
  // The hero's order, with `de` (too) after the fixed `seni` (§3.5).
  hookWatched: 'Bu hafta bir şey seni de izledi.',
  // `tependen`: "over you"; `üzerinden` would read "over it".
  hookPassed: 'Bu hafta tependen ne geçti?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names ────────────────────────────────────────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-hafta-${day}.png`,
}
export default share
