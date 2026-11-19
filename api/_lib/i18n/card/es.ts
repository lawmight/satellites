/**
 * Spanish copy for the share card and the share page (see ./en.ts for where each line shows and its constraints;
 * docs/i18n/es.md §3 is the authority on every line here). Pure TypeScript, no DOM, Node or src/ imports: the server
 * reads it too.
 *
 * Why it reads this way:
 *  - The headline is the results headline (*7 satélites observaron* | *Waterloo.*), and the zero case its own
 *    sentence (*Ninguno de los satélites que seguimos observó*), as es.md §3.3 has them. The per-verdict headlines of
 *    old shares are the §3.4 frames; the words after the place (*con su franja.*, *a su alcance.*) sit in the accent,
 *    on the place's serif line, as its tail. When the place was cut short ("…") English drops its full stop and the
 *    week's " this week."; Spanish does the same, and moves a tail the sentence cannot lose in front of the place
 *    instead (*tuvo a su alcance Cataratas del Ni…*), so the line never ends on words after an ellipsis. The week's
 *    *esta semana.* is held together by a no-break space, so the serif lines break before it (*Waterloo* / *esta
 *    semana.*), never leaving *semana.* alone.
 *  - The place is a bare direct object or follows a preposition: no article, no personal *a*, no *del/al* before it,
 *    never a subject (§5). A nameless satellite is *Un satélite* as a subject and *un satélite* after *de*, written by
 *    each sentence; only the chips and the plan plate print `aSatellite`.
 *  - Dates come from Intl `es` parts at the place's zone, never a month table: mono *dom 1 nov 2026*, *3 nov* (any
 *    trailing abbreviation point an older ICU adds is dropped: §6 uses none); prose *el domingo 1 de noviembre de 2026*.
 *    *a las* becomes *a la* before a clock that starts with `01:`.
 *  - No no-break spaces here: the canvas renderer splits words on any white space while satori keeps U+00A0 together,
 *    and the three renderers must wrap the same words alike.
 *  - Numbers through fmt('es'), decimals through its `dec` (decimal comma); percent attached (`25%`).
 */
import { fmt } from '../format.js'
import { dateFormat } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('es')

// ── Days at the place's zone, from Intl's parts ──────────────────────────────────────────────────────────────────────

