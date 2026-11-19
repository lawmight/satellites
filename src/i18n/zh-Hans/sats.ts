/**
 * Simplified Chinese blurbs for the satellites (see docs/i18n/zh-Hans.md §4.1, §8, §9.1): the one plain sentence under
 * a satellite's name in the pass view, saying what its camera or radar is.
 *
 * Why it reads this way: satellite, instrument, mission, agency and company names stay as the catalog spells them
 * (Sentinel-2, VIIRS, Maxar, Planet, Copernicus), never 哨兵-2 or 陆地卫星; the one exception is a Chinese programme,
 * whose official name a blurb may give once, plainly, with no comment (风云四号 B 星, 吉林一号, 高分二号, 天和核心舱).
 * The words are the glossary's: an instrument is a 成像仪, a swath 成像带 or, as a width, 幅宽; a pixel size is
 * 每像素 10 m; a radar 成像 and is never 拍下; "agile" is 敏捷, "spotlight" 聚束模式, "operational" 业务运行. Every
 * blurb is one sentence with 。, set as body text. Numbers keep the English grouping (3,040 km, 1.1 km, as
 * Intl.NumberFormat('zh-Hans') writes them), a number and its unit or measure word are tied with U+00A0, and a year
 * touches its Han (自2011年起).
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: 'Copernicus 的多光谱成像仪：13 个波段、每像素 10 m、幅宽 290 km。',
    landsat8: 'Operational Land Imager：彩色像素 30 m，全色像素 15 m，幅宽 185 km。',
    landsat9: 'Operational Land Imager 2：彩色像素 30 m，全色像素 15 m，幅宽 185 km。',

    // ── Weather satellites in polar orbit ──
    noaaViirs: '它的 VIIRS 成像仪扫过 3,040 km 宽的成像带，每天覆盖整个地球两次。',
    suomiNpp: '轨道上的第一台 VIIRS 成像仪，自2011年起以 3,040 km 的幅宽扫描地面。',
    terra: '自1999年起，它的 MODIS 成像仪一直以 2,330 km 的幅宽注视整个地球。',
    aqua: '自2002年起，它的 MODIS 成像仪一直以 2,330 km 的幅宽注视整个地球。',
    metop: '欧洲的极轨气象卫星；搭载的 AVHRR 成像仪幅宽 2,900 km，每像素 1.1 km。',
    sentinel3: '它的 OLCI 仪器以 21 个波段记录陆地和海洋的颜色，幅宽 1,270 km。',
    fengyun3: '中国风云三号系列的极轨气象卫星，搭载的 MERSI 成像仪幅宽 2,900 km。',
    fengyun3e: '风云三号 E 星：中国的晨昏轨道气象卫星，搭载微光 MERSI 成像仪。',

    // ── Geostationary weather satellites ──
    goesEast: 'GOES-East：每 10 分钟获取一张覆盖美洲的全圆盘图像。',
    goesWest: 'GOES-West：每 10 分钟获取一张覆盖太平洋和美洲的全圆盘图像。',
    goes16: '曾经的 GOES-East，现在作为备用星留在轨道上。',
    goes17: '曾经的 GOES-West，现在作为备用星留在轨道上。',
    himawari9: '日本的气象卫星：每 10 分钟获取一张覆盖亚洲和太平洋的全圆盘图像。',
    himawari8: 'Himawari-9 的备用星。',
    meteosat12: '首颗第三代 Meteosat（MTG-I1）：每 10 分钟为欧洲和非洲成像一次。',
    meteosat9: '覆盖印度洋地区，每 15 分钟获取一张全圆盘图像。',
    meteosatSecondGen: '第二代 Meteosat；我们不把它算作这个地方的全圆盘成像卫星。',
    mtgI2: '第三代 Meteosat 的第二颗成像卫星，尚未投入业务运行。',
    geoKompsat2a: '韩国的气象卫星：每 10 分钟获取一张全圆盘图像。',
    fengyun4b: '风云四号 B 星：中国在业务运行的静止气象卫星，每 15 分钟获取一张全圆盘图像。',
    fengyun4a: '风云四号 A 星：中国较早的静止轨道成像卫星，不算作主用业务卫星。',
    fengyun4c: '风云四号 C 星：中国最新的静止轨道成像卫星，尚未投入业务运行。',
    insat: '印度的气象卫星：每 30 分钟获取一张全圆盘图像。',
    insat3d: '印度较早的气象卫星，不算作业务成像卫星。',
    elektroL: '俄罗斯的静止气象卫星：每 30 分钟获取一张全圆盘图像。',
    elektroL2: '俄罗斯较早的静止气象卫星，不算作业务成像卫星。',
    elektroL5: '俄罗斯最新的静止气象卫星，暂时还不算作业务卫星。',

    // ── Commercial and government high-resolution cameras ──
    worldview1: '全色成像仪，每像素 50 cm，能对准远离地面轨迹的地方。',
    worldview2: '8 波段成像仪，全色像素 46 cm。',
    worldview3: '拥有 16 个光谱波段的成像仪，全色像素 31 cm。',
    geoeye1: '全色像素 41 cm 的成像仪，自2008年起在轨运行。',
    worldviewLegion: 'Maxar 的 WorldView Legion 成像卫星之一，每像素约 30 cm。',
    skysat: 'Planet 的敏捷成像卫星，每像素约 50 cm；它按任务指令对准特定目标。',
    pelican: 'Planet 较新的敏捷高分辨率成像卫星。',
    superDove: 'Planet 的一颗 SuperDove 立方星；整个星群每天为地球上大部分陆地成像，每像素约 3 m。',
    blacksky: 'BlackSky 的快速重访成像卫星，每像素约 1 m 或更精细。',
    pleiades: '敏捷成像卫星，提供每像素 50 cm 的全色产品。',
    pleiadesNeo: '敏捷成像卫星，原生像素 30 cm。',
    spot6: '大范围成像卫星，全色像素 1.5 m，幅宽 60 km。',
    spot7: 'SPOT 6 的孪生星，由阿塞拜疆以 Azersky 的名称运营。',
    kompsat3: '韩国的成像卫星，全色像素 70 cm。',
    kompsat3a: '韩国的成像卫星，全色像素 55 cm，另有一个红外通道。',
    jilin1: '吉林一号商业星座的一员，搭载亚米级成像仪。',
    superview: '中国的商业成像卫星，每像素约 50 cm 或更精细。',
    gaofenWideField: '中国政府的成像卫星，搭载 2 m 全色相机和 16 m 宽幅相机。',
    gaofen2: '高分二号：中国政府的成像卫星，全色像素 80 cm。',
    gaofen7: '高分七号：中国政府的立体测绘成像卫星，像素达到亚米级。',
    gaofenOptical: '中国政府的高分辨率光学卫星；具体参数没有公开。',

    // ── Radar satellites ──
    sentinel1: 'Copernicus 的 C 波段雷达，公开每一张图像：朝轨道一侧成像，幅宽 250 km，每像素 20 m，能穿透云层，不分昼夜。',
    iceye: '小型 X 波段雷达卫星，可按任务指令成像，能穿透云层，不分昼夜。',
    capella: 'X 波段雷达卫星，聚束模式图像每像素约 50 cm，不分昼夜。',
    umbra: 'X 波段雷达卫星，聚束模式图像每像素可达约 25 cm。',
    japaneseSmallRadar: '日本的小型 X 波段雷达卫星。',
    kompsat5: '韩国的 X 波段雷达卫星，聚束模式图像每像素 1 m。',
    terrasarX: '德国的 X 波段雷达卫星，自2007年起持续成像。',
    tandemX: '与 TerraSAR-X 近距离编队飞行，用雷达测绘地球的地形。',
    cosmoSkymed: '意大利 COSMO-SkyMed 系统的 X 波段雷达卫星。',
    paz: '西班牙的 X 波段雷达卫星。',
    radarsat2: '加拿大的 C 波段雷达卫星，自2007年起持续成像。',
    rcm: '加拿大 RADARSAT Constellation Mission 的 3 颗卫星之一。',
    saocom: '阿根廷的 L 波段雷达卫星，还能测量土壤湿度。',
    alos2: '日本的 L 波段雷达卫星，自2014年起持续成像。',
    alos4: '日本的 L 波段雷达卫星，ALOS-2 的后继星。',
    nisar: '双波段雷达卫星，测绘幅宽 242 km，用来测量地面的移动。',
    superviewNeo2: '中国的商业 X 波段雷达卫星。',
    gaofen3: '高分三号：中国政府的 C 波段雷达卫星。',
    gaofen12: '高分十二号：中国政府的雷达卫星；具体参数没有公开。',

    // ── Crewed space stations ──
    iss: '国际空间站，自2000年11月起一直有人驻留。',
    tiangong: '中国空间站，以2021年发射的天和核心舱为基础建成。',
  },
}
export default sats
