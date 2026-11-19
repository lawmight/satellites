/**
 * German copy for the photo viewer (see src/i18n/en/lightbox.ts for where each message shows; docs/i18n/de.md is the
 * authority on every word here).
 *
 * Why it reads this way: the viewer opens radar images, mosaics and full-disc frames as well as photographs, so its
 * chrome says *Bilder* (dialog, counter, filmstrip, thumbnails) and its share button *Bild teilen* (de.md §4.1). Buttons
 * and tooltips are infinitives, addressing no one (§1.1); the Escape key stays *Esc* (§3.7). The spoken position names
 * a cover's lead in its own words (*aus nächster Nähe*, *bedeckt*): code never lowercases a German title (§6.4). The
 * zoom readout takes the decimal comma (*2,5×*), the cloud status the no-break space before % (*Bewölkt · 81 %*, the
 * gallery's word). The words a photo carries everywhere (why a cover leads, its alt text, *Erfassung*, the scale bar)
 * come from the gallery namespace, as in English.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('de')

const lightbox: typeof en = {
  dialogLabel: 'Bilder',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Bild ${f.int(k)} von ${f.int(n)}${lead === 'closest' ? ', aus nächster Nähe' : lead === 'clouded' ? ', bedeckt' : ''}`,
  spokenLastClear: 'Der letzte klare Blick, aufgenommen vor dieser Woche',
  timelapseLabel: 'Zeitraffer dieses Ortes, Jahr für Jahr',
  timelapse: 'Zeitraffer',
  zoomOut: 'Verkleinern',
  zoomOutTitle: 'Verkleinern (−)',
  zoomIn: 'Vergrößern',
  zoomInTitle: 'Vergrößern (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Bildansicht schließen',
  closeTitle: 'Schließen (Esc)',
  perPixel: (pixel: string) => `${pixel} / Pixel`,
  // A Landsat photo; *von Landsat*, never *Landsats* (de.md §3.9).
  panTitle: 'Mit dem 15-m-Kanal von Landsat geschärft',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Bewölkt${pct !== undefined ? ` · ${f.int(pct)}\u00a0%` : ''}`,
    clearAtSpot: 'Klar an deinem Ort',
  },
  replayLabel: 'Überflug auf dem Globus abspielen',
  replay: 'Abspielen',
  shareLabel: 'Bild teilen',
  share: 'Teilen',
  filmstripLabel: 'Alle Bilder',
  thumbLabel: (i: number) => `Bild ${f.int(i)}`,
}

export default lightbox
