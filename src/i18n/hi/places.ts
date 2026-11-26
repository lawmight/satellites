/**
 * Hindi names for the curated places (see docs/i18n/hi.md §4.3): the landing's three example chips and the "Surprise
 * me" pool, every id with the same fields as English.
 *
 * Why these names: each is the established Hindi name where one exists («गीज़ा के पिरामिड», «नियाग्रा जलप्रपात»,
 * «मृत सागर», «स्वेज़ नहर», «यूनान»), otherwise a transliteration as Hindi news writes it («लास वेगास स्ट्रिप»,
 * «सोसुसव्लाई»). A country is written as the where line under a searched place writes it (Intl's names through
 * shownCountryName: «मिस्र», «तुर्किये», «संयुक्त अरब अमीरात», «हाँग काँग»), so one country is never named two ways,
 * except the US: Intl's «संयुक्त राज्य» is not how Hindi names it, so the sublabels say «अमेरिका» (docs/i18n/hi.md
 * §4.3). Garden City's circles are irrigated fields, so they are «गोल खेत», what they are, not crop circles. Sublabels
 * run most specific first, with commas, as Hindi addresses do. Usage stats, record_lookup and shares keep the English
 * label, so nothing here splits a count.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'एरिया 51', label: 'एरिया 51', sublabel: 'ग्रूम लेक, नेवादा, अमेरिका' },
  centralPark: { chip: 'सेंट्रल पार्क', label: 'सेंट्रल पार्क', sublabel: 'न्यूयॉर्क, अमेरिका' },
  giza: { chip: 'गीज़ा', label: 'गीज़ा के पिरामिड', sublabel: 'गीज़ा, मिस्र' },
  // "Surprise me"
  uluru: { label: 'उलुरु', sublabel: 'नॉर्दर्न टेरिटरी, ऑस्ट्रेलिया' },
  palmJumeirah: { label: 'पाम जुमेराह', sublabel: 'दुबई, संयुक्त अरब अमीरात' },
  worldIslands: { label: 'द वर्ल्ड द्वीपसमूह', sublabel: 'दुबई, संयुक्त अरब अमीरात' },
  grandCanyon: { label: 'ग्रैंड कैन्यन', sublabel: 'एरिज़ोना, अमेरिका' },
  meteorCrater: { label: 'मीटियोर क्रेटर', sublabel: 'एरिज़ोना, अमेरिका' },
  lowerManhattan: { label: 'लोअर मैनहैटन', sublabel: 'न्यूयॉर्क, अमेरिका' },
  lasVegasStrip: { label: 'लास वेगास स्ट्रिप', sublabel: 'नेवादा, अमेरिका' },
  hooverDam: { label: 'हूवर बाँध और लेक मीड', sublabel: 'नेवादा और एरिज़ोना, अमेरिका' },
  goldenGate: { label: 'गोल्डन गेट', sublabel: 'सैन फ़्रांसिस्को, अमेरिका' },
  kennedySpaceCenter: { label: 'कैनेडी स्पेस सेंटर', sublabel: 'फ़्लोरिडा, अमेरिका' },
  washingtonDc: { label: 'वॉशिंगटन डी.सी.', sublabel: 'नेशनल मॉल, अमेरिका' },
  mountStHelens: { label: 'माउंट सेंट हेलेंस', sublabel: 'वॉशिंगटन राज्य, अमेरिका' },
  niagaraFalls: { label: 'नियाग्रा जलप्रपात', sublabel: 'ओंटारियो, कनाडा' },
  panamaCanal: { label: 'पनामा नहर', sublabel: 'गातुन लॉक्स, पनामा' },
  rioDeJaneiro: { label: 'रियो डी जनेरियो', sublabel: 'शुगरलोफ़ और कोपाकबाना, ब्राज़ील' },
  paris: { label: 'पेरिस', sublabel: 'इल-द-फ़्रांस, फ़्रांस' },
  venice: { label: 'वेनिस', sublabel: 'वेनेतो, इटली' },
  vesuvius: { label: 'माउंट विसूवियस', sublabel: 'नेपल्स, इटली' },
  istanbul: { label: 'इस्तांबुल', sublabel: 'बॉस्फ़ोरस, तुर्किये' },
  chernobyl: { label: 'चेर्नोबिल', sublabel: 'कीव क्षेत्र, यूक्रेन' },
  tableMountain: { label: 'टेबल माउंटेन', sublabel: 'केप टाउन, दक्षिण अफ़्रीका' },
  kilimanjaro: { label: 'किलिमंजारो', sublabel: 'किलिमंजारो, तंज़ानिया' },
  everest: { label: 'माउंट एवरेस्ट', sublabel: 'नेपाल और चीन' },
  angkorWat: { label: 'अंकोरवाट', sublabel: 'सिएम रीप, कंबोडिया' },
  singapore: { label: 'सिंगापुर', sublabel: 'मरीना बे, सिंगापुर' },
  hongKong: { label: 'हाँग काँग', sublabel: 'विक्टोरिया हार्बर, हाँग काँग' },
  tokyo: { label: 'टोक्यो', sublabel: 'टोक्यो, जापान' },
  fuji: { label: 'माउंट फ़ूजी', sublabel: 'शिज़ुओका, जापान' },
  sydneyHarbour: { label: 'सिडनी हार्बर', sublabel: 'सिडनी, ऑस्ट्रेलिया' },
  richat: { label: 'रिशात संरचना', sublabel: 'सहारा, मॉरिटानिया' },
  greatBlueHole: { label: 'ग्रेट ब्लू होल', sublabel: 'लाइटहाउस रीफ़, बेलीज़' },
  boraBora: { label: 'बोरा बोरा', sublabel: 'सोसाइटी द्वीपसमूह, फ़्रेंच पोलिनेशिया' },
  hardyReef: { label: 'हार्डी रीफ़', sublabel: 'ग्रेट बैरियर रीफ़, ऑस्ट्रेलिया' },
  male: { label: 'माले', sublabel: 'उत्तरी माले एटॉल, मालदीव' },
  deadSea: { label: 'मृत सागर के नमक तालाब', sublabel: 'दक्षिणी बेसिन, इज़राइल और जॉर्डन' },
  binghamCanyon: { label: 'बिंगहम कैन्यन खदान', sublabel: 'यूटा, अमेरिका' },
  mountWhaleback: { label: 'माउंट व्हेलबैक खदान', sublabel: 'पिलबारा, ऑस्ट्रेलिया' },
  etna: { label: 'माउंट एटना', sublabel: 'सिसिली, इटली' },
  santorini: { label: 'सैंटोरिनी', sublabel: 'साइक्लेडेस, यूनान' },
  teide: { label: 'माउंट तेइदे', sublabel: 'तेनेरीफ़, स्पेन' },
  kilauea: { label: 'किलाउएआ', sublabel: 'हवाई, अमेरिका' },
  craterLake: { label: 'क्रेटर लेक', sublabel: 'ओरेगन, अमेरिका' },
  glenCanyonDam: { label: 'ग्लेन कैन्यन बाँध', sublabel: 'पेज, एरिज़ोना, अमेरिका' },
  gardenCity: { label: 'गार्डन सिटी के गोल खेत', sublabel: 'कैनसस, अमेरिका' },
  almeria: { label: 'अल्मेरिया के ग्रीनहाउस', sublabel: 'आंदालूसिया, स्पेन' },
  gibraltar: { label: 'जिब्राल्टर', sublabel: 'जिब्राल्टर जलडमरूमध्य' },
  suezCanal: { label: 'स्वेज़ नहर', sublabel: 'इस्माइलिया, मिस्र' },
  aswanDam: { label: 'असवान बाँध', sublabel: 'नासिर झील, मिस्र' },
  wadiRum: { label: 'वादी रम', sublabel: 'अकाबा, जॉर्डन' },
  sossusvlei: { label: 'सोसुसव्लाई', sublabel: 'नामीब रेगिस्तान, नामीबिया' },
  victoriaFalls: { label: 'विक्टोरिया जलप्रपात', sublabel: 'ज़ाम्बिया और ज़िम्बाब्वे' },
  threeGorges: { label: 'थ्री गॉर्जेस बाँध', sublabel: 'हुबेई, चीन' },
  shanghai: { label: 'शंघाई', sublabel: 'हुआंगपु नदी, चीन' },
  itaipu: { label: 'इताइपू बाँध', sublabel: 'ब्राज़ील और पराग्वे' },
}
export default places
