/**
 * Hindi copy the report engine emits (see docs/i18n/hi.md §4.1, §5.3, §7): the computing readout's progress lines and
 * the report's footnotes about degraded data.
 *
 * Why these words: the progress rows are one mono line each beside a number, a duration and a status mark, so they are
 * noun phrases («कक्षाओं की गणना · 400 कक्षाएँ»), never sentences, with the counts in Hindi's plural (zero too) and
 * the noun oblique before a postposition («12 दृश्यों का 340 उड़ानों से मिलान»). The footnotes say what failed and
 * what it means for the numbers, impersonally («… से समय पर जवाब नहीं मिला», «… दिखाई गई हैं»), so no service has
 * to be given a gender. "Watched" and "likely" quote the verdicts' names in quotation marks, with a postposition to
 * link them: «“देखा गया” में गिनी गई है» (counts as watched), «“संभवतः देखा गया” में दिखाई गई हैं» (shown as likely).
 * Proper names stay as they are.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('hi')
/** Hindi counts zero with the plural; Intl files 0 under `one` (docs/i18n/hi.md §5.3) */
const pl = <T,>(n: number, one: T, other: T): T => (n === 0 ? other : f.plural(n, { one, other }))
/** «16,912 वस्तुएँ», «1 उड़ान»: a count and its noun, tied with a no-break space */
const count = (n: number, one: string, other: string) => `${f.int(n)}\u00a0${pl(n, one, other)}`

const engine: typeof en = {
  progress: {
    loadingCatalog: 'कक्षाओं की सूची लोड हो रही है',
    catalog: ({ objects }: { objects: number }) => `सूची · ${count(objects, 'वस्तु', 'वस्तुएँ')}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) =>
      `${count(orbits, 'कक्षा', 'कक्षाओं')} की गणना · ${count(days, 'दिन', 'दिन')}`,
    propagating: ({ done, total }: { done: number; total: number }) => `कक्षाओं की गणना · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Sentinel-2 + Landsat संग्रहों में खोज',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `${count(scenes, 'दृश्य', 'दृश्यों')} का ${count(passes, 'उड़ान', 'उड़ानों')} से मिलान`,
    verifyingWeatherStart: 'NASA के मौसम मोज़ेक की जाँच',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `NASA के मौसम मोज़ेक की जाँच · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) =>
      `${count(passes, 'उड़ान', 'उड़ानें')} · ${count(images, 'तस्वीर', 'तस्वीरें')}`,
  },

  note: {
    archiveSlow: 'Sentinel-2 और Landsat के संग्रहों ने जवाब देने में बहुत देर की, इसलिए उड़ानें सिर्फ़ कक्षाओं की गणना से दिखाई गई हैं।',
    archiveDown: 'Sentinel-2 और Landsat के संग्रहों से संपर्क नहीं हो सका, इसलिए उड़ानें सिर्फ़ कक्षाओं की गणना से दिखाई गई हैं।',
    sentinel2Thumbnails: 'Sentinel-2 की सूची Earth Search से मिली। कुछ दृश्यों में इस जगह का कटा हिस्सा नहीं, पूरे दृश्य की छोटी तस्वीर दिखती है।',
    sentinel2EarthSearch: 'Sentinel-2 की सूची Earth Search से मिली (Planetary Computer में खोज उपलब्ध नहीं थी)।',
    sentinel2Down: 'Sentinel-2 के संग्रह से संपर्क नहीं हुआ। Sentinel-2 की तस्वीरें छूट सकती हैं।',
    landsatDown: 'Landsat के संग्रह से संपर्क नहीं हुआ। Landsat की तस्वीरें छूट सकती हैं।',
    openOcean: 'यह जगह Sentinel-2 की तस्वीरें लेने की योजना से बाहर है (खुला समुद्र)।',
    elementsOld: ({ days }: { days: number }) =>
      `कक्षा के आँकड़े ${count(days, 'दिन', 'दिन')} पुराने हैं, इसलिए उड़ानों का समय कुछ मिनट आगे-पीछे हो सकता है।`,
    elementsNewer: 'ये उड़ानें बाद में प्रकाशित कक्षा के आँकड़ों से दोबारा बनाई गई हैं, इसलिए इनका समय कुछ मिनट आगे-पीछे हो सकता है।',
    gibsUnconfirmed: ({ n }: { n: number }) =>
      pl(
        n,
        'NASA GIBS से एक VIIRS तस्वीर की पुष्टि देर से आई। VIIRS हर दिन पूरी धरती की तस्वीरें लेता है, इसलिए वह उड़ान “देखा गया” में गिनी गई है।',
        `NASA GIBS से ${f.int(n)}\u00a0VIIRS तस्वीरों की पुष्टि देर से आई। VIIRS हर दिन पूरी धरती की तस्वीरें लेता है, इसलिए वे उड़ानें “देखा गया” में गिनी गई हैं।`,
      ),
    gibsSlowAll: 'NASA GIBS से समय पर जवाब नहीं मिला, इसलिए मौसम उपग्रहों की तस्वीरें नहीं दिखाई गई हैं।',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS से मौसम उपग्रहों की ${f.int(total)} में से ${f.int(missing)} ${pl(missing, 'तस्वीर समय पर नहीं मिली, इसलिए वह उड़ान', 'तस्वीरें समय पर नहीं मिलीं, इसलिए वे उड़ानें')} “संभवतः देखा गया” में दिखाई गई ${pl(missing, 'है', 'हैं')}।`,
    gibsDownAll: 'NASA GIBS से संपर्क नहीं हो सका, इसलिए मौसम उपग्रहों की तस्वीरें नहीं दिखाई गई हैं।',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS से मौसम उपग्रहों की ${f.int(total)} में से ${f.int(missing)} ${pl(missing, 'तस्वीर नहीं मिल सकी, इसलिए वह उड़ान', 'तस्वीरें नहीं मिल सकीं, इसलिए वे उड़ानें')} “संभवतः देखा गया” में दिखाई गई ${pl(missing, 'है', 'हैं')}।`,
  },
}
export default engine
