/**
 * English copy for the About page ("How this works", src/ui/pages/AboutPage.tsx): every heading, paragraph, fact,
 * credit and key. The copy is the owner's: short, plain, second person, no em dashes. Its own chunk, like the page.
 *
 * Paragraphs with a link or a mono number are rich parts, so a translation orders the whole sentence itself:
 *   'text'               plain text
 *   { link: [...] }      the paragraph's one link (the page knows where it goes: CelesTrak, or the maker on X)
 *   num('16,893')        a number set in the mono face
 * Nothing else in a paragraph is styled. The verdict names and their one-line definitions are the results'
 * vocabulary (the 'verdicts' namespace, ./verdicts.ts), shown here as they are there; verdictMore adds the About page's
 * longer word after each.
 *
 * Left in English on purpose, in the page itself: the data licences' attribution lines (Copernicus, EUMETSAT, USGS),
 * product and agency names, the maker's handle, the version, and key symbols (/ ↑ ↓ ← → F + − 0 ?).
 */
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import { ns } from '../ns'

const en = fmt('en')

/** A paragraph's one link: the page supplies where it goes. */
export interface LinkPart {
  link: Part[]
}
/** A part of an About paragraph: text, a mono number, or the paragraph's link. */
export type AboutPart = Part | LinkPart

const link = (...parts: Part[]): LinkPart => ({ link: parts })

/** A question or term (mono caps) and its answer. */
interface Fact {
  term: string
  text: string
}

