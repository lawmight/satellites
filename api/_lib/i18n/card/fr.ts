/**
 * French copy for the share card and the share page (see ./en.ts for where each message shows, its slots and its
 * constraints; docs/i18n/fr.md §3.5 is the authority on every line here).
 *
 * Pure TypeScript with no DOM, Node or src/ imports, like ./en.ts: the server reads it through cardMessages('fr'), and
 * the app's French bundle lists this same module as its 'card' namespace.
 *
 * Why it reads this way:
 *  - The headline leads with the week's N and the product verb, *observer*, with the verb inside each plural form:
 *    *1 satellite a observé* / *256 satellites ont observé* / *1 000 000 de satellites ont observé*; zero is its own
 *    sentence, *Aucun satellite que nous suivons n’a observé* (fr.md §3.3). The place is the serif block, after a
 *    transitive verb, so no article, contraction or agreement is ever needed (§5.1).
 *  - A satellite's name is a bare subject of an *avoir* verb or the imparfait (*a survolé*, *avait … à portée*,
 *    *pouvait viser*), never *être* + participle, never *il* / *elle* after it: *son capteur*, *sa caméra*, *sa
 *    fauchée* (§1.3, §5.2). After a preposition it follows *par* (*prise par Sentinel-2C*). A nameless satellite is
 *    written by each sentence: *Un satellite* as a subject, *un satellite* after *par*.
 *  - Dates are CLDR `fr` at the place's zone: readouts as Intl prints them (*dim. 1 nov. 2026*), sentences in full with
 *    day 1 written *1er* and the day held to its month (frDate below, also the post's day in src/i18n/fr/share.ts).
 *    Clocks are 24-hour with colons (*à 11:21 EST*), the zone held to its clock by a no-break space (§5.5, §6.3).
 *  - Numbers come from fmt('fr'): decimal comma, U+202F thousands, U+00A0 before % and units (§6.2). Card strings never
 *    use →, ≈, ≤ or ±, which the bundled card fonts lack (§6.8); the U+202F that Intl puts in grouped numbers (and
 *    before ? in the page's question) is the card builders' to normalise.
 */
import { fmt } from '../format.js'
import { dateFormat, formatDate } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('fr')

// ── Days at the place's zone (CLDR `fr`) ────────────────────────────────────────────────────────────────────────────

/**
 * A date in a sentence or read aloud: Intl's parts, with day 1 written *1er* and a no-break space after the day, so
 * "1er" never ends a line without its month ("dimanche 1er novembre 2026", "22 octobre 2015"). Readouts keep Intl's
 * own form ("dim. 1 nov."), never this.
 */
export function frDate(ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions): string {
  const parts = dateFormat('fr', timeZone, opts).formatToParts(ms)
  let out = ''
  parts.forEach((p, i) => {
    if (p.type === 'day') out += p.value === '1' ? '1er' : p.value
    else if (p.type === 'literal' && p.value === ' ' && parts[i - 1]?.type === 'day') out += '\u00a0'
    else out += p.value
  })
  return out
}

