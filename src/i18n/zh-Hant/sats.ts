/**
 * Traditional Chinese blurbs for the satellites (see docs/i18n/zh-Hant.md §4.1, §5.2, §8): the one plain sentence under
 * a satellite's name in the pass view, saying what its camera or radar is.
 *
 * Why it reads this way: satellite, instrument, mission, agency and company names stay as the catalog spells them
 * (Sentinel-2, VIIRS, Maxar, Planet, Copernicus, Operational Land Imager), never 哨兵 or a coined transliteration; a
 * Chinese programme may be called once by its official Chinese name (吉林一號, 天宮, 天和核心艙), with no comment. The
 * words are the glossary's: an instrument is a 成像儀 and a satellite that images a 成像衛星, a swath 掃描帶, a pixel
 * size 每像素 10 m (resolution, 解析度 / 解像度, splits the regions and is never said), panchromatic 黑白波段 (全色態 /
 * 全色 split them too), a full disc 全圓盤影像. Optical imagers 記錄 or 取得 images and radar 取得影像: radar never 拍,
 * and "watched" (Terra, Aqua) is the product's 注視. Nationality is a plain country word (中國的, 南韓的, 義大利的), facts
 * only, never a ranking. The country words are Intl zh-Hant-TW's; the two that Hong Kong's Intl writes otherwise
 * (意大利, 亞塞拜疆) are zh-Hant-HK overlay rows, noted on their keys, since §1.4's key list misses them. Every blurb
 * is one sentence with 。, set as body text that wraps; numbers keep the English grouping (3,040 km, 1.1 km, as
 * fmt('zh-Hant') writes them) and are tied to their unit or measure word with U+00A0, as the landing's running text is,
 * while the space before a number stays breakable. Spelled-out numbers become digits.
 */
import type en from '../en/sats'