/** One instant's date parts in Spanish at a zone, without the abbreviation point an older ICU may add ("nov."). */
function dateParts(ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions): (t: Intl.DateTimeFormatPartTypes) => string {
  const ps = dateFormat('es', timeZone, opts).formatToParts(ms)
  return (t) => (ps.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
}
/** "dom 1 nov 2026": the mono day with its year (Intl's own short form puts a comma after the weekday) */
const dayYear = (ms: number, timeZone: string) => {
  const g = dateParts(ms, timeZone, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  return `${g('weekday')} ${g('day')} ${g('month')} ${g('year')}`
}
/** "3 nov" */
const dayMonth = (ms: number, timeZone: string) => {
  const g = dateParts(ms, timeZone, { day: 'numeric', month: 'short' })
  return `${g('day')} ${g('month')}`
}
/** "el domingo 1 de noviembre de 2026": prose, from the long parts */
const longDayYear = (ms: number, timeZone: string) => {
  const g = dateParts(ms, timeZone, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return `el ${g('weekday')} ${g('day')} de ${g('month')} de ${g('year')}`
}
/** "a las 11:21", "a la 01:05" */
const aLas = (clock: string) => `${/^01:/.test(clock) ? 'a la' : 'a las'} ${clock}`

// ── Pieces the Spanish sentences share ──────────────────────────────────────────────────────────────────────────────

/** "31 satélites observaron" / "1 satélite observó" / "Ninguno de los satélites que seguimos observó" */
const watched = (n: number) =>
  n > 0
    ? f.plural(n, {
        one: `${f.int(n)} satélite observó`,
        many: `${f.int(n)} satélites observaron`,
        other: `${f.int(n)} satélites observaron`,
      })
    : 'Ninguno de los satélites que seguimos observó'
/** The full stop after the place, unless the place was cut short ("…." reads as a typo). */
const stop = (cut: boolean, tail = '.') => (cut ? [] : [tail])
/** A sentence's subject: the satellite's name, or "Un satélite" */
const subject = (sat: SatName) => sat ?? 'Un satélite'
/** After "de": the satellite's name, or "un satélite" */
const ofSat = (sat: SatName) => sat ?? 'un satélite'

/**
 * A headline whose words after the place are part of the sentence ("tuvo [PLACE] a su alcance."): the tail sits on
 * the place's serif line; when the place was cut short it moves before it, so no words follow the ellipsis.
 */
const withTail = (lead: string, tail: string, place: string, cut: boolean): Rich =>
  cut ? [`${lead} ${tail}`, accent(place)] : [lead, accent(place, ` ${tail}.`)]

const COMPASS = ['norte', 'noreste', 'este', 'sureste', 'sur', 'suroeste', 'oeste', 'noroeste']
/** " el domingo 1 de noviembre de 2026 a las 11:21 EST" */
const at = (w?: CardWhen) => (w ? ` ${longDayYear(w.ms, w.timeZone)} ${aLas(w.clock)} ${w.zone}` : '')
/** ", rumbo al sur" (every compass word is masculine) */
const moving = (heading?: number) => (heading !== undefined && COMPASS[heading] ? `, rumbo al ${COMPASS[heading]}` : '')

const es: CardMessages = {
  // ── The headline ──────────────────────────────────────────────────────────────────────────────────────────────────
  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut))],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [`${subject(sat)} observó`, accent(place, ...stop(cut))],
    likely: (sat: SatName, place: string, cut: boolean): Rich => withTail(`${subject(sat)} cubrió`, 'con su franja', place, cut),
    could: (sat: SatName, place: string, cut: boolean): Rich => withTail(`${subject(sat)} tuvo`, 'a su alcance', place, cut),
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${subject(sat)} sobrevoló`, accent(place, ...stop(cut))],
  },
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut, ' esta semana.'))],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────
  photos: (count: number, atLeast: boolean) =>
    count <= 0
      ? 'No se publicó ninguna imagen.'
      : atLeast
        ? f.plural(count, {
            one: `Se publicó al menos ${f.int(count)} imagen.`,
            many: `Se publicaron al menos ${f.int(count)} imágenes.`,
            other: `Se publicaron al menos ${f.int(count)} imágenes.`,
          })
        : f.plural(count, {
            one: `Se publicó ${f.int(count)} imagen.`,
            many: `Se publicaron ${f.int(count)} imágenes.`,
            other: `Se publicaron ${f.int(count)} imágenes.`,
          }),
  archiveDown: 'Los archivos de imágenes no respondieron, así que por ahora no podemos contar las imágenes públicas.',
  archiveDownShort: 'Los archivos de imágenes no respondieron.',
  cloud: {
    only: {
      sub: (_pct: number) => 'Nublado. Solo vio nubes.',
      chip: (pct: number) => `Nublado · ${f.int(pct)}%`,
      post: (_pct: number) => 'Solo vio nubes.',
      desc: (pct: number) => `Solo vio nubes (${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `Casi todo nubes: el ${f.int(pct)}% de la escena.`,
      chip: (pct: number) => `Casi todo nubes · ${f.int(pct)}%`,
      post: (pct: number) => `Vio casi solo nubes (${f.int(pct)}%).`,
      desc: (pct: number) => `Vio casi solo nubes (${f.int(pct)}%).`,
    },
    spot: {
      sub: 'Nubes sobre el punto exacto.',
      chip: 'Nubes en el punto',
      post: 'Las nubes cubrían el punto exacto.',
      desc: 'Las nubes cubrían el punto exacto.',
    },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────
  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  weekTo: (ms: number, timeZone: string) => `7 días al ${dayYear(ms, timeZone)}`,
  lastWeek: 'Últimos 7 días',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────
  readout: {
    altitude: 'Altitud',
    elevation: 'Elevación',
    speed: 'Velocidad',
    offNadir: 'Fuera de nadir',
    pixel: 'Píxel',
    mosaicPixel: 'Píxel mosaico',
    closest: 'Más cerca',
  },
  lane: { imaged: 'Imagen', likely: 'Probable', could: 'Posible', overhead: 'De paso' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────
  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${f.int(km * 1000)} m`),
  geometry: 'Geometría · norte arriba',
  note: {
    imageInApp: 'La imagen se abre en la app',
    imageUnavailable: 'Imagen no disponible ahora',
    commercial: 'Archivo comercial, no público',
    inSwath: 'En la franja, sin imagen pública aún',
    groundTrack: 'Traza terrestre en el punto más cercano',
  },
  acquiring: 'Captando…',
  noPublicPhoto: 'Ninguna imagen pública esta semana',
  noPhoto: 'Sin imagen que mostrar',
  // The week card's lead chip (mono, top left) must end before the picture's scale chip: *Más cercana · Sentinel-2C ·
  // 10 m* (32) does, where *Vista más cercana* (38 with the same tail) ran into it. The gallery keeps *Vista más
  // cercana*.
  look: {
    closest: 'Más cercana',
    lastClear: 'Última sin nubes',
    clouded: 'Nublado',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: 'Un satélite',
  invite: 'Mira qué te observó',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────
  hero: [['Algo'], ['te observó ', accent('a ti')], ['esta semana.']] as Rich[],
  enterAnyPlace: 'Busca cualquier lugar',
  defaultPlace: 'Palm Jumeirah',
  defaultAlt:
    'Una foto real del satélite Sentinel-2 de Palm Jumeirah, Dubái, junto a la frase: Algo te observó esta semana. Busca cualquier lugar de la Tierra.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────
  page: {
    title: 'Algo te observó esta semana.',
    description:
      'Busca cualquier lugar de la Tierra. Mira todos los satélites que lo sobrevolaron en los últimos 7 días y las imágenes reales que tomaron.',
    placeTitle: (place: string) => `Qué satélites observaron ${place} esta semana`,
    placeDescription: (place: string) =>
      `Todos los satélites que pasaron sobre ${place} en los últimos 7 días y las imágenes reales que tomaron. ¿Qué te observó esta semana?`,
    opening: ['Abriendo ', accent('Watched')] as Rich,
  },
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) =>
    `${subject(o.sat)} pasó${o.altitudeKm !== undefined ? ` a ${f.int(o.altitudeKm)} km de altura` : ''} sobre ${o.place}${at(o.when)}${moving(o.heading)}.`,
  withinView: (o: PassFacts) => `${subject(o.sat)} tuvo ${o.place} a su alcance${at(o.when)}${moving(o.heading)}.`,
  couldHave: 'Pudo haber apuntado aquí. Su operador no dice si lo hizo.',
  straightDown: 'Miraba directamente hacia abajo.',
  offNadir: (deg: number) => `Miraba a ${f.dec(deg, 1)}° de la vertical.`,
  cloudCover: (pct: number) => `Nubosidad: ${f.int(pct)}%.`,
  inSwath: (place: string) => `Su franja cubrió ${place}.`,
  bestFrom: {
    closest: (sat: SatName) => `La vista más cercana es de ${ofSat(sat)}.`,
    lastClear: (sat: SatName) => `La última vista despejada es de ${ofSat(sat)}.`,
    first: (sat: SatName) => `La primera imagen es de ${ofSat(sat)}.`,
  },
  question: '¿Qué te observó esta semana?',
  cardAlt: {
    withPhoto: (sat: SatName) => `La tarjeta para compartir, con la imagen más cercana de la semana, de ${ofSat(sat)}.`,
    plain: 'La tarjeta para compartir.',
  },
}

export default es
