/**
 * Italian copy for the photo viewer (see src/i18n/en/lightbox.ts; docs/i18n/it.md §3.7 "Lightbox and gallery", §4,
 * §7): its top bar, the chips on the photo, the metadata under it, its Replay and Share buttons and the filmstrip.
 *
 * Why it reads this way: the words a photo carries everywhere come from the gallery namespace, so the viewer says
 * *foto* and *ripresa* exactly as the panel does. Buttons are tu imperatives (*Rivedi*, *Condividi*); the zoom
 * buttons say *Aumenta lo zoom* / *Riduci lo zoom*, as Italian maps do, so they never read like the gallery's
 * *Ingrandisci la foto* (which opens this viewer). The status box holds ≤ ~14 characters: *Nuvoloso · 82%*, *Sereno
 * qui* (*Sereno sul tuo punto* is too long, §7). The zoom readout writes the decimal comma through fmt('it') (*2,5×*).
 * "pan" stays in the product line: it is the band's code, like "C2 L2" beside it.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('it')

const lightbox: typeof en = {
  dialogLabel: 'Foto',
  // Spoken: *cielo coperto* reads as a phrase after the photo's number, where a bare *coperto* would want to agree.
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Foto ${f.int(k)} di ${f.int(n)}${lead === 'closest' ? ', ripresa più vicina' : lead === 'clouded' ? ', cielo coperto' : ''}`,
  spokenLastClear: 'L’ultima ripresa limpida, prima di questa settimana',
  timelapseLabel: 'Time-lapse di questo luogo, anno dopo anno',
  timelapse: 'Time-lapse',
  zoomOut: 'Riduci lo zoom',
  zoomOutTitle: 'Riduci lo zoom (−)',
  zoomIn: 'Aumenta lo zoom',
  zoomInTitle: 'Aumenta lo zoom (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Chiudi il visualizzatore di foto',
  closeTitle: 'Chiudi (Esc)',
  perPixel: (pixel: string) => `${pixel} / pixel`,
  panTitle: 'Nitidezza migliorata con la banda pancromatica da 15 m di Landsat',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Nuvoloso${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Sereno qui',
  },
  replayLabel: 'Rivedi questo passaggio sul globo',
  replay: 'Rivedi',
  shareLabel: 'Condividi questa foto',
  share: 'Condividi',
  filmstripLabel: 'Tutte le foto',
  thumbLabel: (i: number) => `Foto ${f.int(i)}`,
}

export default lightbox
