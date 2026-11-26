/**
 * Vietnamese copy for one pass's paragraph (see src/i18n/en/pass.ts; docs/i18n/vi.md §3.5 holds every frame below).
 *
 * Why the sentences are built this way: the order is fixed by the guide (what crossed, where from you, when, how high,
 * how it moved), the clock before the altitude because Vietnamese narrates a moment first (*lúc … ở độ cao …*). The
 * first clause takes *đã* (a finished event) and a pass's conditions *lúc đó* ("at that time"), never *đang*.
 * "Overhead" is *ngay trên đầu bạn*, the everyday phrase for anything passing straight above, with the reader in it.
 * Satellites get no pronoun (*nó* reads careless in writing): the subject is dropped, or it is *Camera*, *Radar của
 * vệ tinh*, *vệ tinh này*; a station is *trạm vũ trụ* on first mention, then *trạm*. An English participle on a missing
 * subject ("Pointing 12.3° …, it could have…") becomes a condition, *Nếu …*, which Vietnamese can hang on the
 * sentence's subject.
 *
 * Vietnamese says a direction the same way after "moving" and after "to the", so there is one table of words, but two
 * nouns before it: *hướng* for where the satellite moved (*di chuyển về hướng nam*) and *phía* for where it was from
 * you (*cách bạn 61 km về phía tây*), so one sentence never says *về phía … về phía*. Readouts use the 16 Vietnamese
 * abbreviations (§4.2), with B for north: N is *nam* (south) to a Vietnamese reader.
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('vi')

/** "nam", "tây bắc": Vietnamese puts east and west first in a compound (*đông bắc*, *tây nam*) */
const WORDS: Record<Compass8, string> = {
  n: 'bắc',
  ne: 'đông bắc',
  e: 'đông',
  se: 'đông nam',
  s: 'nam',
  sw: 'tây nam',
  w: 'tây',
  nw: 'tây bắc',
}

const km = (n: number) => num(f.int(n), 'km')
/** "10 phút": a cadence, its unit set like a number's */
const minutes = (n: number) => num(f.int(n), 'phút')
const clock = (time: string, zone: string) => num(time, zone)

/**
 * "… đã bay qua ngay trên đầu bạn lúc 16:14:21 UTC ở độ cao 786 km" / "… đã bay qua lúc 16:14:21 UTC ở độ cao 786 km,
 * cách bạn 61 km về phía tây": the clause shared by the watched and likely sentences.
 */
const crossedAt = (sat: string, altKm: number, time: string, zone: string, offset?: Offset): Part[] => [
  offset ? `${sat} đã bay qua lúc ` : `${sat} đã bay qua ngay trên đầu bạn lúc `,
  clock(time, zone),
  ' ở độ cao ',
  km(altKm),
  ...(offset ? [', cách bạn ', km(offset.km), ` về phía ${WORDS[offset.dir]}`] : []),
]

