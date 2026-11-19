/**
 * Ukrainian copy for the photo viewer (see docs/i18n/uk.md §4.1, §7, Appendix A): its top bar, the chips on the photo,
 * the metadata under it, its Replay and Share buttons and the filmstrip.
 *
 * Why these words: the viewer shows every kind of picture, so it says «знімок», as the gallery does (the words a photo
 * carries everywhere come from the gallery namespace). Buttons are infinitives («Збільшити», «Поділитися»), the status
 * box is a noun or a short state in ≤ 14 characters («Ясно в точці», «Хмарно · 93%»). The zoom and pixel readouts
 * write the decimal comma through fmt('uk'). "pan" stays in the product line: it is the band's code, like «C2 L2»
 * beside it (Ukrainian «пан» would read "mister").
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('uk')

const lightbox: typeof en = {
  dialogLabel: 'Знімки',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Знімок ${f.int(k)} з ${f.int(n)}${lead === 'closest' ? ', кадр зблизька' : lead === 'clouded' ? ', під хмарами' : ''}`,
  spokenLastClear: 'Останній ясний кадр, зроблений до цього тижня',
  timelapseLabel: 'Таймлапс: це місце рік за роком',
  timelapse: 'Таймлапс',
  zoomOut: 'Зменшити',
  zoomOutTitle: 'Зменшити (−)',
  zoomIn: 'Збільшити',
  zoomInTitle: 'Збільшити (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Закрити перегляд знімків',
  closeTitle: 'Закрити (Esc)',
  perPixel: (pixel: string) => `${pixel} на піксель`,
  panTitle: 'Різкість підвищено завдяки панхроматичному каналу Landsat (15\u00a0м)',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Хмарно${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Ясно в точці',
  },
  replayLabel: 'Відтворити проліт на глобусі',
  replay: 'Повтор',
  shareLabel: 'Поділитися знімком',
  share: 'Поділитися',
  filmstripLabel: 'Усі знімки',
  thumbLabel: (i: number) => `Знімок ${f.int(i)}`,
}
export default lightbox
