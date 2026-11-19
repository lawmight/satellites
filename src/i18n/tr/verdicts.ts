/**
 * The Turkish verdict vocabulary (see src/i18n/en/verdicts.ts for where each word shows; docs/i18n/tr.md §3.6 is the
 * authority on every word here, and the engine's footnotes, About and the pass list quote these titles).
 *
 * Why these words:
 *  - The titles are active past forms with the satellite as the implied subject, one voice for all four: *İzledi*,
 *    *Muhtemelen izledi*, *Buraya bakabilirdi*, *Tepeden geçti*. *izlemek* is the product verb, kept for satellites
 *    watching places (never *fotoğrafladı, gözetledi*); *Buraya bakabilirdi* states only a capability.
 *  - The lanes are one mono word each, at most 8 letters: *Görüntü* (never *Fotoğraf*: the lane holds radar images and
 *    mosaics), *Muhtemel*, *Menzilde* (*olası* would be a synonym of *muhtemel*: the could lane says what its definition
 *    says, a camera was in range), *Tepeden*. CSS uppercases them with Turkish rules (*GÖRÜNTÜ, MENZİLDE*).
 *  - Every verdict counts passes, and a noun after a numeral is always singular: *1 geçiş*, *31 geçiş*.
 *  - `verb` is said alone after the satellite's name in a row's spoken summary (*Sentinel-2C, izledi, …*), so it is
 *    active; the passive (*izlendi*) would say the satellite was watched. No headline is built from it.
 *  - In the definitions a possessive never follows a sentence about the place (§5.2): the likely one says *Buranın
 *    görüntüsü*, and the could one's *Operatörü* follows a sentence whose subject is the camera.
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('tr')

/** "1 geçiş", "31 geçiş": every verdict counts passes, singular after any number */
const passes = (n: number) => f.plural(n, { one: 'geçiş', other: 'geçiş' })

const verdicts: typeof en = {
  imaged: {
    title: 'İzledi',
    // The lane holds radar images and mosaics too: *Görüntü*, never *Fotoğraf*.
    short: 'Görüntü',
    unit: passes,
    definition: 'Bu yerin gerçek bir görüntüsü kamuya açık bir arşivde var.',
    verb: 'izledi',
  },
  likely: {
    title: 'Muhtemelen izledi',
    short: 'Muhtemel',
    unit: passes,
    definition: 'Sabit bir kameranın tarama şeridi bu yeri kapsadı. Buranın görüntüsü yayımlanmadı.',
    verb: 'taradı',
  },
  could: {
    title: 'Buraya bakabilirdi',
    short: 'Menzilde',
    unit: passes,
    definition: 'Yönlendirilebilir ya da arşivi kapalı bir kamera menzildeydi. Operatörü bakıp bakmadığını söylemiyor.',
    verb: 'görüş alanından geçti',
  },
  overhead: {
    title: 'Tepeden geçti',
    short: 'Tepeden',
    unit: passes,
    definition: 'Gökyüzünden geçti. İstasyonlar ve geri kalan her şey.',
    verb: 'tepeden geçti',
  },
}

export default verdicts
