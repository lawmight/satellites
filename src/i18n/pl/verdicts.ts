/**
 * The ONE verdict vocabulary in Polish (see docs/i18n/pl.md §3.6, §4.1): every screen that names a verdict reads it
 * from here, so «Pod okiem» on the summary, the timeline, the pass list and About is one phrase everywhere.
 *
 * Why these words:
 *  - No title is a past tense with a bare name as its subject: code knows neither the satellite's gender nor the
 *    reader's. «Pod okiem» mirrors the headline's frame («Warszawa pod okiem 256 satelitów…»), and the could title
 *    names the satellite («Satelita mógł spojrzeć»): the could group holds radars, which are not cameras, and the
 *    masculine noun fixes the verb's gender.
 *  - Each title fits one line of the summary tile at 1280 px (English's «Could have pointed here», 23 characters,
 *    fills it): «Zapewne pod okiem» (17), the written register's «presumably», and «Satelita mógł spojrzeć» (22; «tu» is
 *    the screen's place). «Prawdopodobnie pod okiem» (24) and «Satelita mógł tu spojrzeć» (25) wrapped and pushed the
 *    last row under the panel's fold. Sentences keep «prawdopodobnie».
 *  - «Obserwowane» is never a label: on Instagram and X it means "Following" (§9).
 *  - The lanes are short prepositional states in mono caps (about 8 characters): «Obraz» (the owner's "Image", the
 *    lane that holds the pictures, radar and mosaics included), «W kadrze» (never «W pasie», which alone reads "at the waist"), «W zasięgu»,
 *    «Nad głową».
 *  - The spoken `verb` follows a bare satellite name in a comma list («Sentinel-2C, pod okiem, piątek, 6 listopada…»),
 *    so it is the title's own gender-free phrase in running case.
 *  - Every verdict counts passes: «przelot» in pl's four plural forms.
 */
import type en from '../en/verdicts'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('pl')

/** «1 przelot», «3 przeloty», «31 przelotów», «1,5 przelotu» */
const passes = (n: number) => f.plural(n, { one: 'przelot', few: 'przeloty', many: 'przelotów', other: 'przelotu' })

const verdicts: typeof en = {
  imaged: {
    title: 'Pod okiem',
    // «Obraz», as the definition says: the lane also holds radar images and daily mosaics (English says Image; owner)
    short: 'Obraz',
    unit: passes,
    // «obraz», not «zdjęcie»: the imaged verdict includes radar images and weather mosaics.
    definition: 'Prawdziwy obraz tego miejsca jest w\u00a0publicznym archiwum.',
    verb: 'pod okiem',
  },
  likely: {
    title: 'Zapewne pod okiem',
    short: 'W\u00a0kadrze',
    unit: passes,
    definition: 'To miejsce było w\u00a0pasie obrazowania kamery, która zawsze patrzy w\u00a0dół. Nie opublikowano zdjęcia tego miejsca.',
    verb: 'w kadrze',
  },
  could: {
    title: 'Satelita mógł spojrzeć',
    short: 'W\u00a0zasięgu',
    unit: passes,
    definition: 'Wychylna lub prywatna kamera była w\u00a0zasięgu. Jej operator nie podaje, czy tu patrzyła.',
    verb: 'w zasięgu',
  },
  overhead: {
    title: 'Nad głową',
    short: 'Nad głową',
    unit: passes,
    definition: 'Przelot po twoim niebie. Stacje kosmiczne i\u00a0cała reszta.',
    verb: 'nad głową',
  },
}
export default verdicts
