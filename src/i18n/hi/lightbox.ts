/**
 * Hindi copy for the photo viewer (see docs/i18n/hi.md §4.1, §7): its top bar, the chips on the photo, the metadata
 * under it, its Replay and Share buttons and the filmstrip.
 *
 * Why these words: the words a photo carries everywhere come from the gallery namespace, so the viewer and the panel
 * never disagree. Every picture is a «तस्वीर» (radar images and mosaics included). Buttons are the polite imperative or
 * the one noun the screen implies («रीप्ले», «शेयर करें»); tooltips name their key in brackets. Zoom is «ज़ूम
 * बढ़ाएँ / घटाएँ», never «बड़ा करें», which is what expanding a photo says («तस्वीर बड़ी करें»). "Sharpened" is
 * «निखारी गई». "k of n" is «n में से k», as everywhere. Zoom and the pixel chip use fmt('hi') and the unit «मी» as
 * Hindi papers print it.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('hi')

const lightbox: typeof en = {
  dialogLabel: 'तस्वीरें',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `${f.int(n)} में से तस्वीर ${f.int(k)}${lead === 'closest' ? ', सबसे नज़दीकी झलक' : lead === 'clouded' ? ', बादल छाए' : ''}`,
  spokenLastClear: 'आखिरी साफ़ झलक, इस हफ़्ते से पहले की',
  timelapseLabel: 'इस जगह का टाइम-लैप्स, साल दर साल',
  timelapse: 'टाइम-लैप्स',
  zoomOut: 'ज़ूम घटाएँ',
  zoomOutTitle: 'ज़ूम घटाएँ (−)',
  zoomIn: 'ज़ूम बढ़ाएँ',
  zoomInTitle: 'ज़ूम बढ़ाएँ (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'तस्वीर व्यूअर बंद करें',
  closeTitle: 'बंद करें (Esc)',
  perPixel: (pixel: string) => `${pixel} / पिक्सेल`,
  panTitle: 'Landsat के 15\u00a0मी बैंड से और निखारी गई',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `बादल छाए${pct !== undefined ? ` · ${f.pct(pct)}` : ''}`,
    clearAtSpot: 'आपकी जगह पर साफ़',
  },
  replayLabel: 'इस उड़ान का रीप्ले ग्लोब पर देखें',
  replay: 'रीप्ले',
  shareLabel: 'यह तस्वीर शेयर करें',
  share: 'शेयर करें',
  filmstripLabel: 'सभी तस्वीरें',
  thumbLabel: (i: number) => `तस्वीर ${f.int(i)}`,
}
export default lightbox
