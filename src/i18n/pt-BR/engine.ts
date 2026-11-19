/**
 * Brazilian Portuguese copy the report engine emits (see src/i18n/en/engine.ts for where each line shows;
 * docs/i18n/pt-BR.md §3.7 is the authority on the computing rows and the footnotes, §7 on their length).
 *
 * Why it reads this way: the computing rows are status lines, so they take the gerund (*Carregando*, *Calculando*,
 * *Consultando*, *Associando*, *Verificando*), in sentence case (CSS sets them in capitals, accents kept), and each fits
 * the row's 40 characters (the longest, *Verificando mosaicos da NASA · 12 / 35*, is 38). The archives are *consultados*,
 * never *buscados* (which would read as looking for the satellites). The footnotes say plainly what failed and what it
 * means for the numbers, in the impersonal *Não foi possível…*, without apology. They quote the verdict titles as the
 * results write them (*fica em “Observou”*, *ficam em “Deve ter observado”*), read from the 'verdicts' namespace so
 * the two never drift; a pass is never said to be *observada* (a pass is not what was watched). Every count goes
 * through fmt('pt-BR') and pt-BR's plural forms, with 0 given the plural in code (§5). Proper names stay as they are,
 * with their article in static text: *o NASA GIBS*, *o VIIRS*, *o Sentinel-2*, *o Landsat*, *o Earth Search*.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'
import verdicts from './verdicts'

const f = fmt('pt-BR')

/** A form for a count: 0 takes the plural (pt-BR puts it in `one`), `many` reads as `other` */
const pl = (n: number, one: string, other: string) => (n === 0 ? other : f.plural(n, { one, many: other, other }))
/** "16.912 objetos", "1 passagem", "0 imagens": a grouped count and its noun */
const count = (n: number, one: string, other: string) => `${f.int(n)} ${pl(n, one, other)}`
/** The verdict titles, quoted: “Observou”, “Deve ter observado” */
const imaged = `“${verdicts.imaged.title}”`
const likely = `“${verdicts.likely.title}”`

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Carregando catálogo orbital',
    catalog: ({ objects }: { objects: number }) => `Catálogo · ${count(objects, 'objeto', 'objetos')}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) =>
      `Calculando ${count(orbits, 'órbita', 'órbitas')} · ${f.int(days)} ${pl(days, 'dia', 'dias')}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Calculando órbitas · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Consultando Sentinel-2 + Landsat',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `Associando ${count(scenes, 'cena', 'cenas')} a ${count(passes, 'passagem', 'passagens')}`,
    verifyingWeatherStart: 'Verificando mosaicos da NASA',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `Verificando mosaicos da NASA · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) =>
      `${count(passes, 'passagem', 'passagens')} · ${count(images, 'imagem', 'imagens')}`,
  },

  note: {
    archiveSlow:
      'Os arquivos do Sentinel-2 e do Landsat demoraram demais para responder; as passagens aparecem só pela geometria orbital.',
    archiveDown:
      'Não foi possível acessar os arquivos do Sentinel-2 e do Landsat; as passagens aparecem só pela geometria orbital.',
    sentinel2Thumbnails:
      'Sentinel-2 listado pelo Earth Search; algumas cenas aparecem como miniatura da cena inteira, não como recorte.',
    sentinel2EarthSearch: 'Sentinel-2 listado pelo Earth Search (busca do Planetary Computer indisponível).',
    sentinel2Down: 'Arquivo do Sentinel-2 inacessível; podem faltar imagens do Sentinel-2.',
    landsatDown: 'Arquivo do Landsat inacessível; podem faltar imagens do Landsat.',
    openOcean: 'Este ponto está fora do plano de aquisição do Sentinel-2 (oceano aberto).',
    elementsOld: ({ days }: { days: number }) =>
      `Os elementos orbitais têm ${f.int(days)} ${pl(days, 'dia', 'dias')}, por isso os horários das passagens podem errar por alguns minutos.`,
    elementsNewer:
      'Estas passagens foram reconstruídas com elementos orbitais mais recentes, por isso os horários podem errar por alguns minutos.',
    gibsUnconfirmed: ({ n }: { n: number }) =>
      pl(
        n,
        `O NASA GIBS demorou para confirmar 1 imagem VIIRS; o VIIRS capta o planeta inteiro todos os dias, por isso essa passagem fica em ${imaged}.`,
        `O NASA GIBS demorou para confirmar ${f.int(n)} imagens VIIRS; o VIIRS capta o planeta inteiro todos os dias, por isso essas passagens ficam em ${imaged}.`,
      ),
    gibsSlowAll: 'O NASA GIBS não respondeu a tempo, por isso as imagens de satélites meteorológicos não aparecem.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `O NASA GIBS não enviou a tempo ${f.int(missing)} de ${f.int(total)} ${pl(total, 'imagem', 'imagens')} de satélites meteorológicos; ` +
      pl(missing, `essa passagem fica em ${likely}.`, `essas passagens ficam em ${likely}.`),
    gibsDownAll: 'Não foi possível acessar o NASA GIBS, por isso as imagens de satélites meteorológicos não aparecem.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `O NASA GIBS não retornou ${f.int(missing)} de ${f.int(total)} ${pl(total, 'imagem', 'imagens')} de satélites meteorológicos; ` +
      pl(missing, `essa passagem fica em ${likely}.`, `essas passagens ficam em ${likely}.`),
  },
}

export default engine
