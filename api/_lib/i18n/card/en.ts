/**
 * English copy for the share card and the share page: every word the card prints (the DOM preview in the share sheet,
 * the PNG people save, the Open Graph card X / iMessage / Slack unfurl) and every word the server writes around it
 * (the share page's title, description and image alt, the unfurl of an address-bar link, the default card).
 *
 * Pure TypeScript with no DOM or Node APIs, like cardSpec.ts: the serverless functions read it through
 * cardMessages(locale) (./index.ts), with the locale passed in (the server has no runtime store); the app's card
 * builders do the same, and src/i18n/en/card.ts registers it as the app's 'card' namespace. A translation is
 * api/_lib/i18n/card/<locale>.ts, typed `CardMessages` (./index.ts).
 *
 * Why it is shaped this way:
 *  - One card, three renderers: they print exactly these words, so the sharer previews what their followers see. The
 *    card is in the SHARER's language (the app's language when they shared; a link carries it as `l=`), and so are the
 *    share page's title and description that unfurl beside it.
 *  - The headline is rich parts laid out as blocks, in the order a message returns them: each text part is a block in
 *    the condensed display face (up to three lines), the accent part (the place, with whatever words sit on its line)
 *    a block in the serif. So a language can put the place first, last or between two text blocks. The same parts,
 *    joined with a space (nothing in Chinese and Japanese), are the share page's title.
 *  - Names are inserted as they come, never inflected: the place as the visitor's geocoder or the offline list named
 *    it (an example chip or a Surprise me pick by its English name, as its links and stored share name it), the
 *    satellite as its operator names it ("Sentinel-2C", "ISS (ZARYA)", "NORAD 60989"). Each language writes frames that
 *    stay grammatical around an uninflected name.
 *  - A satellite can be nameless (an old share that kept neither its name nor its NORAD id, a picture whose platform
 *    is unknown): a sentence then gets `sat` undefined and says "a satellite" itself, in the form that sentence needs
 *    (subject, object, after a preposition). Only the mono chips and the plan plate's callout print `aSatellite`.
 *  - Dates arrive as numbers: `ms` (epoch ms) and `timeZone`, the place's IANA zone; format them at that zone
 *    (formatDate in api/_lib/i18n/dates.ts). English keeps its hand-made house form ("Sun 1 Nov 2026"), a port of the
 *    results' localParts (spec.test.ts holds the two equal). The 24-hour clock ("11:21") and the zone ("EST", "UTC+9")
 *    are international and arrive formatted.
 *  - Counts arrive as numbers: say them with fmt(locale).plural and fmt(locale).int (every plural form the language has).
 *    Decimals go through `decimal` (English rounds as JavaScript's toFixed always has; a translation uses
 *    fmt(locale).dec, which writes its own decimal sign).
 *  - Mono labels (chips over the picture, the stamp, readout labels and units, the footer) are stored in sentence case:
 *    each renderer uppercases them in the card's language, except the units ("10 m", "1 km", "km/s" stay lowercase:
 *    ../units.ts). They are single lines that never wrap and are never cut: keep them about as short as the English.
 *  - The licence credits ("Contains modified Copernicus Sentinel data 2026", "Landsat: USGS / NASA") stay in English
 *    as the data policies word them: they are in cardSpec.ts, not here. Satellite, sensor and agency names, NORAD ids,
 *    the brand ("Watched.") and www.watched.earth are never translated.
 */
import { fmt } from '../format.js'
import { accent, type Rich } from '../parts.js'

const en = fmt('en')

// ── English's hand-made days ("Sun 1 Nov 2026", "3 Nov"), at the place's zone ──────────────────────────────────────
// en-GB fields with English month names, as src/ui/results/lib/time.ts localParts reads them.

const PARTS_OPTS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
}
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dtfs = new Map<string, Intl.DateTimeFormat>()

