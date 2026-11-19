/**
 * Brazilian Portuguese copy for the photo viewer (see src/i18n/en/lightbox.ts; docs/i18n/pt-BR.md is the authority on
 * every word).
 *
 * Why it reads this way: the viewer opens radar images and weather mosaics as well as photographs, so it is *o
 * visualizador*, its counter says *Imagem 3 de 27* and its share button *Compartilhar esta imagem* (pt-BR.md §4.1,
 * §4.2). The words a picture carries everywhere (why a cover leads, its alt text, *Captando*, the scale bar, ‹ ›) come
 * from the gallery namespace, as in English. Zoom follows the glossary (*Aumentar zoom (+)*, *Diminuir zoom (−)*), the
 * zoom readout takes the decimal comma from fmt('pt-BR') (`2,5×`), and replay is *Rever* (§4.1). A clouded status says
 * *Nublado*, as the gallery's does; spoken, a clouded cover is *céu encoberto*, as on the card (*imagem encoberta* would
 * read as a hidden image). The product code on the pan-sharpened line stays as it is.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('pt-BR')

const lightbox: typeof en = {
  dialogLabel: 'Imagens',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Imagem ${f.int(k)} de ${f.int(n)}${lead === 'closest' ? ', vista mais próxima' : lead === 'clouded' ? ', céu encoberto' : ''}`,
  spokenLastClear: 'A última vista limpa, de antes desta semana',
  timelapseLabel: 'Time-lapse deste lugar, ano a ano',
  timelapse: 'Time-lapse',
  zoomOut: 'Diminuir zoom',
  zoomOutTitle: 'Diminuir zoom (−)',
  zoomIn: 'Aumentar zoom',
  zoomInTitle: 'Aumentar zoom (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Fechar o visualizador',
  closeTitle: 'Fechar (Esc)',
  perPixel: (pixel: string) => `${pixel} / pixel`,
  panTitle: 'Nitidez reforçada com a banda pancromática de 15 m do Landsat',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Nublado${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Céu limpo no ponto',
  },
  replayLabel: 'Rever esta passagem no globo',
  replay: 'Rever',
  shareLabel: 'Compartilhar esta imagem',
  share: 'Compartilhar',
  filmstripLabel: 'Todas as imagens',
  thumbLabel: (i: number) => `Imagem ${f.int(i)}`,
}

export default lightbox
