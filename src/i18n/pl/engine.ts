/**
 * Polish copy the report engine emits as MessageRefs (see docs/i18n/pl.md §1.2, §3.6, §3.7, §5.3): the computing
 * readout's rows and the footnotes about degraded data.
 *
 * Why these forms:
 *  - The rows are mono status lines in sentence case (CSS sets them in capitals), one line of about 40 characters. A
 *    state in progress is the imperfective verbal noun («Wczytywanie», «Propagacja», «Dopasowywanie», «Sprawdzanie»),
 *    which has no gender. A verbal noun governs the genitive, so a count after it collapses few and many («Propagacja
 *    1 orbity / 412 orbit», «Dopasowywanie 3 scen do 31 przelotów»); a count that stands alone is nominative
 *    («Katalog · 16 893 obiekty», «812 przelotów · 31 obrazów»).
 *  - The footnotes are calm and impersonal: the archive or the service is the subject, or «nie udało się», or «my» in
 *    the present («przeloty pokazujemy…»). NASA GIBS takes the classifier «usługa» (f.) wherever a verb agrees with
 *    it; a foreign name after a preposition takes one too («z archiwum Earth Search»), so no name is ever declined.
 *  - Verdicts are quoted by their exact titles in „ ” («Pod okiem», «Zapewne pod okiem»), as every other
 *    screen names them (verdicts.ts).
 *  - A number is tied to its noun, and a one-letter word to the next, by a no-break space (§6.3).
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('pl')

type Forms = { one: string; few: string; many: string; other: string }

/** A whole count, or a fraction kept (its plural form is `other`) */
const int = (n: number) => (Number.isInteger(n) ? f.int(n) : f.dec(n, 1))
/** «16 893 obiekty», «7 dni»: a count and its noun, tied with a no-break space */
const count = (n: number, forms: Forms) => `${int(n)}\u00a0${f.plural(n, forms)}`

// Standing alone, or after «mają»: nominative / accusative
const OBJECTS: Forms = { one: 'obiekt', few: 'obiekty', many: 'obiektów', other: 'obiektu' }
const DAYS: Forms = { one: 'dzień', few: 'dni', many: 'dni', other: 'dnia' }
const PASSES: Forms = { one: 'przelot', few: 'przeloty', many: 'przelotów', other: 'przelotu' }
const IMAGES: Forms = { one: 'obraz', few: 'obrazy', many: 'obrazów', other: 'obrazu' }
// After a verbal noun or a genitive preposition («do», «z»): the genitive
const ORBITS_GEN: Forms = { one: 'orbity', few: 'orbit', many: 'orbit', other: 'orbity' }
const SCENES_GEN: Forms = { one: 'sceny', few: 'scen', many: 'scen', other: 'sceny' }
const PASSES_GEN: Forms = { one: 'przelotu', few: 'przelotów', many: 'przelotów', other: 'przelotu' }
const IMAGES_GEN: Forms = { one: 'obrazu', few: 'obrazów', many: 'obrazów', other: 'obrazu' }

