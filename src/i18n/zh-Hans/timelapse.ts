/**
 * Simplified Chinese copy for the time-lapse: the player, its waiting screen, its share and video buttons, and the
 * words drawn into the MP4 (see docs/i18n/zh-Hans.md, Appendix A).
 *
 * Why it reads this way: "time-lapse" is 延时摄影, never 延时 alone (that is "delay"); a frame is 帧 and a clear look
 * 无云画面, so a loop is "12 帧无云画面 · 一年一帧". Dates are built by hand from the frame's day (`ms` is UTC midnight
 * of it, so its UTC fields are the day): "2015年10月22日", "10月22日"; Intl's zh form ("2015/10/22") is not the house
 * style. A year after 自 stays ungrouped and touches the Han ("自2015年起"). The war-zone and glacier captions say only
 * which season every frame is from (每年秋季一帧), never why (§8). The video draws these words as they are: Han has no
 * case. Names (Sentinel-2, Planetary Computer, H.264, Chrome) stay as they are; places go through cjkGap.
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'
import { withName, zhFields } from '../../../api/_lib/i18n/card/zh-Hans'

const f = fmt('zh-Hans')
const NB = ' '
const pad2 = (n: number) => String(n).padStart(2, '0')

/** "10月22日": the frame's day, read at 'UTC' (its `ms` is UTC midnight of that day) */
const dayMonth = (ms: number) => {
  const d = zhFields(ms, 'UTC')
  return `${d.month}月${d.day}日`
}
/** "2015年10月22日" */
const day = (ms: number) => `${zhFields(ms, 'UTC').year}年${dayMonth(ms)}`
/** "12 帧无云画面" */
const looks = (n: number) => `${f.int(n)}${NB}帧无云画面`
/** "自2015年起": the archive's first year, never grouped */
const since = (year: number) => `自${year}年起`
const EACH: Record<SeasonName, string> = {
  winter: '每年冬季一帧',
  spring: '每年春季一帧',
  summer: '每年夏季一帧',
  autumn: '每年秋季一帧',
}
/** The first sentence both notes share */
const SQUARE = (km: number) => `每一帧都是同一块 ${f.int(km)}${NB}km 见方的区域，由 Sentinel-2 拍摄，和这里的每张照片一样经过调色。`

const timelapse: typeof en = {
  // ── The dialog and its bar ────────────────────────────────────────────────────────────────
  dialog: (place: string) => withName('', place, '的延时摄影'),
  title: '延时摄影',
  close: '关闭',
  escKey: 'Esc',

  // ── Controls ──────────────────────────────────────────────────────────────────────────────
  play: '播放',
  pause: '暂停',
  slider: '帧',
  frameList: '帧列表',

  // ── Dates and the readout ─────────────────────────────────────────────────────────────────
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `第 ${f.int(index)}${NB}帧，共 ${f.int(total)}${NB}帧：${day(ms)}`,

  // ── The caption ───────────────────────────────────────────────────────────────────────────
  captionYearly: (count: number) => `${looks(count)} · 一年一帧`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (year: number) => `一年一帧无云画面 · ${since(year)}`,
  captionShort: '这个地方没有延时摄影',
  captionError: '图像库没有响应',

  // ── The note under the frames ─────────────────────────────────────────────────────────────
  note: (km: number) => `${SQUARE(km)}每年尽量取一个不同的季节；某一年如果没有无云画面，就略过这一年。`,
  noteOneSeason: (km: number) => `${SQUARE(km)}每一年都取同一个季节；某一年的这个季节如果没有无云画面，就略过这一年。`,
  source: 'Copernicus Sentinel-2，由 Planetary Computer 提供',

  // ── The waiting screen ────────────────────────────────────────────────────────────────────
  listing: '正在检索图像库',
  choosing: '正在挑选无云画面',
  developing: '正在显影',
  choosingProgress: (done: number, total: number) => `正在挑选无云画面，已检查 ${f.int(done)}${NB}张，共 ${f.int(total)}${NB}张`,
  developingProgress: (done: number, total: number) => `正在显影，已完成 ${f.int(done)}${NB}帧，共 ${f.int(total)}${NB}帧`,
  tooCloudy: '这里云太多，做不成延时摄影。',
  tooFew: (count: number, year: number, needed: number) =>
    `${since(year)}${count === 0 ? '没有无云画面' : `只有 ${looks(count)}`} · 至少需要 ${f.int(needed)}${NB}帧`,
  noAnswer: '图像库没有响应。',
  unreachable: '无法连接 Planetary Computer',
  retry: '重试',

  // ── Sharing and the video ─────────────────────────────────────────────────────────────────
  share: '分享',
  linkCopied: '链接已复制',
  shareTitle: (place: string) => `${place}，一年一帧`,
  video: '视频',
  rendering: (pct: number) => `生成中 ${pad2(pct)}%`,
  videoFailed: '视频生成失败',
  saveVideo: '保存视频',
  noH264: '此浏览器没有 H.264 编码器：文件只能在 Chrome 和 Firefox 中播放',
  fileNamePlace: 'place',
}

export default timelapse
