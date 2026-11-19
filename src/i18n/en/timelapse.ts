/**
 * English copy for the time-lapse (src/ui/timelapse/: the player, its waiting screen, its share and video buttons, and
 * the words drawn into the MP4 by video.ts): one clear Sentinel-2 photo of the same place a year, played as a loop.
 *
 * Why it is shaped this way:
 *  - Dates are passed as numbers (ms at UTC midnight of the frame's local calendar day: format them at time zone
 *    'UTC'), never as text, so each language writes its own day and month (formatDate in api/_lib/i18n/dates.ts).
 *    English keeps its house form ("22 Oct 2015") through the English 'time' namespace's day-month, not a second
 *    table, and reads that namespace directly, so this catalog stays English whatever language the page shows.
 *  - The season of a single-season time-lapse (war zones and glaciers, imagery/seasonRegions.ts) arrives as an id
 *    ('autumn'), and each language says "one each autumn" as a whole phrase.
 *  - The video uppercases its words itself (canvas has no CSS), in the visitor's language (toLocaleUpperCase). The
 *    licence credit ("Contains modified Copernicus Sentinel data 2015–2026") stays English everywhere, as the data
 *    policy words it: it is in the code, not here.
 *  - Mono labels are stored in sentence case; CSS uppercases them on screen.
 *
 * Terms: a "clear look" is a cloud-free photo of the place; a "frame" is one year's photo in the loop; "the archive" is
 * Planetary Computer's Sentinel-2 archive (a proper name, never translated, like Sentinel-2, Copernicus, H.264).
 */
import { ns } from '../ns'
import { fmt } from '../../../api/_lib/i18n/format'
import { localParts } from '@/ui/results/lib/time'
import type { SeasonName } from '@/imagery/seasonRegions'
import enTime from './time'

const en = fmt('en')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** "22 Oct": the English time namespace itself, never the active language's (fmtDayMonth would read that), so this
 * catalog is English whatever the page shows: a bundle without 'timelapse' falls back to whole English sentences. */
const dayMonth = (ms: number) => enTime.dayMonth(ms, 'UTC', localParts(ms, 'UTC'))
/** "22 Oct 2015" */
const day = (ms: number) => `${dayMonth(ms)} ${new Date(ms).getUTCFullYear()}`
/** "1 clear look", "11 clear looks" */
const looks = (n: number) => en.plural(n, { one: `${en.int(n)} clear look`, other: `${en.int(n)} clear looks` })
const EACH: Record<SeasonName, string> = {
  winter: 'one each winter',
  spring: 'one each spring',
  summer: 'one each summer',
  autumn: 'one each autumn',
}

