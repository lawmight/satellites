/**
 * Russian copy the report engine emits as MessageRefs (see docs/i18n/ru.md §1.3, §5.3, §3.6): the computing readout's
 * rows and the footnotes about degraded data.
 *
 * Why these forms: the rows are mono status labels, so they are verbal nouns in sentence case («Расчёт орбит», CSS
 * uppercases them), and a count a verbal noun governs takes the genitive in every category («Сверка 121 кадра и 1 201
 * пролёта», «Расчёт 21 орбиты»; «Сверка», not «Сопоставление», keeps the row inside the ~40 characters a phone shows);
 * a count standing alone is nominative («Каталог · 16 912 объектов»). The footnotes say what failed as an impersonal
 * fact, one fact a sentence (the English semicolons become full stops), and name the verdicts in the results' own words
 * in quotation marks («Увидено», «Вероятно, увидено»). NASA GIBS gets the head noun «сервис», so its past tense has a
 * gender. "One image … that pass" is said only for exactly 1: ru's `one` also holds 21 and 31, which take the counted
 * form.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ru')

type Forms = { one: string; few: string; many: string; other: string }

/** A whole count, or a fraction kept (its plural form is `other`) */
const int = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** «16 912 объектов», «7 дней»: a count and its noun, tied with a no-break space */
const count = (n: number, forms: Forms) => `${int(n)}\u00a0${f.plural(n, forms)}`

const OBJECTS: Forms = { one: 'объект', few: 'объекта', many: 'объектов', other: 'объекта' }
const DAYS: Forms = { one: 'день', few: 'дня', many: 'дней', other: 'дня' }
const PASSES: Forms = { one: 'пролёт', few: 'пролёта', many: 'пролётов', other: 'пролёта' }
const IMAGES: Forms = { one: 'снимок', few: 'снимка', many: 'снимков', other: 'снимка' }
// After a verbal noun («Расчёт», «Сверка»): the genitive, which merges few and many.
const ORBITS_GEN: Forms = { one: 'орбиты', few: 'орбит', many: 'орбит', other: 'орбиты' }
const SCENES_GEN: Forms = { one: 'кадра', few: 'кадров', many: 'кадров', other: 'кадра' }
const PASSES_GEN: Forms = { one: 'пролёта', few: 'пролётов', many: 'пролётов', other: 'пролёта' }
// «из 35 снимков», «из 21 снимка»: the noun after the total, in the genitive «из» takes
const OF_IMAGES: Forms = { one: 'снимка', few: 'снимков', many: 'снимков', other: 'снимка' }

/** «3 из 35 снимков метеоспутников» */
const ofTotal = (missing: number, total: number) => `${int(missing)} из ${int(total)}\u00a0${f.plural(total, OF_IMAGES)} метеоспутников`
/** The passes those missing pictures belong to: one pass, or several */
const thosePasses = (missing: number) => (missing === 1 ? 'Этот пролёт показан' : 'Эти пролёты показаны')

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Загрузка каталога орбит',
    catalog: ({ objects }: { objects: number }) => `Каталог · ${count(objects, OBJECTS)}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) => `Расчёт ${count(orbits, ORBITS_GEN)} · ${count(days, DAYS)}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Расчёт орбит · ${int(done)} / ${int(total)}`,
    searchingArchives: 'Поиск снимков Sentinel-2 + Landsat',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `Сверка ${count(scenes, SCENES_GEN)} и ${count(passes, PASSES_GEN)}`,
    verifyingWeatherStart: 'Проверка суточных мозаик NASA',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `Проверка суточных мозаик NASA · ${int(settled)} / ${int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `${count(passes, PASSES)} · ${count(images, IMAGES)}`,
  },

  note: {
    archiveSlow: 'Архивы Sentinel-2 и Landsat отвечали слишком медленно. Пролёты показаны только по геометрии орбит.',
    archiveDown: 'Не удалось связаться с архивами Sentinel-2 и Landsat. Пролёты показаны только по геометрии орбит.',
    sentinel2Thumbnails:
      'Кадры Sentinel-2 найдены через Earth Search. Некоторые из них показаны миниатюрой целого кадра, а не вырезанным фрагментом.',
    sentinel2EarthSearch: 'Кадры Sentinel-2 найдены через Earth Search (поиск Planetary Computer недоступен).',
    sentinel2Down: 'Архив Sentinel-2 недоступен. Снимков Sentinel-2 может не хватать.',
    landsatDown: 'Архив Landsat недоступен. Снимков Landsat может не хватать.',
    openOcean: 'Эта точка вне плана съёмки Sentinel-2 (открытый океан).',
    elementsOld: ({ days }: { days: number }) =>
      `Элементам орбит уже ${count(days, DAYS)}, поэтому время пролётов может отличаться на несколько минут.`,
    elementsNewer: 'Эти пролёты восстановлены по более новым элементам орбит, поэтому их время может отличаться на несколько минут.',
    gibsUnconfirmed: ({ n }: { n: number }) =>
      n === 1
        ? 'Сервис NASA GIBS не успел подтвердить один снимок VIIRS. VIIRS каждый день снимает всю Землю, поэтому этот пролёт отмечен как «Увидено».'
        : `Сервис NASA GIBS не успел подтвердить ${count(n, IMAGES)} VIIRS. VIIRS каждый день снимает всю Землю, поэтому эти пролёты отмечены как «Увидено».`,
    gibsSlowAll: 'Сервис NASA GIBS не успел ответить, поэтому снимки метеоспутников не показаны.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `Сервис NASA GIBS не успел прислать ${ofTotal(missing, total)}. ${thosePasses(missing)} как «Вероятно, увидено».`,
    gibsDownAll: 'Сервис NASA GIBS недоступен, поэтому снимки метеоспутников не показаны.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `Сервису NASA GIBS не удалось прислать ${ofTotal(missing, total)}. ${thosePasses(missing)} как «Вероятно, увидено».`,
  },
}
export default engine
