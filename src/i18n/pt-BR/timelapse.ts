/**
 * Brazilian Portuguese copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the
 * words the MP4 draws (see src/i18n/en/timelapse.ts for where each line shows; docs/i18n/pt-BR.md §3.7 is the
 * authority on every line here).
 *
 * Why it reads this way: the feature keeps *time-lapse* (m., invariable; never *lapso de tempo*), a frame is a *quadro*
 * (never *frame* or *moldura*), a clear look a *vista limpa*, and the frames are *revelados* as a photograph is
 * (pt-BR.md §4.1). The note may say *fotos* because every frame is a Sentinel-2 photograph. The place follows a colon or
 * opens the label (*Time-lapse: Waterloo*, *Waterloo, ano a ano*), never *de* (§5). Dates arrive as instants at UTC
 * midnight and are written from Intl `pt-BR` parts at zone 'UTC', never a month table: mono *22 out 2015* (the
 * abbreviation's period stripped, no *de*), spoken *22 de outubro de 2015* with *1º* for the first of the month (§6). A
 * single-season caption states the season and nothing else (*uma a cada outono*, §8). The video button keeps its
 * 132 px: *Vídeo*, *Gerando 42%*, *Falha no vídeo*, *Salvar vídeo* (§7). The file-name word is *lugar*.
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { dateFormat } from '../../../api/_lib/i18n/dates'

const f = fmt('pt-BR')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** One instant's date parts in pt-BR at UTC, without the abbreviation's period ("out." → "out") */
const parts = (ms: number, opts: Intl.DateTimeFormatOptions) => {
  const ps = dateFormat('pt-BR', 'UTC', opts).formatToParts(ms)
  return (t: Intl.DateTimeFormatPartTypes) => (ps.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
}
/** "22 out" */
const dayMonth = (ms: number) => {
  const g = parts(ms, { day: 'numeric', month: 'short' })
  return `${g('day')} ${g('month')}`
}
/** "22 out 2015" */
const day = (ms: number) => {
  const g = parts(ms, { day: 'numeric', month: 'short', year: 'numeric' })
  return `${g('day')} ${g('month')} ${g('year')}`
}
/** "22 de outubro de 2015", "1º de outubro de 2015": read aloud, the month in full */
const spokenDay = (ms: number) => {
  const g = parts(ms, { day: 'numeric', month: 'long', year: 'numeric' })
  const d = g('day')
  return `${d === '1' ? '1º' : d} de ${g('month')} de ${g('year')}`
}
/** "1 vista limpa", "12 vistas limpas" (0 takes the plural) */
const looks = (n: number) =>
  n === 0
    ? `${f.int(n)} vistas limpas`
    : f.plural(n, { one: `${f.int(n)} vista limpa`, many: `${f.int(n)} vistas limpas`, other: `${f.int(n)} vistas limpas` })
/** "uma" agrees with "vista" */
const EACH: Record<SeasonName, string> = {
  winter: 'uma a cada inverno',
  spring: 'uma a cada primavera',
  summer: 'uma a cada verão',
  autumn: 'uma a cada outono',
}

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Time-lapse: ${place}`,
  title: 'Time-lapse',
  close: 'Fechar',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Reproduzir',
  pause: 'Pausar',
  slider: 'Quadro',
  frameList: 'Quadros',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Quadro ${f.int(index)} de ${f.int(total)}: ${spokenDay(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · uma por ano`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  // A year: never grouped ("desde 2015").
  captionGathering: (since: number) => `Uma vista limpa por ano · desde ${since}`,
  captionShort: 'Sem time-lapse para este lugar',
  captionError: 'O arquivo não respondeu',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) =>
    `Cada quadro é o mesmo quadrado de ${f.int(km)} km, captado pelo Sentinel-2 e tratado como todas as fotos daqui. Cada ano busca uma estação diferente; um ano sem vista limpa fica de fora.`,
  noteOneSeason: (km: number) =>
    `Cada quadro é o mesmo quadrado de ${f.int(km)} km, captado pelo Sentinel-2 e tratado como todas as fotos daqui. Todos os anos são da mesma estação; um ano sem vista limpa nessa estação fica de fora.`,
  source: 'Copernicus Sentinel-2, via Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Consultando o arquivo',
  choosing: 'Escolhendo vistas limpas',
  developing: 'Revelando quadros',
  // Read aloud only: the step as the screen says it, then the counter, zero-padded as on screen ("03 de 11").
  choosingProgress: (done: number, total: number) => `Escolhendo vistas limpas, ${pad2(done)} de ${pad2(total)}`,
  developingProgress: (done: number, total: number) => `Revelando quadros, ${pad2(done)} de ${pad2(total)}`,
  tooCloudy: 'Nuvens demais aqui para um time-lapse.',
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'Nenhuma vista limpa' : looks(count)} desde ${since} · ${f.int(needed)} ${
      needed === 0 ? 'necessárias' : f.plural(needed, { one: 'necessária', many: 'necessárias', other: 'necessárias' })
    }`,
  noAnswer: 'O arquivo não respondeu.',
  unreachable: 'Não foi possível acessar o Planetary Computer',
  retry: 'Tentar de novo',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Compartilhar',
  linkCopied: 'Link copiado',
  shareTitle: (place: string) => `${place}, ano a ano`,
  video: 'Vídeo',
  // Padded to two digits, as English, so the 132 px button never changes width while it counts.
  rendering: (pct: number) => `Gerando ${pad2(pct)}%`,
  videoFailed: 'Falha no vídeo',
  saveVideo: 'Salvar vídeo',
  // "o vídeo", never "o arquivo" (arquivo is the archive, §1.4).
  noH264: 'Este navegador não tem codificador H.264: o vídeo toca no Chrome e no Firefox',
  fileNamePlace: 'lugar',
}

export default timelapse
