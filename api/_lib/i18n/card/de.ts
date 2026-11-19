/**
 * German copy for the share card and the share page (see ./en.ts for where each message shows, its slots and its
 * constraints; docs/i18n/de.md §3.1, §3.2, §3.5 and §5 are the authority on every line here).
 *
 * Pure TypeScript with no DOM, Node or src/ imports, like ./en.ts: the server reads it through cardMessages('de'), and
 * the app's German bundle lists this same module as its 'card' namespace.
 *
 * Why it reads this way:
 *  - The headline lead is complete before the place: Präteritum with the verb inside each plural form (*256 Satelliten
 *    beobachteten*, *1 Satellit beobachtete*, *Kein uns bekannter Satellit beobachtete*), and the place is the serif
 *    block after it, as the accusative object of an unmistakably nominative subject (de.md §5.1). Pass leads are
 *    *beobachtete*, *erfasste vermutlich*, *kam in Sichtweite von*, *überflog*: nothing verbal ever falls into the
 *    serif tail. The closing full stop is its own part, and is dropped when the place was cut or already ends on one.
 *  - Names stay bare. A curated place that German writes with an article takes it from one table (./deNames.ts), as
 *    plain text in the lead, never in the serif: *7 Satelliten beobachteten den* | *Central Park.* A satellite is the
 *    bare subject, singular verb, no pronoun after it: the second sentence makes *die Kamera* or *der Betreiber* the
 *    subject. A nameless satellite is written by each sentence: *Ein Satellit* as the subject, *einem Satelliten* after
 *    *von*. In page sentences (not headline leads) a crewed station is *Die Raumstation ISS*.
 *  - Dates come from CLDR `de` at the place's zone: numeric in mono (*So 01.11.2026*, *03.11.*), Intl's short form in
 *    prose (*am So., 1. Nov. 2026, um 11:21 MEZ*, with both commas). Every zone goes through zoneDe (CET → MEZ). No
 *    *Uhr* beside a zone (§5.5).
 *  - Numbers come from fmt('de'): decimal comma, a dot from four digits, a no-break space before every unit and before
 *    % (*25 %*). Card text never holds →, ≈, U+2009, U+202F or a soft hyphen, which the card fonts lack (§6.7).
 */
import { fmt } from '../format.js'
import { dateFormat, formatDate } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'
import { zoneDe } from './deZone.js'
import { accDe, subjectDe, vonDe } from './deNames.js'

const f = fmt('de')
/** "25 %" (U+00A0 before the sign, as Intl `de` writes it) */
const pct = (n: number) => `${f.int(n)}\u00a0%`

// ── Days at the place's zone (CLDR `de`) ────────────────────────────────────────────────────────────────────────────

const NUMERIC_DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }

