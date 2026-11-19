/**
 * Spanish copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass view (see
 * src/i18n/en/sats.ts; docs/i18n/es.md is the authority on every word here, §4 for the instrument vocabulary).
 *
 * Why it reads this way: each blurb is one plain sentence under the satellite's name, so it never repeats the name and
 * never refers to the satellite with a pronoun: *Su sensor…* (*su* has no gender), or a noun phrase that names what it
 * is (*Satélite de observación…*, *Satélite de radar de banda X…*, never *satélite de imágenes*). "imager" is *sensor*
 * when it is an instrument (VIIRS, MODIS, AVHRR, MERSI) and *satélite de observación* when it is the whole satellite;
 * the verb "images" is *toma imágenes* (*toma una imagen de disco completo*, as the pass view says it). The terms are
 * the glossary's: *franja*, *pancromático*, *multiespectral*, *banda C / X / L* (noun first), *órbita crepuscular*,
 * *de reserva*, *revisita rápida*, *se programa* for tasking, *modo spotlight*, *cartografía estereoscópica*, *humedad
 * del suelo*, and *ha observado todo el planeta* for Terra and Aqua's record. "Korea(n)" is *surcoreano*, the form
 * Spanish uses for the South. Numbers are typed the guide's way (§6): four digits ungrouped (*3040 km*), a decimal
 * comma (*1,1 km*), a no-break space before every unit. Names (satellites, instruments, missions, agencies, companies)
 * stay as they are.
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──

    sentinel2: 'Sensor multiespectral de Copernicus: 13 bandas, píxeles de 10 m y una franja de 290 km.',
    landsat8: 'Operational Land Imager: píxeles en color de 30 m y pancromáticos de 15 m, en una franja de 185 km.',
    landsat9: 'Operational Land Imager 2: píxeles en color de 30 m y pancromáticos de 15 m, en una franja de 185 km.',

    // ── Weather satellites in polar orbit ──

    noaaViirs: 'Su sensor VIIRS escanea una franja de 3040 km y cubre todo el planeta dos veces al día.',
    suomiNpp: 'Su sensor VIIRS, el primero en órbita, escanea una franja de 3040 km desde 2011.',
    terra: 'Su sensor MODIS ha observado todo el planeta, en franjas de 2330 km, desde 1999.',
    aqua: 'Su sensor MODIS ha observado todo el planeta, en franjas de 2330 km, desde 2002.',
    metop: 'Satélite meteorológico europeo de órbita polar; su sensor AVHRR cubre una franja de 2900 km con píxeles de 1,1 km.',
    sentinel3: 'Su instrumento OLCI capta el color de la tierra y del océano en 21 bandas, en una franja de 1270 km.',
    fengyun3: 'Satélite meteorológico chino de órbita polar; su sensor MERSI cubre una franja de 2900 km.',
    fengyun3e: 'Satélite meteorológico chino en órbita crepuscular, con un sensor MERSI para poca luz.',

    // ── Geostationary weather satellites ──

    goesEast: 'GOES-East: toma una imagen de disco completo de las Américas cada 10 minutos.',
    goesWest: 'GOES-West: toma una imagen de disco completo del Pacífico y las Américas cada 10 minutos.',
    goes16: 'Antes era GOES-East; ahora se mantiene en órbita como satélite de reserva.',
    goes17: 'Antes era GOES-West; ahora se mantiene en órbita como satélite de reserva.',
    himawari9: 'Satélite meteorológico de Japón: toma una imagen de disco completo de Asia y el Pacífico cada 10 minutos.',
    himawari8: 'Satélite de reserva de Himawari-9.',
    meteosat12: 'El primer Meteosat de tercera generación (MTG-I1): toma imágenes de Europa y África cada 10 minutos.',
    meteosat9: 'Cubre la región del océano Índico y toma una imagen de disco completo cada 15 minutos.',
    /** "not counted here": the app does not list it as watching the place */
    meteosatSecondGen: 'Meteosat de segunda generación; no lo contamos entre los que toman imágenes de disco completo de este lugar.',
    mtgI2: 'El segundo Meteosat de tercera generación; aún no está en servicio operativo.',
    geoKompsat2a: 'Satélite meteorológico surcoreano: toma una imagen de disco completo cada 10 minutos.',
    fengyun4b: 'Satélite meteorológico geoestacionario operativo de China: toma una imagen de disco completo cada 15 minutos.',
    fengyun4a: 'Satélite geoestacionario chino más antiguo; no se cuenta como el servicio principal.',
    fengyun4c: 'El satélite geoestacionario chino más reciente; aún no está en servicio operativo.',
    insat: 'Satélite meteorológico indio: toma una imagen de disco completo cada 30 minutos.',
    insat3d: 'Satélite meteorológico indio más antiguo; no se cuenta como satélite operativo.',
    elektroL: 'Satélite meteorológico geoestacionario ruso: toma una imagen de disco completo cada 30 minutos.',
    elektroL2: 'Satélite meteorológico geoestacionario ruso más antiguo; no se cuenta como satélite operativo.',
    elektroL5: 'El satélite meteorológico geoestacionario ruso más reciente; aún no se cuenta como operativo.',

    // ── Commercial and government high-resolution cameras ──

    worldview1: 'Satélite de observación pancromático con píxeles de 50 cm que puede apuntar muy lejos de su traza terrestre.',
    worldview2: 'Satélite de observación de ocho bandas con píxeles pancromáticos de 46 cm.',
    worldview3: 'Satélite de observación con píxeles pancromáticos de 31 cm y 16 bandas espectrales.',
    geoeye1: 'Satélite de observación con píxeles pancromáticos de 41 cm, en órbita desde 2008.',
    worldviewLegion: 'Uno de los satélites WorldView Legion de Maxar, con píxeles de unos 30 cm.',
    /** Planet is the company */
    skysat: 'Satélite ágil de Planet con píxeles de unos 50 cm; se programa para apuntar a objetivos concretos.',
    pelican: 'El nuevo satélite ágil de alta resolución de Planet.',
    superDove: 'Un cubesat SuperDove de Planet; la flota toma imágenes de la mayor parte de la tierra firme del planeta cada día, con píxeles de unos 3 m.',
    blacksky: 'Un satélite de revisita rápida de BlackSky, con píxeles de alrededor de 1 m o menos.',
    pleiades: 'Satélite ágil que ofrece productos pancromáticos de 50 cm.',
    pleiadesNeo: 'Satélite ágil con píxeles nativos de 30 cm.',
    spot6: 'Satélite de observación de gran cobertura con píxeles pancromáticos de 1,5 m y una franja de 60 km.',
    spot7: 'Gemelo de SPOT 6, operado por Azerbaiyán con el nombre de Azersky.',
    kompsat3: 'Satélite de observación surcoreano con píxeles pancromáticos de 70 cm.',
    kompsat3a: 'Satélite de observación surcoreano con píxeles pancromáticos de 55 cm y un canal infrarrojo.',
    jilin1: 'Parte de la constelación comercial china Jilin-1, con sensores de menos de 1 m por píxel.',
    superview: 'Satélite de observación comercial chino con píxeles de unos 50 cm o menos.',
    gaofenWideField: 'Satélite de observación gubernamental chino con cámaras pancromáticas de 2 m y de campo amplio de 16 m.',
    gaofen2: 'Satélite de observación gubernamental chino con píxeles pancromáticos de 80 cm.',
    gaofen7: 'Satélite gubernamental chino de cartografía estereoscópica con píxeles de menos de 1 m.',
    gaofenOptical: 'Satélite óptico gubernamental chino de alta resolución; sus especificaciones no se publican.',

    // ── Radar satellites ──

    /** The longest blurb; "to one side": radar looks sideways, not straight down */
    sentinel1:
      'Radar de banda C de Copernicus que publica todas sus imágenes: una franja de 250 km a un lado, con píxeles de 20 m, a través de las nubes, de día o de noche.',
    iceye: 'Pequeño satélite de radar de banda X que se puede programar para tomar imágenes a través de las nubes, de día o de noche.',
    capella: 'Satélite de radar de banda X con imágenes en modo spotlight de unos 50 cm, de día o de noche.',
    umbra: 'Satélite de radar de banda X con imágenes en modo spotlight de hasta unos 25 cm.',
    japaneseSmallRadar: 'Pequeño satélite japonés de radar de banda X.',
    kompsat5: 'Satélite surcoreano de radar de banda X con imágenes en modo spotlight de 1 m.',
    terrasarX: 'Satélite alemán de radar de banda X, que toma imágenes desde 2007.',
    tandemX: 'Vuela en formación cerrada con TerraSAR-X para cartografiar por radar el relieve de la Tierra.',
    cosmoSkymed: 'Satélite italiano de radar de banda X del sistema COSMO-SkyMed.',
    paz: 'Satélite español de radar de banda X.',
    radarsat2: 'Satélite canadiense de radar de banda C, que toma imágenes desde 2007.',
    rcm: 'Uno de los tres satélites de la RADARSAT Constellation Mission, de Canadá.',
    saocom: 'Satélite argentino de radar de banda L que también mide la humedad del suelo.',
    alos2: 'Satélite japonés de radar de banda L, que toma imágenes desde 2014.',
    alos4: 'Satélite japonés de radar de banda L, sucesor de ALOS-2.',
    nisar: 'Radar de doble banda que cartografía una franja de 242 km para medir cómo se mueve el suelo.',
    superviewNeo2: 'Satélite comercial chino de radar de banda X.',
    gaofen3: 'Satélite gubernamental chino de radar de banda C.',
    gaofen12: 'Satélite gubernamental chino de radar; sus especificaciones no se publican.',

    // ── Crewed space stations ──

    /** es.md §4 (ISS, in blurbs), word for word */
    iss: 'La Estación Espacial Internacional, tripulada sin interrupción desde noviembre de 2000.',
    tiangong: 'La estación espacial de China, construida en torno al módulo central Tianhe, lanzado en 2021.',
  },
}

export default sats
