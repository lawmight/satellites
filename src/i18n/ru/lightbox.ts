/**
 * Russian copy for the photo viewer (see docs/i18n/ru.md §4.1, §7, Appendix A): its top bar, the chips on the photo,
 * the metadata under it, its Replay and Share buttons and the filmstrip.
 *
 * Why these words: the viewer shows every kind of picture, so it says «снимок», as the gallery does (the words a photo
 * carries everywhere come from the gallery namespace). Buttons are infinitives («Увеличить», «Поделиться»), the status
 * box a noun or a short state in ≤ 14 characters («Ясно в точке», «Облачно · 93%»). The zoom and pixel readouts write
 * the decimal comma through fmt('ru'). "pan" stays in the product line: it is the band's code, like «C2 L2» beside it.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ru')

const lightbox: typeof en = {
  dialogLabel: 'Снимки',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `Снимок ${f.int(k)} из ${f.int(n)}${lead === 'closest' ? ', самый близкий кадр' : lead === 'clouded' ? ', под облаками' : ''}`,
  spokenLastClear: 'Последний ясный кадр, сделанный до этой недели',
  timelapseLabel: 'Таймлапс: это место год за годом',
  timelapse: 'Таймлапс',
  zoomOut: 'Уменьшить',
  zoomOutTitle: 'Уменьшить (−)',
  zoomIn: 'Увеличить',
  zoomInTitle: 'Увеличить (+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: 'Закрыть просмотр снимков',
  closeTitle: 'Закрыть (Esc)',
  perPixel: (pixel: string) => `${pixel} на пиксель`,
  panTitle: 'Резкость повышена панхроматическим каналом Landsat (15\u00a0м)',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 pan · ${pixel}`,
  status: {
    clouded: (pct?: number) => `Облачно${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: 'Ясно в точке',
  },
  replayLabel: 'Воспроизвести пролёт на глобусе',
  replay: 'Повтор',
  shareLabel: 'Поделиться снимком',
  share: 'Поделиться',
  filmstripLabel: 'Все снимки',
  thumbLabel: (i: number) => `Снимок ${f.int(i)}`,
}
export default lightbox
