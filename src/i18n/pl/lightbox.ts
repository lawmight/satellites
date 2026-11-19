/**
 * Polish copy for the photo viewer (see docs/i18n/pl.md §3.8, §3.9, §4.1, §7): its top bar, the chips on the photo,
 * the metadata under it, its Replay and Share buttons and the filmstrip.
 *
 * Why these words: the words a photo carries everywhere come from the gallery namespace, so the viewer says what the
 * panel says («Ujęcie z najbliższa», «Cirrusy»). The time-lapse is «Rok po roku», the feature's indeclinable name (§3.8).
 * The viewer is «podgląd zdjęć», never «przeglądarka zdjęć», which a Polish reader takes for a web browser. Buttons are
 * the 2nd-person imperative («Przybliż», «Udostępnij», «Odtwórz»). Zoom is «Przybliż» / «Oddal», as on maps and in
 * About's key list, because «Powiększ» is the F key's expand (gallery, About). The status box is a state in ≤ ~14
 * characters («Pochmurne · 93%»), except the guide's «Czysto nad twoim punktem». The zoom and pixel readouts write the
 * decimal comma through fmt('pl'). "pan" stays in the product line: it is the band's code, like «C2 L2» beside it.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('pl')

const lightbox: typeof en = {
  dialogLabel: 'Zdjęcia',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Zdjęcie ${f.int(k)} z ${f.int(n)}${lead === 'closest' ? ', ujęcie z najbliższa' : lead === 'clouded' ? ', zachmurzone' : ''}`,
  spokenLastClear: 'Ostatnie bezchmurne ujęcie, sprzed tego tygodnia',
  timelapseLabel: 'To miejsce rok po roku',
  timelapse: 'Rok po roku',
  zoomOut: 'Oddal',
  zoomOutTitle: 'Oddal (−)',
  zoomIn: 'Przybliż',
  zoomInTitle: 'Przybliż (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Zamknij podgląd zdjęć',
  closeTitle: 'Zamknij (Esc)',
  // `pixel` arrives written («10 m»): «10 m NA PIKSEL».
  perPixel: (pixel: string) => `${pixel} na piksel`,
  panTitle: 'Wyostrzone kanałem panchromatycznym 15\u00a0m z\u00a0satelity Landsat',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Pochmurne${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Czysto nad twoim punktem',
  },
  replayLabel: 'Odtwórz ten przelot na globusie',
  replay: 'Odtwórz',
  shareLabel: 'Udostępnij to zdjęcie',
  share: 'Udostępnij',
  filmstripLabel: 'Wszystkie zdjęcia',
  thumbLabel: (i: number) => `Zdjęcie ${f.int(i)}`,
}
export default lightbox
