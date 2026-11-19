/**
 * Spanish copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the words the MP4
 * draws (see src/i18n/en/timelapse.ts; docs/i18n/es.md is the authority on every line here).
 *
 * Why it reads this way: the feature keeps *time-lapse* (m., hyphenated; never *timelapse* or *cámara rápida*), a frame
 * is an *imagen* (never *fotograma* or *cuadro*, which split Spain and Latin America), a clear look a *vista despejada*,
 * and the frames are *revelados* as a photograph is (es.md §4). The note may say *fotos* because every frame is a
 * Sentinel-2 photograph. Dates arrive as instants at UTC midnight and are written by Intl `es` at zone 'UTC' ("22 oct
 * 2015"; spoken "22 de octubre de 2015"), never from a hand-made month table (§6). A single-season caption states the
 * season and nothing else (*una cada otoño*, §8). The video button keeps its 132 px width: *Video*, *Generando 42%*,
 * *Error de video*, *Guardar video* (§7). The file-name word is *lugar*.
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { formatDate } from '../../../api/_lib/i18n/dates'

const f = fmt('es')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** "22 oct" */
const dayMonth = (ms: number) => formatDate('es', ms, 'UTC', { day: 'numeric', month: 'short' })
/** "22 oct 2015" */
const day = (ms: number) => formatDate('es', ms, 'UTC', { day: 'numeric', month: 'short', year: 'numeric' })
/** "22 de octubre de 2015": read aloud, the month in full */
const spokenDay = (ms: number) => formatDate('es', ms, 'UTC', { day: 'numeric', month: 'long', year: 'numeric' })
/** "1 vista despejada", "11 vistas despejadas" */
const looks = (n: number) =>
  f.plural(n, { one: `${f.int(n)} vista despejada`, many: `${f.int(n)} vistas despejadas`, other: `${f.int(n)} vistas despejadas` })
const EACH: Record<SeasonName, string> = {
  winter: 'una cada invierno',
  spring: 'una cada primavera',
  summer: 'una cada verano',
  autumn: 'una cada otoño',
}

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => `Time-lapse de ${place}`,
  title: 'Time-lapse',
  close: 'Cerrar',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: 'Reproducir',
  pause: 'Pausar',
  slider: 'Imagen',
  frameList: 'Imágenes',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Imagen ${f.int(index)} de ${f.int(total)}: ${spokenDay(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · una al año`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Una vista despejada al año · desde ${since}`,
  captionShort: 'No hay time-lapse de este lugar',
  captionError: 'El archivo no respondió',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) =>
    `Cada imagen muestra el mismo cuadrado de ${f.int(km)} km. Son fotos de Sentinel-2, con el mismo tratamiento de color que todas las de Watched. Cada año se busca una estación distinta; los años sin ninguna vista despejada no aparecen.`,
  noteOneSeason: (km: number) =>
    `Cada imagen muestra el mismo cuadrado de ${f.int(km)} km. Son fotos de Sentinel-2, con el mismo tratamiento de color que todas las de Watched. Todas las imágenes son de la misma estación; los años sin ninguna vista despejada en esa estación no aparecen.`,
  source: 'Copernicus Sentinel-2, vía Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: 'Consultando el archivo',
  choosing: 'Eligiendo vistas despejadas',
  developing: 'Revelando imágenes',
  // Read aloud only: the step as the screen says it, then the counter, zero-padded as on screen ("03 de 12").
  choosingProgress: (done: number, total: number) => `Eligiendo vistas despejadas: ${pad2(done)} de ${pad2(total)}`,
  developingProgress: (done: number, total: number) => `Revelando imágenes: ${pad2(done)} de ${pad2(total)}`,
  tooCloudy: 'Aquí hay demasiadas nubes para un time-lapse.',
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'Ninguna vista despejada' : looks(count)} desde ${since} · ${f.plural(needed, {
      one: `se necesita ${f.int(needed)}`,
      many: `se necesitan ${f.int(needed)}`,
      other: `se necesitan ${f.int(needed)}`,
    })}`,
  noAnswer: 'El archivo no respondió.',
  unreachable: 'No se pudo conectar con Planetary Computer',
  retry: 'Reintentar',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: 'Compartir',
  linkCopied: 'Enlace copiado',
  shareTitle: (place: string) => `${place}, año a año`,
  video: 'Video',
  // Padded to two digits, as English, so the 132 px button never changes width while it counts.
  rendering: (pct: number) => `Generando ${pad2(pct)}%`,
  videoFailed: 'Error de video',
  saveVideo: 'Guardar video',
  noH264: 'Este navegador no tiene codificador H.264: el archivo se reproduce en Chrome y Firefox',
  fileNamePlace: 'lugar',
}

export default timelapse
