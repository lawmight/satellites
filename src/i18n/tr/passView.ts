/**
 * Turkish copy for the passes: the list grouped by verdict and the view of one pass (see docs/i18n/tr.md §3.4, §3.6,
 * §3.8, §4, §5, §6.3).
 *
 * Why it is built this way:
 *  - Every verdict counts passes (DESIGN §7), so the unit is `geçiş` whatever the group. A noun after a numeral never
 *    takes the plural suffix (`1 geçiş`, `31 geçiş`, `12 uydu`), so the count needs no plural table; satellites are
 *    counted in full words, never `sat` (§6.8).
 *  - No suffix on an inserted value (§5): numbers, names, days and clocks stand before a fixed noun that carries the
 *    case (`Sentinel-2C görüntüsü`, `40 tane daha`, `10 dk’da bir`) or after a comma. The place is never inserted: the
 *    notes say `bu nokta`, `seçtiğin nokta` (your spot, §1.4), `burada`.
 *  - Readout labels are short nouns in sentence case, uppercased by CSS with Turkish rules (`İRTİFA`, `BAKIŞ AÇISI`,
 *    `NOKTADA BULUT`); bearings arrive as the 'pass' namespace's Turkish letters (`GGB`). Percentages put the sign
 *    first (`%25`); a screen reader hears `bulut yüzde 25`.
 *  - The footnotes say `görüntü` for anything that can be radar or a mosaic and `sahne` for an archive's scene (§4);
 *    `fotoğraf` only for a crewed station's pictures, which are photos. A whole sentence after a colon starts with a
 *    capital (TDK, §6.1: `Kamuya açık görüntü yok: Bu radar operatörünün…`, `…gösterir: Binalar…`), as the sats
 *    blurbs write it; a phrase after one stays lowercase (`Tam disk görüntüsü: uydunun görebildiği…`).
 *  - The row thumbnail opens a radar image as well as a photo (only daily mosaics have none), so its label says
 *    `Görüntüyü büyüt`, like the gallery's, rather than `Fotoğrafı büyüt` (the honesty rule, §9.3 item 13).
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('tr')

/** The unit of every verdict's count: singular after any number (`1 geçiş`, `31 geçiş`) */
const PASS = 'geçiş'
const passCount = (n: number) => `${f.int(n)} ${PASS}`
/** "Sentinel-2C, 1 Kas Paz 16:14" */
const who = (sat: string, day: string, time: string) => `${sat}, ${day} ${time}`
/** How often a geostationary satellite takes a full-disc image: `her dakika`, `her 10 dakikada bir`, `birkaç dakikada bir` */
const cadence = (min?: number) =>
  min ? f.plural(min, { one: 'her dakika', other: `her ${f.int(min)}\u00a0dakikada bir` }) : 'birkaç dakikada bir'
