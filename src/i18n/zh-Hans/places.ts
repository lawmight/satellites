/**
 * Simplified Chinese names for the curated places (see docs/i18n/zh-Hans.md §4.3, §8): the landing's three example
 * chips and the "Surprise me" pool, by the same ids as the English (src/i18n/en/plain/placeNames.ts).
 *
 * Why they read this way: a label is the place's established mainland name (吉萨金字塔群, 科罗拉多大峡谷), and a
 * sublabel runs from large to small with no commas, the way Chinese writes an address (美国内华达州格鲁姆湖); a comma
 * only separates two unlike parts (巴西，面包山和科帕卡巴纳). Chips exist only for the first three. The traps the guide
 * names are avoided on purpose: Golden Gate is 金门大桥 (bare 金门 is Kinmen island), Meteor Crater 巴林杰陨石坑, the
 * Garden City circles are irrigation fields (never 麦田怪圈), Everest sits on 中国和尼泊尔边境, and 51区 is written
 * without a space by established usage. Only what is shown changes: usage stats and links keep the English label.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: '51区', label: '51区', sublabel: '美国内华达州格鲁姆湖' },
  centralPark: { chip: '中央公园', label: '中央公园', sublabel: '美国纽约' },
  giza: { chip: '吉萨', label: '吉萨金字塔群', sublabel: '埃及吉萨' },
  // "Surprise me"
  uluru: { label: '乌鲁鲁', sublabel: '澳大利亚北领地' },
  palmJumeirah: { label: '朱美拉棕榈岛', sublabel: '阿联酋迪拜' },
  worldIslands: { label: '世界群岛', sublabel: '阿联酋迪拜' },
  grandCanyon: { label: '科罗拉多大峡谷', sublabel: '美国亚利桑那州' },
  meteorCrater: { label: '巴林杰陨石坑', sublabel: '美国亚利桑那州' },
  lowerManhattan: { label: '曼哈顿下城', sublabel: '美国纽约' },
  lasVegasStrip: { label: '拉斯维加斯大道', sublabel: '美国内华达州' },
  hooverDam: { label: '胡佛水坝和米德湖', sublabel: '美国内华达州和亚利桑那州' },
  goldenGate: { label: '金门大桥', sublabel: '美国旧金山' },
  kennedySpaceCenter: { label: '肯尼迪航天中心', sublabel: '美国佛罗里达州' },
  washingtonDc: { label: '华盛顿特区', sublabel: '美国国家广场' },
  mountStHelens: { label: '圣海伦斯火山', sublabel: '美国华盛顿州' },
  niagaraFalls: { label: '尼亚加拉瀑布', sublabel: '加拿大安大略省' },
  panamaCanal: { label: '巴拿马运河', sublabel: '巴拿马加通船闸' },
  rioDeJaneiro: { label: '里约热内卢', sublabel: '巴西，面包山和科帕卡巴纳' },
  paris: { label: '巴黎', sublabel: '法国法兰西岛大区' },
  venice: { label: '威尼斯', sublabel: '意大利威尼托大区' },
  vesuvius: { label: '维苏威火山', sublabel: '意大利那不勒斯' },
  istanbul: { label: '伊斯坦布尔', sublabel: '土耳其博斯普鲁斯海峡' },
  chernobyl: { label: '切尔诺贝利', sublabel: '乌克兰基辅州' },
  tableMountain: { label: '桌山', sublabel: '南非开普敦' },
  kilimanjaro: { label: '乞力马扎罗山', sublabel: '坦桑尼亚乞力马扎罗区' },
  everest: { label: '珠穆朗玛峰', sublabel: '中国和尼泊尔边境' },
  angkorWat: { label: '吴哥窟', sublabel: '柬埔寨暹粒' },
  singapore: { label: '新加坡', sublabel: '新加坡滨海湾' },
  hongKong: { label: '香港', sublabel: '中国香港维多利亚港' },
  tokyo: { label: '东京', sublabel: '日本东京' },
  fuji: { label: '富士山', sublabel: '日本静冈县' },
  sydneyHarbour: { label: '悉尼港', sublabel: '澳大利亚悉尼' },
  richat: { label: '理查特结构', sublabel: '毛里塔尼亚撒哈拉沙漠' },
  greatBlueHole: { label: '大蓝洞', sublabel: '伯利兹灯塔礁' },
  boraBora: { label: '波拉波拉岛', sublabel: '法属波利尼西亚社会群岛' },
  hardyReef: { label: '哈迪礁', sublabel: '澳大利亚大堡礁' },
  male: { label: '马累', sublabel: '马尔代夫北马累环礁' },
  deadSea: { label: '死海盐田', sublabel: '以色列和约旦，死海南部' },
  binghamCanyon: { label: '宾汉峡谷铜矿', sublabel: '美国犹他州' },
  mountWhaleback: { label: '惠尔巴克山铁矿', sublabel: '澳大利亚皮尔巴拉' },
  etna: { label: '埃特纳火山', sublabel: '意大利西西里岛' },
  santorini: { label: '圣托里尼', sublabel: '希腊基克拉泽斯群岛' },
  teide: { label: '泰德峰', sublabel: '西班牙特内里费岛' },
  kilauea: { label: '基拉韦厄火山', sublabel: '美国夏威夷州' },
  craterLake: { label: '火山口湖', sublabel: '美国俄勒冈州' },
  glenCanyonDam: { label: '格伦峡谷大坝', sublabel: '美国亚利桑那州佩奇' },
  gardenCity: { label: '花园城圆形灌溉农田', sublabel: '美国堪萨斯州' },
  almeria: { label: '阿尔梅里亚温室群', sublabel: '西班牙安达卢西亚' },
  gibraltar: { label: '直布罗陀', sublabel: '直布罗陀海峡' },
  suezCanal: { label: '苏伊士运河', sublabel: '埃及伊斯梅利亚' },
  aswanDam: { label: '阿斯旺高坝', sublabel: '埃及纳赛尔湖' },
  wadiRum: { label: '瓦迪拉姆', sublabel: '约旦亚喀巴' },
  sossusvlei: { label: '索苏斯盐沼', sublabel: '纳米比亚纳米布沙漠' },
  victoriaFalls: { label: '维多利亚瀑布', sublabel: '赞比亚和津巴布韦' },
  threeGorges: { label: '三峡大坝', sublabel: '中国湖北' },
  shanghai: { label: '上海', sublabel: '中国上海黄浦江' },
  itaipu: { label: '伊泰普水电站', sublabel: '巴西和巴拉圭' },
}
export default places
