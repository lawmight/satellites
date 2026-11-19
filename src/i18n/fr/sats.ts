/**
 * French copy about the satellites themselves: the one-sentence blurb under a pass's sentence in the pass view (see
 * src/i18n/en/sats.ts; docs/i18n/fr.md is the authority on words, §6.2 on the numbers written into these lines).
 *
 * Why it reads this way: a blurb sits under a satellite's bare name, whose gender French cannot know (the ISS is
 * feminine), so no blurb puts *il* / *elle* or an agreeing participle on the satellite (§1.3). Most are noun phrases
 * headed by a noun of known gender (*Imageur…*, *Satellite radar…*, *La station spatiale…*), which then agree normally;
 * English "Its …" is a possessive on a known noun (*Son imageur VIIRS…*, *ses caractéristiques*), and "not counted"
 * becomes *que nous ne comptons pas*, which agrees with nothing. English's "images the full disk every 10 minutes" is
 * the noun phrase *une image du disque complet toutes les 10 minutes*: the bare verb *image* after a colon reads as
 * the noun. The glossary's words hold: swath *fauchée* (never *bande*, which is kept for spectral and radar frequency
 * bands: *13 bandes*, *bande C*, the Latin letter kept), imager *imageur*, full disk *disque complet*, standby spare
 * *satellite de réserve*, the product verb *observer*. Korea is *sud-coréen*, every name (satellite, instrument,
 * mission, agency, company, "Planet" included) stays as it is. Numbers are grouped and punctuated by hand as
 * fmt('fr') would (*3 040 km* with U+202F, *1,1 km*), a U+00A0 between a number and its unit or noun, years never
 * grouped, counts in digits (*8 bandes*, *3 satellites*) like the blurbs around them (§2.2). A radar's spotlight
 * figure names its *résolution* (*images de 1 m de résolution*), so the number never reads as the size of the image.
 */
import type en from '../en/sats'

