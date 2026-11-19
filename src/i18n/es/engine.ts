/**
 * Spanish copy the report engine emits (see src/i18n/en/engine.ts; docs/i18n/es.md is the authority on every word).
 *
 * Why it reads this way: the progress rows are the guide's computing readout (§7: *Cargando catálogo de órbitas*,
 * *Propagando 412 órbitas · 7 días*, *Emparejando 12 escenas con 31 pasadas*, *Revisando mosaicos de la NASA · 12 /
 * 31*), each within the 40 characters a 390 px phone holds, in sentence case (CSS uppercases them), with
 * *meteorológico* dropped from the row because the column is narrow (§7 strategy 5). The footnotes say what failed in
 * the impersonal *se* (*No se pudo acceder…*) and quote the verdicts exactly as the results do, agreeing with
 * *pasada* (*esa pasada cuenta como observada*, *se muestran como probablemente observadas*, §3.5). Every count takes
 * Spanish's three plural categories (`many` a copy of `other`), and the verb agrees with it. Proper names stay as they
 * are: NASA GIBS, VIIRS, Sentinel-2, Landsat, Earth Search, Planetary Computer.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('es')
/** A count and its noun, tied by a no-break space: "16 917 objetos", "1 pasada" */
const count = (n: number, one: string, other: string) => `${f.int(n)}\u00a0${f.plural(n, { one, many: other, other })}`

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Cargando catálogo de órbitas',
    catalog: ({ objects }: { objects: number }) => `Catálogo · ${count(objects, 'objeto', 'objetos')}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) =>
      `Propagando ${count(orbits, 'órbita', 'órbitas')} · ${count(days, 'día', 'días')}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Propagando órbitas · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Buscando en Sentinel-2 + Landsat',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `Emparejando ${count(scenes, 'escena', 'escenas')} con ${count(passes, 'pasada', 'pasadas')}`,
    verifyingWeatherStart: 'Revisando mosaicos de la NASA',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `Revisando mosaicos de la NASA · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) =>
      `${count(passes, 'pasada', 'pasadas')} · ${count(images, 'imagen', 'imágenes')}`,
  },

  note: {
    archiveSlow:
      'Los archivos de Sentinel-2 y Landsat tardaron demasiado en responder; las pasadas se muestran solo a partir de la geometría orbital.',
    archiveDown:
      'No se pudo acceder a los archivos de Sentinel-2 y Landsat; las pasadas se muestran solo a partir de la geometría orbital.',
    sentinel2Thumbnails:
      'Sentinel-2 se consultó a través de Earth Search; algunas escenas muestran una miniatura de la escena completa, no un recorte.',
    sentinel2EarthSearch: 'Sentinel-2 se consultó a través de Earth Search (la búsqueda de Planetary Computer no estaba disponible).',
    sentinel2Down: 'Archivo de Sentinel-2 inaccesible; pueden faltar imágenes de Sentinel-2.',
    landsatDown: 'Archivo de Landsat inaccesible; pueden faltar imágenes de Landsat.',
    openOcean: 'Este lugar queda fuera del plan de captura de Sentinel-2 (mar abierto).',
    elementsOld: ({ days }: { days: number }) =>
      `Los elementos orbitales tienen ${count(days, 'día', 'días')} de antigüedad, así que las horas de las pasadas pueden desviarse unos minutos.`,
    elementsNewer:
      'Estas pasadas se reconstruyeron con elementos orbitales más recientes, así que sus horas pueden desviarse unos minutos.',
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.plural(n, {
        one: 'NASA GIBS tardó en confirmar una imagen de VIIRS; VIIRS toma imágenes de todo el planeta cada día, así que esa pasada cuenta como observada.',
        many: `NASA GIBS tardó en confirmar ${f.int(n)}\u00a0imágenes de VIIRS; VIIRS toma imágenes de todo el planeta cada día, así que esas pasadas cuentan como observadas.`,
        other: `NASA GIBS tardó en confirmar ${f.int(n)}\u00a0imágenes de VIIRS; VIIRS toma imágenes de todo el planeta cada día, así que esas pasadas cuentan como observadas.`,
      }),
    gibsSlowAll: 'NASA GIBS no respondió a tiempo, así que no se muestran las imágenes de los satélites meteorológicos.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS no devolvió a tiempo ${f.int(missing)} de ${count(total, 'imagen', 'imágenes')} de satélites meteorológicos; ${shownAsLikely(missing)}`,
    gibsDownAll: 'No se pudo acceder a NASA GIBS, así que no se muestran las imágenes de los satélites meteorológicos.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS no pudo devolver ${f.int(missing)} de ${count(total, 'imagen', 'imágenes')} de satélites meteorológicos; ${shownAsLikely(missing)}`,
  },
}

/** "esa pasada se muestra…" for one missing image, "esas pasadas se muestran…" otherwise: the verb agrees with the count */
function shownAsLikely(missing: number): string {
  return f.plural(missing, {
    one: 'esa pasada se muestra como probablemente observada.',
    many: 'esas pasadas se muestran como probablemente observadas.',
    other: 'esas pasadas se muestran como probablemente observadas.',
  })
}

export default engine
