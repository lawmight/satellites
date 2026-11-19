/**
 * Spanish copy for the share sheet, the post it prefills and the PNG's file name (see src/i18n/en/share.ts;
 * docs/i18n/es.md §3.4 and §7 are the authority on every line here).
 *
 * Why it reads this way: buttons are infinitives with no article (*Compartir*, *Guardar PNG*), and the three that sit
 * side by side on a phone stay within 11 characters, which is why the copy button is *Copiar URL* and X's is *Enviar a
 * X* (es.md §7; *Copiar enlace* and *Publicar en X* overflow). One *Copiado* replaces both copy buttons. The link's
 * and the post's labels fit a 48 px column (*Enlace*, *Texto*). The post is prose: the satellite first and bare, the
 * place as a bare direct object (no article, no personal *a*, never a subject), the day in its long form from Intl
 * parts (*el domingo 1 de noviembre*, no hand-made month table), then *a las* (*a la* before `01:`) and *hora local*
 * (§5). The verbs are the verdicts' own: *observó*, *pasó sobre … La franja de su cámara cubrió el lugar*, *tuvo … a su
 * alcance*, *pasó a … de altura sobre* (§3.4, §3.5). Numbers take fmt('es'); a no-break space ties each to its unit.
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'

const f = fmt('es')

/** "795 km": the satellite's altitude in the post (whole km) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)} km`
/** "10 m", "2 km": a pixel's size in the post, in whole metres or whole km */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)} km` : `${f.int(m)} m`)
/** "domingo 1 de noviembre": the long weekday, day and month from Intl's parts (its own long form adds a comma) */
const longDay = (ms: number, timeZone: string) => {
  const ps = dateFormat('es', timeZone, { weekday: 'long', day: 'numeric', month: 'long' }).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => ps.find((p) => p.type === t)?.value ?? ''
  return `${get('weekday')} ${get('day')} de ${get('month')}`
}
/** "el domingo 1 de noviembre a las 11:21, hora local" (a la 01:05) */
const when = (w: PostWhen) => `el ${longDay(w.ms, w.timeZone)} ${/^01:/.test(w.clock) ? 'a la' : 'a las'} ${w.clock}, hora local`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Compartir esta pasada',
  titleImage: 'Compartir esta imagen',
  titleWeek: 'Compartir esta semana',
  close: 'Cerrar',
  closeTitle: 'Cerrar (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Compartir imagen',
  preparingImage: 'Preparando imagen…',
  share: 'Compartir',
  copyLink: 'Copiar URL',
  copied: 'Copiado',
  postToX: 'Enviar a X',
  copyImage: 'Copiar imagen',
  savePng: 'Guardar PNG',
  tryAgain: 'Reintentar',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Enlace',
  directLink: 'Enlace directo: ahora mismo no se puede crear el enlace corto',
  creatingLink: 'Creando enlace…',
  linkLater: 'Se crea al compartir',
  postLabel: 'Texto',
  renderFailed: 'No se pudo generar la tarjeta en este navegador; el enlace funciona igual.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat} observó ${place} desde ${km(altitudeKm)} de altura ${when(w)}. ${
        pixelM !== undefined ? `${pixel(pixelM)} por píxel; esta` : 'Esta'
      } es la imagen real.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat} observó ${place} desde ${km(altitudeKm)} de altura ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} pasó sobre ${place} a ${km(altitudeKm)} de altura ${when(w)}. La franja de su cámara cubrió el lugar.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${sat} tuvo ${place} a su alcance ${when(w)}. Pudo haber apuntado aquí. Su operador no dice si lo hizo.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) => `${sat} pasó a ${km(altitudeKm)} de altura sobre ${place} ${when(w)}.`,
  },
  hookWatched: 'Algo te observó a ti también esta semana.',
  hookPassed: '¿Qué te sobrevoló esta semana?',
  credit: (handle: string) => `vía ${handle}`,

  // ── File names (lowercase ASCII words and hyphens) ────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-semana-${day}.png`,
}

export default share
