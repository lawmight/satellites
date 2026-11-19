/**
 * Italian copy the report engine emits (see src/i18n/en/engine.ts; docs/i18n/it.md §3.7 "Computing readout" and
 * "Engine notes", §4, §7): the computing readout's progress lines and the report's footnotes about degraded data.
 *
 * Why it reads this way:
 *  - The readout rows are status labels, so they name a process with a noun (*Caricamento…*, *Propagazione…*,
 *    *Ricerca…*, *Abbinamento…*, *Verifica…*), never a verb in the first person: the product is *noi*, never *io*.
 *    They are written in sentence case (CSS sets the capitals) and kept within the ~40 characters a phone row holds:
 *    *Ricerca archivi Sentinel-2 + Landsat* drops its *negli* for that (36 against 42).
 *  - Counts take all three CLDR forms (*1 orbita*, *412 orbite*, *1.000.000 di orbite*); numbers come from fmt('it')
 *    (*16.912*, *1715*), and a number never parts from its unit (no-break space before *giorni*).
 *  - Footnotes say what failed, then what it means for the numbers, joined by a colon or a semicolon as the English
 *    joins them. The agent is often irrelevant there, so the guide's footnote passives are used (*i passaggi sono
 *    calcolati…*, *sono mostrati come probabilmente osservati*). They quote the verdicts in the plural, in the results'
 *    own words (*contano come osservati*, *probabilmente osservati*).
 *  - The archive notes never put a participle on *Sentinel-2* or *Landsat*: the log-like lines start from a noun
 *    (*Elenco delle scene Sentinel-2…*, *Archivio Landsat non raggiungibile*).
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('it')

/** A grouped count and its noun in the form the count takes: *1 orbita*, *412 orbite*, *1.000.000 di orbite* */
const count = (n: number, one: string, other: string, gap = ' ') =>
  `${f.int(n)}${gap}${f.plural(n, { one, many: `di ${other}`, other })}`
/** *7 giorni*: days are a unit, tied to their number */
const days = (n: number) => count(n, 'giorno', 'giorni', ' ')
/** *quel passaggio è mostrato* / *quei passaggi sono mostrati*, as many as the missing images */
const shownAsLikely = (n: number) =>
  f.plural(n, {
    one: 'quel passaggio è mostrato come probabilmente osservato',
    many: 'quei passaggi sono mostrati come probabilmente osservati',
    other: 'quei passaggi sono mostrati come probabilmente osservati',
  })
/** *3 immagini dei satelliti meteo su 12* */
const weatherOf = (missing: number, total: number) =>
  `${count(missing, 'immagine', 'immagini')} dei satelliti meteo su ${f.int(total)}`

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Caricamento del catalogo delle orbite',
    catalog: ({ objects }: { objects: number }) => `Catalogo · ${count(objects, 'oggetto', 'oggetti')}`,
    propagateStart: ({ orbits, days: d }: { orbits: number; days: number }) =>
      `Propagazione di ${count(orbits, 'orbita', 'orbite')} · ${days(d)}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Propagazione delle orbite · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Ricerca archivi Sentinel-2 + Landsat',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `Abbinamento di ${count(scenes, 'scena', 'scene')} a ${count(passes, 'passaggio', 'passaggi')}`,
    verifyingWeatherStart: 'Verifica dei mosaici meteo NASA',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `Verifica mosaici meteo NASA · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) =>
      `${count(passes, 'passaggio', 'passaggi')} · ${count(images, 'immagine', 'immagini')}`,
  },

  note: {
    archiveSlow: 'Gli archivi Sentinel-2 e Landsat erano troppo lenti: i passaggi sono calcolati solo dalla geometria orbitale.',
    archiveDown:
      'Non è stato possibile raggiungere gli archivi Sentinel-2 e Landsat: i passaggi sono calcolati solo dalla geometria orbitale.',
    sentinel2Thumbnails:
      'Elenco delle scene Sentinel-2 da Earth Search; di alcune mostriamo la miniatura dell’intera scena, non un ritaglio.',
    sentinel2EarthSearch: 'Elenco delle scene Sentinel-2 da Earth Search (la ricerca di Planetary Computer non è disponibile).',
    sentinel2Down: 'Archivio Sentinel-2 non raggiungibile; possono mancare immagini Sentinel-2.',
    landsatDown: 'Archivio Landsat non raggiungibile; possono mancare immagini Landsat.',
    openOcean: 'Questo punto è fuori dal piano di acquisizione di Sentinel-2 (mare aperto).',
    elementsOld: ({ days: d }: { days: number }) =>
      `Gli elementi orbitali hanno ${days(d)}, quindi gli orari dei passaggi possono essere sbagliati di qualche minuto.`,
    elementsNewer:
      'Questi passaggi sono ricostruiti da elementi orbitali più recenti, quindi i loro orari possono essere sbagliati di qualche minuto.',
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.plural(n, {
        one: 'NASA GIBS è stato lento a confermare un’immagine VIIRS; VIIRS riprende tutto il globo ogni giorno, quindi quel passaggio conta come osservato.',
        many: `NASA GIBS è stato lento a confermare ${f.int(n)} di immagini VIIRS; VIIRS riprende tutto il globo ogni giorno, quindi quei passaggi contano come osservati.`,
        other: `NASA GIBS è stato lento a confermare ${f.int(n)} immagini VIIRS; VIIRS riprende tutto il globo ogni giorno, quindi quei passaggi contano come osservati.`,
      }),
    gibsSlowAll: 'NASA GIBS non ha risposto in tempo, quindi le immagini dei satelliti meteo non sono mostrate.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS non ha restituito in tempo ${weatherOf(missing, total)}; ${shownAsLikely(missing)}.`,
    gibsDownAll: 'Non è stato possibile raggiungere NASA GIBS, quindi le immagini dei satelliti meteo non sono mostrate.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS non è riuscito a restituire ${weatherOf(missing, total)}; ${shownAsLikely(missing)}.`,
  },
}
export default engine
