/**
 * Dutch copy for the share card and the share page (see docs/i18n/nl.md §3.1, §3.2, §3.3, §3.5, §3.6, §5, §6, §7):
 * every word the card prints and every word the server writes around it. Pure TypeScript, no DOM, Node or src/
 * imports: the server reads it through cardMessages('nl'), and the app's nl bundle lists this very module.
 *
 * Why it is built this way:
 *  - Dutch cannot inflect an inserted name either, but it never needs to: the place stands after a preposition that
 *    takes any name (`naar`, `over`, `van`) or as the object of `had … binnen bereik`, with no article, and a sentence
 *    never opens on it (`De plek lag binnen de opnamestrook.`). In the headline the place is the serif accent at the
 *    end, where Dutch sentence stress falls; its closing full stop is its own part.
 *  - The count phrase is number + noun + verb (`31 satellieten keken naar`), with `keek` / `keken` agreeing with the
 *    category; zero is its own sentence with the comma Dutch puts between two finite verbs (`Geen satelliet die we
 *    volgen, keek …`). On the week's card `deze week` sits in the lead, before `naar`, never after the place (§3.6).
 *  - The could-verdict's verb wraps the place (`had *Waterloo* binnen bereik.`): a text block after the accent.
 *  - The satellite is the bare subject, singular verb, no pronoun back to it: the second sentence makes the camera the
 *    subject. A nameless satellite is written out as each sentence needs it: `Een satelliet` as the subject,
 *    `een satelliet` after `van` / `door`.
 *  - Dates come from Intl's parts at the place's zone: short in mono (`zo 1 nov 2026`, `3 nov`), in full and lowercase
 *    in prose (`op zondag 1 november 2026 om 11:21 EST`). A trailing full stop some ICU versions put after a short
 *    weekday or month is dropped. `t/m` (inclusive) in the week stamp, the one sanctioned abbreviation (§6).
 *  - Mono labels are sentence case; each renderer uppercases them in Dutch (`MOZAÏEKPIXEL` keeps its trema).
 */
import { fmt } from '../format.js'
import { dateFormat } from '../dates.js'
import { accent, type Rich } from '../parts.js'
import type { CardMessages, CardWhen, PassFacts, SatName } from './index.js'

const f = fmt('nl')

// ── Days at the place, from Intl's parts ────────────────────────────────────────────────────────────────────────────

const SHORT_DAY: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
const LONG_DAY: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }

function dayParts(ms: number, timeZone: string, opts: Intl.DateTimeFormatOptions) {
  const parts = dateFormat('nl', timeZone, opts).formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => (parts.find((p) => p.type === t)?.value ?? '').replace(/\.$/, '')
  return { weekday: get('weekday'), day: get('day'), month: get('month'), year: get('year') }
}
/** "zo 1 nov 2026": the card is the one place a short date carries the year */
const dayYear = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone, SHORT_DAY)
  return `${d.weekday} ${d.day} ${d.month} ${d.year}`
}
/** "3 nov" */
const dayMonth = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone, SHORT_DAY)
  return `${d.day} ${d.month}`
}
/** "zondag 1 november 2026" (prose: in full, lowercase, no comma) */
const dateProse = (ms: number, timeZone: string) => {
  const d = dayParts(ms, timeZone, LONG_DAY)
  return `${d.weekday} ${d.day} ${d.month} ${d.year}`
}

// ── Pieces the sentences share ──────────────────────────────────────────────────────────────────────────────────────

/** "31 satellieten keken" / "1 satelliet keek" / "Geen satelliet die we volgen, keek", then `rest` ("naar") */
const watched = (n: number, rest: string) =>
  n > 0
    ? f.plural(n, { one: `${f.int(n)} satelliet keek ${rest}`, other: `${f.int(n)} satellieten keken ${rest}` })
    : `Geen satelliet die we volgen, keek ${rest}`
/** The full stop after the place, unless it was cut short ("…." reads as a typo) or already ends on one ("D.C.") */
const stop = (cut: boolean, place: string) => (cut || /[.…!?]$/u.test(place) ? [] : ['.'])
/** The headline's serif block: the place and its full stop */
const head = (place: string, cut: boolean) => accent(place, ...stop(cut, place))
/** A prose sentence's closing full stop after the place, unless the name already ends on one */
const end = (s: string) => (/[.…!?]$/u.test(s) ? s : `${s}.`)

/** A nameless satellite as the subject ("Een satelliet keek …") */
const Sat = (s: SatName) => s ?? 'Een satelliet'
/** …and after a preposition ("… is van een satelliet.") */
const sat = (s: SatName) => s ?? 'een satelliet'

