/**
 * Traditional Chinese copy for the photo viewer (see docs/i18n/zh-Hant.md, Appendix A).
 *
 * The viewer shows weather mosaics and radar images as well as photos, so what it holds is 影像, and its counters say
 * 第 3 張 without a noun. Its words for a photo (why a cover leads, the alt text, the scale bar) come from the gallery
 * catalog, as in English. Tooltips name their keys in full-width parentheses; the per-pixel chip reads as Chinese
 * readouts do, 每像素 10 m. Landsat's panchromatic band is 黑白波段: 全色態 (Taiwan) and 全色 (Hong Kong) split the
 * regions (§1.4).
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('zh-Hant')

const lightbox: typeof en = {
  dialogLabel: '影像',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `第 ${f.int(k)} 張，共 ${f.int(n)} 張${lead === 'closest' ? '，最清晰的一張' : lead === 'clouded' ? '，雲層遮蔽' : ''}`,
  spokenLastClear: '最近一張無雲影像，來自這星期之前',
  timelapseLabel: '這個地點的縮時影像，逐年變化',
  timelapse: '縮時影像',
  zoomOut: '縮小',
  zoomOutTitle: '縮小（−）',
  zoomIn: '放大',
  zoomInTitle: '放大（+）',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: '關閉影像檢視器',
  closeTitle: '關閉（Esc）',
  perPixel: (pixel: string) => `每像素 ${pixel}`,
  panTitle: '以 Landsat 的 15 m 黑白波段銳化',
  /**
   * The product code stays; only "pan" is a word, 黑白 (the root of 黑白波段): the phone's one nowrap line also holds
   * the crop width, which 黑白波段 pushes past a 390 px screen. The tooltip says the band in full.
   */
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 黑白 · ${pixel}`,
  status: {
    clouded: (pct?: number) => `雲層遮蔽${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: '地點無雲',
  },
  replayLabel: '在地球上重播這次過境',
  replay: '重播',
  /** 影像, not 照片: the picture may be a radar image or a full-disc frame */
  shareLabel: '分享這張影像',
  share: '分享',
  filmstripLabel: '所有影像',
  thumbLabel: (i: number) => `第 ${f.int(i)} 張`,
}

export default lightbox
