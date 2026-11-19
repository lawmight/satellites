/**
 * Italian copy for the share card and the share page (see ./en.ts for where each message shows, its slots and its
 * constraints; docs/i18n/it.md §3.1, §3.3 and §3.5 are the authority on every line here).
 *
 * Pure TypeScript with no DOM, Node or src/ imports, like ./en.ts: the server reads it through cardMessages('it'), and
 * the app's Italian bundle lists this same module as its 'card' namespace.
 *
 * Why it reads this way:
 *  - The headline leads with the results headline's words, the verb inside each plural form: *1 satellite ha
 *    osservato* / *256 satelliti hanno osservato* / *1.000.000 di satelliti hanno osservato*; zero is its own
 *    sentence, *Nessun satellite che seguiamo ha osservato*. The place is the serif block, the bare object of a
 *    transitive verb, so no article, contraction or agreement is ever needed (§5.1). A no-break space holds the
 *    auxiliary to its participle (*hanno osservato*), so the card's lead breaks as *256 satelliti* / *hanno osservato*,
 *    never *256 satelliti hanno* / *osservato*.
 *  - A satellite's name is the bare subject of an *avere* perfect or an imperfetto (*ha osservato*, *ha inquadrato*,
 *    *aveva a portata*, *ha sorvolato*, *guardava*), never *essere* + participle, never an article; after a preposition
 *    only a simple one (*di Sentinel-2B*). A nameless satellite is written by each sentence: *Un satellite* as a
 *    subject, *un satellite* after *di* (§5.2).
 *  - Dates are Intl `it` at the place's zone: readouts as Intl prints them (*dom 1 nov 2026*, *3 nov*), sentences in
 *    full with the weekday and no article (*domenica 1 novembre 2026 alle 11:21 EST*); the first of the month is *1*
 *    (§5.5, §6). Compass words in prose are Italian, after *verso* (*verso nord-ovest*).
 *  - Numbers come from fmt('it') (decimal comma, *12.847*, *1715*), tied to their units by a no-break space in
 *    sentences. Card strings never use →, ≈ or ±, which the bundled card fonts lack: the week's stamp says *fino a*.
 */
import { fmt } from '../format.js'
import { dateFormat } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('it')

// ── Days at the place's zone (Intl `it`) ────────────────────────────────────────────────────────────────────────────

/**
 * Intl's parts of a day at the place, joined by single spaces (*dom 1 nov 2026*, *domenica 1 novembre 2026*). Some ICU
 * data ends an abbreviation with a full stop; the stamps have none (§6), as the app's dates have none.
 */