export default ns('timelapse', {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────

  /** The dialog's accessible name (aria only), with the place's name as it came (never inflected) */
  dialog: (place: string) => `Time-lapse of ${place}`,
  /** The feature's name: the bar's label, shown as "TIME-LAPSE / {place}" (mono caps by CSS; the " / " and the
   * place are separate elements after it). One line beside the Close button, cut with an ellipsis */
  title: 'Time-lapse',
  /** The bar's close button: its visible label (mono caps by CSS, hidden on touch screens) and its accessible name */
  close: 'Close',
  /** The key cap beside it: the Escape key's name as keyboards print it (most languages keep "Esc") */
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────

  /** The play button's accessible name while the loop is paused (aria only, an icon button) */
  play: 'Play',
  /** …and while it plays */
  pause: 'Pause',
  /** The time line's accessible name (aria only; a slider whose value is the frame's number and whose spoken value
   * is the frame's date) */
  slider: 'Frame',
  /** The frame list's accessible name (aria only; laptops show the list beside the picture) */
  frameList: 'Frames',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────

  /** A frame's date: under the picture's big year (with the satellite, see `readout`), the time line's two ends, and
   * the slider's spoken value. `ms` is UTC midnight of the day: format at time zone 'UTC'. Mono, caps by CSS, one
   * line: keep it short (an abbreviated month) */
  date: day,
  /** A frame's day and month in the frame list (the year has its own column): "22 Oct". Mono caps by CSS, short */
  dayMonth,
  /** The line under the picture's big year: the frame's date and the satellite that took it ("Sentinel-2A", never
   * translated). One line on the picture, no wrapping; the video draws it in capitals */
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  /** What a screen reader hears when someone moves to another frame (aria-live): its number, of how many, and its
   * date (`ms` as in `date`; a spoken date may be longer than the readout's) */
  frameSpoken: (index: number, total: number, ms: number) => `Frame ${en.int(index)} of ${en.int(total)}: ${day(ms)}`,

  // ── The caption (one mono line under the time line, caps by CSS, read aloud as it changes) ─────────────

  /** The loop is ready and the years turn through the seasons: how many frames (at least 3), and that there is one a
   * year */
  captionYearly: (count: number) => `${looks(count)} · one a year`,
  /** The loop is ready and every year is the same season (war zones, glaciers): how many frames (at least 3), and
   * that each is from that season ("one each autumn"). `season` is an id: winter, spring, summer or autumn (a southern
   * glacier's summer is February). Say it as a whole phrase in your language */
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  /** While the frames are gathered: what the loop will be, and the year the archive starts (a year: never group its
   * digits) */
  captionGathering: (since: number) => `One clear look a year · since ${since}`,
  /** Too few clear frames for a loop */
  captionShort: 'No time-lapse for this place',
  /** The archive failed (no full stop: a label; the waiting screen's head says it as a sentence, `noAnswer`) */
  captionError: 'The archive did not answer',

  // ── The note under the frames (body text, 13 px, beside the picture on laptops in a 248 px column) ─────────────

  /** The years turn through the seasons. `km` is the square's side (10) */
  note: (km: number) =>
    `Each frame is the same ${en.int(km)} km square, taken by Sentinel-2 and toned like every photo here. Each year aims for a different season; a year with no clear look is left out.`,
  /** Every year is the same season (war zones, glaciers: the caption names it). `km` is the square's side (10) */
  noteOneSeason: (km: number) =>
    `Each frame is the same ${en.int(km)} km square, taken by Sentinel-2 and toned like every photo here. Every year is from the same season; a year with no clear look in that season is left out.`,
  /** The credit line before there are frames (mono micro caps by CSS): where the pictures come from. The names stay;
   * only "via" is yours. Once there are frames the licence credit replaces it, in English */
  source: 'Copernicus Sentinel-2, via Planetary Computer',

  // ── The waiting screen (on the picture, under the breathing wordmark) ──────────────────────────────

  /** The three steps of gathering, each shown with its count beside it ("03 / 12"). Mono caps by CSS, one line, no
   * wrapping, centred on a phone's picture (about 280 px): keep them short */
  listing: 'Listing the archive',
  /** Each candidate scene is checked for cloud */
  choosing: 'Choosing clear looks',
  /** The chosen frames' pictures are made ("developed", as a photograph is) */
  developing: 'Developing frames',
  /** The waiting screen's accessible name while scenes are checked (aria only): the step, as `choosing` says it, and
   * how far it is (scenes checked, of how many). English pads the counts to two digits like the counter on screen
   * ("03 / 12"); you need not. While the archive is listed there is no count: the name is `listing` alone */
  choosingProgress: (done: number, total: number) => `Choosing clear looks, ${pad2(done)} of ${pad2(total)}`,
  /** …and while the chosen frames' pictures are made: the step, as `developing` says it, and frames made, of how many */
  developingProgress: (done: number, total: number) => `Developing frames, ${pad2(done)} of ${pad2(total)}`,
  /** Too few clear frames: the panel's head (a condensed display sentence) */
  tooCloudy: 'Too cloudy here for a time-lapse.',
  /** …and the line under it (mono caps by CSS): how many clear frames there are (0, 1 or 2), since the archive's first
   * year (`since`: never group its digits), and how many a loop needs (`needed`: 3) */
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'No clear look' : looks(count)} since ${since} · ${en.int(needed)} needed`,
  /** The archive failed: the panel's head (a sentence) */
  noAnswer: 'The archive did not answer.',
  /** …the line under it (mono caps by CSS). Planetary Computer is Microsoft's archive: its name stays */
  unreachable: 'Planetary Computer could not be reached',
  /** …and its button (small, mono caps by CSS) */
  retry: 'Try again',

  // ── Sharing and the video (small mono buttons, caps by CSS) ─────────────────────────────────────

  /** The share button: a link that opens this time-lapse */
  share: 'Share',
  /** …its label for a moment after the link is copied (laptops) */
  linkCopied: 'Link copied',
  /** The title handed to a phone's share sheet with the link or the video, with the place's name as it came */
  shareTitle: (place: string) => `${place}, year by year`,
  /** The video button: the first press makes an MP4 of the loop. The button keeps one width (132 px) through its
   * labels, so keep `video`, `rendering`, `videoFailed` and `saveVideo` about as short as English */
  video: 'Video',
  /** …while it is made: the share done, 0–99, padded to two digits so the label never changes width as it counts */
  rendering: (pct: number) => `Rendering ${pad2(pct)}%`,
  /** …when it could not be made (for 2 s, then back to `video`) */
  videoFailed: 'Video failed',
  /** …once it is made: the second press saves or shares the file */
  saveVideo: 'Save video',
  /** The save button's tooltip when the browser could only make VP9/AV1: the file will not play on Apple devices.
   * Codec and browser names stay */
  noH264: 'This browser has no H.264 encoder: the file plays in Chrome and Firefox',
  /** The video file's name uses the place's name in Latin letters ("watched-sao-paulo-2015-2026.mp4"); a name with
   * none (東京, Київ) uses this word instead. Lowercase a–z, digits and hyphens only (anything else is dropped) */
  fileNamePlace: 'place',
})
