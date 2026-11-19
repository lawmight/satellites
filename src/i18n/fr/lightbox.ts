/**
 * French copy for the photo viewer (see src/i18n/en/lightbox.ts for where each message shows; docs/i18n/fr.md is the
 * authority on every word here).
 *
 * Why it reads this way: the viewer opens radar images, mosaics and full-disc frames as well as photographs, so its
 * chrome says *Images* (dialog, counter, filmstrip, thumbnails: fr.md §3.9) and its button is *Partager cette image*.
 * The time-lapse button is the feature's name, *Au fil des ans* (§3.8). Buttons and tooltips are infinitives or nouns,
 * never *vous* (§1.1); the Escape key is *Échap* (§3.7). The zoom readout takes the decimal comma (*2,5×*). The words a
 * photo carries everywhere (why a cover leads, its alt text, "Acquisition", the scale bar) come from the gallery
 * namespace, as in English.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('fr')

const lightbox: typeof en = {
  dialogLabel: 'Images',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Image ${f.int(k)} sur ${f.int(n)}${lead === 'closest' ? ', vue rapprochée' : lead === 'clouded' ? ', ciel couvert' : ''}`,
  spokenLastClear: 'La dernière vue dégagée, prise avant cette semaine',
  timelapseLabel: 'Ce lieu au fil des ans, une vue par an',
  timelapse: 'Au fil des ans',
  zoomOut: 'Zoom arrière',
  zoomOutTitle: 'Zoom arrière (−)',
  zoomIn: 'Zoom avant',
  zoomInTitle: 'Zoom avant (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Fermer la visionneuse d’images',
  closeTitle: 'Fermer (Échap)',
  perPixel: (pixel: string) => `${pixel} / pixel`,
  // A Landsat photo, so *photo* is honest here; the noun carries the participle's agreement.
  panTitle: 'Photo Landsat affinée avec sa bande panchromatique de 15\u00a0m',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  // Nouns within the ~14-character box: *Nuages · 25 %*, *Dégagé ici* (fr.md §4.1).
  status: {
    clouded: (pct?: number) => `Nuages${pct !== undefined ? ` · ${f.int(pct)}\u00a0%` : ''}`,
    clearAtSpot: 'Dégagé ici',
  },
  replayLabel: 'Rejouer ce passage sur le globe',
  replay: 'Rejouer',
  shareLabel: 'Partager cette image',
  share: 'Partager',
  filmstripLabel: 'Toutes les images',
  thumbLabel: (i: number) => `Image ${f.int(i)}`,
}

export default lightbox
