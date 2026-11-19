/**
 * Simplified Chinese copy for the photo viewer (see docs/i18n/zh-Hans.md).
 *
 * The viewer shows weather mosaics and radar images as well as photos, so what it holds is 图像, and its counters say
 * 第 3 张 without a noun. Its words for a photo (why a cover leads, the alt text, the scale bar) come from the gallery
 * catalog, as in English. Tooltips name their keys in full-width parentheses; the per-pixel chip reads as Chinese
 * readouts do, 每像素 10 m.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('zh-Hans')
const NB = '\u00a0'

const lightbox: typeof en = {
  dialogLabel: '图像',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `第 ${f.int(k)}${NB}张，共 ${f.int(n)}${NB}张${lead === 'closest' ? '，最清晰画面' : lead === 'clouded' ? '，云层遮挡' : ''}`,
  spokenLastClear: '这一周之前的最近一次无云画面',
  timelapseLabel: '这个地方的延时摄影，一年一帧',
  timelapse: '延时摄影',
  zoomOut: '缩小',
  zoomOutTitle: '缩小（−）',
  zoomIn: '放大',
  zoomInTitle: '放大（+）',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: '关闭图像查看器',
  closeTitle: '关闭（Esc）',
  perPixel: (pixel: string) => `每像素 ${pixel}`,
  panTitle: `用 Landsat 的 15${NB}m 全色波段锐化`,
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 全色 · ${pixel}`,
  status: {
    clouded: (pct?: number) => `云层遮挡${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: '此处无云',
  },
  replayLabel: '在地球上回放这次过境',
  replay: '回放',
  shareLabel: '分享这张图像',
  share: '分享',
  filmstripLabel: '全部图像',
  thumbLabel: (i: number) => `第 ${f.int(i)}${NB}张`,
}

export default lightbox
