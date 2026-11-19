/**
 * English copy for the photo viewer (src/ui/results/Lightbox.tsx): its top bar (counter, Time-lapse, zoom, close),
 * the chips on the photo, the metadata under it, its Replay and Share buttons and the filmstrip.
 *
 * The words a photo carries everywhere come from the gallery namespace (gallery.ts: why a cover leads, the alt text,
 * "Acquiring", the scale bar, ‹ ›, "Thin cirrus"), so the viewer and the panel never disagree. Satellite names, sensors,
 * product codes, coordinates, 24 h times and zone abbreviations are not copy; the credit line under the photo is a legal
 * attribution and stays English (docs/I18N.md).
 */
import { ns } from '../ns'
import { fmt } from '../../../api/_lib/i18n/format'

const en = fmt('en')

export default ns('lightbox', {
  /** The viewer's accessible name (a dialog) */
  dialogLabel: 'Photos',
  /**
   * Read aloud when the photo changes (screen readers only): photo `k` of the window's `n`, and why it leads when it is
   * the cover ('closest': the closest clear look; 'clouded': every photo of the week is clouded over).
   */
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Photo ${en.int(k)} of ${en.int(n)}${lead === 'closest' ? ', closest look' : lead === 'clouded' ? ', clouded over' : ''}`,
  /** Read aloud on the last clear look, a photo from before the window (screen readers only) */
  spokenLastClear: 'The last clear look, from before this week',
  /** The Time-lapse button's accessible name */
  timelapseLabel: 'Time-lapse of this place, year by year',
  /** The Time-lapse button (mono caps, small; the same word as the time-lapse viewer's title) */
  timelapse: 'Time-lapse',
  /** The zoom − button (laptops; accessible name) */
  zoomOut: 'Zoom out',
  /** Its tooltip, naming the key */
  zoomOutTitle: 'Zoom out (−)',
  /** The zoom + button (laptops; accessible name) */
  zoomIn: 'Zoom in',
  /** Its tooltip, naming the key */
  zoomInTitle: 'Zoom in (+)',
  /**
   * The zoom readout between − and + (mono, tabular, in a 48 px box): "2.5×". English keeps toFixed's rounding, as it
   * always has; a translation writes `fmt(locale).dec(k, 1)`.
   */
  zoom: (k: number) => `${k.toFixed(1)}×`,
  /** The close button (accessible name) */
  close: 'Close the photo viewer',
  /** Its tooltip, naming the key */
  closeTitle: 'Close (Esc)',
  /** The chip at the photo's top right: the ground size of one pixel ("10 m / pixel"; mono caps) */
  perPixel: (pixel: string) => `${pixel} / pixel`,
  /** That chip's tooltip on a Landsat photo sharpened with its panchromatic band */
  panTitle: "Pan-sharpened with Landsat's 15 m band",
  /** The product line of that photo ("pan": panchromatic; the product code itself stays as it is) */
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  /**
   * What the picture shows at the place, after the time (mono caps, nowrap, its box ~14 characters): `pct` is the
   * scene's cloud cover when it is known. The thin-cirrus words are gallery.status.cirrus.
   */
  status: {
    clouded: (pct?: number) => `Clouded${pct !== undefined ? ` · ${en.int(pct)}%` : ''}`,
    clearAtSpot: 'Clear at your spot',
  },
  /** The Replay button's accessible name */
  replayLabel: 'Replay this pass on the globe',
  /** The Replay button (mono caps, small; the same word as gallery.replay without its tablet-only strong part) */
  replay: 'Replay',
  /** The Share button's accessible name and tooltip */
  shareLabel: 'Share this photo',
  /** The Share button's word (mono caps, small; dropped under narrow photos, where the glyph stays) */
  share: 'Share',
  /** The filmstrip's accessible name (laptops) */
  filmstripLabel: 'All photos',
  /** A filmstrip thumbnail's accessible name: its place in the strip */
  thumbLabel: (i: number) => `Photo ${en.int(i)}`,
})