/** "dim. 1 nov. 2026": the pass card's stamp (a readout: Intl's abbreviations, no *1er*) */
const stampDay = (ms: number, timeZone: string) =>
  formatDate('fr', ms, timeZone, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
/** "1 nov. 2026": the week's stamp */
const dayYear = (ms: number, timeZone: string) => formatDate('fr', ms, timeZone, { day: 'numeric', month: 'short', year: 'numeric' })
/** "3 nov." */
const dayMonth = (ms: number, timeZone: string) => formatDate('fr', ms, timeZone, { day: 'numeric', month: 'short' })
/** "dimanche 1er novembre 2026": a day in a sentence */
const proseDay = (ms: number, timeZone: string) =>
  frDate(ms, timeZone, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** "256 satellites ont observé" / "1 satellite a observé" / "Aucun satellite que nous suivons n’a observé" */
const watched = (n: number) =>
  n > 0
    ? f.plural(n, {
        one: `${f.int(n)}\u00a0satellite a\u00a0observé`,
        many: `${f.int(n)}\u00a0de satellites ont\u00a0observé`,
        other: `${f.int(n)}\u00a0satellites ont\u00a0observé`,
      })
    : 'Aucun satellite que nous suivons n’a observé'
/** The full stop after the place, unless the place was cut short ("…." reads as a typo). */
const stop = (cut: boolean, tail = '.') => (cut ? [] : [tail])

/** A nameless satellite as a subject (and the chips' label), and after *par* */
const A_SATELLITE = 'Un satellite'
const named = (sat: SatName) => sat ?? A_SATELLITE
const byNamed = (sat: SatName) => sat ?? 'un satellite'

/** Moving that way: whole phrases, so no code joins a preposition to a word (*vers l’est*, fr.md §4.2) */
const MOVING = ['vers le nord', 'vers le nord-est', 'vers l’est', 'vers le sud-est', 'vers le sud', 'vers le sud-ouest', 'vers l’ouest', 'vers le nord-ouest']
/** "le dimanche 1er novembre 2026 à 11:21 EST" */
const at = (w: CardWhen) => `le ${proseDay(w.ms, w.timeZone)} à ${w.clock}\u00a0${w.zone}`
/** ", filant vers le sud" (nothing when the heading is unknown) */
const moving = (heading?: number) => {
  const phrase = heading !== undefined ? MOVING[heading] : undefined
  return phrase ? `, filant ${phrase}` : ''
}

const card: CardMessages = {
  // ── The headline ──────────────────────────────────────────────────────────────────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut))],
  headlineBy: {
    // The auxiliary keeps to its participle (U+00A0): a bare *a* or *ont* never closes a line of the headline.
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} a\u00a0observé`, accent(place, ...stop(cut))],
    likely: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} a\u00a0balayé`, accent(place, ...stop(cut))],
    could: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} pouvait\u00a0viser`, accent(place, ...stop(cut))],
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} a\u00a0survolé`, accent(place, ...stop(cut))],
  },
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut, ' cette semaine.'))],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  // The card's headline already says the week, so zero is *Aucune image n’a été rendue publique.* (fr.md §3.3).
  photos: (count: number, atLeast: boolean) =>
    count <= 0
      ? 'Aucune image n’a été rendue publique.'
      : atLeast
        ? f.plural(count, {
            one: `Au moins ${f.int(count)}\u00a0image a été rendue publique.`,
            many: `Au moins ${f.int(count)}\u00a0d’images ont été rendues publiques.`,
            other: `Au moins ${f.int(count)}\u00a0images ont été rendues publiques.`,
          })
        : f.plural(count, {
            one: `${f.int(count)}\u00a0image a été rendue publique.`,
            many: `${f.int(count)}\u00a0d’images ont été rendues publiques.`,
            other: `${f.int(count)}\u00a0images ont été rendues publiques.`,
          }),
  archiveDown: 'Les archives d’images n’ont pas répondu\u00a0: impossible de compter les images publiques pour l’instant.',
  archiveDownShort: 'Les archives d’images n’ont pas répondu.',
  cloud: {
    only: {
      sub: (_pct: number) => 'Ciel couvert. Rien que des nuages.',
      chip: (pct: number) => `Ciel couvert · ${f.int(pct)}\u00a0%`,
      post: (_pct: number) => 'Rien que des nuages.',
      desc: (pct: number) => `Rien que des nuages (${f.int(pct)}\u00a0%).`,
    },
    mostly: {
      sub: (pct: number) => `Surtout des nuages\u00a0: ${f.int(pct)}\u00a0% de la scène.`,
      chip: (pct: number) => `Très nuageux · ${f.int(pct)}\u00a0%`,
      post: (pct: number) => `Surtout des nuages (${f.int(pct)}\u00a0%).`,
      desc: (pct: number) => `Surtout des nuages (${f.int(pct)}\u00a0%).`,
    },
    spot: {
      sub: 'Des nuages sur l’endroit même.',
      chip: 'Nuages ici',
      post: 'Des nuages couvraient l’endroit même.',
      desc: 'Des nuages couvraient l’endroit même.',
    },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${stampDay(ms, timeZone)} · ${clock}\u00a0${zone}`,
  weekTo: (ms: number, timeZone: string) => `7\u00a0jours au ${dayYear(ms, timeZone)}`,
  lastWeek: '7\u00a0derniers jours',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'Altitude',
    elevation: 'Élévation',
    speed: 'Vitesse',
    offNadir: 'Dépointage',
    pixel: 'Pixel',
    mosaicPixel: 'Pixel mosaïque',
    closest: 'Au plus près',
  },
  // Each within the 8-character lane (fr.md §3.6): IMAGE, not PHOTO, because the lane holds radar and mosaics too.
  lane: { imaged: 'Image', likely: 'Probable', could: 'Possible', overhead: 'Survol' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)}\u00a0km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)}\u00a0m`),
  distance: (km: number) => `${f.int(km)}\u00a0km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)}\u00a0km` : `${f.int(km * 1000)}\u00a0m`),
  // *du passage* dropped: the chip ran into the scale bar beside it (24 characters, as English).
  geometry: 'Géométrie · nord en haut',
  note: {
    imageInApp: 'Image dans l’application',
    imageUnavailable: 'Image indisponible pour l’instant',
    commercial: 'Archives commerciales, non publiques',
    inSwath: 'Dans la fauchée, aucune image publique',
    groundTrack: 'Trace au sol au plus près',
  },
  acquiring: 'Acquisition…',
  noPublicPhoto: 'Aucune image publique cette semaine',
  noPhoto: 'Aucune image à montrer',
  look: {
    closest: 'Vue rapprochée',
    lastClear: 'Dernière vue dégagée',
    clouded: 'Ciel couvert',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: A_SATELLITE,
  invite: 'Voir ce qui vous observait',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // 13 / 14 / 14 characters, the accent alone at the head of the middle line (fr.md §3.1).
  hero: [['Quelque chose'], [accent('vous'), ' observait'], ['cette semaine.']] as Rich[],
  // The sub's first words; *N’importe quel lieu sur Terre* (29) ran into www.watched.earth beside it.
  enterAnyPlace: 'Choisissez un lieu',
  defaultPlace: 'Palm Jumeirah',
  defaultAlt:
    'Une vraie photo Sentinel-2 de Palm Jumeirah, à Dubaï, à côté de la phrase «\u202fQuelque chose vous observait cette semaine.\u202f» Choisissez un lieu, n’importe où sur Terre.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Quelque chose vous observait cette semaine.',
    description:
      'Choisissez un lieu, n’importe où sur Terre. Vous verrez tous les satellites qui l’ont survolé ces 7\u00a0derniers jours, et les images qu’ils ont réellement prises.',
    placeTitle: (place: string) => `Ce qui a observé ${place} cette semaine`,
    placeDescription: (place: string) =>
      `Tous les satellites qui ont survolé ${place} ces 7\u00a0derniers jours, et les images qu’ils ont réellement prises. Qu’est-ce qui vous observait cette semaine\u202f?`,
    opening: ['Ouverture de ', accent('Watched')] as Rich,
  },
  // Every verdict *a survolé* the place; the altitude, the moment and the heading join only when known.
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) =>
    `${named(o.sat)} a survolé ${o.place}${o.altitudeKm !== undefined ? ` à ${f.int(o.altitudeKm)}\u00a0km d’altitude` : ''}${o.when ? `, ${at(o.when)}` : ''}${moving(o.heading)}.`,
  withinView: (o: PassFacts) => `${named(o.sat)} avait ${o.place} à portée${o.when ? ` ${at(o.when)}` : ''}${moving(o.heading)}.`,
  // *elle* is *sa caméra*, whose gender is known (fr.md §1.3).
  couldHave: 'Sa caméra aurait pu viser ici. Son opérateur ne dit pas si elle l’a fait.',
  straightDown: 'Son capteur pointait droit vers le sol.',
  offNadir: (deg: number) => `Son capteur pointait à ${f.dec(deg, 1)}° de la verticale.`,
  cloudCover: (pct: number) => `Couverture nuageuse\u00a0: ${f.int(pct)}\u00a0%.`,
  // Turned around so the place is the object (never *[PLACE] était dans sa fauchée*, fr.md §5.1).
  inSwath: (place: string) => `Sa fauchée couvrait ${place}.`,
  bestFrom: {
    closest: (sat: SatName) => `La vue rapprochée a été prise par ${byNamed(sat)}.`,
    lastClear: (sat: SatName) => `La dernière vue dégagée a été prise par ${byNamed(sat)}.`,
    first: (sat: SatName) => `La première image a été prise par ${byNamed(sat)}.`,
  },
  question: 'Qu’est-ce qui vous observait cette semaine\u202f?',
  cardAlt: {
    withPhoto: (sat: SatName) => `La carte de partage, avec la vue rapprochée de la semaine, prise par ${byNamed(sat)}.`,
    plain: 'La carte de partage.',
  },
}

export default card
