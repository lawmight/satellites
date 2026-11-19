/**
 * Arabic copy the report engine emits (see docs/i18n/ar.md §3.7 "`engine`", §5.3, §5.4): the computing readout's
 * progress lines and the report's footnotes about degraded data. The engine stores message ids with raw params, so
 * these are worded when the results paint, in the language showing then.
 *
 * Why it reads this way:
 *  - Progress rows are short mono labels: a masdar or noun phrase («جارٍ تحميل …»، «مطابقة …»), Arabic letters first,
 *    sentence case (Arabic has no capitals; CSS uppercases only the Latin names). Counts keep their number and take
 *    all six CLDR forms, one and two as words («مدار واحد»، «مدارين»); a counter is «120 / 412», each end its own
 *    island, so the start sits on the right.
 *  - A service, archive or instrument is never a bare subject: it takes a head noun («خدمة NASA GIBS»، «أرشيف
 *    Sentinel-2»، «جهاز VIIRS»), and the two archives are «أرشيف Sentinel-2 وأرشيف Landsat», never a dual before the
 *    names (ar.md §5.3). NASA GIBS stays whole, in Latin letters.
 *  - The footnotes quote the results' verdict words: a pass that counts as watched «يُحسب رصدًا», passes shown as likely
 *    «تظهر ضمن «رصد على الأرجح»» (the verdict's title, verdicts.ts).
 *  - The verb comes before its counted subject and agrees with the noun («تُحسب مرات المرور»); a count after a
 *    preposition or as an object takes the genitive and accusative forms (the dual in ـين). A no-break space ties
 *    each number to its noun. No symbol unit follows a clock.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ar')
const nb = '\u00a0'

type Forms = { one: string; two: string; few: string; many: string; other: string }

/** A whole count, or a fraction kept (its plural category is `other`) */
const int = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** A count and its noun: one and two are words (`one`, `two` hold the whole phrase), else the digit before the form */
const count = (n: number, w: Forms) =>
  f.plural(n, {
    zero: `${int(n)}${nb}${w.other}`,
    one: w.one,
    two: w.two,
    few: `${int(n)}${nb}${w.few}`,
    many: `${int(n)}${nb}${w.many}`,
    other: `${int(n)}${nb}${w.other}`,
  })

/** Standing alone or as a subject (nominative): «جسمان»، «يومان»، «مرتا مرور»، «صورتان» */
const OBJECTS: Forms = { one: 'جسم واحد', two: 'جسمان', few: 'أجسام', many: 'جسمًا', other: 'جسم' }
const DAYS: Forms = { one: 'يوم واحد', two: 'يومان', few: 'أيام', many: 'يومًا', other: 'يوم' }
const PASSES: Forms = { one: 'مرة مرور واحدة', two: 'مرتا مرور', few: 'مرات مرور', many: 'مرة مرور', other: 'مرة مرور' }
const IMAGES: Forms = { one: 'صورة واحدة', two: 'صورتان', few: 'صور', many: 'صورة', other: 'صورة' }
/** After a masdar or a preposition (genitive): «مدارين»، «مشهدين»، «مرتي مرور» */
const ORBITS: Forms = { one: 'مدار واحد', two: 'مدارين', few: 'مدارات', many: 'مدارًا', other: 'مدار' }
const SCENES: Forms = { one: 'مشهد واحد', two: 'مشهدين', few: 'مشاهد', many: 'مشهدًا', other: 'مشهد' }
const PASSES_GEN: Forms = { one: 'مرة مرور واحدة', two: 'مرتي مرور', few: 'مرات مرور', many: 'مرة مرور', other: 'مرة مرور' }
/** Weather-satellite images as an object or after «في» (accusative and genitive): «صورتين لأقمار الطقس» */
const WEATHER_IMAGES: Forms = {
  one: 'صورة واحدة لأقمار الطقس',
  two: 'صورتين لأقمار الطقس',
  few: 'صور لأقمار الطقس',
  many: 'صورة لأقمار الطقس',
  other: 'صورة لأقمار الطقس',
}
/** VIIRS images after «في تأكيد»: the name follows a plural or singular noun, never a dual («صورتين لجهاز VIIRS») */
const VIIRS_IMAGES: Forms = {
  one: 'صورة VIIRS واحدة',
  two: 'صورتين لجهاز VIIRS',
  few: 'صور VIIRS',
  many: 'صورة VIIRS',
  other: 'صورة VIIRS',
}

