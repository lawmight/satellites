/**
 * Japanese copy for the photo viewer (see docs/i18n/ja.md §3.7 "gallery and lightbox").
 *
 * The viewer shows weather mosaics and radar images as well as photos, so what it holds is 画像, counted with 枚, total
 * first ("27枚中3枚目"). Its words for a photo (why a cover leads, the alt text, the scale bar) come from the gallery
 * catalog, as in English, so the panel and the viewer never disagree. Buttons are nouns (縮小, 拡大, 共有); tooltips name
 * their keys in half-width parentheses, as key hints are mono. The per-pixel chip reads as a mono readout, label then
 * value: 1ピクセル 10 m.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ja')

const lightbox: typeof en = {
  dialogLabel: '画像',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `${f.int(n)}枚中${f.int(k)}枚目${lead === 'closest' ? '、最も詳細な画像' : lead === 'clouded' ? '、雲に覆われた' : ''}`,
  spokenLastClear: '直近の晴天画像。この1週間より前のもの',
  timelapseLabel: 'この場所のタイムラプス。年ごとの変化',
  timelapse: 'タイムラプス',
  zoomOut: '縮小',
  zoomOutTitle: '縮小(−)',
  zoomIn: '拡大',
  zoomInTitle: '拡大(+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: '画像ビューアを閉じる',
  closeTitle: '閉じる(Esc)',
  perPixel: (pixel: string) => `1ピクセル ${pixel}`,
  panTitle: 'Landsatの15 mパンクロマチックバンドでパンシャープン済み',
  /** The product code stays as it is, "pan" included */
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `雲に覆われた${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: '地点に雲なし',
  },
  replayLabel: 'この通過を地球儀でリプレイ',
  replay: 'リプレイ',
  shareLabel: 'この画像を共有',
  share: '共有',
  filmstripLabel: 'すべての画像',
  thumbLabel: (i: number) => `${f.int(i)}枚目`,
}

export default lightbox