const sats: typeof en = {
  blurb: {
    // ── Open photo archives (Sentinel-2, Landsat) ──
    sentinel2: 'Imageur multispectral de Copernicus\u00a0: 13\u00a0bandes, des pixels de 10\u00a0m et une fauchée de 290\u00a0km.',
    landsat8:
      'Operational Land Imager\u00a0: des pixels de 30\u00a0m en couleur et de 15\u00a0m en panchromatique, sur une fauchée de 185\u00a0km.',
    landsat9:
      'Operational Land Imager 2\u00a0: des pixels de 30\u00a0m en couleur et de 15\u00a0m en panchromatique, sur une fauchée de 185\u00a0km.',

    // ── Weather satellites in polar orbit ──
    noaaViirs: 'Son imageur VIIRS balaie une fauchée de 3\u202f040\u00a0km et couvre toute la planète deux fois par jour.',
    suomiNpp: 'Le premier imageur VIIRS mis en orbite, qui balaie une fauchée de 3\u202f040\u00a0km depuis 2011.',
    terra: 'Son imageur MODIS observe toute la planète par fauchées de 2\u202f330\u00a0km depuis 1999.',
    aqua: 'Son imageur MODIS observe toute la planète par fauchées de 2\u202f330\u00a0km depuis 2002.',
    metop:
      'Satellite météo européen en orbite polaire\u202f; son imageur AVHRR couvre une fauchée de 2\u202f900\u00a0km, à 1,1\u00a0km par pixel.',
    sentinel3:
      'Son instrument OLCI observe la couleur des terres et des océans en 21\u00a0bandes, sur une fauchée de 1\u202f270\u00a0km.',
    fengyun3: 'Satellite météo chinois en orbite polaire\u202f; son imageur MERSI couvre une fauchée de 2\u202f900\u00a0km.',
    fengyun3e: 'Satellite météo chinois en orbite aube-crépuscule, avec un imageur MERSI adapté à la faible luminosité.',

    // ── Geostationary weather satellites (each sits over the equator and images the whole disc below it) ──
    goesEast: 'GOES-East\u00a0: une image du disque complet des Amériques toutes les 10\u00a0minutes.',
    goesWest: 'GOES-West\u00a0: une image du disque complet du Pacifique et des Amériques toutes les 10\u00a0minutes.',
    goes16: 'L’ancien GOES-East, maintenu en orbite comme satellite de réserve.',
    goes17: 'L’ancien GOES-West, maintenu en orbite comme satellite de réserve.',
    himawari9: 'Le satellite météo japonais\u00a0: une image du disque complet de l’Asie et du Pacifique toutes les 10\u00a0minutes.',
    himawari8: 'Satellite de secours pour Himawari-9.',
    meteosat12:
      'Le premier Meteosat de troisième génération (MTG-I1)\u00a0: une image de l’Europe et de l’Afrique toutes les 10\u00a0minutes.',
    meteosat9: 'Au-dessus de l’océan Indien\u00a0: une image du disque complet toutes les 15\u00a0minutes.',
    meteosatSecondGen:
      'Meteosat de deuxième génération, que nous ne comptons pas ici parmi les imageurs du disque complet qui couvrent ce lieu.',
    mtgI2: 'Deuxième imageur Meteosat de troisième génération, qui n’assure pas encore le service opérationnel.',
    geoKompsat2a: 'Le satellite météo sud-coréen\u00a0: une image du disque complet toutes les 10\u00a0minutes.',
    fengyun4b: 'Le satellite météo géostationnaire chinois en service\u00a0: une image du disque complet toutes les 15\u00a0minutes.',
    fengyun4a: 'Imageur géostationnaire chinois plus ancien, que nous ne comptons pas comme le service principal.',
    fengyun4c: 'Le plus récent imageur géostationnaire chinois, qui n’assure pas encore le service opérationnel.',
    insat: 'Satellite météo indien\u00a0: une image du disque complet toutes les 30\u00a0minutes.',
    insat3d: 'Satellite météo indien plus ancien, que nous ne comptons pas comme imageur opérationnel.',
    elektroL: 'Satellite météo géostationnaire russe\u00a0: une image du disque complet toutes les 30\u00a0minutes.',
    elektroL2: 'Satellite météo géostationnaire russe plus ancien, que nous ne comptons pas comme imageur opérationnel.',
    elektroL5: 'Le plus récent satellite météo géostationnaire russe, que nous ne comptons pas encore comme opérationnel.',

    // ── Commercial and government high-resolution cameras ──
    worldview1: 'Imageur panchromatique aux pixels de 50\u00a0cm, capable de pointer loin de sa trace au sol.',
    worldview2: 'Imageur à 8\u00a0bandes, avec des pixels panchromatiques de 46\u00a0cm.',
    worldview3: 'Imageur aux pixels panchromatiques de 31\u00a0cm, avec 16\u00a0bandes spectrales.',
    geoeye1: 'Imageur aux pixels panchromatiques de 41\u00a0cm, en orbite depuis 2008.',
    worldviewLegion: 'L’un des imageurs WorldView Legion de Maxar, aux pixels d’environ 30\u00a0cm.',
    skysat: 'Imageur agile de Planet, aux pixels d’environ 50\u00a0cm\u202f; il est programmé pour viser des cibles précises.',
    pelican: 'Le nouvel imageur agile à haute résolution de Planet.',
    superDove:
      'Un cubesat SuperDove de Planet\u202f; la flotte observe chaque jour la plupart des terres émergées, à environ 3\u00a0m par pixel.',
    blacksky: 'Un imageur BlackSky à revisite rapide, aux pixels d’environ 1\u00a0m, voire plus fins.',
    pleiades: 'Imageur agile qui fournit des produits panchromatiques à 50\u00a0cm.',
    pleiadesNeo: 'Imageur agile aux pixels natifs de 30\u00a0cm.',
    spot6: 'Imageur à large couverture\u00a0: des pixels panchromatiques de 1,5\u00a0m et une fauchée de 60\u00a0km.',
    spot7: 'Jumeau de SPOT 6, exploité par l’Azerbaïdjan sous le nom d’Azersky.',
    kompsat3: 'Imageur sud-coréen aux pixels panchromatiques de 70\u00a0cm.',
    kompsat3a: 'Imageur sud-coréen aux pixels panchromatiques de 55\u00a0cm, avec un canal infrarouge.',
    jilin1: 'Membre de la constellation commerciale chinoise Jilin-1, aux imageurs de résolution submétrique.',
    superview: 'Imageur commercial chinois aux pixels d’environ 50\u00a0cm, voire plus fins.',
    gaofenWideField:
      'Imageur gouvernemental chinois, avec des caméras panchromatiques à 2\u00a0m et des caméras grand champ à 16\u00a0m.',
    gaofen2: 'Imageur gouvernemental chinois aux pixels panchromatiques de 80\u00a0cm.',
    gaofen7: 'Imageur gouvernemental chinois de cartographie stéréoscopique, aux pixels submétriques.',
    gaofenOptical: 'Satellite optique gouvernemental chinois à haute résolution\u202f; ses caractéristiques ne sont pas publiées.',

    // ── Radar satellites (they see through cloud and at night) ──
    sentinel1:
      'Radar en bande C de Copernicus, dont chaque image est publiée\u00a0: une fauchée de 250\u00a0km sur le côté, à 20\u00a0m par pixel, à travers les nuages, de jour comme de nuit.',
    iceye: 'Petit satellite radar en bande X, programmable pour imager à travers les nuages, de jour comme de nuit.',
    capella: 'Satellite radar en bande X, aux images d’environ 50\u00a0cm de résolution en mode spotlight, de jour comme de nuit.',
    umbra: 'Satellite radar en bande X, aux images en mode spotlight d’une résolution allant jusqu’à environ 25\u00a0cm.',
    japaneseSmallRadar: 'Petit satellite radar japonais en bande X.',
    kompsat5: 'Satellite radar sud-coréen en bande X, aux images de 1\u00a0m de résolution en mode spotlight.',
    terrasarX: 'Satellite radar allemand en bande X, en service depuis 2007.',
    tandemX: 'Satellite radar qui vole en formation serrée avec TerraSAR-X pour cartographier le relief de la Terre.',
    cosmoSkymed: 'Satellite radar italien en bande X, du système COSMO-SkyMed.',
    paz: 'Satellite radar espagnol en bande X.',
    radarsat2: 'Satellite radar canadien en bande C, en service depuis 2007.',
    rcm: 'L’un des 3\u00a0satellites canadiens de la Mission de la Constellation RADARSAT.',
    saocom: 'Satellite radar argentin en bande L, qui mesure aussi l’humidité des sols.',
    alos2: 'Satellite radar japonais en bande L, en service depuis 2014.',
    alos4: 'Satellite radar japonais en bande L, successeur d’ALOS-2.',
    nisar: 'Radar bibande qui cartographie une fauchée de 242\u00a0km pour mesurer les mouvements du sol.',
    superviewNeo2: 'Satellite radar commercial chinois en bande X.',
    gaofen3: 'Satellite radar gouvernemental chinois en bande C.',
    gaofen12: 'Satellite radar gouvernemental chinois\u202f; ses caractéristiques ne sont pas publiées.',

    // ── Crewed space stations ──
    iss: 'La Station spatiale internationale, habitée sans interruption depuis novembre 2000.',
    tiangong: 'La station spatiale chinoise, construite autour du module central Tianhe, lancé en 2021.',
  },
}

export default sats