/** "…; those passes are shown as likely": one pass is «ذلك المرور», more are «مرات المرور هذه» */
const shownAsLikely = (missing: number) =>
  f.category(missing) === 'one' ? 'لذا يظهر ذلك المرور ضمن «رصد على الأرجح».' : 'لذا تظهر مرات المرور هذه ضمن «رصد على الأرجح».'

const engine: typeof en = {
  progress: {
    loadingCatalog: 'جارٍ تحميل كتالوج المدارات',
    catalog: ({ objects }: { objects: number }) => `الكتالوج · ${count(objects, OBJECTS)}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) => `جارٍ حساب ${count(orbits, ORBITS)} · ${count(days, DAYS)}`,
    propagating: ({ done, total }: { done: number; total: number }) => `جارٍ حساب المدارات · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'جارٍ البحث في أرشيف Sentinel-2 + Landsat',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) => `مطابقة ${count(scenes, SCENES)} مع ${count(passes, PASSES_GEN)}`,
    verifyingWeatherStart: 'جارٍ التحقق من فسيفساء ناسا للطقس',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `جارٍ التحقق من فسيفساء ناسا للطقس · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `${count(passes, PASSES)} · ${count(images, IMAGES)}`,
  },

  note: {
    archiveSlow: 'تأخر أرشيف Sentinel-2 وأرشيف Landsat في الرد؛ لذا تظهر مرات المرور من الحسابات المدارية فقط.',
    archiveDown: 'تعذّر الوصول إلى أرشيف Sentinel-2 وأرشيف Landsat؛ لذا تظهر مرات المرور من الحسابات المدارية فقط.',
    sentinel2Thumbnails: 'أُدرجت مشاهد Sentinel-2 عبر Earth Search؛ تظهر بعض المشاهد صورةً مصغرة للمشهد كاملًا، لا مقتطعة حول المكان.',
    sentinel2EarthSearch: 'أُدرجت مشاهد Sentinel-2 عبر Earth Search (بحث Planetary Computer غير متاح).',
    sentinel2Down: 'تعذّر الوصول إلى أرشيف Sentinel-2؛ قد تنقص صور Sentinel-2.',
    landsatDown: 'تعذّر الوصول إلى أرشيف Landsat؛ قد تنقص صور Landsat.',
    openOcean: 'هذه البقعة خارج خطة تصوير Sentinel-2 (محيط مفتوح).',
    // The age is the predicate of «عمر» (nominative): «يومان», «5 أيام», «11 يومًا».
    elementsOld: ({ days }: { days: number }) =>
      `عمر العناصر المدارية ${count(days, DAYS)}، لذا قد تختلف أوقات المرور بضع دقائق.`,
    elementsNewer: 'أُعيد حساب مرات المرور هذه من عناصر مدارية أحدث، لذا قد تختلف أوقاتها بضع دقائق.',
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.category(n) === 'one'
        ? 'تأخرت خدمة NASA GIBS في تأكيد صورة VIIRS واحدة؛ يرصد جهاز VIIRS الأرض كلها يوميًا، لذا يُحسب ذلك المرور رصدًا.'
        : `تأخرت خدمة NASA GIBS في تأكيد ${count(n, VIIRS_IMAGES)}؛ يرصد جهاز VIIRS الأرض كلها يوميًا، لذا تُحسب مرات المرور تلك رصدًا.`,
    gibsSlowAll: 'لم تستجب خدمة NASA GIBS في الوقت المناسب، لذا لا تظهر صور أقمار الطقس.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `لم تُرسل خدمة NASA GIBS في الوقت المناسب ${count(missing, WEATHER_IMAGES)} من أصل ${f.int(total)}؛ ${shownAsLikely(missing)}`,
    gibsDownAll: 'تعذّر الوصول إلى خدمة NASA GIBS، لذا لا تظهر صور أقمار الطقس.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `أخفقت خدمة NASA GIBS في إرسال ${count(missing, WEATHER_IMAGES)} من أصل ${f.int(total)}؛ ${shownAsLikely(missing)}`,
  },
}
export default engine
