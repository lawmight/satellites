/**
 * Brazilian Portuguese copy for the share card and the share page (see ./en.ts for where each line shows and its
 * constraints; docs/i18n/pt-BR.md §3.6 is the authority on every line here). Pure TypeScript, no DOM, Node or src/
 * imports: the server reads it too.
 *
 * Why it reads this way:
 *  - The headline is the results headline (*7 satélites observaram* | *Waterloo.*), the verb inside the count's plural,
 *    and the zero case its own sentence (*Nenhum satélite que rastreamos observou*). The per-verdict headlines of old
 *    shares use the verdicts' verbs (*observou*, *cobriu*, *teve … ao alcance*, *sobrevoou*; never *varrer* with a
 *    place, pt-BR.md §3.4); *ao alcance* sits in the accent, on the place's serif line, and stays there when the place
 *    was cut short (*teve Rio Grande do… ao alcance*, no full stop), as the guide has it.
 *  - The place is a bare direct object or follows *sobre*: no article, no *de / em / a / por* before it, never a
 *    subject (§5). A satellite is bare as a subject and *do satélite {sat}* after a preposition, so no article ever
 *    lands on its name; a nameless one is *Um satélite* / *de um satélite*, written by each sentence (only the chips and
 *    the plan plate print `aSatellite`).
 *  - Dates come from Intl `pt-BR` parts at the place's zone, never a month table: mono *dom 1 nov 2026*, *3 nov* (the
 *    abbreviation's period stripped, no *de*); prose *no domingo, 1º de novembro de 2026* (*no / na* from the weekday,
 *    *1º* for the first of the month). A clock takes *às*, or *à* when it starts 00 or 01 (§5).
 *  - The sub-line is one line of 24 px sans in the 466 px column, so a partial count says *Ao menos*: *Pelo menos 312
 *    imagens foram publicadas.* is 468 px and would leave *publicadas.* alone on a second line (shaped with the card's
 *    sans; *Ao menos 1.715 …* is 463 px).
 *  - A place link's title names the satellites (*Quais satélites observaram Waterloo esta semana*): in *O que observou
 *    Waterloo*, a name after the verb of a question reads as its subject, so Waterloo would be the one observing.
 *  - Mono labels are stored in sentence case (the renderers uppercase them); the lane words are the short verdict forms
 *    (*Imagem*, not *Foto*: the lane holds radar images and mosaics too, §3.5). *Mais perto* and *Pixel mosaico* fit the
 *    134 px a later readout column leaves; *Busque um lugar da Terra* fits the footer beside the host (§3.6).
 *  - No no-break spaces here: the canvas renderer splits words on any white space while satori keeps U+00A0 together,
 *    and the three renderers must wrap the same words alike.
 *  - Numbers through fmt('pt-BR'), decimals through its `dec` (decimal comma); `%` and `°` attached (`25%`, `5,3°`).
 */
import { fmt } from '../format.js'
import { dateFormat } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('pt-BR')

// ── Days at the place's zone, from Intl's parts ──────────────────────────────────────────────────────────────────────

