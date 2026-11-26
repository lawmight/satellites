/**
 * Vietnamese copy for the photo viewer (see src/i18n/en/lightbox.ts; docs/i18n/vi.md §3.8). The words a photo carries
 * everywhere come from the gallery namespace, so the viewer and the panel never disagree.
 *
 * Why it reads this way: "Photo k of n" is *Ảnh k trong số n* (a slash pair would read as a date); the zoom buttons are
 * *Phóng to* / *Thu nhỏ*, the pair every Vietnamese interface uses; the pan-sharpened Landsat band is *toàn sắc*, the
 * remote-sensing word for panchromatic; "your spot" in a 14-character status is *tại điểm*.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('vi')

const lightbox: typeof en = {
  dialogLabel: 'Ảnh',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Ảnh ${f.int(k)} trong số ${f.int(n)}${lead === 'closest' ? ', chi tiết nhất' : lead === 'clouded' ? ', mây che kín' : ''}`,
  spokenLastClear: 'Ảnh không mây mới nhất, từ trước tuần này',
  timelapseLabel: 'Time-lapse của nơi này, qua từng năm',
  timelapse: 'Time-lapse',
  zoomOut: 'Thu nhỏ',
  zoomOutTitle: 'Thu nhỏ (−)',
  zoomIn: 'Phóng to',
  zoomInTitle: 'Phóng to (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Đóng trình xem ảnh',
  closeTitle: 'Đóng (Esc)',
  perPixel: (pixel: string) => `${pixel} / điểm ảnh`,
  panTitle: 'Làm sắc nét bằng kênh toàn sắc 15 m của Landsat',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Có mây${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Điểm không mây',
  },
  replayLabel: 'Phát lại lượt bay này trên quả địa cầu',
  replay: 'Phát lại',
  shareLabel: 'Chia sẻ ảnh này',
  share: 'Chia sẻ',
  filmstripLabel: 'Tất cả ảnh',
  thumbLabel: (i: number) => `Ảnh ${f.int(i)}`,
}
export default lightbox