function dayFields(ms: number, timeZone: string): { weekday: string; day: number; month: string; year: number } {
  let f = dtfs.get(timeZone)
  if (!f) {
    try {
      f = new Intl.DateTimeFormat('en-GB', { ...PARTS_OPTS, timeZone })
    } catch {
      f = new Intl.DateTimeFormat('en-GB', { ...PARTS_OPTS, timeZone: 'UTC' })
    }
    dtfs.set(timeZone, f)
  }
  const ps = f.formatToParts(ms)
  const get = (t: Intl.DateTimeFormatPartTypes) => ps.find((p) => p.type === t)?.value ?? ''
  return { weekday: get('weekday').slice(0, 3), day: Number(get('day')), month: MONTHS[Number(get('month')) - 1] ?? '', year: Number(get('year')) }
}

/** "Sun 1 Nov" at the place: English's house day (the results' fmtLocalDay), also the post text's (src/i18n/en/share.ts). */
export function enDay(ms: number, timeZone: string): string {
  const d = dayFields(ms, timeZone)
  return `${d.weekday} ${d.day} ${d.month}`
}
/** "Sun 1 Nov 2026": the card is the one place a human date carries the year. */
const dayYear = (ms: number, timeZone: string) => `${enDay(ms, timeZone)} ${dayFields(ms, timeZone).year}`
/** "3 Nov" */
const dayMonth = (ms: number, timeZone: string) => {
  const d = dayFields(ms, timeZone)
  return `${d.day} ${d.month}`
}

// ── Pieces the English sentences share ──────────────────────────────────────────────────────────────────────────────

/** "31 satellites watched" / "1 satellite watched" / "No satellite we track watched" (the results headline's N) */
const watched = (n: number) =>
  n > 0 ? en.plural(n, { one: `${en.int(n)} satellite watched`, other: `${en.int(n)} satellites watched` }) : 'No satellite we track watched'
/** The full stop after the place, unless the place was cut short ("…." reads as a typo). */
const stop = (cut: boolean, tail = '.') => (cut ? [] : [tail])

/** When a pass was closest, at the place: the instant and the zone, plus the 24-hour clock and zone name already formatted. */
export interface CardWhen {
  ms: number
  /** The place's IANA zone */
  timeZone: string
  /** "11:21" (24-hour, international) */
  clock: string
  /** "EST", "CET", "UTC+9" (international) */
  zone: string
}

/** A pass in the share page's description: who, where, and what else is known (each part may be missing). */
export interface PassFacts {
  /** The satellite's name as its operator writes it ("Sentinel-2C", "NORAD 60989"); undefined when it has none */
  sat?: string
  place: string
  when?: CardWhen
  /** Its heading as a compass point: 0 north, 1 northeast, 2 east, … 7 northwest */
  heading?: number
}

/**
 * A nameless satellite in an English sentence: "A satellite", capital A wherever it falls, as English has always
 * printed it (a translation writes the words each of its sentences needs instead).
 */
const A_SATELLITE = 'A satellite'
/** A satellite's name as its operator writes it, or undefined when it has none (the sentence says "a satellite") */
export type SatName = string | undefined
const named = (sat: SatName) => sat ?? A_SATELLITE

const COMPASS = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest']
const at = (w?: CardWhen) => (w ? ` at ${w.clock} ${w.zone} on ${dayYear(w.ms, w.timeZone)}` : '')
const moving = (heading?: number) => (heading !== undefined ? `, moving ${COMPASS[heading] ?? ''}` : '')

