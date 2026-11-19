/**
 * Brazilian Portuguese copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass
 * view (see src/i18n/en/sats.ts; docs/i18n/pt-BR.md is the authority on every word here, §4.1 for the instrument
 * vocabulary and §6 for the numbers).
 *
 * Why it reads this way: each blurb is one plain sentence under the satellite's name, so it never repeats the name and
 * never gives the satellite a pronoun or *seu / sua* (the reader would read "your"): "Its VIIRS imager" is *O sensor
 * VIIRS*, with the article. The blurbs are static, one per satellite, so unlike a slot they may use articles and
 * agreement (*O antigo GOES-East, mantido em órbita como reserva.*, *A Estação Espacial Internacional*). "imager" is
 * *sensor* when it is an instrument (VIIRS, MODIS, AVHRR, MERSI, never *imageador*) and *satélite de observação* when it
 * is the whole satellite; the verb "images" is *captar* (*capta uma imagem de disco completo*), never *registrar*; the
 * product's own verb *observar* only for Terra and Aqua's record, in the guide's words (§6: *observa o planeta inteiro,
 * 2.330 km por vez, desde 1999*). *varrer* only with a swath as its object (§3.4). The terms are the glossary's:
 * *faixa*, *pancromático*, *multiespectral*, *disco completo*, *traço no solo*, *banda C / X / L*, *programado* for
 * tasked, *modo spotlight*. "Korea(n)" is *sul-coreano*, the country these satellites belong to; Canada's two radars
 * say *do Canadá*, which needs no Brazilian or Portuguese adjective. Numbers are typed the pt-BR way, the one place in
 * the catalogs they are (§6): a thousands dot (*3.040 km*), a decimal comma (*1,1 km*), a no-break space before every
 * unit. Satellite, instrument, mission, agency and company names stay as they are.
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──

    sentinel2: 'Sensor multiespectral do Copernicus: 13 bandas, pixels de 10 m e uma faixa de 290 km.',
    landsat8: 'Operational Land Imager: pixels de 30 m em cores e pixels pancromáticos de 15 m, em uma faixa de 185 km.',
    landsat9: 'Operational Land Imager 2: pixels de 30 m em cores e pixels pancromáticos de 15 m, em uma faixa de 185 km.',

    // ── Weather satellites in polar orbit ──

    noaaViirs: 'O sensor VIIRS varre uma faixa de 3.040 km e cobre o planeta inteiro duas vezes por dia.',
    suomiNpp: 'O primeiro sensor VIIRS em órbita, que varre uma faixa de 3.040 km desde 2011.',
    terra: 'O sensor MODIS observa o planeta inteiro, 2.330 km por vez, desde 1999.',
    aqua: 'O sensor MODIS observa o planeta inteiro, 2.330 km por vez, desde 2002.',
    metop: 'Satélite meteorológico europeu de órbita polar; o sensor AVHRR cobre uma faixa de 2.900 km com pixels de 1,1 km.',
    sentinel3: 'O instrumento OLCI capta a cor da terra e do oceano em 21 bandas, em uma faixa de 1.270 km.',
    fengyun3: 'Satélite meteorológico chinês de órbita polar; o sensor MERSI cobre uma faixa de 2.900 km.',
    /** "dawn–dusk orbit": *órbita crepuscular* (it flies over the line between dawn and dusk) */
    fengyun3e: 'Satélite meteorológico chinês em órbita crepuscular, com um sensor MERSI para pouca luz.',

    // ── Geostationary weather satellites ──

    goesEast: 'GOES-East: capta uma imagem de disco completo das Américas a cada 10 minutos.',
    goesWest: 'GOES-West: capta uma imagem de disco completo do Pacífico e das Américas a cada 10 minutos.',
    /** §6, word for word */
    goes16: 'O antigo GOES-East, mantido em órbita como reserva.',
    goes17: 'O antigo GOES-West, mantido em órbita como reserva.',
    himawari9: 'O satélite meteorológico do Japão, que capta uma imagem de disco completo da Ásia e do Pacífico a cada 10 minutos.',
    himawari8: 'Reserva do Himawari-9.',
    meteosat12: 'O primeiro Meteosat de terceira geração (MTG-I1), que capta imagens da Europa e da África a cada 10 minutos.',
    meteosat9: 'Cobre a região do oceano Índico, com uma imagem de disco completo a cada 15 minutos.',
    /** "not counted here": the app does not list it among the watchers of this place */
    meteosatSecondGen: 'Meteosat de segunda geração; aqui não é contado como fonte de imagens de disco completo deste lugar.',
    mtgI2: 'Segundo Meteosat de terceira geração; ainda não é o serviço operacional.',
    geoKompsat2a: 'O satélite meteorológico sul-coreano, que capta uma imagem de disco completo a cada 10 minutos.',
    fengyun4b: 'O satélite meteorológico geoestacionário operacional da China, que capta uma imagem de disco completo a cada 15 minutos.',
    fengyun4a: 'Satélite geoestacionário chinês mais antigo, não contado como o serviço principal.',
    fengyun4c: 'O mais novo satélite geoestacionário chinês; ainda não é o serviço operacional.',
    insat: 'Satélite meteorológico indiano que capta uma imagem de disco completo a cada 30 minutos.',
    insat3d: 'Satélite meteorológico indiano mais antigo, não contado como fonte operacional de imagens.',
    elektroL: 'Satélite meteorológico geoestacionário russo que capta uma imagem de disco completo a cada 30 minutos.',
    elektroL2: 'Satélite meteorológico geoestacionário russo mais antigo, não contado como fonte operacional de imagens.',
    elektroL5: 'O mais novo satélite meteorológico geoestacionário russo; ainda não é contado como operacional.',

    // ── Commercial and government high-resolution cameras ──

    worldview1: 'Satélite de observação pancromático, com pixels de 50 cm, capaz de apontar para bem longe do traço no solo.',
    worldview2: 'Satélite de observação de oito bandas, com pixels pancromáticos de 46 cm.',
    worldview3: 'Satélite de observação com pixels pancromáticos de 31 cm e 16 bandas espectrais.',
    geoeye1: 'Satélite de observação com pixels pancromáticos de 41 cm, em órbita desde 2008.',
    worldviewLegion: 'Um dos satélites de observação WorldView Legion da Maxar, com pixels de cerca de 30 cm.',
    /** Planet is a company (*a Planet*), never the common noun; "tasked": *programado* */
    skysat: 'Satélite de observação ágil da Planet, com pixels de cerca de 50 cm; é programado para apontar para alvos específicos.',
    /** "newer": Pelican is the generation after SkySat */
    pelican: 'Satélite de observação ágil e de alta resolução da nova geração da Planet.',
    superDove: 'Um cubesat SuperDove da Planet; a frota capta a maior parte da terra firme do planeta todos os dias, a cerca de 3 m por pixel.',
    /** "or better": smaller pixels */
    blacksky: 'Um satélite de observação de revisita rápida da BlackSky, com pixels de cerca de 1 m ou menores.',
    pleiades: 'Satélite de observação ágil que fornece produtos pancromáticos de 50 cm.',
    pleiadesNeo: 'Satélite de observação ágil com pixels nativos de 30 cm.',
    spot6: 'Satélite de observação de cobertura ampla, com pixels pancromáticos de 1,5 m e uma faixa de 60 km.',
    spot7: 'Gêmeo do SPOT 6, operado pelo Azerbaijão com o nome Azersky.',
    kompsat3: 'Satélite de observação sul-coreano com pixels pancromáticos de 70 cm.',
    kompsat3a: 'Satélite de observação sul-coreano com pixels pancromáticos de 55 cm e um canal infravermelho.',
    jilin1: 'Parte da constelação comercial chinesa Jilin-1, com sensores de resolução submétrica.',
    superview: 'Satélite de observação comercial chinês, com pixels de cerca de 50 cm ou menores.',
    gaofenWideField: 'Satélite de observação do governo chinês, com câmeras pancromáticas de 2 m e de campo amplo de 16 m.',
    gaofen2: 'Satélite de observação do governo chinês, com pixels pancromáticos de 80 cm.',
    gaofen7: 'Satélite de mapeamento estereoscópico do governo chinês, com pixels submétricos.',
    gaofenOptical: 'Satélite óptico de alta resolução do governo chinês; as especificações não são publicadas.',

    // ── Radar satellites ──

    /** "to one side": radar looks sideways, not straight down; "at 20 m": its pixels */
    sentinel1: 'Radar de banda C do Copernicus que publica todas as imagens: uma faixa lateral de 250 km, a 20 m por pixel, através das nuvens, de dia ou de noite.',
    iceye: 'Pequeno satélite de radar de banda X que pode ser programado para captar imagens através das nuvens, de dia ou de noite.',
    capella: 'Satélite de radar de banda X com imagens de cerca de 50 cm no modo spotlight, de dia ou de noite.',
    umbra: 'Satélite de radar de banda X com imagens de até cerca de 25 cm no modo spotlight.',
    japaneseSmallRadar: 'Pequeno satélite japonês de radar de banda X.',
    kompsat5: 'Satélite sul-coreano de radar de banda X, com imagens de 1 m no modo spotlight.',
    terrasarX: 'Satélite alemão de radar de banda X, que capta imagens desde 2007.',
    tandemX: 'Voa em formação próxima com o TerraSAR-X para mapear a topografia da Terra por radar.',
    cosmoSkymed: 'Satélite italiano de radar de banda X do sistema COSMO-SkyMed.',
    paz: 'Satélite espanhol de radar de banda X.',
    radarsat2: 'Satélite de radar de banda C do Canadá, que capta imagens desde 2007.',
    rcm: 'Um dos três satélites da RADARSAT Constellation Mission, do Canadá.',
    saocom: 'Satélite argentino de radar de banda L que também mede a umidade do solo.',
    alos2: 'Satélite japonês de radar de banda L, que capta imagens desde 2014.',
    alos4: 'Satélite japonês de radar de banda L, sucessor do ALOS-2.',
    nisar: 'Radar de duas bandas que mapeia uma faixa de 242 km para medir como o solo se move.',
    superviewNeo2: 'Satélite comercial chinês de radar de banda X.',
    gaofen3: 'Satélite de radar de banda C do governo chinês.',
    gaofen12: 'Satélite de radar do governo chinês; as especificações não são publicadas.',

    // ── Crewed space stations ──

    iss: 'A Estação Espacial Internacional, tripulada sem interrupção desde novembro de 2000.',
    tiangong: 'A estação espacial da China, construída em torno do módulo central Tianhe, lançado em 2021.',
  },
}

export default sats