/** Ties a number to its unit or measure word in running text */
const NB = ' '

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: `Copernicus 的多光譜成像儀：13${NB}個波段、每像素 10${NB}m、290${NB}km 寬的掃描帶。`,
    landsat8: `Operational Land Imager：彩色波段每像素 30${NB}m，黑白波段每像素 15${NB}m，掃描帶 185${NB}km 寬。`,
    landsat9: `Operational Land Imager 2：彩色波段每像素 30${NB}m，黑白波段每像素 15${NB}m，掃描帶 185${NB}km 寬。`,

    // ── Weather satellites in polar orbit ──
    noaaViirs: `它的 VIIRS 成像儀掃描帶 3,040${NB}km 寬，每天涵蓋整個地球兩次。`,
    suomiNpp: `軌道上第一台 VIIRS 成像儀，從 2011${NB}年起持續掃描地面，掃描帶 3,040${NB}km 寬。`,
    terra: `它的 MODIS 成像儀從 1999${NB}年起一直注視整個地球，一次涵蓋 2,330${NB}km 寬的範圍。`,
    aqua: `它的 MODIS 成像儀從 2002${NB}年起一直注視整個地球，一次涵蓋 2,330${NB}km 寬的範圍。`,
    metop: `歐洲的極軌氣象衛星，搭載的 AVHRR 成像儀掃描帶 2,900${NB}km 寬，每像素 1.1${NB}km。`,
    sentinel3: `它的 OLCI 儀器以 21${NB}個波段記錄陸地和海洋的顏色，掃描帶 1,270${NB}km 寬。`,
    fengyun3: `中國的極軌氣象衛星，搭載的 MERSI 成像儀掃描帶 2,900${NB}km 寬。`,
    fengyun3e: '中國的晨昏軌道氣象衛星，搭載微光 MERSI 成像儀。',

    // ── Geostationary weather satellites ──
    goesEast: `GOES-East：每 10${NB}分鐘取得一張涵蓋美洲的全圓盤影像。`,
    goesWest: `GOES-West：每 10${NB}分鐘取得一張涵蓋太平洋和美洲的全圓盤影像。`,
    goes16: '曾擔任 GOES-East，現在留在軌道上待命備用。',
    goes17: '曾擔任 GOES-West，現在留在軌道上待命備用。',
    himawari9: `日本的氣象衛星：每 10${NB}分鐘取得一張涵蓋亞洲和太平洋的全圓盤影像。`,
    himawari8: 'Himawari-9 的備用衛星。',
    meteosat12: `第一顆第三代 Meteosat（MTG-I1）：每 10${NB}分鐘取得一次歐洲和非洲的影像。`,
    meteosat9: `涵蓋印度洋地區，每 15${NB}分鐘取得一張全圓盤影像。`,
    /** "not counted here": the app does not list it as watching the place */
    meteosatSecondGen: '第二代 Meteosat，我們不把它算作這個地點的全圓盤成像衛星。',
    mtgI2: '第二顆第三代 Meteosat 成像衛星，尚未正式提供服務。',
    geoKompsat2a: `南韓的氣象衛星：每 10${NB}分鐘取得一張全圓盤影像。`,
    fengyun4b: `中國正式運作的地球同步氣象衛星：每 15${NB}分鐘取得一張全圓盤影像。`,
    fengyun4a: '中國較早期的地球同步成像衛星，不列為主要提供服務的衛星。',
    fengyun4c: '中國最新的地球同步成像衛星，尚未正式提供服務。',
    insat: `印度的氣象衛星：每 30${NB}分鐘取得一張全圓盤影像。`,
    insat3d: '印度較早期的氣象衛星，不列為正式運作的成像衛星。',
    elektroL: `俄羅斯的地球同步氣象衛星：每 30${NB}分鐘取得一張全圓盤影像。`,
    elektroL2: '俄羅斯較早期的地球同步氣象衛星，不列為正式運作的成像衛星。',
    elektroL5: '俄羅斯最新的地球同步氣象衛星，尚未列為正式運作的衛星。',

    // ── Commercial and government high-resolution cameras ──
    worldview1: `黑白波段成像衛星，每像素 50${NB}cm，鏡頭能轉向遠離地面軌跡的地方。`,
    worldview2: `8${NB}個波段的成像衛星，黑白波段每像素 46${NB}cm。`,
    worldview3: `有 16${NB}個光譜波段的成像衛星，黑白波段每像素 31${NB}cm。`,
    geoeye1: `黑白波段每像素 41${NB}cm 的成像衛星，從 2008${NB}年起在軌道上運作。`,
    worldviewLegion: `Maxar 的 WorldView Legion 成像衛星之一，每像素約 30${NB}cm。`,
    skysat: `Planet 的可快速轉向成像衛星，每像素約 50${NB}cm，會依指令對準特定目標。`,
    pelican: 'Planet 較新一代的精細成像衛星，可快速轉向。',
    superDove: `Planet 的 SuperDove 立方衛星，整個衛星群每天記錄地球大部分的陸地，每像素約 3${NB}m。`,
    blacksky: `BlackSky 的快速重訪成像衛星，每像素約 1${NB}m 或更細。`,
    pleiades: `可快速轉向的成像衛星，提供每像素 50${NB}cm 的黑白影像。`,
    pleiadesNeo: `可快速轉向的成像衛星，原生像素 30${NB}cm。`,
    spot6: `大範圍成像衛星，黑白波段每像素 1.5${NB}m，掃描帶 60${NB}km 寬。`,
    /** zh-Hant-HK overlay (Intl zh-Hant-HK's country word): 'SPOT 6 的雙子衛星，由亞塞拜疆以 Azersky 之名營運。' */
    spot7: 'SPOT 6 的雙子衛星，由亞塞拜然以 Azersky 之名營運。',
    kompsat3: `南韓的成像衛星，黑白波段每像素 70${NB}cm。`,
    kompsat3a: `南韓的成像衛星，黑白波段每像素 55${NB}cm，另有一個紅外線波段。`,
    jilin1: `中國吉林一號商業衛星星座的成員，成像儀每像素不到 1${NB}m。`,
    superview: `中國的商業成像衛星，每像素約 50${NB}cm 或更細。`,
    gaofenWideField: `中國政府的成像衛星，搭載每像素 2${NB}m 的黑白相機和每像素 16${NB}m 的寬視場相機。`,
    gaofen2: `中國政府的成像衛星，黑白波段每像素 80${NB}cm。`,
    gaofen7: `中國政府的立體測繪成像衛星，每像素不到 1${NB}m。`,
    gaofenOptical: '中國政府的精細光學成像衛星，規格沒有公開。',

    // ── Radar satellites (they see through cloud and at night) ──
    sentinel1: `Copernicus 的 C 波段雷達，每張影像都公開：朝側面觀測 250${NB}km 寬的掃描帶，每像素 20${NB}m，日夜都能穿透雲層。`,
    iceye: '小型 X 波段雷達衛星，可依指令穿透雲層取得影像，日夜皆可。',
    capella: `X 波段雷達衛星，聚束模式影像每像素約 50${NB}cm，日夜皆可。`,
    umbra: `X 波段雷達衛星，聚束模式影像最細可達每像素約 25${NB}cm。`,
    japaneseSmallRadar: '日本的小型 X 波段雷達衛星。',
    kompsat5: `南韓的 X 波段雷達衛星，聚束模式影像每像素 1${NB}m。`,
    terrasarX: `德國的 X 波段雷達衛星，從 2007${NB}年起持續取得影像。`,
    tandemX: '與 TerraSAR-X 近距離編隊飛行，用雷達測繪地球的地形。',
    /** zh-Hant-HK overlay (§5.2, Intl zh-Hant-HK's country word): '意大利 COSMO-SkyMed 系統的 X 波段雷達衛星。' */
    cosmoSkymed: '義大利 COSMO-SkyMed 系統的 X 波段雷達衛星。',
    paz: '西班牙的 X 波段雷達衛星。',
    radarsat2: `加拿大的 C 波段雷達衛星，從 2007${NB}年起持續取得影像。`,
    rcm: `加拿大 RADARSAT Constellation Mission 的 3${NB}顆衛星之一。`,
    saocom: '阿根廷的 L 波段雷達衛星，也能測量土壤濕度。',
    alos2: `日本的 L 波段雷達衛星，從 2014${NB}年起持續取得影像。`,
    alos4: '日本的 L 波段雷達衛星，是 ALOS-2 的後繼衛星。',
    nisar: `雙波段雷達，以 242${NB}km 寬的掃描帶測繪地面，用來測量地表的移動。`,
    superviewNeo2: '中國的商業 X 波段雷達衛星。',
    gaofen3: '中國政府的 C 波段雷達衛星。',
    gaofen12: '中國政府的雷達衛星，規格沒有公開。',

    // ── Crewed space stations ──
    /** A date token is one unit with no spaces inside (§6.2) */
    iss: '國際太空站，2000年11月起一直有人駐留。',
    tiangong: `中國的天宮太空站，圍繞 2021${NB}年發射的天和核心艙建成。`,
  },
}
export default sats