/** «3 z 35 obrazów z satelitów pogodowych»: the object of a negated verb, so the genitive */
const ofTotal = (missing: number, total: number) => `${int(missing)} z\u00a0${count(total, IMAGES_GEN)} z\u00a0satelitów pogodowych`
/** The passes those pictures belong to: «ten przelot» for one, «te przeloty» for more */
const thosePasses = (missing: number) => (missing === 1 ? 'ten przelot' : 'te przeloty')

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Wczytywanie katalogu orbit',
    catalog: ({ objects }: { objects: number }) => `Katalog · ${count(objects, OBJECTS)}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) =>
      `Propagacja ${count(orbits, ORBITS_GEN)} · ${count(days, DAYS)}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Propagacja orbit · ${int(done)} / ${int(total)}`,
    // 39 characters, as the English row: the guide's one row that names both archives.
    searchingArchives: 'Szukanie w\u00a0archiwach Sentinel-2/Landsat',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `Dopasowywanie ${count(scenes, SCENES_GEN)} do ${count(passes, PASSES_GEN)}`,
    verifyingWeatherStart: 'Sprawdzanie mozaik NASA',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `Sprawdzanie mozaik NASA · ${int(settled)} / ${int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `${count(passes, PASSES)} · ${count(images, IMAGES)}`,
  },

  note: {
    archiveSlow: 'Archiwa Sentinel-2 i\u00a0Landsat odpowiadały zbyt wolno; przeloty pokazujemy z\u00a0samej geometrii orbit.',
    archiveDown: 'Nie udało się połączyć z\u00a0archiwami Sentinel-2 i\u00a0Landsat; przeloty pokazujemy z\u00a0samej geometrii orbit.',
    sentinel2Thumbnails:
      'Listę scen Sentinel-2 pobrano z\u00a0archiwum Earth Search; część z\u00a0nich pokazujemy jako miniaturę całej sceny, a\u00a0nie wycinek.',
    sentinel2EarthSearch:
      'Listę scen Sentinel-2 pobrano z\u00a0archiwum Earth Search (wyszukiwanie w\u00a0archiwum Planetary Computer jest niedostępne).',
    // Terse, like the English log line.
    sentinel2Down: 'Archiwum Sentinel-2 niedostępne; może brakować obrazów Sentinel-2.',
    landsatDown: 'Archiwum Landsat niedostępne; może brakować obrazów Landsat.',
    openOcean: 'Ten punkt leży poza planem obrazowania Sentinel-2 (otwarty ocean).',
    // «mają 3 dni»: the accusative, as an age is said; always 3 or more.
    elementsOld: ({ days }: { days: number }) =>
      `Elementy orbitalne mają ${count(days, DAYS)}, więc czasy przelotów mogą się różnić o\u00a0kilka minut.`,
    elementsNewer: 'Te przeloty odtworzono z\u00a0nowszych elementów orbitalnych, więc ich czasy mogą się różnić o\u00a0kilka minut.',
    // The negated «nie zdążyła potwierdzić» takes the genitive («jednego obrazu», «3 obrazów»). pl's `one` is 1 alone.
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.plural(n, {
        one: 'Usługa NASA GIBS nie zdążyła potwierdzić jednego obrazu VIIRS; VIIRS rejestruje całą Ziemię codziennie, więc ten przelot liczymy jako „Pod okiem”.',
        few: `Usługa NASA GIBS nie zdążyła potwierdzić ${count(n, IMAGES_GEN)} VIIRS; VIIRS rejestruje całą Ziemię codziennie, więc te przeloty liczymy jako „Pod okiem”.`,
        many: `Usługa NASA GIBS nie zdążyła potwierdzić ${count(n, IMAGES_GEN)} VIIRS; VIIRS rejestruje całą Ziemię codziennie, więc te przeloty liczymy jako „Pod okiem”.`,
        other: `Usługa NASA GIBS nie zdążyła potwierdzić ${count(n, IMAGES_GEN)} VIIRS; VIIRS rejestruje całą Ziemię codziennie, więc te przeloty liczymy jako „Pod okiem”.`,
      }),
    gibsSlowAll: 'Usługa NASA GIBS nie odpowiedziała na czas, więc nie pokazujemy obrazów z\u00a0satelitów pogodowych.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `Usługa NASA GIBS nie przesłała na czas ${ofTotal(missing, total)}; ${thosePasses(missing)} oznaczamy jako „Zapewne pod okiem”.`,
    gibsDownAll: 'Nie udało się połączyć z\u00a0usługą NASA GIBS, więc nie pokazujemy obrazów z\u00a0satelitów pogodowych.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `Usługa NASA GIBS nie zwróciła ${ofTotal(missing, total)}; ${thosePasses(missing)} oznaczamy jako „Zapewne pod okiem”.`,
  },
}
export default engine
