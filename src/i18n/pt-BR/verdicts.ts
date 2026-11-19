/**
 * Brazilian Portuguese verdict vocabulary (see src/i18n/en/verdicts.ts; docs/i18n/pt-BR.md §3.5 is the authority on
 * every word here, §4.1 on the verbs).
 *
 * Why it reads this way: the titles are verb phrases whose subject is the unstated satellite (*Observou*, *Deve ter
 * observado*, *Pode ter apontado aqui*, *Sobrevoou*), because Portuguese drops subjects and a verb agrees with
 * nothing's gender: *observada* would have to agree with *a passagem*, and a pass is not what was watched. A title is
 * never put after a bare count (*4 observou* is not Portuguese): the readouts write *4 passagens: Observou* and the
 * timeline uses the lane words. The lane words are nouns and adjectives of at most 8 characters (`IMAGEM`, `PROVÁVEL`,
 * `POSSÍVEL`, `SOBREVOO`); *Imagem*, not *Foto*, because radar images and weather mosaics share that lane (an honest
 * departure from English *Photo*). Every verdict counts *passagens*: 0 takes the plural, since pt-BR's plural rule puts
 * 0 in `one` (§5). The verbs are the guide's: *observou* (the product verb), *cobriu* (never *varrer* with a place),
 * *esteve ao alcance* (never *passou ao alcance*), *sobrevoou*. *Ela* in the could definition is *a câmera*, a noun in
 * the same sentence; the operator is *o operador*, never *seu* (the reader would read "your").
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('pt-BR')

/** "1 passagem", "31 passagens", "0 passagens": every verdict counts passes */
const passes = (n: number) => (n === 0 ? 'passagens' : f.plural(n, { one: 'passagem', many: 'passagens', other: 'passagens' }))

const verdicts: typeof en = {
  imaged: {
    title: 'Observou',
    short: 'Imagem',
    unit: passes,
    definition: 'Há uma imagem real deste lugar em um arquivo público.',
    verb: 'observou',
  },
  likely: {
    title: 'Deve ter observado',
    short: 'Provável',
    unit: passes,
    definition: 'A faixa de uma câmera fixa cobriu este lugar. Nenhuma imagem foi publicada.',
    verb: 'cobriu',
  },
  could: {
    title: 'Pode ter apontado aqui',
    short: 'Possível',
    unit: passes,
    definition: 'Uma câmera orientável ou privada estava ao alcance. O operador não diz se ela olhou.',
    verb: 'esteve ao alcance',
  },
  overhead: {
    title: 'Sobrevoou',
    short: 'Sobrevoo',
    unit: passes,
    definition: 'Cruzou o seu céu. Estações espaciais e todo o resto.',
    verb: 'sobrevoou',
  },
}

export default verdicts
