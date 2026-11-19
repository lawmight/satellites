/**
 * Spanish copy for the passes: the list grouped by verdict and the view of one pass (see src/i18n/en/passView.ts;
 * docs/i18n/es.md is the authority on every word here).
 *
 * Why it reads this way: the unit is *pasada* (f.), never *pase* or *paso* (es.md §4), and every verdict counts it, so
 * the verdict a count arrives with does not change the word; its form follows Spanish's three plural categories, with
 * `many` a copy of `other` (§5). Words that agree with the count agree with *pasada* (*Última*, *Más cercana*). The
 * satellite is never referred to by a pronoun (pro-drop, *su*), the spot is *aquí*, never *tu punto* (§9). Readout
 * labels are the glossary's, sized for the strip's four cells (≤ 8 characters a line, wrapping at spaces: *Fuera de
 * nadir*, *Nubes aquí*) and the two-column grid (§7), whose labels are nowrap in a 162 px column on a 360 px phone: at
 * 8.0 px a character they hold 19, so the glossary's longer forms are cut to *Velocidad terrestre*, *Escaneo aquí ·
 * UTC*, *Sentido del escaneo*, *Velocidad de línea*. The elevation's unit is empty: the label says it, and the compass
 * point stands alone (`SSO`, §4). Days, clocks, compass points and durations arrive written; *a las* becomes *a la*
 * before a clock that starts with `01:` (§5).
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('es')
/** "a las 16:14", "a la 01:12" */
const aLas = (clock: string) => `${/^01:/.test(clock) ? 'a la' : 'a las'} ${clock}`
/** The unit of every verdict's count, in the form the number takes */
const passes = (n: number) => f.plural(n, { one: 'pasada', many: 'pasadas', other: 'pasadas' })

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'Ninguno de los satélites que seguimos pasó sobre este lugar en esta ventana de tiempo. Es poco habitual; las notas de arriba indican si alguna fuente de datos no respondió.',
  imagedOrder: 'más cercana, luego últimas',
  count: (n: number, _verdict: Verdict) => `${f.int(n)} ${passes(n)}`,
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), passes(n)),
  sats: (n: number) => `${f.int(n)} ${f.plural(n, { one: 'satélite', many: 'satélites', other: 'satélites' })}`,
  showAllSats: (n: number) => f.plural(n, { one: `Mostrar ${f.int(n)} satélite`, many: `Mostrar los ${f.int(n)} satélites`, other: `Mostrar los ${f.int(n)} satélites` }),
  showAllRows: (n: number) => f.plural(n, { one: `Mostrar ${f.int(n)} fila`, many: `Mostrar las ${f.int(n)} filas`, other: `Mostrar las ${f.int(n)} filas` }),
  showMore: (n: number) => `Mostrar ${f.int(n)} más`,
  left: (n: number) => f.plural(n, { one: `queda ${f.int(n)}`, many: `quedan ${f.int(n)}`, other: `quedan ${f.int(n)}` }),
  showFewer: 'Mostrar menos',
  tag: {
    mosaic: 'Mosaico',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Nublado · ${f.int(pct)}%`,
    cloudedAtSpot: 'Nublado · justo aquí',
  },
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day} ${aLas(o.time)} ${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `nubosidad del ${f.int(o.cloudPct)} por ciento` : undefined,
      o.clouded ? 'imagen nublada' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `${f.dec(deg, 1)}° del nadir`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `nubosidad ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `Ampliar la imagen: ${sat}, ${day} ${time}`,
  expandTitle: 'Ampliar la imagen',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${f.int(o.passes)} ${passes(o.passes)}, la última el ${o.day} ${aLas(o.time)}`,
  latest: 'Última ',
  closest: 'Más cercana ',
  cloudChip: 'Nubes',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Imágenes',
  planSection: 'Vista cenital',
  geometry: 'Geometría',
  replay: 'Repetición',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Una imagen de disco completo: una sola imagen de todo lo que puede ver el satélite, a ${pixel} por píxel aquí. Poco detallada, pero real, y la más reciente que se ha publicado. El satélite ha tomado una como esta ${
      cadenceMin
        ? f.plural(cadenceMin, { one: 'cada minuto', many: `cada ${f.int(cadenceMin)} minutos`, other: `cada ${f.int(cadenceMin)} minutos` })
        : 'cada pocos minutos'
    } durante toda la semana.`,
  mosaicNote: (gsdM: number) =>
    `Un mosaico diario: la NASA une las franjas de cada día en una sola imagen, a ${f.int(gsdM)} m por píxel. Poco detallado, pero real, y del mismo día que esta pasada.`,
  radarNote:
    'Una imagen de radar, no una foto: Sentinel-1 emite microondas y registra su eco, así que ni las nubes ni la oscuridad lo detienen. El brillo indica con qué fuerza el suelo devuelve las microondas: los edificios y el terreno irregular se ven claros, el agua en calma se ve oscura.',
  noImage: {
    openArchive: (sat: string) => `No hay ninguna imagen de este lugar tomada por ${sat} en esta pasada. Vista cenital de la pasada.`,
    radarPrivate: 'Sin imagen pública: el archivo de este operador de radar es privado. Vista cenital de la pasada.',
    commercialPrivate: 'Sin imagen pública: los archivos comerciales son privados. Vista cenital de la pasada.',
    noneToShow: 'No hay ninguna imagen que mostrar de esta pasada. Vista cenital de la pasada.',
    archiveDown: 'Ahora mismo no se puede consultar el archivo. Vista cenital de la pasada.',
    noScene: 'No existe ninguna escena de esta pasada. Vista cenital de la pasada.',
    notYet: 'Aún no se ha publicado ninguna escena de esta pasada. Las escenas de Sentinel-2 y Landsat suelen aparecer en menos de un día.',
    crewed: 'Las estaciones tripuladas llevan cámaras, pero sus fotos no se publican por lugar y hora.',
    unavailable: 'La imagen de esta pasada no está disponible.',
  },
  links: {
    openToSave: 'Abrir la imagen para guardarla',
    downloading: 'Descargando…',
    download: 'Descargar imagen',
    viewSource: (archive: string) => `Ver la fuente · ${archive}`,
  },
  spot: {
    checking: 'Leyendo el píxel del punto exacto…',
    clear: 'Despejado justo aquí.',
    cirrus: 'Cirros finos justo aquí; pueden suavizar la imagen.',
    cloud: 'Nubes justo aquí.',
    shadow: 'Este punto estaba a la sombra de una nube.',
  },

  // ── the readout strip ────────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Altitud',
    elevation: 'Elevación',
    offNadir: 'Fuera de nadir',
    pixel: 'Píxel',
    band: 'Banda',
    sun: 'Sol',
    cloud: 'Nubosidad',
    cloudAtSpot: 'Nubes aquí',
  },
  band: { infrared: 'IR', visible: 'Visible', colour: 'Color' },
  spotValue: { clear: 'Ninguna', cirrus: 'Cirros', cloud: 'Sí', shadow: 'Sombra' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    // Spanish has no word for "up" after the degrees: the label says it, so the unit stays empty (es.md §4).
    up: '',
    mosaic: 'mosaico',
    scene: 'escena',
    sun: { day: 'día', twilight: 'crepúsculo', night: 'noche' },
  },

  // ── 01 / Geometría ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'Más cerca · UTC',
    closestLocal: 'Más cerca · local',
    groundDistance: 'Distancia horizontal',
    elevationFromYou: 'Elevación desde ti',
    groundSpeed: 'Velocidad terrestre',
    heading: 'Rumbo',
    sunElevation: 'Elevación del Sol',
    fieldOfRegard: 'Alcance',
    swath: 'Franja',
    inSwath: 'En la franja',
    inView: 'A la vista',
    window: 'Ventana',
    noradPass: 'NORAD · pasada',
    scanUtc: 'Escaneo aquí · UTC',
    scanLocal: 'Escaneo aquí · local',
    aboveEquator: 'Sobre el ecuador en',
    inYourSky: 'En tu cielo',
    scanDirection: 'Sentido del escaneo',
    lineSpeed: 'Velocidad de línea',
    coverage: 'Cobertura',
    thisScan: 'Este escaneo',
    noradScan: 'NORAD · escaneo',
  },
  northToSouth: 'Norte → sur',
  southToNorth: 'Sur → norte',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Día', twilight: 'Crepúsculo', night: 'Noche' },
  fullDisc: 'Disco completo',
  everyMin: (n: number) => `cada ${f.int(n)} min`,
  upCompass: (compass: string) => compass,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'Asc' : 'Desc'}`,
}

export default passView