/** The footnotes' closing sentence: the drawing above is the pass's plan view */
const PLAN = 'Geçişin kuşbakışı çizimi.'

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'Takip ettiğimiz hiçbir uydu bu aralıkta buranın üzerinden geçmedi. Bu ender olur; bir veri kaynağı çalışmadıysa yukarıdaki notlar bunu söyler.',
  imagedOrder: 'en net görüntü, sonra en yeniler',
  count: (n: number, _verdict: Verdict) => passCount(n),
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), PASS),
  sats: (n: number) => `${f.int(n)} uydu`,
  // A group is only cut past 6 rows, so these always count several: `tümü` reads right for every number they get.
  showAllSats: (n: number) => `${f.int(n)} uydunun tümünü göster`,
  showAllRows: (n: number) => `${f.int(n)} satırın tümünü göster`,
  // `tane` because the noun is left out (§5.3).
  showMore: (n: number) => `${f.int(n)} tane daha göster`,
  left: (n: number) => `${f.int(n)} kaldı`,
  showFewer: 'Daha az göster',
  tag: {
    mosaic: 'Mozaik',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Bulutlu · %${f.int(pct)}`,
    cloudedAtSpot: 'Bulutlu · noktada',
  },
  // The verdict's verb is active after the satellite's name (`Sentinel-2C, izledi`, §3.6).
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day} ${o.time} ${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `bulut yüzde ${f.int(o.cloudPct)}` : undefined,
      // The row's own chip says *Bulutlu · %81*: *tamamen bulutlu* would claim a full cover the number denies.
      o.clouded ? 'bulutlu' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  // `dikeyden`, never `nadir` or `eğim` (§4).
  offNadir: (deg: number) => `dikeyden ${f.dec(deg, 1)}°`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `bulut %${f.int(pct)}`,
  expandLabel: (sat: string, day: string, time: string) => `Görüntüyü büyüt: ${who(sat, day, time)}`,
  expandTitle: 'Görüntüyü büyüt',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${passCount(o.passes)}, sonuncusu ${o.day} ${o.time}`,
  // Labels with a colon: `En yakın dikeyden 5,3°` would read "from the nearest vertical", and `Son 6 Kas` "the last 6".
  latest: 'En son: ',
  closest: 'En yakın: ',
  cloudChip: 'Bulut',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Görüntüler',
  planSection: 'Kuşbakışı çizim',
  geometry: 'Geometri',
  // The section's name is a noun (`Tekrar`); the button that starts it is `Yeniden oynat` (§4).
  replay: 'Tekrar',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Tam disk görüntüsü: uydunun görebildiği her şeyin tek bir görüntüsü; burada piksel başına ${pixel}. Kaba ama gerçek ve yayımlanan en yenisi; uydu bütün hafta ${cadence(cadenceMin)} buna benzer bir görüntü aldı.`,
  mosaicNote: (gsdM: number) =>
    `Günlük mozaik: NASA her günün tarama şeritlerini piksel başına ${f.int(gsdM)} m çözünürlüklü tek bir görüntüde birleştirir. Kaba ama gerçek ve bu geçişin gününden.`,
  radarNote:
    'Fotoğraf değil, radar görüntüsü: Sentinel-1 mikrodalga gönderir ve yankısını kaydeder; bulut ve karanlık onu durdurmaz. Parlaklık, yerin dalgaları ne kadar güçlü geri yansıttığını gösterir: Binalar ve engebeli arazi parlak, durgun su karanlık görünür.',
  noImage: {
    // The satellite's name before the fixed noun `görüntüsü`, so it takes no suffix.
    openArchive: (sat: string) => `Bu geçişten bu noktanın ${sat} görüntüsü yok. ${PLAN}`,
    radarPrivate: `Kamuya açık görüntü yok: Bu radar operatörünün arşivi kapalı. ${PLAN}`,
    commercialPrivate: `Kamuya açık görüntü yok: Ticari arşivler kapalı. ${PLAN}`,
    noneToShow: `Bu geçiş için gösterilecek görüntü yok. ${PLAN}`,
    archiveDown: `Arşiv şu an aranamadı. ${PLAN}`,
    noScene: `Bu geçiş için sahne yok. ${PLAN}`,
    notYet: 'Bu geçişle eşleşen yayımlanmış bir sahne henüz yok. Sentinel-2 ve Landsat sahneleri genellikle bir gün içinde çıkar.',
    crewed: 'İnsanlı istasyonlarda kamera var, ama fotoğrafları yere ve zamana göre yayımlanmıyor.',
    unavailable: 'Bu geçişin görüntüsü kullanılamıyor.',
  },
  links: {
    openToSave: 'Kaydetmek için görüntüyü aç',
    downloading: 'İndiriliyor…',
    download: 'Görüntüyü indir',
    viewSource: (archive: string) => `Kaynağı gör · ${archive}`,
  },
  spot: {
    checking: 'Seçtiğin noktadaki piksel okunuyor…',
    clear: 'Seçtiğin noktada hava açık.',
    cirrus: 'Seçtiğin noktada ince sirrus var; görüntüyü biraz yumuşatabilir.',
    cloud: 'Seçtiğin noktada bulut var.',
    shadow: 'Seçtiğin nokta bulut gölgesindeydi.',
  },

  // ── the readout strip ────────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'İrtifa',
    elevation: 'Ufuktan açı',
    // `Dikeyden`, the rows' word (`dikeyden 5,3°`): one line in the strip's ~10-character cell, where *Bakış açısı*
    // wrapped at 1280 px and dropped its value below its neighbours'. The card keeps *Bakış açısı* (it has room).
    offNadir: 'Dikeyden',
    pixel: 'Piksel',
    band: 'Bant',
    sun: 'Güneş',
    cloud: 'Bulut',
    cloudAtSpot: 'Noktada bulut',
  },
  band: { infrared: 'Kızılötesi', visible: 'Görünür', colour: 'Renkli' },
  // Under NOKTADA BULUT, `Yok` (none) is the clear value and `Var` the cloudy one.
  spotValue: { clear: 'Yok', cirrus: 'Sirrus', cloud: 'Var', shadow: 'Gölge' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/sn',
    up: 'yukarıda',
    mosaic: 'mozaik',
    scene: 'sahne',
    // `alacakaranlık` in full: it may wrap under the value, never be shortened (§6.8).
    sun: { day: 'gündüz', twilight: 'alacakaranlık', night: 'gece' },
  },

  // ── 01 / Geometry ────────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'En yakın an · UTC',
    closestLocal: 'En yakın an · yerel',
    groundDistance: 'Yatay uzaklık',
    elevationFromYou: 'Ufkundan açı',
    groundSpeed: 'Yer hızı',
    heading: 'Yön',
    sunElevation: 'Güneş açısı',
    fieldOfRegard: 'Görüş alanı',
    swath: 'Tarama şeridi',
    inSwath: 'Şeritte',
    inView: 'Görüş alanında',
    // Not `Aralık` alone: in mono caps ARALIK is also December, over a clock range.
    window: 'Zaman aralığı',
    noradPass: 'NORAD · geçiş',
    scanUtc: 'Tarama çizgisi · UTC',
    scanLocal: 'Tarama çizgisi · yerel',
    aboveEquator: 'Ekvatorun üzerinde',
    inYourSky: 'Göğünde',
    scanDirection: 'Tarama yönü',
    lineSpeed: 'Buradaki çizgi hızı',
    coverage: 'Kapsama',
    thisScan: 'Bu tarama',
    noradScan: 'NORAD · tarama',
  },
  northToSouth: 'Kuzey → güney',
  southToNorth: 'Güney → kuzey',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Gündüz', twilight: 'Alacakaranlık', night: 'Gece' },
  fullDisc: 'Tam disk',
  // The suffix sits on the fixed unit `dk` (read `dakikada`), never on the number (§5.3).
  everyMin: (n: number) => `${f.int(n)} dk’da bir`,
  upCompass: (compass: string) => `yukarıda · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'Yükselen' : 'Alçalan'}`,
}
export default passView
