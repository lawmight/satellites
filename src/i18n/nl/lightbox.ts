/**
 * Dutch copy for the photo viewer (see docs/i18n/nl.md §3.7 "Gallery and photo viewer", §4.2, §6): its top bar, the
 * chips on the photo, the metadata under it, its Replay and Share buttons and the filmstrip.
 *
 * Why these words: the viewer shows every kind of picture (radar and mosaics too), so it says `beeld`, as the gallery
 * does; the words a photo carries everywhere come from the gallery namespace. Buttons are infinitives with no pronoun
 * (`Afspelen`, `Delen`, `Inzoomen`); the status box after the time is a short state (≤ ~14 characters where it can be:
 * `Bewolkt · 81%`). The zoom readout writes the decimal comma through fmt('nl') (`2,5×`). "pan" stays in the product
 * line: it is the band's code, like "C2 L2" beside it.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('nl')

const lightbox: typeof en = {
  dialogLabel: 'Beelden',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Beeld ${f.int(k)} van ${f.int(n)}${lead === 'closest' ? ', het scherpste' : lead === 'clouded' ? ', dichtbewolkt' : ''}`,
  spokenLastClear: 'De laatste heldere opname, van vóór deze week',
  timelapseLabel: 'Timelapse van deze plek, jaar na jaar',
  timelapse: 'Timelapse',
  zoomOut: 'Uitzoomen',
  zoomOutTitle: 'Uitzoomen (−)',
  zoomIn: 'Inzoomen',
  zoomInTitle: 'Inzoomen (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Beeldviewer sluiten',
  closeTitle: 'Sluiten (Esc)',
  perPixel: (pixel: string) => `${pixel} / pixel`,
  panTitle: 'Verscherpt met de panchromatische band van Landsat (15 m)',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Bewolkt${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Helder op je plek',
  },
  replayLabel: 'Deze overvlucht afspelen op de wereldbol',
  replay: 'Afspelen',
  shareLabel: 'Dit beeld delen',
  share: 'Delen',
  filmstripLabel: 'Alle beelden',
  thumbLabel: (i: number) => `Beeld ${f.int(i)}`,
}
export default lightbox
