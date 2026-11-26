/**
 * Vietnamese copy for the time-lapse (see src/i18n/en/timelapse.ts; docs/i18n/vi.md §3.8, §4.1).
 *
 * Why it reads this way: the feature keeps the loan *time-lapse*, as Vietnamese photographers and the press write it;
 * *tua nhanh thời gian* is a video speed effect, not one clear photo a year. A clear look is *ảnh không mây*; a frame
 * is *khung hình*; the frames are "developed" as photographs are at a lab, *rửa ảnh* (*tráng* goes with film, and
 * *tráng khung hình* is no collocation). Each year's look is *chọn* for a season (never *nhắm*, a weapon's verb).
 * Dates are digits, day before month (*22/10/2015*; the frame list's *22/10*), at UTC as the slots are given; the
 * spoken date is spelled out (*ngày 6 tháng 11 năm 2018*), and "N of M" is *N trong số M*, since *3/11* would read as a
 * date. A single-season loop says its season as a whole phrase (*mỗi mùa thu một ảnh*). Years are never grouped.
 */
import type en from '../en/timelapse'
import type { SeasonName } from '@/imagery/seasonRegions'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('vi')
const pad2 = (n: number) => String(n).padStart(2, '0')
/** The frame's civil date (UTC midnight of its local day, as the slots arrive) */
const civil = (ms: number) => {
  const t = new Date(ms)
  return { d: t.getUTCDate(), m: t.getUTCMonth() + 1, y: t.getUTCFullYear() }
}
/** "22/10" */
const dayMonth = (ms: number) => {
  const c = civil(ms)
  return `${c.d}/${c.m}`
}
/** "22/10/2015" */
const day = (ms: number) => `${dayMonth(ms)}/${civil(ms).y}`
/** "ngày 22 tháng 10 năm 2015" */
const spokenDay = (ms: number) => {
  const c = civil(ms)
  return `ngày ${c.d} tháng ${c.m} năm ${c.y}`
}
const looks = (n: number) => f.plural(n, { other: `${f.int(n)} ảnh không mây` })
const EACH: Record<SeasonName, string> = {
  winter: 'mỗi mùa đông một ảnh',
  spring: 'mỗi mùa xuân một ảnh',
  summer: 'mỗi mùa hè một ảnh',
  autumn: 'mỗi mùa thu một ảnh',
}

const timelapse: typeof en = {
  // ── The dialog and its bar ──
  dialog: (place: string) => `Time-lapse của ${place}`,
  title: 'Time-lapse',
  close: 'Đóng',
  escKey: 'Esc',

  // ── Controls ──
  play: 'Phát',
  pause: 'Tạm dừng',
  slider: 'Khung hình',
  frameList: 'Danh sách khung hình',

  // ── Dates and the readout ──
  date: day,
  dayMonth,
  readout: (ms: number, satellite: string) => `${day(ms)} · ${satellite}`,
  frameSpoken: (index: number, total: number, ms: number) => `Khung hình ${f.int(index)} trong số ${f.int(total)}: ${spokenDay(ms)}`,

  // ── The caption ──
  captionYearly: (count: number) => `${looks(count)} · mỗi năm một ảnh`,
  captionSeason: (count: number, season: SeasonName) => `${looks(count)} · ${EACH[season]}`,
  captionGathering: (since: number) => `Mỗi năm một ảnh không mây · từ năm ${since}`,
  captionShort: 'Không có time-lapse cho nơi này',
  captionError: 'Kho lưu trữ không phản hồi',

  // ── The note under the frames ──
  note: (km: number) =>
    `Mỗi khung hình là cùng một ô vuông ${f.int(km)}\u00a0km, do Sentinel-2 chụp và được chỉnh màu như mọi ảnh ở đây. Ảnh mỗi năm được chọn vào một mùa khác nhau; năm nào không có ảnh không mây thì được bỏ qua.`,
  noteOneSeason: (km: number) =>
    `Mỗi khung hình là cùng một ô vuông ${f.int(km)}\u00a0km, do Sentinel-2 chụp và được chỉnh màu như mọi ảnh ở đây. Ảnh mọi năm đều được chọn vào cùng một mùa; năm nào không có ảnh không mây vào mùa đó thì được bỏ qua.`,
  source: 'Copernicus Sentinel-2, qua Planetary Computer',

  // ── The waiting screen ──
  listing: 'Đang đọc kho lưu trữ',
  choosing: 'Đang chọn ảnh không mây',
  developing: 'Đang rửa ảnh',
  choosingProgress: (done: number, total: number) => `Đang chọn ảnh không mây, ${f.int(done)} trong số ${f.int(total)}`,
  developingProgress: (done: number, total: number) => `Đang rửa ảnh, ${f.int(done)} trong số ${f.int(total)}`,
  tooCloudy: 'Ở đây quá nhiều mây để làm time-lapse.',
  tooFew: (count: number, since: number, needed: number) =>
    `${count === 0 ? 'Không có ảnh không mây nào' : looks(count)} từ năm ${since} · cần ${f.int(needed)}`,
  noAnswer: 'Kho lưu trữ không phản hồi.',
  unreachable: 'Không kết nối được Planetary Computer',
  retry: 'Thử lại',

  // ── Sharing and the video ──
  share: 'Chia sẻ',
  linkCopied: 'Đã sao chép liên kết',
  shareTitle: (place: string) => `${place}, qua từng năm`,
  video: 'Video',
  // Padded to two digits, as English, so the 132 px button never changes width while it counts.
  rendering: (pct: number) => `Đang tạo ${pad2(pct)}%`,
  videoFailed: 'Lỗi video',
  saveVideo: 'Lưu video',
  /** No *chỉ* ("only"): the English names two browsers it plays in, not the only ones */
  noH264: 'Trình duyệt này không có bộ mã hóa H.264: tệp phát được trên Chrome và Firefox',
  fileNamePlace: 'dia-diem',
}

export default timelapse
