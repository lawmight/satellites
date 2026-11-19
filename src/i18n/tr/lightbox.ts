/**
 * Turkish copy for the photo viewer (see docs/i18n/tr.md §3.9, §4, §6.3): its top bar, the chips on the photo, the
 * metadata under it, its Replay and Share buttons and the filmstrip.
 *
 * Why these words: the viewer shows every kind of picture (radar and mosaics too), so it says `görüntü`, as the
 * gallery does; the words a photo carries everywhere come from the gallery namespace. Buttons are bare stems
 * (`Oynat`, `Paylaş`, `Yakınlaştır`), never a `-ma/-me` noun (§1.3); Replay is `Oynat`, the gallery button's word
 * without its tablet-only part, because the stacked Replay and Share column takes its width from the metadata beside
 * it (the accessible name still says `yeniden oynat`). What a screen reader hears says a position
 * as `Görüntü 3, toplam 12` (a slash is read `bölü`, §5.3). The zoom readout and the cloud chip go through fmt('tr'):
 * `2,5×`, `%86` with the sign first. "pan" stays in the product line: it is the band's code, like "C2 L2" beside it.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('tr')

const lightbox: typeof en = {
  dialogLabel: 'Görüntüler',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Görüntü ${f.int(k)}, toplam ${f.int(n)}${lead === 'closest' ? ', en net görüntü' : lead === 'clouded' ? ', tamamen bulutlu' : ''}`,
  spokenLastClear: 'Son bulutsuz görüntü, bu haftadan önce',
  timelapseLabel: 'Bu yerin zaman atlamalı görüntüleri, yıl yıl',
  timelapse: 'Zaman atlamalı',
  zoomOut: 'Uzaklaştır',
  zoomOutTitle: 'Uzaklaştır (−)',
  zoomIn: 'Yakınlaştır',
  zoomInTitle: 'Yakınlaştır (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Görüntüleyiciyi kapat',
  closeTitle: 'Kapat (Esc)',
  perPixel: (pixel: string) => `${pixel} / piksel`,
  // `15 m’lik`: the suffix sits on the fixed unit, never on a number (§5.3).
  panTitle: 'Landsat’ın 15 m’lik pankromatik bandıyla keskinleştirildi',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Bulutlu${pct !== undefined ? ` · %${f.int(pct)}` : ''}`,
    clearAtSpot: 'Noktanda hava açık',
  },
  replayLabel: 'Bu geçişi kürede yeniden oynat',
  replay: 'Oynat',
  shareLabel: 'Bu görüntüyü paylaş',
  share: 'Paylaş',
  filmstripLabel: 'Tüm görüntüler',
  thumbLabel: (i: number) => `Görüntü ${f.int(i)}`,
}
export default lightbox
