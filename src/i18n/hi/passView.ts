/**
 * Hindi copy for the passes (see docs/i18n/hi.md §3.5, §4.1, §7): the list grouped by verdict, and the view of one
 * pass with its readout strip, notes, links and the 01 / Geometry readouts.
 *
 * Why it is written this way:
 *  - A pass is an «उड़ान» (f) as a noun, and a count of passes is «बार» (times), invariant: «31 बार» needs no plural
 *    form and reads with every verdict («देखा गया · 31 बार»). Satellites and rows are counted with Hindi's plural, zero
 *    with the plural too.
 *  - Readout labels are nouns in narrow mono cells: «ऊँचाई» (altitude), «झुकाव» (off-nadir), «क्षितिज से» over «34°
 *    ऊपर» (an elevation reads as one phrase across label and unit). Units are Hindi's symbols «किमी», «मी», «किमी/से»
 *    (in a readout cell only; prose says «किमी प्रति सेकंड»);
 *    a word in the unit slot («दृश्य», «मोज़ेक», «रात») is a plain word.
 *  - The notes are whole sentences ending in the danda; what failed is said impersonally, and a Latin name is always
 *    followed by a postposition («Sentinel-2 और Landsat के दृश्य»).
 *  - Compass points and clocks arrive written; the arrow in a range keeps its meaning ("until").
 */
import type en from '../en/passView'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'
import type { Verdict } from '@/ui/results/lib/meta'

const f = fmt('hi')
/** Hindi counts zero with the plural; Intl files 0 under `one` (docs/i18n/hi.md §5.3) */
const pl = <T,>(n: number, one: T, other: T): T => (n === 0 ? other : f.plural(n, { one, other }))

