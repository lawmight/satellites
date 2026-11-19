/**
 * Ukrainian copy the report engine emits as MessageRefs (see docs/i18n/uk.md §1.3, §5.3, §6.2): the computing
 * readout's rows and the footnotes about degraded data.
 *
 * Why these forms: the rows are mono status labels, so they are verbal nouns in sentence case («Розрахунок орбіт»,
 * CSS uppercases them), and a count a verbal noun governs takes the genitive in every category («Зіставлення 121 кадру
 * та 1 201 прольоту»); a count standing alone is nominative («Каталог · 16 912 об’єктів»). Two counts are joined by
 * «та», never «і / й», because the sound of a number cannot be known. The footnotes say what failed as an impersonal
 * fact, one fact a sentence, and name the verdicts in the results' own words in quotation marks («Побачено»,
 * «Імовірно побачено»). NASA GIBS gets the head noun «сервіс», so its past tense has a gender.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('uk')

type Forms = { one: string; few: string; many: string; other: string }

/** A whole count, or a fraction kept (its plural form is `other`) */
const int = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** «16 912 об’єктів», «7 днів»: a count and its noun, tied with a no-break space */
const count = (n: number, forms: Forms) => `${int(n)}\u00a0${f.plural(n, forms)}`

const OBJECTS: Forms = { one: 'об’єкт', few: 'об’єкти', many: 'об’єктів', other: 'об’єкта' }
const DAYS: Forms = { one: 'день', few: 'дні', many: 'днів', other: 'дня' }
const PASSES: Forms = { one: 'проліт', few: 'прольоти', many: 'прольотів', other: 'прольоту' }
const IMAGES: Forms = { one: 'знімок', few: 'знімки', many: 'знімків', other: 'знімка' }
// After a verbal noun («Розрахунок», «Зіставлення»): the genitive, which collapses few and many.
const ORBITS_GEN: Forms = { one: 'орбіти', few: 'орбіт', many: 'орбіт', other: 'орбіти' }
const SCENES_GEN: Forms = { one: 'кадру', few: 'кадрів', many: 'кадрів', other: 'кадру' }
const PASSES_GEN: Forms = { one: 'прольоту', few: 'прольотів', many: 'прольотів', other: 'прольоту' }
// «з 35 знімків», «з 21 знімка»: the noun after the total
const OF_IMAGES: Forms = { one: 'знімка', few: 'знімків', many: 'знімків', other: 'знімка' }

/** «3 з 35 знімків метеосупутників» */
const ofTotal = (missing: number, total: number) => `${int(missing)} з ${int(total)}\u00a0${f.plural(total, OF_IMAGES)} метеосупутників`
/** The passes those missing pictures belong to: one pass, or several */
const thosePasses = (missing: number) => (missing === 1 ? 'Цей проліт показано' : 'Ці прольоти показано')

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Завантаження каталогу орбіт',
    catalog: ({ objects }: { objects: number }) => `Каталог · ${count(objects, OBJECTS)}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) =>
      `Розрахунок ${count(orbits, ORBITS_GEN)} · ${count(days, DAYS)}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Розрахунок орбіт · ${int(done)} / ${int(total)}`,
    searchingArchives: 'Пошук знімків Sentinel-2 + Landsat',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `Зіставлення ${count(scenes, SCENES_GEN)} та ${count(passes, PASSES_GEN)}`,
    verifyingWeatherStart: 'Перевірка добових мозаїк NASA',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `Перевірка добових мозаїк NASA · ${int(settled)} / ${int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `${count(passes, PASSES)} · ${count(images, IMAGES)}`,
  },

  note: {
    archiveSlow: 'Архіви Sentinel-2 та Landsat відповідали надто повільно. Прольоти показано лише за геометрією орбіт.',
    archiveDown: 'Не вдалося з’єднатися з архівами Sentinel-2 та Landsat. Прольоти показано лише за геометрією орбіт.',
    sentinel2Thumbnails:
      'Кадри Sentinel-2 знайдено через Earth Search. Деякі з них показано мініатюрою цілого кадру, а не вирізаним фрагментом.',
    sentinel2EarthSearch: 'Кадри Sentinel-2 знайдено через Earth Search (пошук Planetary Computer недоступний).',
    sentinel2Down: 'Архів Sentinel-2 недоступний. Знімків Sentinel-2 може бракувати.',
    landsatDown: 'Архів Landsat недоступний. Знімків Landsat може бракувати.',
    openOcean: 'Ця точка поза планом зйомки Sentinel-2 (відкритий океан).',
    elementsOld: ({ days }: { days: number }) =>
      `Елементам орбіти вже ${count(days, DAYS)}, тож час прольотів може відхилятися на кілька хвилин.`,
    elementsNewer: 'Ці прольоти відтворено за новішими елементами орбіти, тож їхній час може відхилятися на кілька хвилин.',
    // "one image … that pass" only for 1: uk's `one` also holds 21, 31, which take the counted form.
    gibsUnconfirmed: ({ n }: { n: number }) =>
      n === 1
        ? 'Сервіс NASA GIBS не встиг підтвердити один знімок VIIRS. VIIRS щодня знімає всю Землю, тож цей проліт позначено як «Побачено».'
        : `Сервіс NASA GIBS не встиг підтвердити ${count(n, IMAGES)} VIIRS. VIIRS щодня знімає всю Землю, тож ці прольоти позначено як «Побачено».`,
    gibsSlowAll: 'Сервіс NASA GIBS не встиг відповісти, тож знімки метеосупутників не показано.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `Сервіс NASA GIBS не встиг надіслати ${ofTotal(missing, total)}. ${thosePasses(missing)} як «Імовірно побачено».`,
    gibsDownAll: 'Сервіс NASA GIBS недоступний, тож знімки метеосупутників не показано.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `Сервісу NASA GIBS не вдалося надіслати ${ofTotal(missing, total)}. ${thosePasses(missing)} як «Імовірно побачено».`,
  },
}
export default engine
