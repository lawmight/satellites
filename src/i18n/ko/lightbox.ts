/**
 * Korean copy for the photo viewer (see docs/i18n/ko.md §3.7 "lightbox").
 *
 * The viewer shows daily composites and radar images as well as photos, so what it holds is 이미지, counted with 장,
 * total first (이미지 27장 중 3번째). Its words for a photo (why a cover leads, the alt text, the scale bar) come from
 * the gallery catalog, as in English, so the panel and the viewer never disagree. Buttons are nouns (축소, 확대, 공유,
 * 다시 보기), never -하기 or -세요; tooltips name their keys in attached parentheses. "Your spot" is 이 지점, never
 * 당신의. The per-pixel chip reads as the glossary writes it: 픽셀당 10 m.
 */
import type en from '../en/lightbox'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ko')

const lightbox: typeof en = {
  dialogLabel: '이미지',
  spokenPosition: (k: number, n: number, lead?: 'closest' | 'clouded') =>
    `이미지 ${f.int(n)}장 중 ${f.int(k)}번째${lead === 'closest' ? ', 가장 자세한 모습' : lead === 'clouded' ? ', 구름에 가림' : ''}`,
  /** 지난 일주일: the rolling window, never 이번 주 */
  spokenLastClear: '지난 일주일보다 앞선 마지막 맑은 모습',
  /** 해마다 본, as the time-lapse's own share title says it (해마다 본 [PLACE]) */
  timelapseLabel: '해마다 본 이 장소의 타임랩스',
  timelapse: '타임랩스',
  zoomOut: '축소',
  zoomOutTitle: '축소(−)',
  zoomIn: '확대',
  zoomInTitle: '확대(+)',
  zoom: (k: number) => `${f.dec(k, 1)}×`,
  close: '이미지 보기 닫기',
  closeTitle: '닫기(Esc)',
  perPixel: (pixel: string) => `픽셀당 ${pixel}`,
  /** 전정색: the panchromatic band's Korean term (§3.7 sats) */
  panTitle: 'Landsat 15 m 전정색 밴드로 선명화',
  panProduct: (pixel: string) => `Landsat C2 L2 + L1 전정색 · ${pixel}`,
  status: {
    clouded: (pct?: number) => `구름${pct !== undefined ? ` · ${f.int(pct)}%` : ''}`,
    clearAtSpot: '이 지점 맑음',
  },
  replayLabel: '지구본에서 이 통과 다시 보기',
  replay: '다시 보기',
  shareLabel: '이 이미지 공유',
  share: '공유',
  filmstripLabel: '모든 이미지',
  thumbLabel: (i: number) => `${f.int(i)}번째 이미지`,
}

export default lightbox
