/**
 * Indonesian copy for the photo viewer (see src/i18n/en/lightbox.ts; docs/i18n/id.md is the authority on words).
 *
 * Why it reads this way: the viewer opens radar images and mosaics as well as photographs, so it is a *penampil citra*
 * and its counter says *Citra 3 dari 11* (id.md §3.8, §9.2 item 4). The words a picture carries everywhere (why a
 * cover leads, its alt text, "Merekam", the scale bar) come from the gallery namespace, as in English. The zoom
 * readout takes Indonesian's decimal comma (`2,5×`, §6); the product code on the pan-sharpened line stays as it is.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('id')

const lightbox: typeof en = {
  dialogLabel: 'Citra',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Citra ${f.int(k)} dari ${f.int(n)}${lead === 'closest' ? ', paling rinci' : lead === 'clouded' ? ', tertutup awan' : ''}`,
  spokenLastClear: 'Citra cerah terakhir, diambil sebelum minggu ini',
  timelapseLabel: 'Time-lapse tempat ini, dari tahun ke tahun',
  timelapse: 'Time-lapse',
  zoomOut: 'Perkecil',
  zoomOutTitle: 'Perkecil (−)',
  zoomIn: 'Perbesar',
  zoomInTitle: 'Perbesar (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Tutup penampil citra',
  closeTitle: 'Tutup (Esc)',
  perPixel: (pixel: string) => `${pixel} / piksel`,
  panTitle: 'Dipertajam dengan kanal pankromatik 15 m Landsat',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Berawan${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Cerah di titikmu',
  },
  replayLabel: 'Putar ulang lintasan ini di bola dunia',
  replay: 'Putar ulang',
  shareLabel: 'Bagikan citra ini',
  share: 'Bagikan',
  filmstripLabel: 'Semua citra',
  thumbLabel: (i: number) => `Citra ${f.int(i)}`,
}

export default lightbox