/** "So 01.11.2026": the mono stamp, Intl's 2-digit parts with the weekday's full stop dropped */
function stampDay(ms: number, timeZone: string): string {
  const parts = dateFormat('de', timeZone, NUMERIC_DAY).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('weekday').replace(/\.$/, '')} ${get('day')}.${get('month')}.${get('year')}`
}
/** "03.11." */
const dayMonth = (ms: number, timeZone: string) => formatDate('de', ms, timeZone, { day: '2-digit', month: '2-digit' })
/** "So., 1. Nov. 2026": a day in a sentence of the page's description */
const proseDay = (ms: number, timeZone: string) =>
  formatDate('de', ms, timeZone, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** "256 Satelliten beobachteten" / "1 Satellit beobachtete" / "Kein uns bekannter Satellit beobachtete" */
const watched = (n: number) =>
  n > 0
    ? f.plural(n, { one: `${f.int(n)} Satellit beobachtete`, other: `${f.int(n)} Satelliten beobachteten` })
    : 'Kein uns bekannter Satellit beobachtete'
/** The lead, then the curated article if the place takes one: "… beobachteten den" */
const lead = (words: string, place: string) => {
  const article = accDe(place).trimEnd()
  return article ? `${words} ${article}` : words
}
/** Ends on a full stop, a cut or a mark already: "D.C." takes no second one */
const closed = (s: string) => /[.…!?]$/u.test(s)
/** The serif block: the place, then its tail, unless the place was cut short ("…." reads as a typo) */
const head = (place: string, cut: boolean, tail = '.') => accent(place, ...(cut ? [] : closed(place) && tail === '.' ? [] : [tail]))
/** A prose sentence's full stop, unless it already ends on one */
const end = (s: string) => (closed(s) ? s : `${s}.`)

/** A nameless satellite as the subject (and the chips' label), and after *von* (dative) */
const A_SATELLITE = 'Ein Satellit'
const Sat = (sat: SatName) => sat ?? A_SATELLITE
const fromSat = (sat: SatName) => sat ?? 'einem Satelliten'

/** Prose compass nouns after *Richtung*, 0 north … 7 northwest (de.md §4.2) */
const COMPASS = ['Norden', 'Nordosten', 'Osten', 'Südosten', 'Süden', 'Südwesten', 'Westen', 'Nordwesten']
/** ", Richtung Süden" (nothing when the heading is unknown) */
const heading = (h?: number) => {
  const noun = h !== undefined ? COMPASS[h] : undefined
  return noun ? `, Richtung ${noun}` : ''
}
/** " am So., 1. Nov. 2026, um 11:21 MEZ" (nothing when the moment is unknown) */
const at = (w?: CardWhen) => (w ? ` am ${proseDay(w.ms, w.timeZone)}, um ${w.clock} ${zoneDe(w.zone)}` : '')

const de: CardMessages = {
  // ── The headline ──────────────────────────────────────────────────────────────────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [lead(watched(satellites), place), head(place, cut)],
  headlineBy: {
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [lead(`${Sat(sat)} beobachtete`, place), head(place, cut)],
    likely: (sat: SatName, place: string, cut: boolean): Rich => [lead(`${Sat(sat)} erfasste vermutlich`, place), head(place, cut)],
    // *von* becomes *vom*, *von der* or *der* for a curated place (deNames.ts).
    could: (sat: SatName, place: string, cut: boolean): Rich => [`${Sat(sat)} kam in Sichtweite ${vonDe(place)}`, head(place, cut)],
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [lead(`${Sat(sat)} überflog`, place), head(place, cut)],
  },
  // A name comes before the time adverb in German order: *beobachteten Waterloo diese Woche.*
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [lead(watched(satellites), place), head(place, cut, ' diese Woche.')],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  // The headline already says *diese Woche*, so zero says only what happened (de.md §3.5). One line of the 466 px
  // column at 24 px: *Mindestens 1.715 Bilder wurden veröffentlicht.* is 505 px, so the partial plural says *sind
  // öffentlich* (423 px for 1.715, 456 for 123.456), still a whole sentence; the partial singular fits as it is (426).
  photos: (count: number, atLeast: boolean) =>
    count <= 0
      ? 'Es wurden keine Bilder veröffentlicht.'
      : atLeast
        ? f.plural(count, { one: `Mindestens ${f.int(count)} Bild wurde veröffentlicht.`, other: `Mindestens ${f.int(count)} Bilder sind öffentlich.` })
        : f.plural(count, { one: `${f.int(count)} Bild wurde veröffentlicht.`, other: `${f.int(count)} Bilder wurden veröffentlicht.` }),
  archiveDown: 'Die Bildarchive haben nicht geantwortet, darum können wir die öffentlichen Bilder gerade nicht zählen.',
  archiveDownShort: 'Die Bildarchive haben nicht geantwortet.',
  // The German Weather Service's words: *bedeckt* from 90 %, *stark bewölkt* below (de.md §3.5).
  cloud: {
    only: {
      sub: (_pct: number) => 'Bedeckt. Das Bild zeigt nur Wolken.',
      chip: (p: number) => `Bedeckt · ${pct(p)}`,
      post: (_pct: number) => 'Das Bild zeigt nur Wolken.',
      desc: (p: number) => `Das Bild zeigt nur Wolken (${pct(p)}).`,
    },
    mostly: {
      sub: (p: number) => `Stark bewölkt: ${pct(p)} der Szene.`,
      chip: (p: number) => `Stark bewölkt · ${pct(p)}`,
      post: (p: number) => `Das Bild zeigt überwiegend Wolken (${pct(p)}).`,
      desc: (p: number) => `Das Bild zeigt überwiegend Wolken (${pct(p)}).`,
    },
    spot: {
      sub: 'Wolken genau über dem Ort.',
      chip: 'Wolken über dem Ort',
      post: 'Wolken lagen über dem Ort.',
      desc: 'Wolken lagen über dem Ort.',
    },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${stampDay(ms, timeZone)} · ${clock}\u00a0${zoneDe(zone)}`,
  weekTo: (ms: number, timeZone: string) => `7\u00a0Tage bis ${stampDay(ms, timeZone)}`,
  lastWeek: 'Letzte 7\u00a0Tage',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'Höhe',
    elevation: 'Höhenwinkel',
    speed: 'Geschwindigkeit',
    offNadir: 'Off-Nadir',
    pixel: 'Pixel',
    mosaicPixel: 'Mosaikpixel',
    closest: 'Abstand',
  },
  // *Bild*, not *Foto*: the lane holds radar images and weather mosaics too (de.md §3.6).
  lane: { imaged: 'Bild', likely: 'Vermutlich', could: 'Möglich', overhead: 'Überflogen' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) =>
    metres >= 1000 ? `${f.int(metres / 1000)}\u00a0km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)}\u00a0m`,
  distance: (km: number) => `${f.int(km)}\u00a0km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)}\u00a0km` : `${Math.round(km * 1000)}\u00a0m`),
  geometry: 'Geometrie · Norden oben',
  note: {
    imageInApp: 'Bild öffnet sich in der App',
    imageUnavailable: 'Bild gerade nicht verfügbar',
    commercial: 'Kommerziell, nicht öffentlich',
    inSwath: 'Im Streifen, unveröffentlicht',
    groundTrack: 'Bodenspur bei größter Annäherung',
  },
  acquiring: 'Erfassung\u00a0…',
  // The stamp already names the week (de.md §3.5).
  noPublicPhoto: 'Kein öffentliches Bild',
  noPhoto: 'Kein Bild vorhanden',
  look: {
    closest: 'Aus nächster Nähe',
    lastClear: 'Letzter klarer Blick',
    clouded: 'Bedeckt',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: A_SATELLITE,
  invite: 'Was hat dich beobachtet?',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // 464 / 377 / 359 of the 466 px column (de.md §3.1): never lengthen the first line.
  hero: [['Etwas hat ', accent('dich')], ['diese Woche'], ['beobachtet.']] as Rich[],
  enterAnyPlace: 'Suche dir einen Ort aus',
  defaultPlace: 'Palm Jumeirah',
  defaultAlt:
    'Ein echtes Satellitenfoto von Sentinel-2 zeigt Palm Jumeirah in Dubai, daneben die Zeile: Etwas hat dich diese Woche beobachtet. Suche dir einen Ort aus.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Etwas hat dich diese Woche beobachtet.',
    // The landing's sub line, verbatim (de.md §3.2).
    description:
      'Gib einen beliebigen Ort auf der Erde ein. Du siehst alle Satelliten, die ihn in den letzten 7\u00a0Tagen überflogen haben, und ihre echten Bilder.',
    // *Welche Satelliten*, never *Was*: with *was* the bare name reads as the subject (de.md §5.1).
    placeTitle: (place: string) => `Welche Satelliten haben ${accDe(place)}${place} diese Woche beobachtet`,
    placeDescription: (place: string) =>
      `Alle Satelliten, die ${accDe(place)}${place} in den letzten 7\u00a0Tagen überflogen haben, und ihre echten Bilder. Was hat dich diese Woche beobachtet?`,
    opening: [accent('Watched'), ' wird geöffnet\u00a0…'] as Rich,
  },
  // Every verdict *überflog* the place, its accusative object; the moment, the altitude and the heading join when known.
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) =>
    end(
      `${o.sat !== undefined ? subjectDe(o.sat) : A_SATELLITE} überflog ${accDe(o.place)}${o.place}${at(o.when)}${
        o.altitudeKm !== undefined ? ` in ${f.int(o.altitudeKm)}\u00a0km Höhe` : ''
      }${heading(o.heading)}`,
    ),
  withinView: (o: PassFacts) =>
    end(`${o.sat !== undefined ? subjectDe(o.sat) : A_SATELLITE} kam${at(o.when)} in Sichtweite ${vonDe(o.place)} ${o.place}${heading(o.heading)}`),
  // *sie* is *die Kamera*, our own noun (de.md §5.2).
  couldHave: 'Die Kamera hätte hierher blicken können. Der Betreiber sagt nicht, ob sie es getan hat.',
  straightDown: 'Die Kamera blickte senkrecht nach unten.',
  offNadir: (deg: number) => `Die Kamera war um ${f.dec(deg, 1)}° aus der Senkrechten geneigt.`,
  cloudCover: (p: number) => `Bewölkung: ${pct(p)}.`,
  // Body prose never repeats the name: *der Ort* (de.md §5.1).
  inSwath: (_place: string) => 'Der Ort lag im Aufnahmestreifen.',
  bestFrom: {
    closest: (sat: SatName) => `Das Bild aus nächster Nähe stammt von ${fromSat(sat)}.`,
    lastClear: (sat: SatName) => `Der letzte klare Blick stammt von ${fromSat(sat)}.`,
    first: (sat: SatName) => `Das erste Bild stammt von ${fromSat(sat)}.`,
  },
  question: 'Was hat dich diese Woche beobachtet?',
  cardAlt: {
    withPhoto: (sat: SatName) => `Die Karte zum Teilen, mit dem Bild der Woche aus nächster Nähe. Es stammt von ${fromSat(sat)}.`,
    plain: 'Die Karte zum Teilen.',
  },
}

export default de
