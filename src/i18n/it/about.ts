/**
 * Italian copy for the About page ("Come funziona", src/ui/pages/AboutPage.tsx; see src/i18n/en/about.ts, and
 * docs/i18n/it.md §1, §2, §3.6, §3.7, which give the title, lede, section headings, fact terms and verdict lines word
 * for word and are the authority on every one).
 *
 * Why it reads this way: the page talks to one reader in tu, and the product is *noi* (*Calcoliamo*, *Conserviamo*),
 * plain and conversational as the owner's English is; nothing agrees with the reader (*Se eri a portata*, never *Sei
 * stato…*). The questions are the reader's own (*Un satellite può vedermi?*: with no subject, *Può vedermi?* reads as
 * the formal *Lei*), answered plainly (*No.*), never with *Tranquillo*.
 * The title is *Come / funziona.*, the accent on the verb, the full stop outside it. The quoted verdict is the results'
 * own title in « » (*«poteva puntare qui»*), lowercase mid-sentence as English writes it. *foto* only where the item is
 * certainly a Sentinel-2 or Landsat photograph; anything that may be radar or a weather frame is *immagine*. Swath is
 * *fascia* (never *striscia*), instruments look *dritto verso il basso*, radar looks *di lato*, and the geostationary
 * satellites *osservano*, the product verb. The privacy rows say exactly what the English says, with no legalese
 * (*Non lo leggiamo mai.*), and active *noi* verbs instead of *viene* passives. Licence lines, product, agency and
 * people's names stay as they are; OpenStreetMap's attribution stays in its English form (§4). Key caps are the names
 * printed on Italian keyboards (*Invio*, *Spazio*, *Esc*). The loaded count agrees with *oggetto* in all three CLDR
 * categories (the exact-million `many` takes *di* outside the mono number), and the ISO stamp follows *aggiornati al*
 * (*al* never elides before a year: every year from 2000 on starts with a consonant sound). A number never parts from
 * its unit (U+00A0).
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('it')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: 'Informazioni',
  close: 'Chiudi',
  sectionsLabel: 'Sezioni',
  /** "Come / *funziona*." (it.md §3.1): the accent on the verb, the full stop outside it */
  title: [['Come'], [accent('funziona'), '.']] as Rich[],
  lede: 'Scegli un punto sulla Terra. Calcoliamo quali satelliti l’hanno sorvolato nell’ultima settimana, poi andiamo a cercare le foto che hanno ripreso. Funziona tutto nel tuo browser, con dati pubblici.',

  sections: {
    short: 'La versione breve',
    method: 'Come troviamo i passaggi',
    /** ≤ 24 characters, as the other long ones: the index is a mono caps column of about 233 px at 1101 px */
    words: 'Cosa dicono le etichette',
    accuracy: 'Cosa non possiamo vedere',
    privacy: 'Privacy',
    credits: 'Crediti',
    keys: 'Tastiera',
  },

  short: {
    live: {
      term: 'È in tempo reale?',
      text: 'Non proprio. Le foto arrivano negli archivi da qualche ora a un paio di giorni dopo lo scatto: i passaggi più recenti potrebbero non averne ancora una.',
    },
    /** it.md §2, example 3, word for word */
    seeMe: {
      term: 'Un satellite può vedermi?',
      text: 'No. Nel migliore dei casi un pixel misura 10 m. Un’auto è un pixel. Tu lì dentro non ci sei.',
    },
    every: {
      term: 'Ci sono tutti i satelliti?',
      text: 'No. I satelliti militari e spia per lo più non sono nei cataloghi pubblici, e le aziende non dicono dove puntano le loro fotocamere.',
    },
  },

  method: {
    /** The link stays on CelesTrak's name; US Space Force is a name and stays (feminine, as agencies are: *della*) */
    orbits: [
      'Ogni oggetto in orbita ha una serie di numeri pubblici che ne descrive la traiettoria. ',
      link('CelesTrak'),
      ' li pubblica in base ai dati di tracciamento della US Space Force, e ogni sei ore ne scarichiamo una copia aggiornata.',
    ] as AboutPart[],
    /** "Questa pagina ha caricato 16.893 oggetti, aggiornati al 2026-11-08 03:34Z." (the participle agrees with *oggetto*) */
    loaded: (count: number, stamp: string): AboutPart[] => [
      'Questa pagina ha caricato ',
      num(f.int(count)),
      f.plural(count, {
        one: ' oggetto, aggiornato al ',
        many: ' di oggetti, aggiornati al ',
        other: ' oggetti, aggiornati al ',
      }),
      num(stamp),
      '.',
    ],
    sgp4: 'Con SGP4, il modello orbitale standard, calcoliamo la traiettoria di ogni satellite negli ultimi sette giorni. Poi annotiamo ogni volta che il tuo punto era nel suo campo visivo.',
    facts: {
      straightDown: {
        term: 'Dritto verso il basso',
        text: 'Sentinel-2 e Landsat guardano dritto verso il basso, su una fascia di terreno larga circa 290 km per Sentinel-2 e 185 km per Landsat. Devi trovarti dentro la fascia.',
      },
      /** Quotes the could verdict's title, «poteva puntare qui» (it.md §3.7), lowercase mid-sentence as English writes it */
      tilting: {
        term: 'Fotocamere orientabili',
        text: 'Molti satelliti commerciali possono inclinarsi da 30 a 45 gradi. Se eri a portata, lo chiamiamo «poteva puntare qui».',
      },
      daylight: {
        term: 'Luce del giorno',
        text: 'Le fotocamere normali hanno bisogno del sole. Un passaggio al buio non conta mai come foto.',
      },
      /** Radar is never *foto* (it.md §4): *immagini*, shown in grey; *chiari* / *scuri* are tones here, not a sky state */
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 non ha bisogno del sole. Emette microonde e ne registra l’eco: così vede attraverso le nuvole e di notte, guardando di lato rispetto alla sua traccia al suolo. Anche le sue immagini sono pubbliche, quindi le mostriamo, in grigio: i toni chiari sono terreno accidentato ed edifici, quelli scuri acqua calma.',
      },
      weather: {
        term: 'Satelliti meteo',
        text: 'Alcuni restano sopra l’equatore e osservano metà del pianeta ogni 10 minuti. Se ti trovi in quella metà, sei in ogni loro immagine.',
      },
    },
    archives:
      'Poi cerchiamo negli archivi delle immagini (Microsoft Planetary Computer, Element 84 e NASA) e abbiniamo ogni immagine al passaggio che l’ha ripresa. Ogni immagine che vedi è quella vera, ritagliata intorno al tuo punto.',
    photoFacts: {
      touchUps: {
        term: 'Ritocchi',
        text: 'Bilanciamo i colori delle foto di Sentinel-2 e Landsat, le ammorbidiamo e ne aumentiamo appena la nitidezza per il tuo schermo. Applichiamo ogni ritocco allo stesso modo su tutta l’immagine: non aggiungiamo né togliamo nulla.',
      },
      /** The photo viewer's north arrow is labelled N (gallery.north) */
      whichWayUp: {
        term: 'Dov’è il nord',
        text: 'Le foto di Sentinel-2 e Landsat mantengono la griglia cartografica dell’archivio per il tuo luogo, quindi il nord può discostarsi di qualche grado dalla verticale. Quando apri una foto, la sua freccia N mostra esattamente dove.',
      },
    },
  },

  /** After each verdict's definition, as the next sentence (it.md §3.6, word for word) */
  verdictMore: {
    imaged: 'Se la mostriamo, è l’immagine vera.',
    likely: 'La foto non è ancora pubblica, oppure è stata scartata per le nuvole.',
    could: 'Non c’è modo di sapere se l’ha fatto davvero.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Posizioni esatte',
      text: 'I dati orbitali pubblici hanno una precisione di circa un chilometro, e ogni giorno ne perdono un po’. Gli orari possono essere sbagliati di qualche secondo.',
    },
    secret: {
      term: 'Satelliti segreti',
      text: 'Alcune delle migliori fotocamere in orbita appartengono alle forze armate. Qui non compaiono.',
    },
    clouds: {
      term: 'Nuvole',
      text: 'Molte foto sono solo nuvole. Quando l’archivio lo segnala, controlliamo il pixel esatto sopra il tuo punto e lo diciamo.',
    },
    delays: { term: 'Ritardi', text: 'Le foto possono arrivare con un giorno o due di ritardo.' },
  },

  /** Exactly the English, no more and no less (it.md §8): plain words, no GDPR legalese */
  privacy: {
    where: { term: 'Dove funziona', text: 'I calcoli delle orbite avvengono nel tuo browser.' },
    kept: {
      term: 'Cosa conserviamo',
      text: 'Contiamo le ricerche per città e per zone di circa 10 km, mai il tuo punto esatto, e teniamo il conto di aperture e condivisioni. Nessun indirizzo IP, nessun cookie nostro, niente che colleghi una visita alla successiva.',
    },
    others: {
      term: 'Chi altro lo vede',
      text: 'La maggior parte dei nomi di luogo viene da un elenco integrato nel sito. Le altre ricerche vanno a Open-Meteo, Photon o Nominatim. Le foto si caricano direttamente dagli archivi. Chi ospita il sito conta le pagine viste e ne misura la velocità, senza cookie, e può impostare un cookie di sicurezza per distinguere le persone dai bot. Non lo leggiamo mai.',
    },
    links: {
      term: 'Link di condivisione',
      text: 'Li creiamo solo quando condividi qualcosa. Chi ha il link vede il nome del luogo, un punto arrotondato a circa 1 km e il passaggio che hai scelto.',
    },
  },

  /** Product, agency, licence and people's names as they are; *via* stays *via* (it.md §4) */
  credits: {
    madeBy: { who: 'Realizzato da', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' su X'] },
    gibs: 'Immagini da NASA GIBS, parte di EOSDIS. GOES via NOAA e CIRA, Himawari via JMA.',
    archives: {
      who: 'Archivi',
      text: 'Microsoft Planetary Computer ed Element 84 Earth Search; la banda da 15 m di Landsat dal Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Orbite', text: 'Elementi orbitali da CelesTrak. SGP4 di satellite.js.' },
    /** The attribution line stays in its English form, as the licence words it (it.md §4) */
    placeNames: { who: 'Nomi dei luoghi', text: 'Photon di komoot. Dati cartografici © OpenStreetMap contributors (ODbL).' },
    textures: { who: 'Texture della Terra', text: 'Solar System Scope (CC BY 4.0), da NASA Blue Marble e Black Marble.' },
    type: { who: 'Caratteri', text: 'Instrument Sans e Serif di Instrument, Martian Mono di Evil Martians (SIL OFL).' },
  },

  /** tu imperatives and noun labels, as the rest of the UI */
  keys: {
    search: 'Cerca un luogo',
    suggestions: 'Scorri i suggerimenti',
    choose: 'Scegli',
    passes: 'Scorri i passaggi',
    photos: 'Foto precedente / successiva',
    expand: 'Ingrandisci la foto',
    zoom: 'Zoom (con la foto ingrandita)',
    /** Space plays the pass's replay: a media control, so *Riproduci* (never the noun *il replay*) */
    play: 'Riproduci o metti in pausa il passaggio',
    back: 'Indietro o chiudi',
    help: 'Questa pagina',
  },
  /** The names printed on Italian keyboards' caps */
  keyNames: { enter: 'Invio', space: 'Spazio', esc: 'Esc' },

  /** "Built by", as the landing's credit says it (landing.builtBy): one phrase for the same credit */
  builtBy: (handle: string): AboutPart[] => ['Realizzato da ', link(handle)],
  footerNote: 'Fatto con dati pubblici. Non abbiamo scattato nessuna di queste foto.',
}

export default about
