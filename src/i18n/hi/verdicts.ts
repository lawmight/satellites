/**
 * The ONE verdict vocabulary in Hindi (see docs/i18n/hi.md §3.5, §4.1): every screen that names a verdict reads it
 * from here, so «देखा गया» on the summary, the timeline, the pass list and About is one phrase everywhere.
 *
 * Why these forms: the four titles are one gradient on the product's verb, so a reader sees degrees of one question:
 * «देखा गया» (was watched; also how Hindi messengers mark a message "Seen"), «संभवतः देखा गया» (probably watched),
 * «यहाँ देख सकता था» (could have looked here), «ऊपर से गुज़रा» (passed over). Each is the default masculine, which is
 * also the satellite's gender (§5.2), so none guesses anything. The lanes name what each verdict rests on: «तस्वीर»,
 * «संभवतः» (probably), «पहुँच में» (in reach: the could verdict's fact; «मुमकिन», "possible", read as a synonym of
 * «संभवतः»), «ऊपर से». Every verdict counts passes, and Hindi counts them as times: «31 बार», invariant, so «देखा गया ·
 * 31 बार» reads "watched 31 times". A fixed camera is «न मुड़ने वाला कैमरा», the exact opposite of a steerable «मुड़ने
 * वाला कैमरा» (not «सीधे नीचे देखने वाला»: VIIRS and MODIS see far to the side), never «स्थिर», which is a camera that
 * stands still. The could verdict's words all rest on «पहुँच» (reach). The spoken verb follows a bare satellite name in
 * a comma list.
 */
import type en from '../en/verdicts'

/** «1 बार», «31 बार»: every verdict counts passes as times */
const times = () => 'बार'

const verdicts: typeof en = {
  imaged: {
    title: 'देखा गया',
    short: 'तस्वीर',
    unit: times,
    definition: 'इस जगह की एक असली तस्वीर किसी सार्वजनिक संग्रह में मौजूद है।',
    verb: 'देखा',
  },
  likely: {
    title: 'संभवतः देखा गया',
    short: 'संभवतः',
    unit: times,
    definition: 'न मुड़ने वाले कैमरे की पट्टी इस जगह के ऊपर से गुज़री। इस जगह की कोई तस्वीर प्रकाशित नहीं हुई है।',
    verb: 'पट्टी ऊपर से गुज़री',
  },
  could: {
    title: 'यहाँ देख सकता था',
    short: 'पहुँच में',
    unit: times,
    definition: 'मुड़ने वाला या निजी कैमरा पहुँच में था। उसका संचालक नहीं बताता कि कैमरे ने इधर देखा या नहीं।',
    verb: 'पहुँच के दायरे में आया',
  },
  overhead: {
    title: 'ऊपर से गुज़रा',
    short: 'ऊपर से',
    unit: times,
    definition: 'आपके आसमान से गुज़रा। स्टेशन और बाकी सब कुछ।',
    verb: 'ऊपर से गुज़रा',
  },
}
export default verdicts
