/**
 * Brazilian Portuguese copy for the share sheet, the post it prefills and the PNG's file name (see src/i18n/en/share.ts
 * for where each line shows; docs/i18n/pt-BR.md §3.6, §4.2 and §7 are the authority on every line here).
 *
 * Why it reads this way: buttons are infinitives with no article (*Compartilhar*, *Salvar PNG*), and the three that sit
 * side by side on a phone stay within about 11 characters (*Copiar link*, *Postar no X*, *Salvar PNG*, and *Refazer
 * PNG* after a failed render: *Tentar de novo* is 112 px in the 89 px a 360 px phone leaves inside each button); one
 * *Copiado* replaces both copy buttons; the 48 px labels are *Link* and *Texto* (pt-BR.md §4.2, §7). The
 * post is the guide's §3.6 table: the satellite first and bare, the place a bare direct object (no article, no
 * contracting preposition, never a subject), and the verdict's own verb (*observou*, *cobriu*, *teve … ao alcance*,
 * *sobrevoou*), with the altitude as *a 786 km de altitude*, never a dangling *acima* (§3.4). The day is written from
 * Intl's long parts at the place's zone, never a month table: *no domingo, 1º de novembro, às 11:21, hora local*, with
 * *no / na* from the weekday, *1º* for the first of the month, and *à* for a clock that starts 00 or 01 (§5). Numbers
 * go through fmt('pt-BR'); a no-break space ties each number to its unit and *às* to its clock (§6).
 */
import type en from '../en/share'
import type { PostWhen } from '../en/share'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'

const f = fmt('pt-BR')

/** "795 km": the satellite's altitude in the post (whole km) */
const km = (altitudeKm: number) => `${f.int(altitudeKm)} km`
/** "10 m", "2 km": a pixel's size in the post, in whole metres or whole km */
const pixel = (m: number) => (m >= 1000 ? `${f.int(m / 1000)} km` : `${f.int(m)} m`)
/** "no domingo, 1º de novembro", "na sexta-feira, 6 de novembro": Intl's long parts at the place's zone */
const longDay = (ms: number, timeZone: string) => {
  const ps = dateFormat('pt-BR', timeZone, { weekday: 'long', day: 'numeric', month: 'long' }).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => ps.find((p) => p.type === t)?.value ?? ''
  const weekday = get('weekday')
  const day = get('day')
  return `${/^(domingo|sábado)/.test(weekday) ? 'no' : 'na'} ${weekday}, ${day === '1' ? '1º' : day} de ${get('month')}`
}
/** "no domingo, 1º de novembro, às 11:21, hora local" (à 01:05) */
const when = (w: PostWhen) => `${longDay(w.ms, w.timeZone)}, ${parseInt(w.clock, 10) <= 1 ? 'à' : 'às'} ${w.clock}, hora local`

const share: typeof en = {
  // ── The sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
  titlePass: 'Compartilhar esta passagem',
  titleImage: 'Compartilhar esta imagem',
  titleWeek: 'Compartilhar esta semana',
  close: 'Fechar',
  closeTitle: 'Fechar (Esc)',

  // ── Buttons ───────────────────────────────────────────────────────────────────────────────────────────────────────
  shareImage: 'Compartilhar imagem',
  preparingImage: 'Preparando imagem…',
  share: 'Compartilhar',
  copyLink: 'Copiar link',
  copyLinkDesktop: 'Copiar link',
  copied: 'Copiado',
  postToX: 'Postar no X',
  copyImage: 'Copiar PNG',
  savePng: 'Salvar PNG',
  tryAgain: 'Refazer PNG',

  // ── The link and the post preview ─────────────────────────────────────────────────────────────────────────────────
  linkLabel: 'Link',
  directLink: 'Link direto: não foi possível criar o link curto agora',
  creatingLink: 'Criando link…',
  linkLater: 'Criado ao compartilhar',
  postLabel: 'Texto',
  renderFailed: 'Não foi possível gerar a imagem aqui; o link continua funcionando.',

  // ── The post ──────────────────────────────────────────────────────────────────────────────────────────────────────
  post: {
    imaged: (sat: string, place: string, altitudeKm: number, w: PostWhen, pixelM?: number) =>
      `${sat} observou ${place} a ${km(altitudeKm)} de altitude ${when(w)}. ${
        pixelM !== undefined ? `${pixel(pixelM)} por pixel; esta` : 'Esta'
      } é a imagem real.`,
    clouded: (sat: string, place: string, altitudeKm: number, w: PostWhen, cloud: string) =>
      `${sat} observou ${place} a ${km(altitudeKm)} de altitude ${when(w)}. ${cloud}`,
    likely: (sat: string, place: string, altitudeKm: number, w: PostWhen) =>
      `${sat} cobriu ${place} a ${km(altitudeKm)} de altitude ${when(w)}. O ponto ficou dentro da faixa da câmera.`,
    could: (sat: string, place: string, w: PostWhen) =>
      `${sat} teve ${place} ao alcance ${when(w)}. Pode ter apontado aqui. O operador não diz se apontou.`,
    overhead: (sat: string, place: string, altitudeKm: number, w: PostWhen) => `${sat} sobrevoou ${place} a ${km(altitudeKm)} de altitude ${when(w)}.`,
  },
  // "também" after "você": "you too", not "also watched" (§3.6).
  hookWatched: 'Algo observou você também esta semana.',
  hookPassed: 'O que passou sobre você esta semana?',
  credit: (handle: string) => `via ${handle}`,

  // ── File names (lowercase ASCII words and hyphens) ────────────────────────────────────────────────────────────────
  pngName: (sat: string, place: string, day: string) => `watched-${sat}-${place}-${day}.png`,
  weekPngName: (place: string, day: string) => `watched-${place}-semana-${day}.png`,
}

export default share
