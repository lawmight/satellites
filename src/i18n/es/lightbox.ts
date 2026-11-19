/**
 * Spanish copy for the photo viewer (see src/i18n/en/lightbox.ts; docs/i18n/es.md is the authority on every word).
 *
 * Why it reads this way: the viewer opens radar images and weather mosaics as well as photographs, so it is a *visor
 * de imágenes* and its counter says *Imagen 3 de 11* (es.md §4: *imagen* in every generic string). The words a picture
 * carries everywhere (why a cover leads, its alt text, "Captando", the scale bar, ‹ ›) come from the gallery namespace,
 * as in English. Zoom keys follow the glossary (*Acercar (+)*, *Alejar (−)*); the zoom readout takes the decimal comma
 * from fmt('es') (`2,5×`). The product code on the pan-sharpened line stays as it is.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('es')

const lightbox: typeof en = {
  dialogLabel: 'Imágenes',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Imagen ${f.int(k)} de ${f.int(n)}${lead === 'closest' ? ', vista más cercana' : lead === 'clouded' ? ', nublada' : ''}`,
  spokenLastClear: 'La última vista despejada, de antes de esta semana',
  timelapseLabel: 'Time-lapse de este lugar, año a año',
  timelapse: 'Time-lapse',
  zoomOut: 'Alejar',
  zoomOutTitle: 'Alejar (−)',
  zoomIn: 'Acercar',
  zoomInTitle: 'Acercar (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Cerrar el visor de imágenes',
  closeTitle: 'Cerrar (Esc)',
  perPixel: (pixel: string) => `${pixel} / píxel`,
  panTitle: 'Nitidez mejorada con la banda pancromática de 15 m de Landsat',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Nublado${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Despejado aquí',
  },
  replayLabel: 'Repetir esta pasada en el globo',
  replay: 'Repetir',
  shareLabel: 'Compartir esta imagen',
  share: 'Compartir',
  filmstripLabel: 'Todas las imágenes',
  thumbLabel: (i: number) => `Imagen ${f.int(i)}`,
}

export default lightbox
