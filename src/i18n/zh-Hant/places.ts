/**
 * Traditional Chinese names for the curated places (see docs/i18n/zh-Hant.md §4.3, §8): the landing's three example
 * chips and the "Surprise me" pool, by the same ids as the English (src/i18n/en/plain/placeNames.ts).
 *
 * Why they read this way: a label is the place's established Traditional Chinese name in its Taiwan form, which Hong
 * Kong also reads (吉薩金字塔群, 聖母峰); a sublabel runs from large to small with no commas, the way Chinese writes an
 * address (美國內華達州格魯姆湖), with a comma only between two unlike parts (巴西，麵包山和科帕卡巴納). Country words
 * are the ones Intl prints for zh-Hant-TW, except the UAE, which is the short 阿聯酋 both regions write. Chips exist only
 * for the first three. The guide's traps are avoided on purpose: Golden Gate is 金門大橋 (bare 金門 is Kinmen), Meteor
 * Crater 巴林傑隕石坑, the Garden City circles are irrigation fields (never 麥田圈), Hong Kong's sublabel has no 中國
 * prefix, and 51區 is written without a space by established usage. The Hong Kong forms (悉尼港, 意大利, 珠穆朗瑪峰…)
 * belong to the zh-Hant-HK overlay: §4.3's HK rows, plus goldenGate's 三藩市, which §4.3 misses (noted on the key).
 * Only what is shown changes: usage stats and links keep the English label.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: '51區', label: '51區', sublabel: '美國內華達州格魯姆湖' },
  centralPark: { chip: '中央公園', label: '中央公園', sublabel: '美國紐約' },
  giza: { chip: '吉薩', label: '吉薩金字塔群', sublabel: '埃及吉薩' },
  // "Surprise me"
  uluru: { label: '烏魯魯', sublabel: '澳洲北領地' },
  palmJumeirah: { label: '朱美拉棕櫚島', sublabel: '阿聯酋杜拜' },
  worldIslands: { label: '世界群島', sublabel: '阿聯酋杜拜' },
  grandCanyon: { label: '大峽谷', sublabel: '美國亞利桑那州' },
  meteorCrater: { label: '巴林傑隕石坑', sublabel: '美國亞利桑那州' },
  lowerManhattan: { label: '下曼哈頓', sublabel: '美國紐約' },
  lasVegasStrip: { label: '拉斯維加斯大道', sublabel: '美國內華達州' },
  hooverDam: { label: '胡佛水壩和米德湖', sublabel: '美國內華達州和亞利桑那州' },
  /** zh-Hant-HK overlay: { label: '金門大橋', sublabel: '美國三藩市' } (Hong Kong's name, as its 駐三藩市經貿辦 writes it) */
  goldenGate: { label: '金門大橋', sublabel: '美國舊金山' },
  kennedySpaceCenter: { label: '甘迺迪太空中心', sublabel: '美國佛羅里達州' },
  washingtonDc: { label: '華盛頓特區', sublabel: '美國國家廣場' },
  mountStHelens: { label: '聖海倫火山', sublabel: '美國華盛頓州' },
  niagaraFalls: { label: '尼加拉瀑布', sublabel: '加拿大安大略省' },
  panamaCanal: { label: '巴拿馬運河', sublabel: '巴拿馬加通船閘' },
  rioDeJaneiro: { label: '里約熱內盧', sublabel: '巴西，麵包山和科帕卡巴納' },
  paris: { label: '巴黎', sublabel: '法國法蘭西島' },
  venice: { label: '威尼斯', sublabel: '義大利威尼托' },
  vesuvius: { label: '維蘇威火山', sublabel: '義大利拿坡里' },
  istanbul: { label: '伊斯坦堡', sublabel: '土耳其博斯普魯斯海峽' },
  chernobyl: { label: '車諾比', sublabel: '烏克蘭基輔州' },
  tableMountain: { label: '桌山', sublabel: '南非開普敦' },
  kilimanjaro: { label: '吉力馬札羅山', sublabel: '坦尚尼亞吉力馬札羅區' },
  everest: { label: '聖母峰', sublabel: '尼泊爾和中國邊境' },
  angkorWat: { label: '吳哥窟', sublabel: '柬埔寨暹粒' },
  singapore: { label: '新加坡', sublabel: '新加坡濱海灣' },
  hongKong: { label: '香港', sublabel: '香港維多利亞港' },
  tokyo: { label: '東京', sublabel: '日本東京' },
  fuji: { label: '富士山', sublabel: '日本靜岡縣' },
  sydneyHarbour: { label: '雪梨港', sublabel: '澳洲雪梨' },
  richat: { label: '理查特結構', sublabel: '茅利塔尼亞撒哈拉沙漠' },
  greatBlueHole: { label: '大藍洞', sublabel: '貝里斯燈塔礁' },
  boraBora: { label: '波拉波拉島', sublabel: '法屬玻里尼西亞社會群島' },
  hardyReef: { label: '哈迪礁', sublabel: '澳洲大堡礁' },
  male: { label: '馬列', sublabel: '馬爾地夫北馬列環礁' },
  deadSea: { label: '死海鹽田', sublabel: '以色列和約旦，死海南部' },
  binghamCanyon: { label: '賓漢峽谷銅礦', sublabel: '美國猶他州' },
  mountWhaleback: { label: '惠爾巴克山鐵礦', sublabel: '澳洲皮爾巴拉' },
  etna: { label: '埃特納火山', sublabel: '義大利西西里島' },
  santorini: { label: '聖托里尼', sublabel: '希臘基克拉澤斯群島' },
  teide: { label: '泰德峰', sublabel: '西班牙特內里費島' },
  kilauea: { label: '基拉韋亞火山', sublabel: '美國夏威夷州' },
  craterLake: { label: '火山口湖', sublabel: '美國奧勒岡州' },
  glenCanyonDam: { label: '葛倫峽谷水壩', sublabel: '美國亞利桑那州佩吉' },
  gardenCity: { label: '花園城圓形灌溉農田', sublabel: '美國堪薩斯州' },
  almeria: { label: '阿爾梅里亞溫室群', sublabel: '西班牙安達魯西亞' },
  gibraltar: { label: '直布羅陀', sublabel: '直布羅陀海峽' },
  suezCanal: { label: '蘇伊士運河', sublabel: '埃及伊斯梅利亞' },
  aswanDam: { label: '亞斯文高壩', sublabel: '埃及納瑟湖' },
  wadiRum: { label: '瓦地倫', sublabel: '約旦阿卡巴' },
  sossusvlei: { label: '索蘇斯鹽沼', sublabel: '納米比亞納米布沙漠' },
  victoriaFalls: { label: '維多利亞瀑布', sublabel: '尚比亞和辛巴威' },
  threeGorges: { label: '三峽大壩', sublabel: '中國湖北' },
  shanghai: { label: '上海', sublabel: '中國上海黃浦江' },
  itaipu: { label: '伊泰普水壩', sublabel: '巴西和巴拉圭' },
}
export default places
