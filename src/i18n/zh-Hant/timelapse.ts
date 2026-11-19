/**
 * Traditional Chinese copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the
 * words drawn into the MP4 (see docs/i18n/zh-Hant.md, Appendix A).
 *
 * Why it reads this way: "time-lapse" is 縮時影像 in both regions (never 延時攝影, the mainland word), a frame is a 張
 * like every image (never 幀), and a clear look is 無雲影像, so a loop is "11 張無雲影像 · 每年一張". Dates are built by
 * hand from the frame's day (`ms` is UTC midnight of it, so its UTC fields are the day): "2015年10月22日", "10月22日";
 * Intl's numeric zh form ("2015/10/22") reads as different days in Taiwan and Hong Kong. A year is never grouped
 * ("2015 年起"). The war-zone and glacier captions say only which season every frame is from (每年秋季一張), never why
 * (§8). Rendering is 製作 (算繪 / 渲染 split the regions). The video draws these words as they are: Han has no case.
 * Names (Sentinel-2, Planetary Computer, H.264, Chrome) stay as they are; places go through cjkGap.
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { withName, zhFields } from '../../../api/_lib/i18n/card/zh-Hant'

const f = fmt('zh-Hant')
const pad2 = (n: number) => String(n).padStart(2, '0')

/** "10月22日": the frame's day, read at 'UTC' (its `ms` is UTC midnight of that day) */
const dayMonth = (ms: number) => {
  const d = zhFields(ms, 'UTC')
  return `${d.month}月${d.day}日`
}
/** "2015年10月22日" */
const day = (ms: number) => `${zhFields(ms, 'UTC').year}年${dayMonth(ms)}`
/** "11 張無雲影像" */
const looks = (n: number) => `${f.int(n)} 張無雲影像`
/** "2015 年起": the archive's first year, never grouped */
const since = (year: number) => `${year} 年起`
const EACH: Record<SeasonName, string> = {
  winter: '每年冬季一張',
  spring: '每年春季一張',
  summer: '每年夏季一張',
  autumn: '每年秋季一張',
}
/** The first sentence both notes share */
const SQUARE = (km: number) => `每一張都是同一個 ${f.int(km)} km 見方的範圍，由 Sentinel-2 拍攝，調色方式和這裡所有照片相同。`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => withName('', place, '的縮時影像'),
  title: '縮時影像',
  close: '關閉',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: '播放',
  pause: '暫停',
  slider: '影像',
  frameList: '影像列表',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `第 ${f.int(index)} 張，共 ${f.int(total)} 張：${day(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · 每年一張`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (year: number) => `每年一張無雲影像 · ${since(year)}`,
  captionShort: '這個地點無法製作縮時影像',
  captionError: '影像庫沒有回應',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  /** 盡量: the season is an aim, not a rule (a year whose season has no clear look takes any clear date) */
  note: (km: number) => `${SQUARE(km)}每年盡量選取不同的季節；沒有無雲影像的年份會略過。`,
  noteOneSeason: (km: number) => `${SQUARE(km)}每年都取自同一個季節；那個季節沒有無雲影像的年份會略過。`,
  source: 'Copernicus Sentinel-2，經由 Planetary Computer',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: '正在列出影像庫',
  choosing: '正在挑選無雲影像',
  developing: '正在顯影',
  /** Unpadded: the padding is the counter's on screen, not speech */
  choosingProgress: (done: number, total: number) => `正在挑選無雲影像，${f.int(done)} / ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `正在顯影，${f.int(done)} / ${f.int(total)}`,
  tooCloudy: '這裡雲太多，無法製作縮時影像。',
  tooFew: (count: number, year: number, needed: number) =>
    `${since(year)}${count <= 0 ? '沒有無雲影像' : `只有 ${looks(count)}`} · 需要 ${f.int(needed)} 張`,
  noAnswer: '影像庫沒有回應。',
  unreachable: '無法連上 Planetary Computer',
  retry: '再試一次',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: '分享',
  linkCopied: '連結已複製',
  shareTitle: (place: string) => `${place}，逐年變化`,
  video: '影片',
  /** Padded to two digits, as English, so the 132 px button never changes width as it counts */
  rendering: (pct: number) => `製作中 ${pad2(pct)}%`,
  videoFailed: '影片製作失敗',
  saveVideo: '儲存影片',
  noH264: '這個瀏覽器沒有 H.264 編碼器：檔案可在 Chrome 和 Firefox 播放',
  /** ASCII only: the file name keeps a–z, digits and hyphens */
  fileNamePlace: 'place',
}

export default timelapse