/** Prose compass nouns, 0 north … 7 northwest: `naar het zuiden` */
const COMPASS = ['noorden', 'noordoosten', 'oosten', 'zuidoosten', 'zuiden', 'zuidwesten', 'westen', 'noordwesten']
const dir = (heading?: number) => (heading !== undefined ? COMPASS[heading] : undefined)
/** " op zondag 1 november 2026 om 11:21 EST" */
const at = (w?: CardWhen) => (w ? ` op ${dateProse(w.ms, w.timeZone)} om ${w.clock} ${w.zone}` : '')

const nl: CardMessages = {
  // ── The headline: the lead in the condensed face, the place last in the serif ─────────────────────────────────────

  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites, 'naar'), head(place, cut)],
  headlineBy: {
    imaged: (s: SatName, place: string, cut: boolean): Rich => [`${Sat(s)} keek naar`, head(place, cut)],
    likely: (s: SatName, place: string, cut: boolean): Rich => [`${Sat(s)} streek over`, head(place, cut)],
    // The verb wraps the place: its full stop follows `bereik`, so a cut place needs no change.
    could: (s: SatName, place: string, _cut: boolean): Rich => [`${Sat(s)} had`, accent(place), 'binnen bereik.'],
    overhead: (s: SatName, place: string, cut: boolean): Rich => [`${Sat(s)} vloog over`, head(place, cut)],
  },
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites, 'deze week naar'), head(place, cut)],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  // The verb agrees with the count (`is` / `zijn`); `Minstens` is the only hedge. The card gives this one line of its
  // 466 px column at 24 px, and `Minstens 29 beelden zijn openbaar gemaakt.` is already 490 px, so the partial form
  // says the state without `gemaakt` (`Minstens 1.715 beelden zijn openbaar.`, 412 px). A card never settles in place,
  // so the two forms never share a screen.
  photos: (count: number, atLeast: boolean) =>
    count <= 0
      ? 'Er zijn geen beelden openbaar gemaakt.'
      : atLeast
        ? f.plural(count, { one: `Minstens ${f.int(count)} beeld is openbaar.`, other: `Minstens ${f.int(count)} beelden zijn openbaar.` })
        : f.plural(count, { one: `${f.int(count)} beeld is openbaar gemaakt.`, other: `${f.int(count)} beelden zijn openbaar gemaakt.` }),
  archiveDown: 'De beeldarchieven reageerden niet, dus we kunnen de openbare beelden nu niet tellen.',
  archiveDownShort: 'De beeldarchieven reageerden niet.',
  cloud: {
    only: {
      // One line under the headline: the warn chip over the picture already says `Dichtbewolkt · 92%`, and with it in
      // front the line is 483 px of the 466 px column.
      sub: (_pct: number) => 'De camera zag alleen wolken.',
      chip: (pct: number) => `Dichtbewolkt · ${f.int(pct)}%`,
      post: (_pct: number) => 'De camera zag alleen wolken.',
      desc: (pct: number) => `De camera zag alleen wolken (${f.int(pct)}%).`,
    },
    mostly: {
      sub: (pct: number) => `Vooral wolken: ${f.int(pct)}% van de opname.`,
      chip: (pct: number) => `Vooral wolken · ${f.int(pct)}%`,
      post: (pct: number) => `De camera zag vooral wolken (${f.int(pct)}%).`,
      desc: (pct: number) => `De camera zag vooral wolken (${f.int(pct)}%).`,
    },
    spot: {
      sub: 'Bewolking precies boven de plek.',
      chip: 'Wolk boven de plek',
      post: 'Er lag een wolk boven de plek.',
      desc: 'Er lag een wolk boven de plek.',
    },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  // `t/m` (inclusive): `tot` alone reads as "up to, not including" the day.
  weekTo: (ms: number, timeZone: string) => `7 dagen t/m ${dayYear(ms, timeZone)}`,
  lastWeek: 'Afgelopen 7 dagen',

  // ── Readouts ──────────────────────────────────────────────────────────────────────────────────────────────────────

  readout: {
    altitude: 'Hoogte',
    elevation: 'Elevatie',
    speed: 'Snelheid',
    offNadir: 'Nadirhoek',
    pixel: 'Pixel',
    mosaicPixel: 'Mozaïekpixel',
    closest: 'Dichtstbij',
  },
  // Each lane is the noun of its prose verb; `Beeld`, not `Foto`: the lane holds radar images and mosaics too.
  lane: { imaged: 'Beeld', likely: 'Strook', could: 'Bereik', overhead: 'Hemel' },
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  decimal: (n: number, digits: number) => f.dec(n, digits),

  // ── Over the picture ──────────────────────────────────────────────────────────────────────────────────────────────

  pixelSize: (metres: number) => (metres >= 1000 ? `${f.int(metres / 1000)} km` : `${metres < 1 ? f.dec(metres, 2) : f.int(metres)} m`),
  distance: (km: number) => `${f.int(km)} km`,
  scale: (km: number) => (km >= 1 ? `${f.int(km)} km` : `${Math.round(km * 1000)} m`),
  geometry: 'Geometrie · noorden boven',
  note: {
    imageInApp: 'Beeld opent in de app',
    imageUnavailable: 'Beeld nu niet beschikbaar',
    commercial: 'Commercieel archief, niet openbaar',
    inSwath: 'In strook, nog geen openbaar beeld',
    groundTrack: 'Grondspoor bij dichtste nadering',
  },
  acquiring: 'Ophalen…',
  noPublicPhoto: 'Deze week geen openbaar beeld',
  noPhoto: 'Geen beeld om te tonen',
  look: {
    // The most zoomed-in clear photo, not the nearest pass: never `Dichtstbij` here.
    closest: 'Scherpst',
    lastClear: 'Laatst helder',
    clouded: 'Dichtbewolkt',
    radar: 'Radar',
  },
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  aSatellite: 'Een satelliet',
  invite: 'Wat keek er naar jou?',

  // ── The default card ──────────────────────────────────────────────────────────────────────────────────────────────

  // One sentence over three lines; the accent is the stressed `jou` at its end, the full stop outside it.
  hero: [['Iets keek'], ['deze week'], ['naar ', accent('jou'), '.']] as Rich[],
  enterAnyPlace: 'Kies een plek op aarde',
  defaultPlace: 'Palm Jumeirah',
  defaultAlt:
    'Een echte satellietfoto van Sentinel-2 van Palm Jumeirah, Dubai, naast de regel: Iets keek deze week naar jou. Kies een plek op aarde.',

  // ── The share page ────────────────────────────────────────────────────────────────────────────────────────────────

  page: {
    title: 'Iets keek deze week naar jou.',
    description:
      'Kies een plek op aarde. Je ziet welke satellieten er de afgelopen 7 dagen overheen vlogen, en de echte beelden die ze maakten.',
    placeTitle: (place: string) => `Wat keek er deze week naar ${place}`,
    placeDescription: (place: string) =>
      `Alle satellieten die de afgelopen 7 dagen over ${place} vlogen, en de echte beelden die ze maakten. Wat keek er deze week naar jou?`,
    opening: [accent('Watched'), ' wordt geopend'] as Rich,
  },
  // `vloog … over [PLACE]` for all three verdicts: when, then how high, then the place, then the heading.
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) => {
    const d = dir(o.heading)
    const lead = `${Sat(o.sat)} vloog${at(o.when)}${o.altitudeKm !== undefined ? ` op ${f.int(o.altitudeKm)} km hoogte` : ''} over ${o.place}`
    return d ? `${lead}, naar het ${d}.` : end(lead)
  },
  withinView: (o: PassFacts) => {
    const d = dir(o.heading)
    return `${Sat(o.sat)} had ${o.place}${at(o.when)} binnen bereik${d ? ` en vloog naar het ${d}` : ''}.`
  },
  couldHave: 'De camera kon hierheen kijken. De exploitant zegt niet of dat ook gebeurd is.',
  straightDown: 'De camera keek recht naar beneden.',
  // `schuin` is measured from straight down; never `onder een hoek van`, which readers measure from the horizontal.
  offNadir: (deg: number) => `De camera keek ${f.dec(deg, 1)}° schuin naar beneden.`,
  cloudCover: (pct: number) => `Bewolking: ${f.int(pct)}%.`,
  // Never opens on the place (a name can begin with ’s or a lowercase particle): it is `de plek`.
  inSwath: (_place: string) => 'De plek lag binnen de opnamestrook.',
  bestFrom: {
    closest: (s: SatName) => `Het scherpste beeld is van ${sat(s)}.`,
    lastClear: (s: SatName) => `De laatste heldere opname is van ${sat(s)}.`,
    first: (s: SatName) => `Het eerste beeld is van ${sat(s)}.`,
  },
  question: 'Wat keek er deze week naar jou?',
  cardAlt: {
    withPhoto: (s: SatName) => `De deelkaart, met het scherpste beeld van de week, gemaakt door ${sat(s)}.`,
    plain: 'De deelkaart.',
  },
}

export default nl