/** One instant's date parts in pt-BR at a zone, without the abbreviation's period ("nov." → "nov"). */
function dateParts(ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions): (t: Intl.DateTimeFormatPartTypes) => string {
  const ps = dateFormat('pt-BR', timeZone, opts).formatToParts(ms)
  return (t) => (ps.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
}
/** "dom 1 nov 2026": the mono day with its year (Intl's own short form adds a comma and "de") */
const dayYear = (ms: number, timeZone: string) => {
  const g = dateParts(ms, timeZone, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  return `${g('weekday')} ${g('day')} ${g('month')} ${g('year')}`
}
/** "3 nov" */
const dayMonth = (ms: number, timeZone: string) => {
  const g = dateParts(ms, timeZone, { day: 'numeric', month: 'short' })
  return `${g('day')} ${g('month')}`
}
/** "no domingo, 1º de novembro de 2026", "na sexta-feira, 6 de novembro de 2026": prose, from the long parts */
const longDayYear = (ms: number, timeZone: string) => {
  const g = dateParts(ms, timeZone, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const weekday = g('weekday')
  const day = g('day')
  return `${/^(domingo|sábado)/.test(weekday) ? 'no' : 'na'} ${weekday}, ${day === '1' ? '1º' : day} de ${g('month')} de ${g('year')}`
}
/** "às 11:21", "à 01:05" */
const atClock = (clock: string) => `${parseInt(clock, 10) <= 1 ? 'à' : 'às'} ${clock}`

// ── Pieces the Portuguese sentences share ───────────────────────────────────────────────────────────────────────────

/**
 * "31 satélites observaram" / "1 satélite observou" / "Nenhum satélite que rastreamos observou" (the verb agrees with
 * the count, so it lives inside the plural)
 */
const watched = (n: number) =>
  n > 0
    ? f.plural(n, {
        one: `${f.int(n)} satélite observou`,
        many: `${f.int(n)} satélites observaram`,
        other: `${f.int(n)} satélites observaram`,
      })
    : 'Nenhum satélite que rastreamos observou'
/** The full stop after the place, unless the place was cut short ("…." reads as a typo). */
const stop = (cut: boolean, tail = '.') => (cut ? [] : [tail])
/** A sentence's subject: the satellite's name, bare, or "Um satélite" */
const subject = (sat: SatName) => sat ?? 'Um satélite'
/** After "é" / a comma: "do satélite Sentinel-2C", or "de um satélite" (the noun makes the contraction safe, §5) */
const ofSat = (sat: SatName) => (sat !== undefined ? `do satélite ${sat}` : 'de um satélite')

/** The heading table (pt-BR.md §4.3): 0 north, 1 northeast, … 7 northwest */
const COMPASS = [
  'rumo ao norte',
  'rumo ao nordeste',
  'rumo ao leste',
  'rumo ao sudeste',
  'rumo ao sul',
  'rumo ao sudoeste',
  'rumo ao oeste',
  'rumo ao noroeste',
]
/** " às 11:21 EST, no domingo, 1º de novembro de 2026" */
const at = (w?: CardWhen) => (w ? ` ${atClock(w.clock)} ${w.zone}, ${longDayYear(w.ms, w.timeZone)}` : '')
/** ", rumo ao sul" */
const moving = (heading?: number) => (heading !== undefined && COMPASS[heading] ? `, ${COMPASS[heading]}` : '')

const ptBR: CardMessages = {
  // ── The headline ──────────────────────────────────────────────────────────────────────────────────────────────────
  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut))],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [`${subject(sat)} observou`, accent(place, ...stop(cut))],
    likely: (sat: SatName, place: string, cut: boolean): Rich => [`${subject(sat)} cobriu`, accent(place, ...stop(cut))],
    could: (sat: SatName, place: string, cut: boolean): Rich => [`${subject(sat)} teve`, accent(place, ' ao alcance', ...stop(cut))],
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${subject(sat)} sobrevoou`, accent(place, ...stop(cut))],
  },
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut, ' esta semana.'))],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────
  photos: (count: number, atLeast: boolean) =>
    count <= 0
      ? 'Nenhuma imagem foi publicada.'
      : atLeast
        ? f.plural(count, {
            one: `Ao menos ${f.int(count)} imagem foi publicada.`,
            many: `Ao menos ${f.int(count)} imagens foram publicadas.`,
            other: `Ao menos ${f.int(count)} imagens foram publicadas.`,
          })
        : f.plural(count, {
            one: `${f.int(count)} imagem foi publicada.`,
            many: `${f.int(count)} imagens foram publicadas.`,
            other: `${f.int(count)} imagens foram publicadas.`,
          }),
  archiveDown: 'Os arquivos de imagens não responderam, por isso não conseguimos contar as imagens públicas agora.',
  archiveDownShort: 'Os arquivos de imagens não responderam.',
  cloud: {
    only: {
      sub: (_pct: number) => 'Céu encoberto. Só viu nuvens.',
      chip: (pct: number) => `Encoberto · ${f.int(pct)}%`,
      post: (_pct: number) => 'Só viu nuvens.',
      desc: (pct: number) => `Só viu nuvens (${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `Quase só nuvens: ${f.int(pct)}% da cena.`,
      chip: (pct: number) => `Quase só nuvens · ${f.int(pct)}%`,
      post: (pct: number) => `Viu quase só nuvens (${f.int(pct)}%).`,
      desc: (pct: number) => `Viu quase só nuvens (${f.int(pct)}%).`,
    },
    spot: {
      sub: 'Nuvem sobre o próprio ponto.',
      chip: 'Nuvem sobre o ponto',
      post: 'Nuvens cobriam o ponto.',
      desc: 'Nuvens cobriam o ponto.',
    },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────
  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  weekTo: (ms: number, timeZone: string) => `7 dias até ${dayYear(ms, timeZone)}`,
  lastWeek: 'Últimos 7 dias',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────
  readout: {
    altitude: 'Altitude',
    elevation: 'Elevação',
    speed: 'Velocidade',
    offNadir: 'Fora do nadir',
    pixel: 'Pixel',
    mosaicPixel: 'Pixel mosaico',
    closest: 'Mais perto',
  },
  lane: { imaged: 'Imagem', likely: 'Provável', could: 'Possível', overhead: 'Sobrevoo' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────
  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${f.int(km * 1000)} m`),
  geometry: 'Geometria · norte acima',
  note: {
    imageInApp: 'Imagem abre no site',
    imageUnavailable: 'Imagem indisponível agora',
    commercial: 'Arquivo comercial, não público',
    inSwath: 'Na faixa, sem imagem pública ainda',
    groundTrack: 'Traço no solo na máxima aproximação',
  },
  acquiring: 'Captando…',
  noPublicPhoto: 'Nenhuma imagem pública esta semana',
  noPhoto: 'Nenhuma imagem para mostrar',
  look: {
    closest: 'Vista mais próxima',
    lastClear: 'Última vista limpa',
    clouded: 'Encoberto',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: 'Um satélite',
  invite: 'Algo observou você também',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────
  hero: [['Algo'], ['observou ', accent('você')], ['esta semana.']] as Rich[],
  enterAnyPlace: 'Busque um lugar da Terra',
  defaultPlace: 'Palm Jumeirah',
  defaultAlt:
    'Foto real do satélite Sentinel-2: Palm Jumeirah, Dubai, ao lado da frase: Algo observou você esta semana. Busque um lugar da Terra.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────
  page: {
    title: 'Algo observou você esta semana.',
    description:
      'Busque qualquer lugar da Terra. Veja todos os satélites que passaram sobre ele nos últimos 7 dias, e as imagens reais que captaram.',
    placeTitle: (place: string) => `Quais satélites observaram ${place} esta semana`,
    placeDescription: (place: string) =>
      `Todos os satélites que passaram sobre ${place} nos últimos 7 dias, e as imagens reais que captaram. Quais satélites observaram você esta semana?`,
    opening: ['Abrindo o ', accent('Watched')] as Rich,
  },
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) =>
    `${subject(o.sat)} passou${o.altitudeKm !== undefined ? ` a ${f.int(o.altitudeKm)} km de altitude` : ''} sobre ${o.place}${at(o.when)}${moving(o.heading)}.`,
  withinView: (o: PassFacts) => `${subject(o.sat)} teve ${o.place} ao alcance${at(o.when)}${moving(o.heading)}.`,
  couldHave: 'Pode ter apontado aqui. O operador não diz se apontou.',
  straightDown: 'Olhava direto para baixo.',
  offNadir: (deg: number) => `Olhava ${f.dec(deg, 1)}° fora da vertical.`,
  cloudCover: (pct: number) => `Cobertura de nuvens: ${f.int(pct)}%.`,
  inSwath: (place: string) => `A faixa da câmera cobriu ${place}.`,
  bestFrom: {
    closest: (sat: SatName) => `A vista mais próxima é ${ofSat(sat)}.`,
    lastClear: (sat: SatName) => `A última vista limpa é ${ofSat(sat)}.`,
    first: (sat: SatName) => `A primeira imagem é ${ofSat(sat)}.`,
  },
  question: 'Quais satélites observaram você esta semana?',
  cardAlt: {
    withPhoto: (sat: SatName) => `A imagem de compartilhamento, com a vista mais próxima da semana, ${ofSat(sat)}.`,
    plain: 'A imagem de compartilhamento.',
  },
}

export default ptBR