export default ns('about', {
  /** The bar at the top: the wordmark, then "/ About" */
  bar: 'About',
  /** The close button's text and accessible name; its key cap is keyNames.esc */
  close: 'Close',
  /** The section index on the left (aria only) */
  sectionsLabel: 'Sections',
  /**
   * The title, one phrase as display lines (each wipes in): "How this / works." The accent (the serif) goes on one
   * word, the one that means "works" or carries the phrase; keep the full stop outside it if your language allows.
   */
  title: [['How this'], [accent('works'), '.']] as Rich[],
  /** Under the title */
  lede: 'Pick a spot on Earth. We work out which satellites flew over it in the last week, then go find the photos they took. It all runs in your browser, on public data.',

  /** Section headings: in the index and over each section (keep them short: the index is a narrow column) */
  sections: {
    short: 'The short version',
    method: 'How we find the passes',
    words: 'What the labels mean',
    accuracy: 'What we can’t see',
    privacy: 'Privacy',
    credits: 'Credits',
    keys: 'Keyboard',
  },

  /** 00 · The short version */
  short: {
    live: {
      term: 'Is it live?',
      text: 'Not quite. Photos land in the archives a few hours to a couple of days after they’re taken, so the newest passes might not have one yet.',
    },
    seeMe: { term: 'Can it see me?', text: 'No. At best a pixel here is 10 m across. A car is one pixel. You’re not in it.' },
    every: {
      term: 'Is this every satellite?',
      text: 'No. Military and spy satellites mostly aren’t in public catalogs, and companies don’t say where they point their cameras.',
    },
  } satisfies Record<string, Fact>,

  /** 01 · How we find the passes */
  method: {
    /** The first paragraph; its link is CelesTrak's page (keep the name) */
    orbits: [
      'Every object in orbit has a public set of numbers that describes its path. ',
      link('CelesTrak'),
      ' publishes them from US Space Force tracking, and we grab a fresh copy every six hours.',
    ] as AboutPart[],
    /**
     * Added to that paragraph once the catalog is in: how many objects this page loaded (mono) and when they were
     * fetched (`stamp`, an ISO time, "2026-11-08 03:34Z", mono: keep it as it is).
     */
    loaded: (count: number, stamp: string): AboutPart[] => [
      'This page loaded ',
      num(en.int(count)),
      ` ${en.plural(count, { one: 'object', other: 'objects' })}, fetched `,
      num(stamp),
      '.',
    ],
    sgp4: 'We run each satellite through SGP4, the standard orbit model, for the past seven days and note every time your spot was inside what it could see.',
    facts: {
      straightDown: {
        term: 'Straight down',
        text: 'Sentinel-2 and Landsat look straight down at a strip of ground, about 290 km wide for Sentinel-2 and 185 km for Landsat. You have to be in the strip.',
      },
      /** Quotes the verdict name "Could have pointed here" (results vocabulary): use your translation of it, in your quotation marks */
      tilting: {
        term: 'Tilting cameras',
        text: 'Lots of commercial satellites can lean 30 to 45 degrees. If you were in reach, we call it “could have pointed here”.',
      },
      daylight: { term: 'Daylight', text: 'Regular cameras need the sun. A pass in the dark never counts as a photo.' },
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 doesn’t need the sun. It sends out microwaves and records the echo, so it sees through cloud and at night, looking off to one side of its track. Its images are public too, so we show them, in grey: bright is rough ground and buildings, dark is calm water.',
      },
      weather: {
        term: 'Weather satellites',
        text: 'A few sit over the equator and watch half the planet every 10 minutes. If you’re on their side of Earth, you’re in every frame.',
      },
    } satisfies Record<string, Fact>,
    archives:
      'Then we search the image archives (Microsoft Planetary Computer, Element 84 and NASA) and match each image to the pass that took it. Every image you see is the real one, cropped around your spot.',
    photoFacts: {
      touchUps: {
        term: 'Touch-ups',
        text: 'Sentinel-2 and Landsat photos are colour-balanced, smoothed and lightly sharpened for your screen, the same way across the whole picture. Nothing is added or removed.',
      },
      /** "N arrow": the photo viewer's north arrow, labelled N */
      whichWayUp: {
        term: 'Which way is up',
        text: 'Sentinel-2 and Landsat photos keep the archive’s own map grid for your place, so north can sit a few degrees off straight up. When you open a photo, its N arrow shows exactly where.',
      },
    } satisfies Record<string, Fact>,
  },

  /**
   * 02 · What the labels mean: said after each verdict's one-sentence definition (results vocabulary, shown above it),
   * as the next sentence. "could" refers back to that definition ("…doesn’t say whether it looked. There’s no way to
   * know if it actually did."). Empty: nothing more.
   */
  verdictMore: {
    imaged: 'If we show it, it’s the actual photo.',
    likely: 'The photo isn’t public yet, or it got tossed because of clouds.',
    could: 'There’s no way to know if it actually did.',
    overhead: '',
  },

  /** 03 · What we can’t see */
  accuracy: {
    positions: {
      term: 'Exact positions',
      text: 'Public orbit data is good to about a kilometre and drifts a little each day. Times can be off by a few seconds.',
    },
    secret: { term: 'Secret satellites', text: 'Some of the best cameras in orbit belong to militaries. They don’t show up here.' },
    clouds: {
      term: 'Clouds',
      text: 'Plenty of photos are just cloud. When the archive tells us, we check the exact pixel over your spot and say so.',
    },
    delays: { term: 'Delays', text: 'Photos can take a day or two to show up.' },
  } satisfies Record<string, Fact>,

  /** 04 · Privacy (what is kept and who sees what: translate exactly, promise nothing more or less) */
  privacy: {
    where: { term: 'Where it runs', text: 'The orbit maths happens in your browser.' },
    kept: {
      term: 'What we keep',
      text: 'We count searches by town and a rough 10 km area, never your exact spot, and keep a tally of what gets opened and shared. No IP addresses, no cookies of our own, nothing that ties one visit to the next.',
    },
    others: {
      term: 'Who else sees it',
      text: 'Most place names come from a list built into the site. Other searches go to Open-Meteo, Photon or Nominatim. Photos load straight from the archives. Our host counts page views and speed, without cookies, and may set one security cookie to tell people from bots. We never read it.',
    },
    links: {
      term: 'Share links',
      text: 'Only made when you share something. Anyone with the link sees the place name, a spot rounded to about 1 km, and the pass you picked.',
    },
  } satisfies Record<string, Fact>,

  /** 05 · Credits: a label (mono caps) and a line. Keep every product, agency, licence and person's name as it is */
  credits: {
    /** `handle` is the maker's X handle ("@armaangupt0", the link); "Armaan" is his name */
    madeBy: { who: 'Made by', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' on X'] },
    gibs: 'Imagery from NASA’s GIBS, part of EOSDIS. GOES via NOAA and CIRA, Himawari via JMA.',
    archives: {
      who: 'Archives',
      text: 'Microsoft Planetary Computer and Element 84 Earth Search; Landsat’s 15 m band from the Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Orbits', text: 'Element sets from CelesTrak. SGP4 by satellite.js.' },
    /** Keep "© OpenStreetMap contributors (ODbL)" in the form OpenStreetMap's attribution guidelines give for your language (or as it is) */
    placeNames: { who: 'Place names', text: 'Photon by komoot. Map data © OpenStreetMap contributors (ODbL).' },
    textures: { who: 'Earth textures', text: 'Solar System Scope (CC BY 4.0), from NASA Blue Marble and Black Marble.' },
    /** The typefaces (names as they are) */
    type: { who: 'Type', text: 'Instrument Sans and Serif by Instrument, Martian Mono by Evil Martians (SIL OFL).' },
  },

  /** 06 · Keyboard (desktops only): what each key does */
  keys: {
    search: 'Search for a place',
    suggestions: 'Move through suggestions',
    choose: 'Choose',
    passes: 'Step through passes',
    photos: 'Previous / next photo',
    expand: 'Expand the photo',
    zoom: 'Zoom (when expanded)',
    play: 'Play or pause the replay',
    back: 'Back, or close',
    help: 'This page',
  },
  /** Key caps with names (mono caps in a small box): use the name printed on keyboards in your language */
  keyNames: { enter: 'Enter', space: 'Space', esc: 'Esc' },

  /** The page's foot: "Built by @armaangupt0" (the handle is the link) */
  builtBy: (handle: string): AboutPart[] => ['Built by ', link(handle)],
  footerNote: 'Made from public data. We didn’t take any of these photos.',
})