const pass: typeof en = {
  compass16: {
    n: 'B',
    nne: 'BĐB',
    ne: 'ĐB',
    ene: 'ĐĐB',
    e: 'Đ',
    ese: 'ĐĐN',
    se: 'ĐN',
    sse: 'NĐN',
    s: 'N',
    ssw: 'NTN',
    sw: 'TN',
    wsw: 'TTN',
    w: 'T',
    wnw: 'TTB',
    nw: 'TB',
    nnw: 'BTB',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    /**
     * No seat: drop *tại [LON]*; no cadence: end at *bên dưới.* (vi.md §3.5). "The whole face of the Earth below it" is
     * one disc, *cả nửa Trái Đất bên dưới* (About's *nửa hành tinh*): *toàn bộ mặt Trái Đất* would be the whole surface
     */
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} không bay qua. Vệ tinh này đứng yên ở độ cao `,
      km(o.altKm),
      o.seat !== undefined ? ` trên xích đạo tại ${o.seat}` : ' trên xích đạo',
      ...(o.cadenceMin
        ? [' và quét cả nửa Trái Đất bên dưới mỗi ', minutes(o.cadenceMin), '.']
        : [' và quét cả nửa Trái Đất bên dưới.']),
    ],
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `Đường quét lần này tới ${o.place} vào khoảng `,
      clock(o.time, o.zone),
      `, di chuyển về hướng ${WORDS[o.heading]}.`,
    ],
    infrared: 'Lúc đó ở đây trời tối, nên đây là ảnh hồng ngoại: đỉnh mây theo nhiệt độ, càng lạnh càng sáng.',
  },

  // ── a pass with a picture ("Đã quan sát") ────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    ...crossedAt(o.sat, o.altKm, o.time, o.zone, o.offset),
    `, di chuyển về hướng ${WORDS[o.heading]} với tốc độ `,
    num(f.dec(o.speedKmS, 2), 'km/s'),
    '.',
  ],
  /**
   * "swept X into NASA's mosaic" is a calque in Vietnamese: the sensor *ghi lại* the place *cho* the mosaic. "At 375 m
   * per pixel" is *ở độ phân giải 375 m*, as Vietnamese remote sensing says it (never *với 375 m mỗi điểm ảnh*)
   */
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Cảm biến ${o.sensor} đã ghi lại ${o.place} cho ảnh ghép màu thực hằng ngày của NASA, ở độ phân giải `,
    num(f.int(o.gsdM), 'm'),
    '.',
  ],
  /** *ghi lại*, not *chụp*: radar does not photograph */
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Radar của vệ tinh, chếch ',
    num(f.dec(o.deg, 1), '°'),
    ` sang một bên, đã ghi lại ${o.place} ở độ phân giải `,
    num(f.int(o.gsdM), 'm'),
    o.dark ? ', trong bóng tối.' : '.',
  ],
  lookingDown: 'Camera hướng thẳng xuống.',
  lookingOff: (deg: number): Rich => ['Camera nghiêng ', num(f.dec(deg, 1), '°'), ' so với phương thẳng đứng.'],
  /**
   * *Lượng mây*, the meteorologist's word for cloud cover; the colon does the work of "is". It is the archive's figure
   * for the whole scene (*cả cảnh ảnh*), not for the crop on screen, which every screen calls *ảnh*
   */
  cloudCover: (pct: number): Rich => ['Lượng mây của cả cảnh ảnh: ', num(f.int(pct), '%'), '.'],

  // ── "Nhiều khả năng đã quan sát" ─────────────────────────────────────────────────────────
  likely: {
    /** No swath known: the sentence ends after the clause */
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      ...crossedAt(o.sat, o.altKm, o.time, o.zone, o.offset),
      ...(o.swathKm ? [', và chỗ của bạn nằm trong dải quét rộng ', km(o.swathKm), '.'] : ['.']),
    ],
    /** "would have": the likely verdict's hedge, *nhiều khả năng*, below notYet's *gần như chắc chắn* (never *hẳn*) */
    archiveFailed: 'Lúc đó trời sáng, nên nhiều khả năng vệ tinh đã ghi lại điểm này. Hiện chưa tra cứu được kho lưu trữ.',
    noScene:
      'Không có cảnh ảnh nào từ lượt bay này. Sentinel-2 chỉ ghi ảnh đất liền và vùng nước ven biển, và có thể đã không lên lịch chụp điểm này.',
    notYet:
      'Lúc đó trời sáng, nên gần như chắc chắn vệ tinh đã ghi lại điểm này. ' +
      'Chưa có cảnh ảnh nào từ lượt bay này được công bố; các kho lưu trữ có thể chậm một ngày hoặc hơn.',
    /** The two-beat ending, *của bạn* twice on purpose (the reader's own clouds and streets), as *X, chứ không phải Y* */
    dark: 'Lúc đó ở đây trời tối. Vệ tinh khí tượng vẫn quét suốt đêm bằng hồng ngoại, nên thứ vệ tinh thấy là mây của bạn, chứ không phải phố của bạn.',
    mosaicUnconfirmed: 'Chưa xác nhận được ảnh ghép hằng ngày của NASA cho lượt bay này ở chỗ của bạn.',
    notPublished: 'Ảnh của vệ tinh này dùng cho dự báo thời tiết; chúng không được công bố thành hình ảnh mà chúng tôi có thể hiển thị.',
  },

  // ── "Có thể đã hướng về đây" ─────────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${o.sat} đã bay qua trong tầm nhìn lúc `,
      clock(o.time, o.zone),
      ...(o.offset ? [', cách bạn ', km(o.offset.km), ` về phía ${WORDS[o.offset.dir]}.`] : [', ngay trên đầu bạn.']),
    ],
    /** Vietnamese may start a sentence with the place (no case, its own capital: vi.md §5.1 rule 3) */
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      `${o.place} nằm trong dải quét rộng `,
      km(o.swathKm),
      ' của vệ tinh này. Nhà vận hành không công bố vệ tinh đã chụp những nơi nào, nên chúng tôi không thể biết nơi này có được chụp hay không.',
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Radar nhìn xuyên mây và bóng tối. ',
      ...(o.deg === undefined ? ['Vệ tinh này'] : ['Nếu chếch ', num(f.dec(o.deg, 1), '°'), ' sang một bên, vệ tinh này']),
      ` có thể đã ghi ảnh ${o.place}.`,
      o.openArchive ? ' Chúng tôi không tìm thấy ảnh nào được công bố từ lượt bay này.' : ' Chúng tôi không thể biết điều đó có xảy ra hay không.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['Nếu nhìn thẳng xuống, '] : ['Nếu nghiêng ', num(f.dec(o.deg, 1), '°'), ' so với phương thẳng đứng, ']),
      `vệ tinh này có thể đã quan sát ${o.place}. Chúng tôi không thể biết điều đó có xảy ra hay không.`,
    ],
  },

  // ── "Bay qua trên đầu" ───────────────────────────────────────────────────────────────────
  /**
   * The clock before the altitude, as every pass sentence; the angle in words a person says (*cao 64° trên đường chân
   * trời*); near the zenith, *gần như ngay trên đầu*
   */
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat} đã bay qua lúc `,
    clock(o.time, o.zone),
    ' ở độ cao ',
    km(o.altKm),
    ', cao ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined
      ? ' trên đường chân trời của bạn, gần như ngay trên đầu.'
      : ` trên đường chân trời của bạn, về phía ${WORDS[o.toward]}.`,
  ],
  /** The station is named on first mention (*trạm* alone is also a bus stop), and the condition closes with *thì* */
  darkStation:
    'Lúc đó chỗ bạn trời tối. Nếu khi ấy trạm vũ trụ vẫn còn được Mặt Trời chiếu sáng, thì trạm đã băng qua bầu trời của bạn như một chấm sáng đều, không nhấp nháy.',
}
export default pass
