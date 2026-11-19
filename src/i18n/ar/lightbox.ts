/**
 * Arabic copy for the photo viewer (see src/i18n/en/lightbox.ts for where each message shows; docs/i18n/ar.md §3.7
 * "gallery and lightbox" is the authority on every line here).
 *
 * Why it reads this way:
 *  - The viewer says what the gallery says (gallery.ts): «أقرب نظرة», «أحدث نظرة صافية», «تحت السحب», «صافٍ فوق
 *    بقعتك». The time-lapse is «عبر السنين» everywhere, never «فاصل زمني» ("time interval", ar.md §4.1).
 *  - Buttons and accessible names are masdars («تكبير»، «تصغير»، «إغلاق عارض الصور»، «إعادة العرض»), never an
 *    imperative to the reader (ar.md §1.2). Replay is «إعادة العرض», never «إعادة التشغيل» ("restart").
 *  - The zoom readout is a DOM-only number, so it is one left-to-right island (LRI…PDI around it): otherwise `×` would
 *    land on the wrong side of the digits under dir="rtl" (ar.md §6.2.7, §6.3). The pan product code is isolated the
 *    same way, so the pixel after it keeps its unit beside its digits.
 *  - The pixel arrives written by the results namespace («10 م»), so «لكل بكسل» follows it; numbers come from fmt('ar').
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ar')
/** U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE */
const ltr = (s: string) => `\u2066${s}\u2069`

const lightbox: typeof en = {
  dialogLabel: 'الصور',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `الصورة ${f.int(k)} من ${f.int(n)}${lead === 'closest' ? '، أقرب نظرة' : lead === 'clouded' ? '، تحت السحب' : ''}`,
  spokenLastClear: 'أحدث نظرة صافية، من قبل هذا الأسبوع',
  timelapseLabel: 'هذا المكان عبر السنين، نظرة صافية كل عام',
  timelapse: 'عبر السنين',
  zoomOut: 'تصغير',
  zoomOutTitle: 'تصغير (−)',
  zoomIn: 'تكبير',
  zoomInTitle: 'تكبير (+)',
  zoom: (k: number) => ltr(`${f.dec(k, 1)}×`),
  close: 'إغلاق عارض الصور',
  closeTitle: 'إغلاق (Esc)',
  perPixel: (pixel: string) => `${pixel} لكل بكسل`,
  panTitle: 'حُسّنت دقتها بحزمة Landsat البانكروماتية (15\u00a0م)',
  // The Latin code is isolated: otherwise the pixel's digits join its run under dir="rtl" and «م» lands on the far
  // side of the code («م Landsat … pan · 15»), ar.md §6.2.5.
  panProduct: (pixel: string) => `${ltr('Landsat C2 L2 + L1 pan')} · ${pixel}`,
  status: {
    // The percentage is a left-to-right island: after Arabic letters «86%» would draw «%86»
    clouded: (pct?: number) => `سحب${pct !== undefined ? ` · \u2066${f.int(pct)}%\u2069` : ''}`,
    clearAtSpot: 'صافٍ فوق بقعتك',
  },
  replayLabel: 'إعادة عرض هذا المرور على الكرة الأرضية',
  replay: 'إعادة العرض',
  shareLabel: 'مشاركة هذه الصورة',
  share: 'مشاركة',
  filmstripLabel: 'كل الصور',
  thumbLabel: (i: number) => `الصورة ${f.int(i)}`,
}
export default lightbox