function day(ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions): string {
  return dateFormat('it', timeZone, opts)
    .formatToParts(ms)
    .filter((p) => p.type !== 'literal')
    .map((p) => p.value.replace(/\.$/, ''))
    .join(' ')
}
/** *dom 1 nov 2026*: the stamps (a readout, uppercased by the renderers) */
const dayYear = (ms: number, timeZone: string) => day(ms, timeZone, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
/** *3 nov* */
const dayMonth = (ms: number, timeZone: string) => day(ms, timeZone, { day: 'numeric', month: 'short' })
/** *domenica 1 novembre 2026*: a day in a sentence (a weekday takes no article) */
const proseDay = (ms: number, timeZone: string) => day(ms, timeZone, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** *256 satelliti hanno osservato* / *1 satellite ha osservato* / *Nessun satellite che seguiamo ha osservato* */
const watched = (n: number) =>
  n > 0
    ? f.plural(n, {
        one: `${f.int(n)} satellite ha osservato`,
        many: `${f.int(n)} di satelliti hanno osservato`,
        other: `${f.int(n)} satelliti hanno osservato`,
      })
    : 'Nessun satellite che seguiamo ha osservato'
/**
 * What closes the place's serif block: the full stop (or `tail`), unless the place was cut short ("…." reads as a
 * typo), and no second stop after a name that already ends on one (*Washington, D.C.*).
 */
const stop = (cut: boolean, place: string, tail = '.') => (cut || (tail === '.' && /[.…]$/u.test(place)) ? [] : [tail])

/** A nameless satellite as a subject (and the chips' label), and after a preposition */
const A_SATELLITE = 'Un satellite'
const named = (sat: SatName) => sat ?? A_SATELLITE
const ofNamed = (sat: SatName) => sat ?? 'un satellite'

/** *a 795 km di quota* */
const altitude = (km: number) => `a ${f.int(Math.round(km))} km di quota`
/** Moving that way, after *verso*: 0 north … 7 northwest (compass words are lowercase, hyphenated) */
const COMPASS = ['nord', 'nord-est', 'est', 'sud-est', 'sud', 'sud-ovest', 'ovest', 'nord-ovest']
/** " domenica 1 novembre 2026 alle 11:21 EST", with its leading space (nothing when the moment is unknown) */
const at = (w?: CardWhen) => (w ? ` ${proseDay(w.ms, w.timeZone)} alle ${w.clock} ${w.zone}` : '')
/** *, verso sud* (verbless movement, §2; nothing when the heading is unknown) */
const moving = (heading?: number) => {
  const dir = heading !== undefined ? COMPASS[heading] : undefined
  return dir ? `, verso ${dir}` : ''
}

const card: CardMessages = {
  // ── The headline ──────────────────────────────────────────────────────────────────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut, place))],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} ha osservato`, accent(place, ...stop(cut, place))],
    // *inquadrare*: the place was in frame, nothing said about a published picture (§3.5)
    likely: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} ha inquadrato`, accent(place, ...stop(cut, place))],
    // *avere a portata*: in reach, nothing said about whether it looked (never *avere in vista*)
    could: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} aveva a portata`, accent(place, ...stop(cut, place))],
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} ha sorvolato`, accent(place, ...stop(cut, place))],
  },
  // The words on the place's line count toward its two serif lines: long names step the type down a size (§3.5).
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [
    watched(satellites),
    accent(place, ...stop(cut, place, ' questa settimana.')),
  ],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  // The card's headline already says the week, so zero has no *questa settimana* (§3.3). *almeno* comes and goes
  // after the verb without changing another word, as on the results screen.
  photos: (count: number, atLeast: boolean) => {
    if (count <= 0) return 'Nessuna immagine è stata pubblicata.'
    const n = f.int(count)
    const least = atLeast ? 'almeno ' : ''
    return f.plural(count, {
      one: `È stata pubblicata ${least}${n} immagine.`,
      many: `Sono state pubblicate ${least}${n} di immagini.`,
      other: `Sono state pubblicate ${least}${n} immagini.`,
    })
  },
  archiveDown: 'Gli archivi delle immagini non hanno risposto: per ora non possiamo contare le immagini pubbliche.',
  archiveDownShort: 'Gli archivi delle immagini non hanno risposto.',
  // The cloud ladder (§3.5, §4): *Coperto* only for "Clouded over", *Molto nuvoloso* for "Mostly cloud".
  cloud: {
    only: {
      sub: (_pct: number) => 'Coperto. Ha visto solo nuvole.',
      chip: (pct: number) => `Coperto · ${f.int(pct)}%`,
      post: (_pct: number) => 'Ha visto solo nuvole.',
      desc: (pct: number) => `Ha visto solo nuvole (${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `Molto nuvoloso: ${f.int(pct)}% della scena.`,
      chip: (pct: number) => `Molto nuvoloso · ${f.int(pct)}%`,
      post: (pct: number) => `Ha visto soprattutto nuvole (${f.int(pct)}%).`,
      desc: (pct: number) => `Ha visto soprattutto nuvole (${f.int(pct)}%).`,
    },
    spot: { sub: 'Nuvole proprio sul punto.', chip: 'Nuvole sul punto', post: 'Le nuvole coprivano il punto.', desc: 'Le nuvole coprivano il punto.' },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  // 30 characters, about 285 of the ~340 px beside the wordmark; no → on the card (§3.5)
  weekTo: (ms: number, timeZone: string) => `7 giorni fino a ${dayYear(ms, timeZone)}`,
  lastWeek: 'Ultimi 7 giorni',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'Quota',
    elevation: 'Elevazione',
    speed: 'Velocità',
    offNadir: 'Off-nadir',
    pixel: 'Pixel',
    mosaicPixel: 'Pixel mosaico',
    closest: 'Più vicino',
  },
  lane: { imaged: 'Immagine', likely: 'Probabile', could: 'Possibile', overhead: 'In cielo' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) =>
    metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`,
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${f.int(km * 1000)} m`),
  // Top left of the 630 px plan plate, beside the scale bar's chip (from x ≈ 369): *Geometria del passaggio · nord in
  // alto* ran into it (to x ≈ 407); this ends where English does (x ≈ 274). The pass view's section is *Geometria* too.
  geometry: 'Geometria · nord in alto',
  note: {
    imageInApp: 'L’immagine è nell’app',
    imageUnavailable: 'Immagine non disponibile ora',
    commercial: 'Archivio commerciale, non pubblico',
    // *ancora* keeps English's "yet": a picture may still be published (the bottom right corner is free, x ≈ 483).
    inSwath: 'Nella fascia, ancora nessuna immagine pubblica',
    groundTrack: 'Traccia al suolo al massimo avvicinamento',
  },
  acquiring: 'Acquisizione…',
  noPublicPhoto: 'Nessuna foto pubblica questa settimana',
  noPhoto: 'Nessuna foto da mostrare',
  // The week card's lead chip (14 px mono, top left) ends before the picture's scale chip: the glossary's short
  // *Più vicina* (to x ≈ 363 with Sentinel-2B · 10 m), where *Ripresa più vicina* ran into it (x ≈ 445 against 436);
  // *Ultima limpida* likewise (the English length; *Ultima ripresa limpida* is 7 characters longer, before a day).
  look: {
    closest: 'Più vicina',
    lastClear: 'Ultima limpida',
    clouded: 'Coperto',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: A_SATELLITE,
  // *ti* can only be the object here; *Guarda cosa…* would read "look what you did" (§3.1)
  invite: 'Vedi cosa ti ha osservato',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // Five lines at 88 px: *questa settimana* alone is wider than the 466 px column; the widest line is *ha osservato*
  // (about 365 px), and *te.* alone, in the serif, ends the card (§3.1).
  hero: [['Qualcosa'], ['questa'], ['settimana'], ['ha osservato'], [accent('te'), '.']] as Rich[],
  enterAnyPlace: 'Scegli un luogo sulla Terra',
  defaultPlace: 'Palm Jumeirah',
  defaultAlt:
    'Una vera foto di Palm Jumeirah, a Dubai, ripresa da Sentinel-2, accanto alla frase: Qualcosa, questa settimana, ha osservato te. Scegli un luogo sulla Terra.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Qualcosa, questa settimana, ha osservato te.',
    description:
      'Scegli un luogo qualsiasi sulla Terra. Vedi tutti i satelliti che l’hanno sorvolato negli ultimi 7 giorni, e le immagini vere che hanno ripreso.',
    // The plural verb fixes the place as the object: *Cosa ha osservato Waterloo* reads "what did Waterloo observe" (§5.1)
    placeTitle: (place: string) => `I satelliti che hanno osservato ${place} questa settimana`,
    placeDescription: (place: string) =>
      `Tutti i satelliti che hanno sorvolato ${place} negli ultimi 7 giorni, e le immagini vere che hanno ripreso. Cosa ti ha osservato questa settimana?`,
    opening: ['Apertura di ', accent('Watched')] as Rich,
  },
  // *ha sorvolato* for all three kinds: Italian has no gender-free "crossed above [PLACE]" without a preposition before
  // the place, and both English verbs mean flying over it (§3.5).
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) =>
    `${named(o.sat)} ha sorvolato ${o.place}${o.altitudeKm !== undefined ? ` ${altitude(o.altitudeKm)}` : ''}${at(o.when)}${moving(o.heading)}.`,
  withinView: (o: PassFacts) => `${named(o.sat)} aveva a portata ${o.place}${at(o.when)}${moving(o.heading)}.`,
  couldHave: 'Poteva puntare qui. Il suo operatore non dice se l’ha fatto.',
  straightDown: 'Guardava dritto verso il basso.',
  offNadir: (deg: number) => `Guardava a ${f.dec(deg, 1)}° dalla verticale.`,
  cloudCover: (pct: number) => `Copertura nuvolosa: ${f.int(pct)}%.`,
  // Never the place as a sentence-initial subject (*Waterloo era nella sua fascia*, §5.1 rule 4)
  inSwath: (place: string) => `La sua fascia comprendeva ${place}.`,
  bestFrom: {
    closest: (sat: SatName) => `La ripresa più vicina è di ${ofNamed(sat)}.`,
    lastClear: (sat: SatName) => `L’ultima ripresa limpida è di ${ofNamed(sat)}.`,
    first: (sat: SatName) => `La prima immagine è di ${ofNamed(sat)}.`,
  },
  question: 'Cosa ti ha osservato questa settimana?',
  cardAlt: {
    withPhoto: (sat: SatName) => `L’anteprima, con la foto più vicina della settimana, di ${ofNamed(sat)}.`,
    plain: 'L’anteprima.',
  },
}

export default card
