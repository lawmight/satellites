/**
 * Persian copy for the passes: the list grouped by verdict and the view of one pass (see src/i18n/en/passView.ts for
 * where each message shows; docs/i18n/fa.md §3.4, §3.6, §4.1).
 *
 * Why it reads this way:
 *  - A pass is «گذر», and a noun after a number is singular, so every verdict's count is «N گذر» and the verdict a
 *    count arrives with changes nothing. In running text one is a word («یک گذر»); stacked over its unit the digit
 *    stays («1 / گذر»).
 *  - The plan view is «نقشهٔ گذر» (the pass's map): «نمای بالا» would read as "the view above".
 *  - Notes are declarative; the satellite follows its head noun («ماهوارهٔ Sentinel-2C»), the place is «این مکان» or
 *    «نقطهٔ شما» ("your spot"), never the slot.
 *  - Readout labels are short nouns («ارتفاع», «زاویهٔ ارتفاع», «انحراف»), never «میل» (inclination). Units are words
 *    («کیلومتر», «متر», «کیلومتر بر ثانیه»); compass points arrive in Latin letters («SSW») and stay.
 *  - Spans read right to left with «←», each clock its own island. A degree or a percentage after a Persian word is one
 *    LRI…PDI island (DOM-only text), or right-to-left text draws its sign before the digits.
 *  - Accessible names join with «، » and say a percentage in words («ابر 25 درصد»).
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('fa')
const nb = '\u00a0'
/** A whole count, or a fraction kept */
const count = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** U+2066 LEFT-TO-RIGHT ISOLATE … U+2069 POP DIRECTIONAL ISOLATE: one left-to-right run in a DOM-only string */
const ltr = (s: string) => `\u2066${s}\u2069`
/** «یک گذر» · «31 گذر»: passes in a run of text */
const passes = (n: number) => (n === 1 ? 'یک گذر' : `${count(n)}${nb}گذر`)
/** «هر دقیقه» · «هر 10 دقیقه» */
const everyMinutes = (n: number) => (n === 1 ? 'هر دقیقه' : `هر ${count(n)}${nb}دقیقه`)

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  // An open condition about the past takes «افتاده باشد»; «افتاده بود» would be the counterfactual "had it been down".
  empty: 'در این بازه هیچ‌یک از ماهواره‌هایی که ردیابی می‌کنیم از فراز این مکان نگذشت. این کم پیش می‌آید؛ اگر یکی از منابع داده از کار افتاده باشد، یادداشت‌های بالا این را می‌گویند.',
  imagedOrder: 'نزدیک‌ترین نما، بعد تازه‌ترین‌ها',
  count: (n: number, _verdict: Verdict) => `${count(n)}${nb}گذر`,
  countStack: (n: number, _verdict: Verdict): NumPart => num(count(n), 'گذر'),
  sats: (n: number) => `${count(n)}${nb}ماهواره`,
  // «همهٔ», not «هر»: before a large number «هر» reads "every" («هر 1,565 ردیف»)
  showAllSats: (n: number) => `نمایش همهٔ ${count(n)}${nb}ماهواره`,
  showAllRows: (n: number) => `نمایش همهٔ ${count(n)}${nb}ردیف`,
  showMore: (n: number) => `نمایش ${count(n)}${nb}ردیف دیگر`,
  // The counted noun, never the spoken counter «تا» («40 تا»)
  left: (n: number) => `${count(n)}${nb}ردیف باقی مانده`,
  showFewer: 'نمایش کمتر',
  tag: {
    mosaic: 'موزاییک',
    radar: 'رادار',
    cloudedPct: (pct: number) => `ابری · ${ltr(`${f.int(pct)}%`)}`,
    cloudedAtSpot: 'ابری · روی نقطه',
  },
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day} ${ltr(`${o.time} ${o.zone}`)}`,
      o.ago,
      o.cloudPct !== undefined ? `ابر ${f.int(o.cloudPct)} درصد` : undefined,
      o.clouded ? 'پوشیده از ابر' : undefined,
    ]
      .filter(Boolean)
      .join('، '),
  offNadir: (deg: number) => `انحراف ${ltr(`${f.dec(deg, 1)}°`)}`,
  offNadirShort: (deg: number) => ltr(`${f.dec(deg, 1)}°`),
  distanceKm: (km: number) => `${f.int(km)}${nb}کیلومتر`,
  cloudPct: (pct: number) => `ابر ${ltr(`${f.int(pct)}%`)}`,
  expandLabel: (sat: string, day: string, time: string) => `بزرگ کردن تصویر: ${sat}، ${day} ${ltr(time)}`,
  expandTitle: 'بزرگ کردن تصویر',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `، ${o.operator}` : ''}، ${passes(o.passes)}، آخرین: ${o.day} ${ltr(o.time)}`,
  // Labels with a colon: before the row's day «آخرین یکشنبه» would read "the last Sunday", and «نزدیک‌ترین انحراف» "the
  // nearest deviation". The line still reads when they are shed.
  latest: 'آخرین: ',
  closest: 'نزدیک‌ترین: ',
  cloudChip: 'ابر',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'تصویرها',
  planSection: 'نقشهٔ گذر',
  geometry: 'هندسه',
  replay: 'بازپخش',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `تصویر قرص کامل: یک تصویر از همهٔ آنچه ماهواره می‌بیند، در این‌جا با ${pixel} در هر پیکسل. کم‌جزئیات، اما واقعی و تازه‌ترینی که منتشر شده است؛ تمام هفته ${
      cadenceMin ? everyMinutes(cadenceMin) : 'هر چند دقیقه'
    } یکی مثل آن گرفته است.`,
  mosaicNote: (gsdM: number) =>
    `موزاییک روزانه: ناسا نوارهای هر روز را به یک تصویر با ${f.int(gsdM)}${nb}متر در هر پیکسل می‌دوزد. کم‌جزئیات، اما واقعی و از روز همین گذر.`,
  radarNote:
    'این تصویر راداری است، نه عکس: ماهوارهٔ Sentinel-1 ریزموج می‌فرستد و پژواکش را ثبت می‌کند، پس ابر و تاریکی جلویش را نمی‌گیرند. روشنایی هر نقطه نشان می‌دهد زمین موج‌ها را با چه شدتی برمی‌گرداند: ساختمان‌ها و زمین ناهموار روشن‌اند، آب آرام تیره است.',
  noImage: {
    // The satellite is the subject, after its head noun: «هیچ تصویر Sentinel-2C» would also read "no picture of Sentinel-2C"
    openArchive: (sat: string) => `ماهوارهٔ${nb}${ltr(sat)} در این گذر هیچ تصویری از این نقطه ندارد. نقشهٔ بالا مسیر گذر را نشان می‌دهد.`,
    // «هیچ تصویر عمومی‌ای»: a bare «تصویر عمومی نیست» reads "the image is not public"
    radarPrivate: 'هیچ تصویر عمومی‌ای نیست: آرشیو اپراتور این رادار خصوصی است. نقشهٔ بالا مسیر گذر را نشان می‌دهد.',
    commercialPrivate: 'هیچ تصویر عمومی‌ای نیست: آرشیوهای تجاری خصوصی‌اند. نقشهٔ بالا مسیر گذر را نشان می‌دهد.',
    noneToShow: 'برای این گذر تصویری برای نشان دادن نیست. نقشهٔ بالا مسیر گذر را نشان می‌دهد.',
    archiveDown: 'فعلاً جستجو در آرشیو ممکن نیست. نقشهٔ بالا مسیر گذر را نشان می‌دهد.',
    noScene: 'برای این گذر هیچ صحنه‌ای وجود ندارد. نقشهٔ بالا مسیر گذر را نشان می‌دهد.',
    notYet: 'هنوز هیچ صحنهٔ منتشرشده‌ای با این گذر مطابقت ندارد. صحنه‌های Sentinel-2 و Landsat معمولاً ظرف یک روز می‌رسند.',
    crewed: 'ایستگاه‌های سرنشین‌دار دوربین دارند، اما عکس‌هایشان بر اساس مکان و زمان منتشر نمی‌شود.',
    unavailable: 'تصویر این گذر در دسترس نیست.',
  },
  links: {
    openToSave: 'باز کردن تصویر برای ذخیره',
    downloading: 'در حال دانلود…',
    download: 'دانلود تصویر',
    viewSource: (archive: string) => `دیدن منبع · ${archive}`,
  },
  spot: {
    // The picture's pixel at the pass, so the past tense («بود»): a present «است» reads as today's sky
    checking: 'در حال خواندن پیکسل نقطهٔ شما…',
    clear: 'نقطهٔ شما بی‌ابر بود.',
    cirrus: 'روی نقطهٔ شما سیروس نازک دیده شد؛ ممکن است تصویر را کمی مات کند.',
    cloud: 'روی نقطهٔ شما ابر بود.',
    shadow: 'نقطهٔ شما در سایهٔ ابر بود.',
  },

  // ── the readout strip ────────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'ارتفاع',
    elevation: 'زاویهٔ ارتفاع',
    offNadir: 'انحراف',
    pixel: 'پیکسل',
    band: 'باند',
    sun: 'خورشید',
    cloud: 'ابر',
    cloudAtSpot: 'ابر روی نقطه',
  },
  band: { infrared: 'فروسرخ', visible: 'مرئی', colour: 'رنگی' },
  // «بی‌ابر», never «صاف» (also "flat", "smooth")
  spotValue: { clear: 'بی‌ابر', cirrus: 'سیروس', cloud: 'ابری', shadow: 'سایه' },
  unit: {
    km: 'کیلومتر',
    m: 'متر',
    kmS: 'کیلومتر بر ثانیه',
    up: 'بالای افق',
    mosaic: 'موزاییک',
    scene: 'صحنه',
    sun: { day: 'روز', twilight: 'گرگ‌ومیش', night: 'شب' },
  },

  // ── 01 / Geometry ────────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'نزدیک‌ترین · UTC',
    closestLocal: 'نزدیک‌ترین · محلی',
    groundDistance: 'فاصلهٔ زمینی',
    elevationFromYou: 'زاویهٔ ارتفاع از جای شما',
    groundSpeed: 'سرعت زمینی',
    heading: 'جهت حرکت',
    sunElevation: 'ارتفاع خورشید',
    fieldOfRegard: 'گسترهٔ چرخش',
    swath: 'پهنای نوار',
    inSwath: 'درون نوار',
    inView: 'در میدان دید',
    window: 'بازه',
    noradPass: 'NORAD · گذر',
    scanUtc: 'خط اسکن در این‌جا · UTC',
    scanLocal: 'خط اسکن در این‌جا · محلی',
    aboveEquator: 'بالای استوا در',
    inYourSky: 'در آسمان شما',
    scanDirection: 'جهت اسکن',
    lineSpeed: 'سرعت خط در این‌جا',
    coverage: 'پوشش',
    thisScan: 'این اسکن',
    noradScan: 'NORAD · اسکن',
  },
  northToSouth: 'شمال ← جنوب',
  southToNorth: 'جنوب ← شمال',
  // From first, in logical order: under dir="rtl" it sits on the right and ← points to the end.
  timeRange: (from: string, to: string) => `${ltr(from)} ← ${ltr(to)}`,
  sunPhase: { day: 'روز', twilight: 'گرگ‌ومیش', night: 'شب' },
  fullDisc: 'قرص کامل',
  everyMin: (n: number) => `هر ${count(n)}${nb}دقیقه`,
  upCompass: (compass: string) => `بالای افق · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'صعودی' : 'نزولی'}`,
}
export default passView
