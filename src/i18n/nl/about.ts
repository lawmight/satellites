/**
 * Dutch copy for the About page ("Hoe het werkt", src/ui/pages/AboutPage.tsx; see src/i18n/en/about.ts, and
 * docs/i18n/nl.md §3.7 "About", which gives the title, the section names, the answers, the privacy rows and the
 * credit lines word for word). Native review changed seven of those rows, each by the guide's own rules: the index
 * entry `Hoe we overvluchten vinden` (fits the narrow index on one line), `Zijn dit alle satellieten?` (the natural
 * question, checklist 19), `de waarnemingen van de US Space Force` (no English `tracking`, §9), the closed compound
 * `standaardbaanmodel` (§6), `waar het noorden ligt` (no clipped ending), `Zoomen (in het vergrote beeld)` (the
 * condition, not a verb) and the footer's `Op basis van openbare data.` (no third `gemaakt` beside `Gemaakt door`).
 *
 * Why it reads this way: About is the most conversational surface, but the register is the same `je` and `we` as
 * everywhere (§1), in the owner's short, plain sentences. The stressed forms appear only where Dutch stresses them
 * (`Kunnen ze mij zien?`, `Jij staat er niet op.`). `foto` stands only where the thing is certainly a Sentinel-2 or
 * Landsat photo (daylight cameras, touch-ups, which way is up, clouds); anything that can be radar, a mosaic or a
 * full-disc frame is a `beeld` (§4.2). The quoted verdict is the could title's participle phrase, lowercase, in curly
 * quotes (§5). Numbers mirror the English: digits where it has digits, words where it spells them (`elke zes uur`,
 * `zeven dagen`, `30 tot 45 graden`, §2), and a number never parts from its unit (U+00A0). The loaded count and the
 * fetch stamp arrive as mono parts, the count grouped by fmt('nl'), the ISO stamp kept as it is (§6). The licence
 * attribution lines stay English in the page itself; only the credit prose is Dutch, with OpenStreetMap's Dutch
 * wording (`© OpenStreetMap-bijdragers`).
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('nl')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: 'Over',
  close: 'Sluiten',
  sectionsLabel: 'Onderdelen',
  /** "Hoe het / *werkt*." (§3.1): the accent on the verb, the full stop outside it */
  title: [['Hoe het'], [accent('werkt'), '.']] as Rich[],
  lede: 'Kies een plek op aarde. We rekenen uit welke satellieten er de afgelopen week overheen vlogen en gaan dan op zoek naar de beelden die ze maakten. Alles draait in je browser, op openbare data.',

  /** Sentence case, never title case (§6); no article in `Hoe we overvluchten vinden`, so it fits the index column */
  sections: {
    short: 'De korte versie',
    method: 'Hoe we overvluchten vinden',
    words: 'Wat de labels betekenen',
    accuracy: 'Wat we niet kunnen zien',
    privacy: 'Privacy',
    credits: 'Met dank aan',
    keys: 'Toetsenbord',
  },

  short: {
    live: {
      term: 'Is het live?',
      text: 'Niet helemaal. Beelden komen een paar uur tot een paar dagen na de opname in de archieven, dus van de nieuwste overvluchten is er misschien nog geen.',
    },
    /** The stressed `mij` and `Jij` (§1); `er niet op staan` is the idiom for not being in a picture */
    seeMe: {
      term: 'Kunnen ze mij zien?',
      text: 'Nee. Een pixel is hier op zijn best 10 m breed. Een auto is één pixel. Jij staat er niet op.',
    },
    every: {
      term: 'Zijn dit alle satellieten?',
      text: 'Nee. Militaire en spionagesatellieten staan meestal niet in openbare catalogi, en bedrijven zeggen niet waar ze hun camera’s op richten.',
    },
  },

  method: {
    /** The link stays on CelesTrak's name; US Space Force is a name and stays; its tracking is `waarnemingen` (§9) */
    orbits: [
      'Elk object in een baan om de aarde heeft een openbare reeks getallen die zijn baan beschrijft. ',
      link('CelesTrak'),
      ' publiceert die op basis van de waarnemingen van de US Space Force, en we halen elke zes uur een verse kopie op.',
    ] as AboutPart[],
    /** "Deze pagina laadde 16.893 objecten, opgehaald 2026-11-08 03:34Z." The participle does not change with the count */
    loaded: (count: number, stamp: string): AboutPart[] => [
      'Deze pagina laadde ',
      num(f.int(count)),
      ` ${f.plural(count, { one: 'object', other: 'objecten' })}, opgehaald `,
      num(stamp),
      '.',
    ],
    sgp4: 'We rekenen elke satelliet door met SGP4, het standaardbaanmodel, over de afgelopen zeven dagen, en noteren elke keer dat je plek binnen het blikveld van de satelliet lag.',
    facts: {
      straightDown: {
        term: 'Recht naar beneden',
        text: 'Sentinel-2 en Landsat kijken recht naar beneden naar een strook grond, ongeveer 290 km breed bij Sentinel-2 en 185 km bij Landsat. Je plek moet in die strook liggen.',
      },
      /** Quotes the could verdict as a lowercase phrase in “ ” (§5) */
      tilting: {
        term: 'Kantelbare camera’s',
        text: 'Veel commerciële satellieten kunnen 30 tot 45 graden kantelen. Lag je binnen hun bereik, dan noemen we dat “kon hierheen kijken”.',
      },
      /** `foto`: a daylight camera's picture is certainly a photo (§4.2) */
      daylight: { term: 'Daglicht', text: 'Gewone camera’s hebben de zon nodig. Een overvlucht in het donker telt nooit als foto.' },
      /** Radar is never a `foto`; `de satelliet` and `de radar` instead of a pronoun (§5) */
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 heeft de zon niet nodig. De satelliet zendt microgolven uit en registreert de echo, dus de radar kijkt door wolken heen en ook ’s nachts, schuin opzij van het grondspoor. Ook deze beelden zijn openbaar, dus we tonen ze, in grijs: licht is ruwe grond en gebouwen, donker is kalm water.',
      },
      /** "frame" is a full-disc `beeld` here, not a time-lapse `frame` (§4.1) */
      weather: {
        term: 'Weersatellieten',
        text: 'Enkele staan boven de evenaar en kijken elke 10 minuten naar de halve planeet. Ben je aan hun kant van de aarde, dan sta je op elk beeld.',
      },
    },
    /** Two finite verbs side by side take a comma: `Elk beeld dat je ziet, is het echte` (§2) */
    archives:
      'Daarna doorzoeken we de beeldarchieven (Microsoft Planetary Computer, Element 84 en NASA) en koppelen we elk beeld aan de overvlucht die het maakte. Elk beeld dat je ziet, is het echte, uitgesneden rond je plek.',
    photoFacts: {
      touchUps: {
        term: 'Bewerking',
        text: 'Foto’s van Sentinel-2 en Landsat krijgen voor je scherm een kleurbalans, worden gladgestreken en licht verscherpt, over het hele beeld op dezelfde manier. Er wordt niets toegevoegd of weggehaald.',
      },
      /** The photo viewer's north arrow is labelled N in Dutch too; the sentence ends on what it shows (§2) */
      whichWayUp: {
        term: 'Waar boven is',
        text: 'Foto’s van Sentinel-2 en Landsat houden het kaartraster van het archief voor je plek aan, dus het noorden kan een paar graden naast recht omhoog staan. Open je een foto, dan wijst de N-pijl precies aan waar het noorden ligt.',
      },
    },
  },

  /**
   * After each verdict's definition, as the next sentence (§3.5). The could line answers the definition's
   * `De exploitant zegt niet of er gekeken is.`
   */
  verdictMore: {
    imaged: 'Wat we tonen, is het echte beeld.',
    likely: 'Het beeld is nog niet openbaar, of het is afgekeurd vanwege wolken.',
    could: 'Of dat ook echt gebeurd is, valt niet te weten.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Precieze posities',
      text: 'Openbare baandata is op ongeveer een kilometer nauwkeurig en verloopt elke dag een beetje. Tijden kunnen een paar seconden afwijken.',
    },
    secret: { term: 'Geheime satellieten', text: 'Enkele van de beste camera’s in een baan om de aarde zijn van legers. Die zie je hier niet.' },
    clouds: {
      term: 'Wolken',
      text: 'Veel foto’s tonen alleen wolken. Als het archief het ons vertelt, controleren we de pixel precies boven je plek en zeggen we het.',
    },
    delays: { term: 'Vertraging', text: 'Beelden kunnen een dag of twee op zich laten wachten.' },
  },

  /** Exactly as exact as the English: no softening, no inflating (§8) */
  privacy: {
    where: { term: 'Waar het draait', text: 'De baanberekeningen gebeuren in je browser.' },
    kept: {
      term: 'Wat we bewaren',
      text: 'We tellen zoekopdrachten per plaats en per gebied van ongeveer 10 km, nooit je precieze plek, en houden bij wat er geopend en gedeeld wordt. Geen IP-adressen, geen eigen cookies, niets dat het ene bezoek aan het volgende koppelt.',
    },
    others: {
      term: 'Wie het nog meer ziet',
      text: 'De meeste plaatsnamen komen uit een lijst die in de site zit. Andere zoekopdrachten gaan naar Open-Meteo, Photon of Nominatim. Beelden laden rechtstreeks uit de archieven. Onze host telt paginabezoeken en snelheid, zonder cookies, en kan één beveiligingscookie plaatsen om mensen van bots te onderscheiden. Wij lezen die nooit.',
    },
    links: {
      term: 'Deellinks',
      text: 'Alleen gemaakt als je iets deelt. Wie de link heeft, ziet de plaatsnaam, een plek afgerond op ongeveer 1 km en de overvlucht die je koos.',
    },
  },

  /**
   * Product, agency, licence and people's names as they are; `van` for "by", `via` where the English has it, no
   * possessive `’s` (§6). Landsat's 15 m band is named as the photo viewer names it (lightbox.panTitle).
   */
  credits: {
    madeBy: { who: 'Gemaakt door', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' op X'] },
    support: { who: 'Steunen', text: [link('Help Watched gratis te houden :)')] as AboutPart[] },
    gibs: 'Beelden van NASA GIBS, onderdeel van EOSDIS. GOES via NOAA en CIRA, Himawari via JMA.',
    archives: {
      who: 'Archieven',
      text: 'Microsoft Planetary Computer en Element 84 Earth Search; de panchromatische band van Landsat (15 m) uit het Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Banen', text: 'Baanelementen van CelesTrak. SGP4 via satellite.js.' },
    placeNames: { who: 'Plaatsnamen', text: 'Photon van komoot. Kaartgegevens © OpenStreetMap-bijdragers (ODbL).' },
    textures: { who: 'Aardtexturen', text: 'Solar System Scope (CC BY 4.0), op basis van Blue Marble en Black Marble van NASA.' },
    type: { who: 'Letters', text: 'Instrument Sans en Serif van Instrument, Martian Mono van Evil Martians (SIL OFL).' },
  },

  /** Infinitives, no pronoun (§1); `beeld` and `vergroten` as the photo viewer says them (zoom: `in het vergrote beeld`) */
  keys: {
    search: 'Een plek zoeken',
    suggestions: 'Door de suggesties gaan',
    choose: 'Kiezen',
    passes: 'Door de overvluchten gaan',
    photos: 'Vorig / volgend beeld',
    expand: 'Beeld vergroten',
    zoom: 'Zoomen (in het vergrote beeld)',
    play: 'De herhaling afspelen of pauzeren',
    back: 'Terug, of sluiten',
    help: 'Deze pagina',
  },
  /** The names on Dutch keyboards' caps (§4.1: `Spatie`, never `Space`) */
  keyNames: { enter: 'Enter', space: 'Spatie', esc: 'Esc' },

  /** `Gemaakt door`, never the calque `Gebouwd door` (§9); the note beside it avoids a third `gemaakt` */
  builtBy: (handle: string): AboutPart[] => ['Gemaakt door ', link(handle)],
  footerNote: 'Op basis van openbare data. Geen van deze beelden is door ons gemaakt.',
}

export default about
