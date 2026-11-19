/**
 * Korean blurbs for the satellites (see docs/i18n/ko.md §2.3, §3.7 "sats", §4, §5.3, §6.2): the one line under a
 * satellite's name in the pass view, saying what its camera or radar is.
 *
 * Why it reads this way: one line each, 한다체, either a noun phrase with a colon where the English lists specs
 * (명사형 종결: 밴드 13개, 픽셀 10 m, 관측 폭 290 km.) or one -ㄴ다 sentence. "Its" has no pronoun: the subject drops,
 * or the instrument takes the subject particle (VIIRS 이미저가). The instrument class is 이미저 here (in pass sentences it
 * is 센서). Verbs: 관측한다 for an instrument's "images", 훑는다 for "sweeps", 지켜봐 왔다 where the English says "has
 * watched" on purpose (Terra, Aqua); never 촬영 or 감시, and a picture is never 영상. Words come from the glossary:
 * 다중분광, 전정색 (panchromatic: 전정색 픽셀 50 cm), 관측 폭, 지상 궤적, 극궤도 기상위성, 정지궤도, 지구 전면 (never 전구),
 * 여명-황혼 궤도, 위성군, 큐브샛, 자세를 빠르게 바꾸는 (agile), 재방문 주기가 짧은, 스포트라이트 모드, C 밴드 / X 밴드 /
 * L 밴드, 현업 운용 (operational, the KMA's word), 예비 위성. 해상도 appears only where the English says
 * high-resolution. Satellite, instrument, mission, agency and company names stay as the catalog spells them (KOMPSAT-3A,
 * Operational Land Imager, Tianhe, Maxar, Planet), and a particle after one follows how Korean readers say it
 * (TerraSAR-X와, Tianhe를), never two -로 in a row (예전의 GOES-East: 지금은 예비 위성으로 …); the three Korean
 * satellites add the programme name Korean readers know, once, in parentheses (천리안위성 2A호, 아리랑 3호). "Full
 * disk of X" is X 쪽 지구 전면, and "Older" is 먼저 발사된 (a comparative with nothing to compare to reads translated).
 * Numbers group with fmt('ko')'s comma (3,040 km, 1.1 km); a number and an SI unit keep one no-break space; a counter
 * or a year touches its number (밴드 21개, 2008년부터, 10분마다).
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: 'Copernicus 다중분광 이미저: 밴드 13개, 픽셀 10 m, 관측 폭 290 km.',
    landsat8: 'Operational Land Imager: 컬러 픽셀 30 m, 전정색 픽셀 15 m, 관측 폭 185 km.',
    landsat9: 'Operational Land Imager 2: 컬러 픽셀 30 m, 전정색 픽셀 15 m, 관측 폭 185 km.',

    // ── Weather satellites in polar orbit ──
    noaaViirs: 'VIIRS 이미저가 관측 폭 3,040 km를 훑으며 하루 두 번 지구 전체를 덮는다.',
    suomiNpp: '궤도에 오른 첫 VIIRS 이미저로, 2011년부터 관측 폭 3,040 km를 훑어 왔다.',
    /** "has watched": the product's verb, 지켜봐 왔다 */
    terra: 'MODIS 이미저는 1999년부터 한 번에 2,330 km씩 지구 전체를 지켜봐 왔다.',
    aqua: 'MODIS 이미저는 2002년부터 한 번에 2,330 km씩 지구 전체를 지켜봐 왔다.',
    /** "at 1.1 km": its pixels */
    metop: '유럽의 극궤도 기상위성: AVHRR 이미저, 관측 폭 2,900 km, 픽셀 1.1 km.',
    sentinel3: 'OLCI 이미저가 관측 폭 1,270 km에 걸쳐 육지와 바다의 색을 밴드 21개로 관측한다.',
    fengyun3: '중국의 극궤도 기상위성: MERSI 이미저, 관측 폭 2,900 km.',
    fengyun3e: '저조도 MERSI 이미저를 실은 중국의 여명-황혼 궤도 기상위성.',

    // ── Geostationary weather satellites ──
    goesEast: 'GOES-East: 10분마다 아메리카 쪽 지구 전면을 관측한다.',
    goesWest: 'GOES-West: 10분마다 태평양과 아메리카 쪽 지구 전면을 관측한다.',
    goes16: '예전의 GOES-East: 지금은 예비 위성으로 궤도에 남아 있다.',
    goes17: '예전의 GOES-West: 지금은 예비 위성으로 궤도에 남아 있다.',
    himawari9: '일본의 기상위성: 10분마다 아시아와 태평양 쪽 지구 전면을 관측한다.',
    himawari8: 'Himawari-9의 예비 위성.',
    /** MTG-I1: its name before launch */
    meteosat12: '3세대 Meteosat의 첫 위성(MTG-I1): 10분마다 유럽과 아프리카를 관측한다.',
    meteosat9: '인도양 지역을 맡아 15분마다 지구 전면을 관측한다.',
    /** "not counted here": the app does not list it as watching the place */
    meteosatSecondGen: '2세대 Meteosat: 이 장소의 지구 전면 이미저로는 세지 않는다.',
    mtgI2: '3세대 Meteosat의 두 번째 이미저: 아직 현업 운용 전이다.',
    geoKompsat2a: '한국의 기상위성(천리안위성 2A호): 10분마다 지구 전면을 관측한다.',
    fengyun4b: '현업 운용 중인 중국의 정지궤도 기상위성: 15분마다 지구 전면을 관측한다.',
    /** "Older": launched before its siblings in service (4A 2016 / 4B 2021; INSAT-3D 2013; Elektro-L 2 2015) */
    fengyun4a: '먼저 발사된 중국의 정지궤도 이미저: 주 운용 위성으로는 세지 않는다.',
    fengyun4c: '중국의 최신 정지궤도 이미저: 아직 현업 운용 전이다.',
    insat: '인도의 기상위성: 30분마다 지구 전면을 관측한다.',
    insat3d: '먼저 발사된 인도의 기상위성: 현업 운용 이미저로는 세지 않는다.',
    elektroL: '러시아의 정지궤도 기상위성: 30분마다 지구 전면을 관측한다.',
    elektroL2: '먼저 발사된 러시아의 정지궤도 기상위성: 현업 운용 이미저로는 세지 않는다.',
    elektroL5: '러시아의 최신 정지궤도 기상위성: 아직 현업 운용 위성으로 세지 않는다.',

    // ── Commercial and government high-resolution cameras ──
    worldview1: '전정색 이미저로, 픽셀은 50 cm이며 지상 궤적에서 멀리 떨어진 곳까지 기울여 볼 수 있다.',
    /** "Eight-band": eight colour channels */
    worldview2: '밴드 8개, 전정색 픽셀 46 cm의 이미저.',
    worldview3: '전정색 픽셀 31 cm, 분광 밴드 16개의 이미저.',
    geoeye1: '전정색 픽셀 41 cm의 이미저로, 2008년부터 궤도에 있다.',
    worldviewLegion: 'Maxar의 WorldView Legion 위성군 이미저: 픽셀 약 30 cm.',
    /** Planet: the company, never the common noun */
    skysat: '자세를 빠르게 바꾸는 Planet의 이미저로, 픽셀은 약 50 cm이며 요청에 따라 특정 지점을 찍는다.',
    pelican: '자세를 빠르게 바꾸는 Planet의 새 고해상도 이미저.',
    /** "the fleet images": 위성군이 … 관측한다 */
    superDove: 'Planet의 SuperDove 큐브샛: 위성군이 날마다 지구 육지 대부분을 픽셀 약 3 m로 관측한다.',
    /** "or better": smaller pixels, 이하 */
    blacksky: '재방문 주기가 짧은 BlackSky 이미저: 픽셀 약 1 m 이하.',
    /** "products": what the archive delivers (resampled to 50 cm), 산출물, never 영상 */
    pleiades: '자세를 빠르게 바꾸는 이미저로, 전정색 산출물을 50 cm로 제공한다.',
    pleiadesNeo: '자세를 빠르게 바꾸는 이미저로, 픽셀은 본래 30 cm다.',
    spot6: '광역 이미저: 전정색 픽셀 1.5 m, 관측 폭 60 km.',
    spot7: 'SPOT 6의 쌍둥이 위성으로, 아제르바이잔이 Azersky라는 이름으로 운용한다.',
    kompsat3: '한국의 이미저(아리랑 3호): 전정색 픽셀 70 cm.',
    kompsat3a: '한국의 이미저(아리랑 3A호): 전정색 픽셀 55 cm, 적외선 채널.',
    jilin1: '중국 상업 위성군 Jilin-1의 위성: 픽셀 1 m 미만의 이미저.',
    superview: '중국의 상업 이미저: 픽셀 약 50 cm 이하.',
    gaofenWideField: '중국 정부의 이미저: 전정색 카메라 2 m, 광시야 카메라 16 m.',
    gaofen2: '중국 정부의 이미저: 전정색 픽셀 80 cm.',
    gaofen7: '중국 정부의 입체 지도 제작용 이미저: 픽셀 1 m 미만.',
    gaofenOptical: '중국 정부의 고해상도 광학 위성: 사양은 공개되지 않았다.',

    // ── Radar satellites ──
    sentinel1: '모든 이미지를 공개하는 Copernicus C 밴드 레이더: 한쪽 옆으로 관측 폭 250 km, 20 m, 구름을 뚫고 밤낮없이.',
    iceye: '요청에 따라 구름을 뚫고 밤낮없이 관측할 수 있는 소형 X 밴드 레이더 위성.',
    capella: 'X 밴드 레이더 위성: 스포트라이트 모드 약 50 cm, 밤낮없이.',
    umbra: 'X 밴드 레이더 위성: 스포트라이트 모드에서 약 25 cm까지.',
    japaneseSmallRadar: '일본의 소형 X 밴드 레이더 위성.',
    kompsat5: '한국의 X 밴드 레이더 위성(아리랑 5호): 스포트라이트 모드 1 m.',
    terrasarX: '독일의 X 밴드 레이더 위성: 2007년부터 관측해 왔다.',
    tandemX: 'TerraSAR-X와 가까이 편대 비행하며 레이더로 지구의 지형을 측량한다.',
    cosmoSkymed: 'COSMO-SkyMed 시스템의 이탈리아 X 밴드 레이더 위성.',
    paz: '스페인의 X 밴드 레이더 위성.',
    radarsat2: '캐나다의 C 밴드 레이더 위성: 2007년부터 관측해 왔다.',
    rcm: '캐나다 RADARSAT Constellation Mission을 이루는 위성 3기 가운데 1기.',
    saocom: '토양 수분도 측정하는 아르헨티나의 L 밴드 레이더 위성.',
    alos2: '일본의 L 밴드 레이더 위성: 2014년부터 관측해 왔다.',
    alos4: '일본의 L 밴드 레이더 위성: ALOS-2의 후속 위성.',
    nisar: '이중 밴드 레이더: 관측 폭 242 km를 훑어 지면의 움직임을 측정한다.',
    superviewNeo2: '중국의 상업 X 밴드 레이더 위성.',
    gaofen3: '중국 정부의 C 밴드 레이더 위성.',
    gaofen12: '중국 정부의 레이더 위성: 사양은 공개되지 않았다.',

    // ── Crewed space stations ──
    iss: '국제우주정거장. 2000년 11월부터 사람이 끊임없이 머물고 있다.',
    /** Tianhe: the module's name, as it is */
    tiangong: '중국의 우주정거장: 2021년에 발사된 핵심 모듈 Tianhe를 중심으로 지어졌다.',
  },
}
export default sats
