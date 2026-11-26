/**
 * Persian copy for the photo viewer (see src/i18n/en/lightbox.ts; docs/i18n/fa.md §4.1). The words a photo carries
 * everywhere come from the gallery namespace, so the viewer and the panel never disagree.
 *
 * Why it reads this way: buttons and tooltips are nouns («بزرگ‌نمایی», «بستن»), the keys in brackets as keyboards print
 * them. The zoom readout is a DOM-only number, so it is one left-to-right island («2.5×»), or «×» would jump to the
 * other side. "Per pixel" is «در هر پیکسل», as every Persian technical text says it; the viewer is «نمایشگر تصویر»
 * (it shows radar images and mosaics too).
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('fa')
/** U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE */
const ltr = (s: string) => `\u2066${s}\u2069`

const lightbox: typeof en = {
  dialogLabel: 'تصویرها',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `تصویر ${f.int(k)} از ${f.int(n)}${lead === 'closest' ? '، نزدیک‌ترین نما' : lead === 'clouded' ? '، پوشیده از ابر' : ''}`,
  spokenLastClear: 'آخرین نمای بی‌ابر، از پیش از این هفته',
  // Not «… سال به سال» after the name: the years would be said twice
  timelapseLabel: 'گذر سال‌ها در این مکان، با یک نما در هر سال',
  timelapse: 'گذر سال‌ها',
  zoomOut: 'کوچک‌نمایی',
  zoomOutTitle: 'کوچک‌نمایی (−)',
  zoomIn: 'بزرگ‌نمایی',
  zoomInTitle: 'بزرگ‌نمایی (+)',
  zoom: (k: number) => ltr(`${f.dec(k, 1)}×`),
  close: 'بستن نمایشگر تصویر',
  closeTitle: 'بستن (Esc)',
  perPixel: (pixel: string) => `${pixel} در هر پیکسل`,
  panTitle: `با باند 15\u00a0متری Landsat تیزتر شده است`,
  panProduct: (pixel: string) => `${ltr('Landsat C2 L2 + L1 pan')} · ${pixel}`,
  status: {
    clouded: (pct?: number) => `ابری${pct !== undefined ? ` · ${ltr(`${f.int(pct)}%`)}` : ''}`,
    clearAtSpot: 'بی‌ابر روی نقطهٔ شما',
  },
  replayLabel: 'بازپخش این گذر روی کرهٔ زمین',
  replay: 'بازپخش',
  shareLabel: 'اشتراک‌گذاری این تصویر',
  share: 'اشتراک‌گذاری',
  filmstripLabel: 'همهٔ تصویرها',
  thumbLabel: (i: number) => `تصویر ${f.int(i)}`,
}
export default lightbox