const passView: typeof en = {
  // ── the list ──
  empty: 'इस अवधि में हमारी सूची का कोई उपग्रह इस जगह के ऊपर से नहीं गुज़रा। ऐसा कम होता है। ऊपर के नोट बताते हैं कि कोई डेटा स्रोत बंद था या नहीं।',
  imagedOrder: 'पहले सबसे नज़दीकी झलक, फिर नई से पुरानी',
  count: (n: number, _verdict: Verdict) => `${f.int(n)}\u00a0बार`,
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), 'बार'),
  sats: (n: number) => `${f.int(n)}\u00a0उपग्रह`,
  showAllSats: (n: number) => `सभी ${f.int(n)}\u00a0उपग्रह दिखाएँ`,
  showAllRows: (n: number) => `सभी ${f.int(n)}\u00a0${pl(n, 'पंक्ति', 'पंक्तियाँ')} दिखाएँ`,
  showMore: (n: number) => `${f.int(n)} और दिखाएँ`,
  left: (n: number) => `${f.int(n)} बाकी`,
  showFewer: 'कम दिखाएँ',
  tag: {
    mosaic: 'मोज़ेक',
    radar: 'रडार',
    cloudedPct: (pct: number) => `बादल छाए · ${f.pct(pct)}`,
    cloudedAtSpot: 'बादल छाए · आपकी जगह पर',
  },
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [o.sat, o.verb, `${o.day}, ${o.time} ${o.zone}`, o.ago, o.cloudPct !== undefined ? `बादल ${f.int(o.cloudPct)} प्रतिशत` : undefined, o.clouded ? 'बादल छाए' : undefined]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `झुकाव ${f.dec(deg, 1)}°`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)}\u00a0किमी`,
  cloudPct: (pct: number) => `बादल ${f.pct(pct)}`,
  expandLabel: (sat: string, day: string, time: string) => `तस्वीर बड़ी करें: ${sat}, ${day}, ${time}`,
  expandTitle: 'तस्वीर बड़ी करें',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${f.int(o.passes)} बार, आखिरी बार ${o.day}, ${o.time}`,
  latest: 'आखिरी बार: ',
  closest: 'सबसे नज़दीक: ',
  cloudChip: 'बादल',

  // ── one pass ──
  photosSection: 'तस्वीरें',
  planSection: 'उड़ान का नक्शा',
  geometry: 'ज्यामिति',
  replay: 'रीप्ले',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `पूरी डिस्क की तस्वीर: उपग्रह जो कुछ देख सकता है, उस सबकी एक तस्वीर, यहाँ एक पिक्सेल ${pixel} का। बारीक नहीं, पर असली, और अब तक प्रकाशित सबसे नई। वह पूरे हफ़्ते ${
      cadenceMin ? pl(cadenceMin, 'हर मिनट', `हर ${f.int(cadenceMin)} मिनट`) : 'हर कुछ मिनट'
    } में ऐसी एक तस्वीर लेता रहा है।`,
  mosaicNote: (gsdM: number) =>
    `दैनिक मोज़ेक: NASA हर दिन की पट्टियों को जोड़कर ${f.int(gsdM)}\u00a0मी प्रति पिक्सेल की एक तस्वीर बनाता है। बारीक नहीं, पर असली, और इसी उड़ान के दिन की।`,
  radarNote:
    'रडार तस्वीर, फ़ोटो नहीं: Sentinel-1 माइक्रोवेव भेजता है और उनकी गूँज दर्ज करता है, इसलिए बादल और अंधेरा उसे नहीं रोकते। चमक बताती है कि ज़मीन उन्हें कितनी ज़ोर से लौटाती है: इमारतें और ऊबड़-खाबड़ ज़मीन चमकीली दिखती हैं, शांत पानी काला।',
  noImage: {
    openArchive: (sat: string) => `इस उड़ान में ली गई इस जगह की कोई ${sat} तस्वीर नहीं है। ऊपर उड़ान का नक्शा है।`,
    radarPrivate: 'कोई सार्वजनिक तस्वीर नहीं: इस रडार संचालक का संग्रह निजी है। ऊपर उड़ान का नक्शा है।',
    commercialPrivate: 'कोई सार्वजनिक तस्वीर नहीं: व्यावसायिक संग्रह निजी होते हैं। ऊपर उड़ान का नक्शा है।',
    noneToShow: 'इस उड़ान की दिखाने लायक कोई तस्वीर नहीं है। ऊपर उड़ान का नक्शा है।',
    archiveDown: 'अभी संग्रह में खोज नहीं हो सकी। ऊपर उड़ान का नक्शा है।',
    noScene: 'इस उड़ान का कोई दृश्य मौजूद नहीं है। ऊपर उड़ान का नक्शा है।',
    notYet: 'इस उड़ान से मेल खाता कोई दृश्य अभी प्रकाशित नहीं हुआ है। Sentinel-2 और Landsat के दृश्य आमतौर पर एक दिन के भीतर आ जाते हैं।',
    crewed: 'मानवयुक्त स्टेशनों पर कैमरे होते हैं, पर उनकी फ़ोटो जगह और समय के हिसाब से प्रकाशित नहीं होतीं।',
    unavailable: 'इस उड़ान की तस्वीर उपलब्ध नहीं है।',
  },
  links: {
    openToSave: 'सेव करने के लिए तस्वीर खोलें',
    downloading: 'डाउनलोड हो रही है…',
    download: 'तस्वीर डाउनलोड करें',
    viewSource: (archive: string) => `स्रोत देखें · ${archive}`,
  },
  spot: {
    checking: 'आपकी जगह का पिक्सेल पढ़ रहे हैं…',
    clear: 'आपकी जगह पर आसमान साफ़ था।',
    cirrus: 'आपकी जगह पर पतले, ऊँचे बादल दर्ज हुए। इनसे तस्वीर थोड़ी धुंधली हो सकती है।',
    cloud: 'आपकी जगह पर बादल थे।',
    shadow: 'आपकी जगह बादल की छाया में थी।',
  },

  // ── the readout strip ──
  strip: {
    altitude: 'ऊँचाई',
    elevation: 'क्षितिज से',
    offNadir: 'झुकाव',
    pixel: 'पिक्सेल',
    band: 'बैंड',
    sun: 'सूरज',
    cloud: 'बादल',
    cloudAtSpot: 'जगह पर बादल',
  },
  band: { infrared: 'इन्फ्रारेड', visible: 'दृश्य प्रकाश', colour: 'रंगीन' },
  spotValue: { clear: 'साफ़', cirrus: 'पतले बादल', cloud: 'बादल', shadow: 'छाया' },
  unit: {
    km: 'किमी',
    m: 'मी',
    kmS: 'किमी/से',
    up: 'ऊपर',
    mosaic: 'मोज़ेक',
    scene: 'दृश्य',
    sun: { day: 'दिन', twilight: 'धुंधलका', night: 'रात' },
  },

  // ── 01 / Geometry ──
  geo: {
    closestUtc: 'सबसे नज़दीक · UTC',
    closestLocal: 'सबसे नज़दीक · स्थानीय',
    groundDistance: 'ज़मीनी दूरी',
    elevationFromYou: 'आपके क्षितिज से',
    groundSpeed: 'ज़मीनी रफ़्तार',
    heading: 'दिशा',
    sunElevation: 'सूरज की ऊँचाई',
    fieldOfRegard: 'देखने का दायरा',
    swath: 'पट्टी',
    inSwath: 'पट्टी में',
    inView: 'पहुँच में',
    window: 'अवधि',
    noradPass: 'NORAD · उड़ान',
    scanUtc: 'यहाँ स्कैन-रेखा · UTC',
    scanLocal: 'यहाँ स्कैन-रेखा · स्थानीय',
    aboveEquator: 'भूमध्य रेखा के ऊपर',
    inYourSky: 'आपके आसमान में',
    scanDirection: 'स्कैन की दिशा',
    lineSpeed: 'यहाँ रेखा की रफ़्तार',
    coverage: 'दायरा',
    thisScan: 'यह स्कैन',
    noradScan: 'NORAD · स्कैन',
  },
  northToSouth: 'उत्तर → दक्षिण',
  southToNorth: 'दक्षिण → उत्तर',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'दिन', twilight: 'धुंधलका', night: 'रात' },
  fullDisc: 'पूरी डिस्क',
  everyMin: (n: number) => `हर ${f.int(n)}\u00a0मिनट`,
  upCompass: (compass: string) => `ऊपर · ${compass}`,
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'आरोही' : 'अवरोही'}`,
}
export default passView
