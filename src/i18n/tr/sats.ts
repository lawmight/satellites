/**
 * Turkish copy about the satellites themselves: the one-sentence blurb under a pass's sentences in the pass view (see
 * src/i18n/en/sats.ts; docs/i18n/tr.md §3.13 gives five of them word for word, §4 the vocabulary).
 *
 * Why it reads this way:
 *  - A blurb follows the pass paragraph and its footnotes, which can end on a sentence whose subject is the place or
 *    *burası*. A Turkish sentence without a subject takes the topic of the one before, so a blurb never opens with a
 *    bare possessive or a bare verb (*Kamerası…*, *Kapsar…* would attach to the place, §5.2). It names the instrument
 *    (*VIIRS görüntüleyicisi …*, *OLCI algılayıcısı …*) or says what the satellite is (*… meteoroloji uydusu*, *…
 *    görüntüleme uydusu*, *… X bandı radar uydusu*), with the facts in a modifier before that noun, Turkish's own
 *    order. A noun-phrase blurb is a sentence, as the English ones are.
 *  - "Imager" is *görüntüleyici* when it is an instrument and *görüntüleme uydusu* when it is the whole satellite;
 *    "instrument" is *algılayıcı* (§4). "Images" (the verb) is *görüntüler*; a geostationary satellite *tam disk
 *    görüntüsünü her 10 dakikada bir alır*, as §3.13 and the pass view say it. "Has watched" (Terra, Aqua) is
 *    *izliyor*, the product's verb for satellites over places.
 *  - Terms: *şerit* / *tarama genişliği* (swath), *multispektral*, *pankromatik*, *C / X / L bandı* (the Latin letter
 *    kept), *kutupsal yörünge*, *gün doğumu–gün batımı yörüngesi*, *yerdurağan*, *operasyonel* (the meteorological
 *    services' word), *takımyıldız*, *küp uydu*, *çevik* for agile, *spotlight modu*, *metre altı*, *insanlı*.
 *    Countries are adjectives (*Çin, Hint, Rus, Japon, Alman, İtalyan*), Korea is *Güney Kore* (the KOMPSAT
 *    operator), and "government" is *Çin devletine ait*.
 *  - Numbers are fixed copy, typed the Turkish way (§6.2): full-stop grouping (*3.040 km*), decimal comma (*1,1 km*,
 *    *1,5 m*), a no-break space before every unit, and a suffix on the unit or on a written year where Turkish needs
 *    one (*290 km’lik*, *1999’dan beri*, *2014’ten*). Names stay as they are, suffixed with U+2019 by pronunciation
 *    (*SPOT 6’nın, Himawari-9’un, ALOS-2’nin, Planet’in*); "tasked" is *istek üzerine*, and *tarafından* stays out of
 *    the prose (§2.3).
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──

    /** §3.13, word for word */
    sentinel2: 'Copernicus multispektral görüntüleyicisi: 13 bant, 10 m piksel, 290 km tarama genişliği.',
    landsat8: 'Operational Land Imager: 30 m renkli ve 15 m pankromatik piksel, 185 km tarama genişliği.',
    landsat9: 'Operational Land Imager 2: 30 m renkli ve 15 m pankromatik piksel, 185 km tarama genişliği.',

    // ── Weather satellites in polar orbit ──

    /** §3.13, word for word */
    noaaViirs: 'VIIRS görüntüleyicisi 3.040 km’lik bir şeridi tarar ve bütün gezegeni günde iki kez kapsar.',
    suomiNpp: 'Yörüngedeki ilk VIIRS görüntüleyicisi: 2011’den beri 3.040 km’lik bir şeridi tarıyor.',
    /** §3.13, word for word */
    terra: 'MODIS görüntüleyicisi 1999’dan beri bütün gezegeni her seferinde 2.330 km’lik bir şeritle izliyor.',
    aqua: 'MODIS görüntüleyicisi 2002’den beri bütün gezegeni her seferinde 2.330 km’lik bir şeritle izliyor.',
    /** "at 1.1 km": pixels 1.1 km across */
    metop: 'Kutupsal yörüngedeki Avrupa meteoroloji uydusu; AVHRR görüntüleyicisi 2.900 km’lik bir şeridi 1,1 km’lik piksellerle kapsar.',
    sentinel3: 'OLCI algılayıcısı kara ve okyanus rengini 21 bantta, 1.270 km’lik bir şerit boyunca görüntüler.',
    fengyun3: 'Kutupsal yörüngedeki Çin meteoroloji uydusu; MERSI görüntüleyicisi 2.900 km’lik bir şeridi kapsar.',
    /** §3.13, word for word */
    fengyun3e: 'Gün doğumu–gün batımı yörüngesindeki Çin meteoroloji uydusu; düşük ışıkta çalışan bir MERSI görüntüleyicisi taşır.',

    // ── Geostationary weather satellites (each sits over the equator and images the whole disc below it) ──

    goesEast: 'GOES-East: Amerika kıtasının tam disk görüntüsünü her 10 dakikada bir alır.',
    goesWest: 'GOES-West: Pasifik ve Amerika kıtasının tam disk görüntüsünü her 10 dakikada bir alır.',
    goes16: 'Eski GOES-East; yörüngede yedek olarak bekletiliyor.',
    goes17: 'Eski GOES-West; yörüngede yedek olarak bekletiliyor.',
    /** §3.13, word for word */
    himawari9: 'Japonya’nın meteoroloji uydusu: Asya ve Pasifik’in tam disk görüntüsünü her 10 dakikada bir alır.',
    himawari8: 'Himawari-9’un yedeği.',
    meteosat12: 'Üçüncü nesil Meteosat’ların ilki (MTG-I1): Avrupa ve Afrika’yı her 10 dakikada bir görüntüler.',
    /** Opens with what it is, never a bare *Kapsar* (§5.2) */
    meteosat9: 'Hint Okyanusu bölgesini kapsayan Meteosat: Tam disk görüntüsünü her 15 dakikada bir alır.',
    /** "here": in this app; *burada* reads as "at this place" under the pass paragraph, so the verb carries it */
    meteosatSecondGen: 'İkinci nesil Meteosat; bu yerin tam disk görüntüleyicisi olarak sayılmıyor.',
    mtgI2: 'Üçüncü nesil Meteosat görüntüleyicilerinin ikincisi; henüz operasyonel hizmette değil.',
    geoKompsat2a: 'Güney Kore’nin meteoroloji uydusu: Tam disk görüntüsünü her 10 dakikada bir alır.',
    fengyun4b: 'Çin’in operasyonel yerdurağan meteoroloji uydusu: Tam disk görüntüsünü her 15 dakikada bir alır.',
    fengyun4a: 'Çin’in daha eski yerdurağan görüntüleyicisi; asıl hizmet olarak sayılmıyor.',
    fengyun4c: 'Çin’in en yeni yerdurağan görüntüleyicisi; henüz operasyonel hizmette değil.',
    insat: 'Hint meteoroloji uydusu: Tam disk görüntüsünü her 30 dakikada bir alır.',
    insat3d: 'Daha eski bir Hint meteoroloji uydusu; operasyonel görüntüleyici olarak sayılmıyor.',
    elektroL: 'Rus yerdurağan meteoroloji uydusu: Tam disk görüntüsünü her 30 dakikada bir alır.',
    elektroL2: 'Daha eski bir Rus yerdurağan meteoroloji uydusu; operasyonel görüntüleyici olarak sayılmıyor.',
    elektroL5: 'En yeni Rus yerdurağan meteoroloji uydusu; henüz operasyonel sayılmıyor.',

    // ── Commercial and government high-resolution cameras ──

    worldview1: 'Yer izinin epey dışına bakabilen, 50 cm pikselli pankromatik görüntüleme uydusu.',
    worldview2: '46 cm pankromatik pikselli, sekiz bantlı görüntüleme uydusu.',
    worldview3: '31 cm pankromatik pikselli ve 16 spektral bantlı görüntüleme uydusu.',
    geoeye1: '41 cm pankromatik pikselli görüntüleme uydusu; 2008’den beri yörüngede.',
    worldviewLegion: 'Maxar’ın yaklaşık 30 cm pikselli WorldView Legion görüntüleme uydularından biri.',
    /** Planet is the company (Planet Labs); "tasked": pointed on request */
    skysat: 'Planet’in yaklaşık 50 cm pikselli çevik görüntüleme uydusu; istek üzerine belirli hedeflere çevrilir.',
    pelican: 'Planet’in daha yeni, çevik, yüksek çözünürlüklü görüntüleme uydusu.',
    superDove: 'Planet’in SuperDove küp uydularından biri; filo, Dünya’daki karaların çoğunu her gün yaklaşık 3 m çözünürlükle görüntüler.',
    blacksky: 'Aynı yerin üzerinden sık sık geçen, yaklaşık 1 m ya da daha iyi çözünürlüklü bir BlackSky görüntüleme uydusu.',
    pleiades: '50 cm pankromatik ürünler sunan çevik görüntüleme uydusu.',
    pleiadesNeo: 'Doğal çözünürlüğü 30 cm olan çevik görüntüleme uydusu.',
    spot6: 'Geniş alanları görüntüleyen uydu: 1,5 m pankromatik piksel, 60 km tarama genişliği.',
    spot7: 'SPOT 6’nın ikizi; Azerbaycan onu Azersky adıyla işletiyor.',
    kompsat3: '70 cm pankromatik pikselli Güney Kore görüntüleme uydusu.',
    kompsat3a: '55 cm pankromatik pikselli ve kızılötesi kanallı Güney Kore görüntüleme uydusu.',
    jilin1: 'Çin’in ticari Jilin-1 uydu takımyıldızının bir parçası; metre altı çözünürlüklü görüntüleyiciler taşır.',
    superview: 'Yaklaşık 50 cm ya da daha iyi çözünürlüklü bir Çin ticari görüntüleme uydusu.',
    gaofenWideField: 'Çin devletine ait görüntüleme uydusu; 2 m pankromatik ve 16 m geniş alan kameraları taşır.',
    gaofen2: '80 cm pankromatik pikselli, Çin devletine ait görüntüleme uydusu.',
    gaofen7: 'Metre altı pikselli, Çin devletine ait stereo haritalama uydusu.',
    gaofenOptical: 'Çin devletine ait yüksek çözünürlüklü optik uydu; teknik özellikleri yayımlanmıyor.',

    // ── Radar satellites (they see through cloud and at night) ──

    /** "to one side": off to one side of its ground track; *bulutun içinden, gece gündüz* as the gallery says it */
    sentinel1: 'Bütün görüntülerini yayımlayan Copernicus C bandı radarı: yer izinin bir yanında 250 km’lik bir şerit, piksel başına 20 m, bulutun içinden, gece gündüz.',
    iceye: 'İstek üzerine bulutun içinden, gece gündüz görüntü alabilen küçük bir X bandı radar uydusu.',
    capella: 'Spotlight modunda yaklaşık 50 cm çözünürlükle gece gündüz görüntü alan X bandı radar uydusu.',
    umbra: 'Spotlight modunda çözünürlüğü yaklaşık 25 cm’ye kadar inen X bandı radar uydusu.',
    japaneseSmallRadar: 'Küçük bir Japon X bandı radar uydusu.',
    kompsat5: 'Spotlight modunda 1 m çözünürlüklü Güney Kore X bandı radar uydusu.',
    terrasarX: '2007’den beri görüntü alan Alman X bandı radar uydusu.',
    tandemX: 'TerraSAR-X ile yakın formasyonda uçarak Dünya’nın topografyasını radarla haritalayan uydu.',
    cosmoSkymed: 'COSMO-SkyMed sistemine ait bir İtalyan X bandı radar uydusu.',
    paz: 'İspanyol X bandı radar uydusu.',
    radarsat2: '2007’den beri görüntü alan Kanada C bandı radar uydusu.',
    /** The mission's name stays English and takes no suffix; *adlı* keeps it bare without saying "Mission görevi" */
    rcm: 'Kanada’nın RADARSAT Constellation Mission adlı görevini oluşturan üç uydudan biri.',
    saocom: 'Toprak nemini de ölçen Arjantin L bandı radar uydusu.',
    alos2: '2014’ten beri görüntü alan Japon L bandı radar uydusu.',
    alos4: 'ALOS-2’nin yerini alan Japon L bandı radar uydusu.',
    nisar: 'Yerin nasıl hareket ettiğini ölçmek için 242 km’lik bir şeridi haritalayan çift bantlı radar.',
    superviewNeo2: 'Çin ticari X bandı radar uydusu.',
    gaofen3: 'Çin devletine ait C bandı radar uydusu.',
    gaofen12: 'Çin devletine ait radar uydusu; teknik özellikleri yayımlanmıyor.',

    // ── Crewed space stations ──

    /** "continuously crewed" as a plain verb (*insanlı* is stilted as a bare predicate); never *ISS uydusu* */
    iss: 'Uluslararası Uzay İstasyonu: Kasım 2000’den beri hiç insansız kalmadı.',
    tiangong: 'Çin’in uzay istasyonu; 2021’de fırlatılan Tianhe çekirdek modülünün çevresine kuruldu.',
  },
}

export default sats
