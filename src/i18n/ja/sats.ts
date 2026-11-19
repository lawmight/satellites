/**
 * Japanese blurbs for the satellites (see docs/i18n/ja.md §2.3, §3.7, §4, §5.2, §8): the short plain line under a
 * satellite's name in the pass view, saying what its camera or radar is.
 *
 * Why it reads this way: plain form, no 〜です, and short noun endings where the English is a list of specs (13バンド、
 * 10 mピクセル、観測幅290 km。), so a blurb may run to two brief sentences where Japanese wants them. "Its" has no
 * pronoun: the subject drops, or the instrument takes が. Instruments 観測 or 走査 (never 撮影); Terra and Aqua keep the
 * product's verb, 見る, because the English uses "watched" on purpose. Satellite, instrument, mission, agency and
 * company names stay as the catalog spells them (Sentinel-2, VIIRS, Maxar, Planet, Tianhe); the one exception is the
 * three Japanese missions, whose Japanese name a blurb gives once, in 「」, after the Latin name the row already shows
 * (「ひまわり9号」, 「だいち2号」), and JMA is 気象庁. The words are the glossary's: 観測幅 for swath, 地上軌跡, 運用, 商業,
 * 全球 for the full disc, Cバンド / Xバンド / Lバンド, マルチスペクトル, パンクロマチック, スポットライトモード, キューブサット,
 * and a pixel size is 1ピクセル10 m or ピクセルは50 cm, never 解像度 (which appears only where the English says
 * high-resolution). Numbers keep fmt('ja')'s grouping (3,040 km, 1.1 km), a number and its unit keep one no-break
 * space, and a counter or a year touches its number (21バンド, 2008年から).
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: 'Copernicusのマルチスペクトルイメージャー。13バンド、10 mピクセル、観測幅290 km。',
    landsat8: 'Operational Land Imager。ピクセルはカラー30 m、パンクロマチック15 m。観測幅185 km。',
    landsat9: 'Operational Land Imager 2。ピクセルはカラー30 m、パンクロマチック15 m。観測幅185 km。',

    // ── Weather satellites in polar orbit ──
    noaaViirs: 'VIIRSイメージャーが観測幅3,040 kmで走査し、1日2回地球全体を覆う。',
    suomiNpp: '軌道に上がった最初のVIIRSイメージャーで、2011年から観測幅3,040 kmで走査している。',
    /** "has watched": the product's verb, 見る */
    terra: 'MODISイメージャーが1999年から、観測幅2,330 kmで地球全体を見続けている。',
    aqua: 'MODISイメージャーが2002年から、観測幅2,330 kmで地球全体を見続けている。',
    metop: '欧州の極軌道気象衛星。AVHRRイメージャーは観測幅2,900 km、1ピクセル1.1 km。',
    sentinel3: 'OLCIセンサーが21バンドで陸と海の色を観測する。観測幅1,270 km。',
    fengyun3: '中国の極軌道気象衛星。MERSIイメージャーは観測幅2,900 km。',
    /** A dawn–dusk orbit follows the line between day and night: 昼夜の境目 */
    fengyun3e: '昼夜の境目に沿って回る中国の気象衛星。MERSIイメージャーは弱い光でも観測できる。',

    // ── Geostationary weather satellites (全球: the whole disc below it) ──
    goesEast: 'GOES-Eastとして、南北アメリカの全球を10分ごとに観測する。',
    goesWest: 'GOES-Westとして、太平洋と南北アメリカの全球を10分ごとに観測する。',
    goes16: 'かつてのGOES-East。いまは予備機として軌道上で待機している。',
    goes17: 'かつてのGOES-West。いまは予備機として軌道上で待機している。',
    himawari9: '気象庁の静止気象衛星「ひまわり9号」で、アジアと太平洋の全球を10分ごとに観測する。',
    himawari8: '「ひまわり8号」。Himawari-9の予備機。',
    meteosat12: '第3世代Meteosatの1号機（MTG-I1）で、ヨーロッパとアフリカを10分ごとに観測する。',
    meteosat9: 'インド洋地域を担当し、全球を15分ごとに観測する。',
    meteosatSecondGen: '第2世代のMeteosat。この場所を全球画像で観測する衛星には数えていない。',
    mtgI2: '第3世代Meteosatの2号機。まだ正式な運用には入っていない。',
    geoKompsat2a: '韓国の気象衛星で、全球を10分ごとに観測する。',
    fengyun4b: '運用中の中国の静止気象衛星で、全球を15分ごとに観測する。',
    fengyun4a: '中国の旧型の静止気象衛星。主力の運用衛星には数えていない。',
    fengyun4c: '中国の最新の静止気象衛星。まだ正式な運用には入っていない。',
    insat: 'インドの気象衛星で、全球を30分ごとに観測する。',
    insat3d: 'インドの旧型の気象衛星。運用中の衛星には数えていない。',
    elektroL: 'ロシアの静止気象衛星で、全球を30分ごとに観測する。',
    elektroL2: 'ロシアの旧型の静止気象衛星。運用中の衛星には数えていない。',
    elektroL5: 'ロシアの最新の静止気象衛星。まだ運用中の衛星には数えていない。',

    // ── Commercial and government high-resolution cameras ──
    worldview1: 'パンクロマチックのイメージャーで、ピクセルは50 cm。地上軌跡から大きく外れた方向にも向けられる。',
    worldview2: '8バンドのイメージャーで、パンクロマチックのピクセルは46 cm。',
    worldview3: '16バンドのイメージャーで、パンクロマチックのピクセルは31 cm。',
    geoeye1: '2008年から軌道上にあるイメージャーで、パンクロマチックのピクセルは41 cm。',
    worldviewLegion: 'MaxarのWorldView Legionの1基で、ピクセルは約30 cm。',
    skysat: 'Planetの機動性の高いイメージャーで、ピクセルは約50 cm。指示に応じて特定の地点に向けられる。',
    pelican: 'Planetの新しい高解像度イメージャーで、機動性が高い。',
    superDove: 'PlanetのSuperDoveキューブサット。衛星群全体で、地球の陸地の大半を毎日、1ピクセル約3 mで観測する。',
    blacksky: 'BlackSkyの高頻度観測イメージャーで、ピクセルは約1 mか、それより細かい。',
    pleiades: '機動性の高いイメージャーで、1ピクセル50 cmのパンクロマチック画像を提供する。',
    /** "native": the pixels as taken, not resampled */
    pleiadesNeo: '機動性の高いイメージャーで、ピクセルは引き伸ばしなしで30 cm。',
    spot6: '広域を観測するイメージャーで、パンクロマチックのピクセルは1.5 m、観測幅60 km。',
    spot7: 'SPOT 6の双子機で、アゼルバイジャンがAzerskyとして運用している。',
    kompsat3: '韓国のイメージャーで、パンクロマチックのピクセルは70 cm。',
    kompsat3a: '韓国のイメージャーで、パンクロマチックのピクセルは55 cm。赤外チャンネルもある。',
    jilin1: '中国の商業衛星群Jilin-1の1基で、ピクセルが1 m未満のイメージャーを搭載する。',
    superview: '中国の商業イメージャーで、ピクセルは約50 cmか、それより細かい。',
    gaofenWideField: '中国政府のイメージャーで、1ピクセル2 mのパンクロマチックカメラと、1ピクセル16 mの広域カメラを搭載する。',
    gaofen2: '中国政府のイメージャーで、パンクロマチックのピクセルは80 cm。',
    gaofen7: '中国政府の立体地図作成用イメージャーで、ピクセルは1 m未満。',
    gaofenOptical: '中国政府の高解像度光学衛星。仕様は公開されていない。',

    // ── Radar satellites (they see through cloud and at night) ──
    sentinel1: 'すべての画像を公開するCopernicusのCバンドレーダー。軌道の片側を観測幅250 km、1ピクセル20 mで、雲を通して昼も夜も観測する。',
    iceye: '小型のXバンドレーダー衛星で、指示に応じて、雲を通して昼も夜も観測できる。',
    capella: 'Xバンドレーダー衛星で、スポットライトモードでは1ピクセル約50 cmの画像を昼も夜も得られる。',
    umbra: 'Xバンドレーダー衛星で、スポットライトモードでは1ピクセル約25 cmまで細かい画像が得られる。',
    japaneseSmallRadar: '日本の小型Xバンドレーダー衛星。',
    kompsat5: '韓国のXバンドレーダー衛星で、スポットライトモードでは1ピクセル1 mの画像が得られる。',
    terrasarX: 'ドイツのXバンドレーダー衛星。2007年から観測を続ける。',
    tandemX: 'TerraSAR-Xと近接編隊を組んで飛び、レーダーで地球の地形を測る。',
    cosmoSkymed: 'COSMO-SkyMedシステムを構成するイタリアのXバンドレーダー衛星。',
    paz: 'スペインのXバンドレーダー衛星。',
    radarsat2: 'カナダのCバンドレーダー衛星。2007年から観測を続ける。',
    rcm: 'カナダのRADARSAT Constellation Missionを構成する3基のうちの1基。',
    saocom: 'アルゼンチンのLバンドレーダー衛星で、土壌の水分も測る。',
    alos2: '日本のLバンドレーダー衛星「だいち2号」。2014年から観測を続ける。',
    alos4: '日本のLバンドレーダー衛星「だいち4号」。ALOS-2の後継機。',
    nisar: '2つの周波数帯を使うレーダーで、観測幅242 kmにわたって地面の動きを測る。',
    superviewNeo2: '中国の商業Xバンドレーダー衛星。',
    gaofen3: '中国政府のCバンドレーダー衛星。',
    gaofen12: '中国政府のレーダー衛星。仕様は公開されていない。',

    // ── Crewed space stations ──
    iss: '国際宇宙ステーション。2000年11月から人が常駐している。',
    tiangong: '中国の宇宙ステーション。2021年に打ち上げられたTianheコアモジュールを中心に建設された。',
  },
}
export default sats
