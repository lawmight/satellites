/**
 * Spanish verdict vocabulary (see src/i18n/en/verdicts.ts; docs/i18n/es.md §3.5 is the authority on every word here).
 *
 * Why it reads this way: the titles head the noun *pasada* (f.) and agree with it (*Observada · 12 pasadas*), so they
 * describe the pass, never the reader. *Pudo haber apuntado aquí*, never *Pudo apuntar aquí*, which reads "it managed
 * to point here", the opposite of the verdict. The lane words are the guide's (`IMAGEN`, `PROBABLE`, `POSIBLE`,
 * `DE PASO`: ≤ 8 characters; *Imagen*, not *Foto*, because radar images and weather mosaics sit in that lane). Every
 * verdict counts *pasadas*, with `many` a copy of `other` (§5). The spoken verb stands alone after the satellite's
 * name in a comma-separated list, so it carries its own object (*observó este lugar*): the place is never referred
 * back to with *lo* (§5), and *barrer* is never used for a swath (§3.5).
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('es')

/** "1 pasada", "31 pasadas": every verdict counts passes */
const passes = (n: number) => f.plural(n, { one: 'pasada', many: 'pasadas', other: 'pasadas' })

const verdicts: typeof en = {
  imaged: {
    title: 'Observada',
    short: 'Imagen',
    unit: passes,
    definition: 'Hay una imagen real de este lugar en un archivo público.',
    verb: 'observó este lugar',
  },
  likely: {
    title: 'Probablemente observada',
    short: 'Probable',
    unit: passes,
    definition: 'La franja de una cámara fija cubrió este lugar. No hay ninguna imagen publicada.',
    verb: 'cubrió este lugar con su franja',
  },
  could: {
    title: 'Pudo haber apuntado aquí',
    short: 'Posible',
    unit: passes,
    definition: 'Una cámara orientable o privada tenía este lugar a su alcance. Su operador no dice si llegó a mirar.',
    verb: 'tuvo este lugar a su alcance',
  },
  overhead: {
    title: 'Pasó por encima',
    short: 'De paso',
    unit: passes,
    definition: 'Cruzó tu cielo. Estaciones espaciales y todo lo demás.',
    verb: 'pasó por encima',
  },
}

export default verdicts
