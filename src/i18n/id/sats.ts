/**
 * Indonesian copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass view
 * (see src/i18n/en/sats.ts; docs/i18n/id.md is the authority on words).
 *
 * Why it reads this way: each blurb is one plain sentence under the satellite's name, so most are noun phrases
 * (*Satelit radar pita X Spanyol.*) and none needs a subject pronoun; English "Its …" becomes *-nya* on the noun, with
 * a hyphen after an acronym (*Sensor VIIRS-nya*), never on the satellite's name and never *ia*, *dia* or *itu* (id.md
 * §5.2). The glossary's words hold: swath *sapuan*, band *kanal* (a radar frequency band *pita*, keeping its Latin
 * letter: *pita C*), pixel *piksel*, full disk *cakram penuh*, imaging satellite *satelit pencitraan*, an instrument
 * *sensor*, the product verb *mengawasi*; China is *Tiongkok*, Korea CLDR's *Korea Selatan*. Every name (satellite,
 * instrument, mission, agency, company, "Planet" included) stays as it is. Numbers are written in Indonesian form
 * (3.040 km, 1,1 km; years never grouped) with a no-break space before the unit.
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: 'Satelit pencitraan multispektral Copernicus: 13 kanal, piksel 10 m, sapuan selebar 290 km.',
    landsat8: 'Operational Land Imager: piksel warna 30 m dan pankromatik 15 m, dengan sapuan selebar 185 km.',
    landsat9: 'Operational Land Imager 2: piksel warna 30 m dan pankromatik 15 m, dengan sapuan selebar 185 km.',

    // ── Weather satellites in polar orbit ──
    noaaViirs: 'Sensor VIIRS-nya memindai dengan sapuan selebar 3.040 km, mencakup seluruh planet dua kali sehari.',
    suomiNpp: 'Sensor VIIRS pertama di orbit, memindai dengan sapuan selebar 3.040 km sejak 2011.',
    terra: 'Sensor MODIS-nya mengawasi seluruh planet sejak 1999, selebar 2.330 km per lintasan.',
    aqua: 'Sensor MODIS-nya mengawasi seluruh planet sejak 2002, selebar 2.330 km per lintasan.',
    metop: 'Satelit cuaca Eropa di orbit kutub; sensor AVHRR-nya memindai dengan sapuan selebar 2.900 km dan piksel 1,1 km.',
    sentinel3: 'Sensor OLCI-nya merekam warna daratan dan laut pada 21 kanal, dengan sapuan selebar 1.270 km.',
    fengyun3: 'Satelit cuaca Tiongkok di orbit kutub; sensor MERSI-nya memindai dengan sapuan selebar 2.900 km.',
    fengyun3e: 'Satelit cuaca Tiongkok di orbit fajar–senja, dengan sensor MERSI untuk cahaya redup.',

    // ── Geostationary weather satellites ──
    goesEast: 'GOES-East: merekam cakram penuh benua Amerika setiap 10 menit.',
    goesWest: 'GOES-West: merekam cakram penuh Pasifik dan benua Amerika setiap 10 menit.',
    goes16: 'GOES-East terdahulu, kini disiagakan di orbit sebagai cadangan.',
    goes17: 'GOES-West terdahulu, kini disiagakan di orbit sebagai cadangan.',
    himawari9: 'Satelit cuaca Jepang: merekam cakram penuh Asia dan Pasifik setiap 10 menit.',
    himawari8: 'Cadangan Himawari-9.',
    meteosat12: 'Meteosat pertama dari generasi ketiga (MTG-I1): merekam Eropa dan Afrika setiap 10 menit.',
    meteosat9: 'Mencakup wilayah Samudra Hindia dan merekam cakram penuh setiap 15 menit.',
    /** "not counted here" is by the app: *tidak kami hitung* (*di sini* beside *tempat ini* reads "at this place") */
    meteosatSecondGen: 'Meteosat generasi kedua; tidak kami hitung sebagai satelit cakram penuh yang mengawasi tempat ini.',
    mtgI2: 'Meteosat kedua dari generasi ketiga; belum menjadi layanan operasional.',
    geoKompsat2a: 'Satelit cuaca Korea Selatan: merekam cakram penuh setiap 10 menit.',
    fengyun4b: 'Satelit cuaca geostasioner operasional Tiongkok: merekam cakram penuh setiap 15 menit.',
    fengyun4a: 'Satelit pencitraan geostasioner Tiongkok yang lebih lama, tidak dihitung sebagai layanan utama.',
    fengyun4c: 'Satelit pencitraan geostasioner Tiongkok terbaru; belum menjadi layanan operasional.',
    insat: 'Satelit cuaca India: merekam cakram penuh setiap 30 menit.',
    insat3d: 'Satelit cuaca India yang lebih lama, tidak dihitung sebagai satelit pencitraan operasional.',
    elektroL: 'Satelit cuaca geostasioner Rusia: merekam cakram penuh setiap 30 menit.',
    elektroL2: 'Satelit cuaca geostasioner Rusia yang lebih lama, tidak dihitung sebagai satelit pencitraan operasional.',
    elektroL5: 'Satelit cuaca geostasioner Rusia terbaru; belum dihitung sebagai satelit operasional.',

    // ── Commercial and government high-resolution cameras ──
    worldview1: 'Satelit pencitraan pankromatik yang bisa diarahkan jauh dari jejak permukaannya, dengan piksel 50 cm.',
    worldview2: 'Satelit pencitraan delapan kanal dengan piksel pankromatik 46 cm.',
    worldview3: 'Satelit pencitraan dengan piksel pankromatik 31 cm dan 16 kanal spektral.',
    geoeye1: 'Satelit pencitraan dengan piksel pankromatik 41 cm, di orbit sejak 2008.',
    worldviewLegion: 'Salah satu satelit pencitraan WorldView Legion milik Maxar, dengan piksel sekitar 30 cm.',
    /** Planet is the company: "milik Planet" keeps it a name */
    skysat: 'Satelit pencitraan gesit milik Planet, dengan piksel sekitar 50 cm; ditugaskan mengarah ke tempat tertentu.',
    pelican: 'Satelit pencitraan gesit beresolusi tinggi yang lebih baru milik Planet.',
    superDove: 'Cubesat SuperDove milik Planet; armadanya merekam sebagian besar daratan Bumi setiap hari, dengan piksel sekitar 3 m.',
    blacksky: 'Satelit pencitraan BlackSky dengan kunjungan ulang cepat dan piksel sekitar 1 m atau lebih kecil.',
    pleiades: 'Satelit pencitraan gesit yang menghasilkan produk pankromatik 50 cm.',
    pleiadesNeo: 'Satelit pencitraan gesit dengan piksel asli 30 cm.',
    spot6: 'Satelit pencitraan area luas dengan piksel pankromatik 1,5 m dan sapuan selebar 60 km.',
    spot7: 'Kembaran SPOT 6, dioperasikan Azerbaijan dengan nama Azersky.',
    kompsat3: 'Satelit pencitraan Korea Selatan dengan piksel pankromatik 70 cm.',
    kompsat3a: 'Satelit pencitraan Korea Selatan dengan piksel pankromatik 55 cm dan satu kanal inframerah.',
    jilin1: 'Bagian dari konstelasi komersial Jilin-1 asal Tiongkok, dengan piksel kurang dari 1 m.',
    superview: 'Satelit pencitraan komersial Tiongkok dengan piksel sekitar 50 cm atau lebih kecil.',
    gaofenWideField: 'Satelit pencitraan pemerintah Tiongkok dengan kamera pankromatik 2 m dan kamera medan pandang lebar 16 m.',
    gaofen2: 'Satelit pencitraan pemerintah Tiongkok dengan piksel pankromatik 80 cm.',
    gaofen7: 'Satelit pemetaan stereo pemerintah Tiongkok dengan piksel kurang dari 1 m.',
    gaofenOptical: 'Satelit optik resolusi tinggi pemerintah Tiongkok; spesifikasinya tidak dipublikasikan.',

    // ── Radar satellites ──
    sentinel1: 'Radar pita C Copernicus yang memublikasikan setiap citranya: sapuan selebar 250 km di satu sisi, piksel 20 m, menembus awan, siang atau malam.',
    iceye: 'Satelit radar pita X berukuran kecil yang bisa ditugaskan merekam menembus awan, siang atau malam.',
    /** "spotlight": the radar imaging mode, kept as its name */
    capella: 'Satelit radar pita X dengan citra mode spotlight sekitar 50 cm, siang atau malam.',
    umbra: 'Satelit radar pita X dengan citra mode spotlight hingga sekitar 25 cm.',
    japaneseSmallRadar: 'Satelit radar pita X berukuran kecil dari Jepang.',
    kompsat5: 'Satelit radar pita X Korea Selatan dengan citra mode spotlight 1 m.',
    terrasarX: 'Satelit radar pita X Jerman, merekam citra sejak 2007.',
    tandemX: 'Terbang dalam formasi rapat dengan TerraSAR-X untuk memetakan topografi Bumi dengan radar.',
    cosmoSkymed: 'Satelit radar pita X Italia dari sistem COSMO-SkyMed.',
    paz: 'Satelit radar pita X Spanyol.',
    radarsat2: 'Satelit radar pita C Kanada, merekam citra sejak 2007.',
    rcm: 'Salah satu dari tiga satelit RADARSAT Constellation Mission milik Kanada.',
    saocom: 'Satelit radar pita L Argentina yang juga mengukur kelembapan tanah.',
    alos2: 'Satelit radar pita L Jepang, merekam citra sejak 2014.',
    alos4: 'Satelit radar pita L Jepang, penerus ALOS-2.',
    nisar: 'Radar dua pita yang memetakan sapuan selebar 242 km untuk mengukur pergerakan permukaan tanah.',
    superviewNeo2: 'Satelit radar pita X komersial Tiongkok.',
    gaofen3: 'Satelit radar pita C pemerintah Tiongkok.',
    gaofen12: 'Satelit radar pemerintah Tiongkok; spesifikasinya tidak dipublikasikan.',

    // ── Crewed space stations ──
    iss: 'Stasiun Antariksa Internasional, terus dihuni awak sejak November 2000.',
    tiangong: 'Stasiun antariksa Tiongkok, berpusat pada modul inti Tianhe yang diluncurkan pada 2021.',
  },
}

export default sats
