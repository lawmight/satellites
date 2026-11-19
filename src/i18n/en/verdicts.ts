/**
 * The ONE verdict vocabulary (DESIGN §7): every word the product uses for a pass's verdict, wherever it is said (the
 * summary's readouts, the timeline's lanes and tooltips, the pass list's groups and rows, About's terms, the share
 * sheet). Code reads it through src/ui/results/lib/meta.ts (verdictWords, VERDICT_META) or useMsgs(enVerdicts); no
 * other file spells a verdict name.
 *
 * Why one table: the four verdicts are the product's promise about what is known ("Watched": a public picture of the
 * place exists; "Likely watched": a camera that is always on crossed it, no picture published; "Could have pointed
 * here": a steerable or private camera was in range; "Passed overhead": it crossed the sky). If two screens named a
 * verdict differently, a reader would think they were two things. The engine's footnotes (engine.note.*) and About's
 * longer text quote these words: keep them in step.
 *
 * The verdict ids ('imaged', 'likely', 'could', 'overhead') are the keys, never words. Owner: user-facing copy says
 * "watched", never "photographed". Titles, short words and units are stored in sentence case; mono labels uppercase
 * them with CSS.
 */
import { fmt } from '../../../api/_lib/i18n/format'
import { ns } from '../ns'
import type { Pass } from '@/types'

const en = fmt('en')

export interface VerdictWords {
  /**
   * The verdict's name: the summary readout's label (mono caps under the count), the pass list's group title, About's
   * term, the timeline tooltip's first words. Keep it short: the summary shows the four names side by side on a phone.
   */
  title: string
  /**
   * The timeline lane's one word (mono caps, about 8 characters, before the lane's count); screens up to 1180 px wide
   * show the count alone
   */
  short: string
  /**
   * The unit after a count of passes in this verdict, in the form the count takes ("1 pass", "31 passes"): the
   * summary readouts (mono caps, beside the number), the pass list's group counts, screen-reader labels. Every verdict
   * counts passes, so the four read alike.
   */
  unit: (n: number) => string
  /** One sentence that says what the verdict means: tooltips (title=), screen readers, About's terms */
  definition: string
  /**
   * The verb in a row's spoken summary ("Sentinel-2C, watched, Friday 6 November 16:14 EST": a comma-separated
   * list read by screen readers, so it stands alone after the satellite's name)
   */
  verb: string
}

/** "1 pass", "31 passes": every verdict counts passes */
const passes = (n: number) => en.plural(n, { one: 'pass', other: 'passes' })

const verdicts: Record<Pass['verdict'], VerdictWords> = {
  /** A real image of the place is public (a photo, a weather mosaic, a radar image) */
  imaged: {
    title: 'Watched',
    /** The lane's word: "Image", not "Photo", since radar images and daily mosaics share the lane (owner, 2026-11-19) */
    short: 'Image',
    unit: passes,
    definition: 'A real image of this place exists in a public archive.',
    verb: 'watched',
  },
  /** A camera that records everything under it (Sentinel-2, Landsat, weather imagers) crossed the place, no picture published */
  likely: {
    title: 'Likely watched',
    short: 'Likely',
    unit: passes,
    /** "Swath": the strip of ground a fixed camera records as the satellite flies */
    definition: 'A fixed camera’s swath covered this place. No picture of it is published.',
    verb: 'swept over',
  },
  /** A camera that can be pointed (commercial, radar) was in range: we can't know whether it looked */
  could: {
    title: 'Could have pointed here',
    short: 'Could',
    unit: passes,
    definition: 'A steerable or private camera was in range. Its operator doesn’t say whether it looked.',
    verb: 'passed within view',
  },
  /** Anything else that crossed the sky (stations, weather and other satellites) */
  overhead: {
    title: 'Passed overhead',
    short: 'Overhead',
    unit: passes,
    definition: 'Crossed your sky. Stations and everything else.',
    verb: 'passed overhead',
  },
}

export default ns('verdicts', verdicts)