const card = {
  // ── The headline (rich: text blocks in the condensed face, the accent block in the serif) ─────────────────────────

  /**
   * A pass card's headline (and its share page's title) when the week's count is known: how many satellites watched
   * the place this week (at least 1), and the place. `cut`: the place was cut short and ends with "…" (English then
   * drops its full stop). Blocks in your order; the accent holds the place and any words that sit on its line, and
   * all of them count toward its two serif lines (the card's type size steps down to fit them), except a last part
   * that is only punctuation: keep a closing full stop as its own part, as English does. The lead must wrap to at most
   * three short lines in a 466 px column (about 24 characters at the largest size).
   */
  headline: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut))],
  /**
   * The same headline for an older share that never stored the week's count: the satellite's own sentence, by what it
   * did. `sat` is its name, or undefined when the share kept none (say "a satellite" as this sentence needs it); same
   * blocks, `place` and `cut` as `headline`.
   */
  headlineBy: {
    /** It took the picture: "Sentinel-2C watched | Waterloo." */
    imaged: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} watched`, accent(place, ...stop(cut))],
    /** The place was inside its camera's swath, no public picture yet */
    likely: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} swept over`, accent(place, ...stop(cut))],
    /** A commercial satellite that could have pointed its camera here */
    could: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} passed within view of`, accent(place, ...stop(cut))],
    /** It passed over, no camera pointed here */
    overhead: (sat: SatName, place: string, cut: boolean): Rich => [`${named(sat)} passed over`, accent(place, ...stop(cut))],
  },
  /**
   * The week's card (the summary share): how many satellites watched the place this week (0 or more), and the place,
   * then "this week". Also the summary's page title and its post's first sentence (there with `cut` false). The words
   * on the place's line count toward its two lines.
   */
  headlineWeek: (satellites: number, place: string, cut: boolean): Rich => [watched(satellites), accent(place, ...stop(cut, ' this week.'))],

  // ── The line under the headline ───────────────────────────────────────────────────────────────────────────────────

  /**
   * How many images were made public this week (photos, weather mosaics and radar images alike: always "images").
   * `atLeast`: the archives were still answering, so the count is a floor. One line of the card (24 px sans).
   */
  photos: (count: number, atLeast: boolean) =>
    count <= 0
      ? 'No images were made public.'
      : atLeast
        ? en.plural(count, { one: `At least ${en.int(count)} image was made public.`, other: `At least ${en.int(count)} images were made public.` })
        : en.plural(count, { one: `${en.int(count)} image was made public.`, other: `${en.int(count)} images were made public.` }),
  /** The image archives did not answer, so there is no count: the share page and the post */
  archiveDown: 'The image archives didn’t answer, so we can’t count the public images right now.',
  /** The same on the card, where it has one line */
  archiveDownShort: 'The image archives didn’t answer.',
  /**
   * A clouded picture, said the same way everywhere (share R2SH3). `pct` is the scene's cloud cover, a whole number.
   * Each case has four channels: `sub` the card's line under the headline (one line), `chip` the warn chip over the
   * picture (mono caps, short), `post` the sentence in the post after "…from 795 km up on…", `desc` the share page's.
   */
  cloud: {
    /** 90 % of the scene or more: it saw only cloud */
    only: {
      sub: (_pct: number) => 'Clouded over. It saw only cloud.',
      chip: (pct: number) => `Clouded over · ${en.int(pct)}%`,
      post: (_pct: number) => 'It saw only cloud.',
      desc: (pct: number) => `It saw only cloud (${en.int(pct)}%).`,
    },
    /** 70–89 % of the scene */
    mostly: {
      sub: (pct: number) => `Mostly cloud: ${en.int(pct)}% of the scene.`,
      chip: (pct: number) => `Mostly cloud · ${en.int(pct)}%`,
      post: (pct: number) => `It saw mostly cloud (${en.int(pct)}%).`,
      desc: (pct: number) => `It saw mostly cloud (${en.int(pct)}%).`,
    },
    /** The scene is clearer, but the place's own pixel is cloud */
    spot: { sub: 'Cloud over the spot itself.', chip: 'Cloud over the spot', post: 'Cloud covered the spot.', desc: 'Cloud covered the spot.' },
  },

  // ── The top row ───────────────────────────────────────────────────────────────────────────────────────────────────

  /**
   * A pass card's stamp, top right beside the wordmark: the day with its year, then the time at the place. `clock`
   * and `zone` arrive formatted ("11:21", "EST"). Mono caps, one line of about 26 characters.
   */
  stamp: (ms: number, timeZone: string, clock: string, zone: string) => `${dayYear(ms, timeZone)} · ${clock} ${zone}`,
  /** The week's card stamp: the seven days ending on this day (its year included). Mono caps, one line */
  weekTo: (ms: number, timeZone: string) => `7 days to ${dayYear(ms, timeZone)}`,
  /** The same when the day is unknown, and the default card's stamp. Mono caps */
  lastWeek: 'Last 7 days',

  // ── Readouts (mono caps labels over mono numbers, in columns 155 px wide, or 116 px for the week's four) ──────────

  readout: {
    /** The satellite's height above the ground */
    altitude: 'Altitude',
    /** How high it stood in the sky seen from the place, in degrees */
    elevation: 'Elevation',
    /** Its ground speed, km/s */
    speed: 'Speed',
    /** How far from straight down its camera was looking, in degrees (remote-sensing term) */
    offNadir: 'Off-nadir',
    /** The size of one pixel on the ground */
    pixel: 'Pixel',
    /** The same for a daily weather mosaic, whose pixel is a resampled grid (the longest label: about 12 characters) */
    mosaicPixel: 'Mosaic pixel',
    /** The closest distance between its ground track and the place */
    closest: 'Closest',
  },
  /** The week's card: the four counts, by what each pass did (the results' lane names). About 8 characters at most */
  lane: { imaged: 'Image', likely: 'Likely', could: 'Could', overhead: 'Overhead' },
  /**
   * Units after a readout's number (mono, smaller, never in capitals). Keep the symbols unless your readers write them
   * otherwise
   */
  unit: { km: 'km', m: 'm', kmPerSecond: 'km/s' },
  /** A number with fixed decimals: readouts ("7.46" km/s, "5.3"°), small pixels ("0.31 m"). Use fmt(locale).dec */
  decimal: (n: number, digits: number) => n.toFixed(digits),

  // ── Over the picture (mono caps chips: one line, never cut) ─────────────────────────────────────────────────────

  /** The size of one pixel on the ground, in the chips: "10 m", "0.31 m", "2 km" (`metres` is a number) */
  pixelSize: (metres: number) => (metres >= 1000 ? `${en.int(metres / 1000)} km` : `${metres < 1 ? metres.toFixed(2) : en.int(metres)} m`),
  /** A distance in the pass geometry: the satellite's altitude beside it, its closest distance to the place */
  distance: (km: number) => `${en.int(km)} km`,
  /** The scale bar's length: a round number (1, 2 or 5 × 10ⁿ), in km from 1 km, else in metres */
  scale: (km: number) => (km >= 1 ? `${km} km` : `${Math.round(km * 1000)} m`),
  /** Top left of the drawing shown when there is no picture: the pass to scale, north up */
  geometry: 'Pass geometry · north up',
  /** Bottom left of that drawing: why there is no picture */
  note: {
    /** It took a picture the card can't cut out: the app shows it */
    imageInApp: 'Image opens in the app',
    /** It took a picture, but the archive didn't send it just now */
    imageUnavailable: 'Image unavailable right now',
    /** A commercial satellite: its pictures are not public */
    commercial: 'Commercial archive, not public',
    /** The place was inside its camera's swath; no public picture yet */
    inSwath: 'In swath, no public image yet',
    /** It passed over: the drawing shows its ground track at closest approach */
    groundTrack: 'Ground track at closest approach',
  },
  /** The share sheet's preview only, while the picture loads (in place of the note) */
  acquiring: 'Acquiring…',
  /** The week's card with no picture, when no image was made public this week */
  noPublicPhoto: 'No public photo this week',
  /** …and when there is a count but no picture to show (or the archives didn't answer) */
  noPhoto: 'No photo to show',
  /**
   * The week's card chip names why its picture leads, as the results gallery tags it, then " · " and the satellite and
   * pixel size: "Closest look · Sentinel-2B · 10 m".
   */
  look: {
    /** The closest clear look of the week */
    closest: 'Closest look',
    /** The last clear look from before the week (every photo of the week was clouded): its day follows */
    lastClear: 'Last clear look',
    /** Every photo was clouded: the least cloudy one */
    clouded: 'Clouded over',
    /** A radar image (no photo this week): an image, never a photo */
    radar: 'Radar',
  },
  /** The last clear look's day in that chip: "3 Nov" (mono caps, short) */
  lookDay: (ms: number, timeZone: string) => dayMonth(ms, timeZone),
  /**
   * A satellite whose name is unknown, as a label on its own: the mono chips over the picture ("Closest look · A
   * satellite · 10 m") and the plan plate's callout beside its dot. Sentences never insert it (they say it themselves)
   */
  aSatellite: A_SATELLITE,
  /** The footer's invitation back to the site (mono caps, beside www.watched.earth in a 466 px row) */
  invite: 'See what watched you',

  // ── The default card (the root link's unfurl) ────────────────────────────────────────────────────────────────────

  /**
   * The hero, in explicit lines (the card never re-wraps them): each part is set as its own word, and parts with a
   * space at their boundary get a word gap (so put spaces where words meet; parts that touch stay together). The
   * accent ("you") is the serif in signal orange. The widest line is ~445 of the 466 px column at 88 px.
   */
  hero: [['Something'], ['watched ', accent('you')], ['this week.']] as Rich[],
  /** The default card's footer (mono caps, beside www.watched.earth) */
  enterAnyPlace: 'Enter any place on Earth',
  /** The default card's picture, named in its chip: Palm Jumeirah, the artificial island in Dubai (use your exonym) */
  defaultPlace: 'Palm Jumeirah',
  /** The default card's image description (og:image:alt; index.html carries the same words) */
  defaultAlt:
    'A real Sentinel-2 satellite photograph of Palm Jumeirah, Dubai, beside the line: Something watched you this week. Enter any place on Earth.',

  // ── The share page (the unfurl's title and description, and the page people see for a moment) ─────────────────────

  page: {
    /** Title of the generic page (the root link, a missing share) */
    title: 'Something watched you this week.',
    /** Its description */
    description: 'Enter any place on Earth. See every satellite that passed over it in the last 7 days, and the actual pictures they took.',
    /** Title of an address-bar link to a place (no full stop: it reads as a heading) */
    placeTitle: (place: string) => `What watched ${place} this week`,
    /** Its description */
    placeDescription: (place: string) =>
      `Every satellite that passed over ${place} in the last 7 days, and the actual pictures they took. What watched you this week?`,
    /** The line people see while the page hands them to the app: the accent is the link, around the brand "Watched" (never translated) */
    opening: ['Opening ', accent('Watched')] as Rich,
  },
  /**
   * A pass page's description, first sentence, for a satellite that took a picture, swept over the place or passed
   * over it. English "crossed 795 km above" / "passed over" (`altitudeKm` may be missing), then when and which way it
   * was heading, when known. `o.sat` undefined: a nameless satellite (say "a satellite" as the subject here).
   */
  crossed: (o: PassFacts & { verdict: 'imaged' | 'likely' | 'overhead'; altitudeKm?: number }) =>
    `${named(o.sat)} ${o.verdict === 'overhead' ? 'passed' : 'crossed'}${o.altitudeKm !== undefined ? ` ${Math.round(o.altitudeKm)} km above` : ' over'} ${o.place}${at(o.when)}${moving(o.heading)}.`,
  /** …for a commercial satellite that could have pointed its camera here */
  withinView: (o: PassFacts) => `${named(o.sat)} passed within view of ${o.place}${at(o.when)}${moving(o.heading)}.`,
  /** Follows `withinView`: honest about what we don't know */
  couldHave: "It could have pointed here. Its operator doesn't say whether it did.",
  /** It took the picture looking (almost) straight down */
  straightDown: 'It was looking straight down.',
  /** …or this many degrees off nadir (one decimal) */
  offNadir: (deg: number) => `It was looking ${deg.toFixed(1)}° off nadir.`,
  /** The picture's cloud cover, when it isn't clouded over (`pct`: a whole number) */
  cloudCover: (pct: number) => `Cloud cover: ${en.int(pct)}%.`,
  /** The place was inside its camera's swath */
  inSwath: (place: string) => `${place} was inside its swath.`,
  /**
   * The week's page: which image leads its card, and from which satellite (`sat` undefined: it has no name, say "a
   * satellite" as the object of this sentence)
   */
  bestFrom: {
    closest: (sat: SatName) => `The closest look is from ${named(sat)}.`,
    lastClear: (sat: SatName) => `The last clear look is from ${named(sat)}.`,
    /** Any other first image (clouded, radar, untagged) */
    first: (sat: SatName) => `The first image is from ${named(sat)}.`,
  },
  /** Every description ends on this question, which brings the reader in */
  question: 'What watched you this week?',
  /** The week's card, described for its image alt (og:image:alt) after its title */
  cardAlt: {
    /** The card has a picture: from its satellite (`sat` undefined: it has no name, say "a satellite" here) */
    withPhoto: (sat: SatName) => `The share card, with the week’s closest photo, from ${named(sat)}.`,
    /** The card has no picture */
    plain: 'The share card.',
  },
}

export default card
