/**
 * Brazilian Portuguese copy for the About page ("Como funciona", src/ui/pages/AboutPage.tsx; see src/i18n/en/about.ts
 * for where each line shows, and docs/i18n/pt-BR.md, the authority on every word here, which gives the title, the
 * section names, the verdict lines, the privacy rows and the credit prose word for word: §1.1, §2.4, §3.5, §4.2, §8).
 * Three lines leave its wording on purpose, for what is on screen: two section names are shorter (the index must not
 * wrap, see `sections`) and the footer note does not repeat the maker credit's *Feito* (see `footerNote`).
 *
 * Why it reads this way: the page talks to one reader as *você*, a little warmer than the results, in short sentences
 * with no em dashes; the product speaks as *nós* through its verb endings only (*Calculamos*, *Anotamos*, *buscamos*),
 * and the reader's gender is never guessed. Instructions are the imperative of *você* (*Escolha*). Generic pictures are
 * *imagens* (radar and mosaics are never photos); *foto* only where the sentence names Sentinel-2 and Landsat, or
 * daylight cameras (§4.1). A satellite or an object never gets *seu / sua* for its things, so the reader never reads
 * "your" (*a trajetória dele*, *as câmeras*); *o seu* is only for what is the reader's (*o seu ponto*, *o seu
 * navegador*). Object clitics, which split Brazil from Portugal, appear only where both place them the same way
 * (after *que*, *por isso*, *nunca*). Off-nadir in prose is *fora da vertical* (§3.4). The could verdict is quoted in
 * “ ”, lowercase, as the guide writes it. The privacy rows promise exactly what the English promises (§8). Numbers typed
 * into the text keep a no-break space before their unit (*10 m*); the loaded count arrives grouped by fmt('pt-BR') as a
 * mono part, and its participle agrees with it inside the plural, 0 taking the plural (pt-BR puts 0 in `one`). The
 * fetch stamp is ISO and stays as it is. The licence attribution lines stay English in the page itself.
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('pt-BR')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: 'Sobre',
  close: 'Fechar',
  sectionsLabel: 'Seções',
  /** "Como / *funciona*." (§4.2): the accent on the word that means "works", the full stop outside it */
  title: [['Como'], [accent('funciona'), '.']] as Rich[],
  /** §1.1's About example; *ele* is *ponto*, the fixed noun of the sentence before */
  lede: 'Escolha um ponto da Terra. Calculamos quais satélites passaram sobre ele na última semana e depois buscamos as imagens que captaram. Tudo acontece no seu navegador, com dados públicos.',

  /**
   * §4.2, but two are shorter. The index is three grid columns, 233 px at its narrowest (1101 px; it hides at 1100),
   * and a mono caps entry must neither wrap nor run under the current entry's 16 px rule (no English one does).
   * *Como encontramos as passagens* (252 px with its number) and *O que os rótulos significam* (236 px) did both; at 25
   * characters (221 px, as long as *O que não conseguimos ver*) they never wrap.
   */
  sections: {
    short: 'Em resumo',
    method: 'Como achamos as passagens',
    words: 'O significado dos rótulos',
    accuracy: 'O que não conseguimos ver',
    privacy: 'Privacidade',
    credits: 'Créditos',
    keys: 'Teclado',
  },

  short: {
    live: {
      term: 'É em tempo real?',
      text: 'Não exatamente. As imagens chegam aos arquivos entre algumas horas e um ou dois dias depois de captadas. Por isso, as passagens mais recentes podem ainda não ter nenhuma.',
    },
    /** §2.4, word for word: no subject pronoun, the idiom, the concrete ending */
    seeMe: {
      term: 'Dá para me ver?',
      text: 'Não. Na melhor das hipóteses, um pixel aqui tem 10 m de lado. Um carro é um pixel. Você não aparece.',
    },
    every: {
      term: 'Aparecem todos os satélites?',
      text: 'Não. A maioria dos satélites militares e de espionagem não está nos catálogos públicos, e as empresas não dizem para onde apontam as câmeras.',
    },
  },

  method: {
    /** The link stays on CelesTrak's name (*o CelesTrak*, §8); US Space Force is *Força Espacial dos EUA* (§8) */
    orbits: [
      'Cada objeto em órbita tem um conjunto público de números que descreve a trajetória dele. O ',
      link('CelesTrak'),
      ' publica esses números a partir do rastreamento da Força Espacial dos EUA, e baixamos uma cópia nova a cada seis horas.',
    ] as AboutPart[],
    /** "Esta página carregou 16.912 objetos, obtidos em 2026-11-08 03:34Z." The participle agrees with the count */
    loaded: (count: number, stamp: string): AboutPart[] => [
      'Esta página carregou ',
      num(f.int(count)),
      ` ${count === 0 ? 'objetos, obtidos' : f.plural(count, { one: 'objeto, obtido', many: 'objetos, obtidos', other: 'objetos, obtidos' })} em `,
      num(stamp),
      '.',
    ],
    sgp4: 'Calculamos a trajetória de cada satélite nos últimos sete dias com o SGP4, o modelo orbital padrão. Anotamos cada vez que o seu ponto ficou dentro do que o satélite podia ver.',
    facts: {
      /** The term is §4.1's About term for "straight down" */
      straightDown: {
        term: 'Na vertical',
        text: 'O Sentinel-2 e o Landsat olham direto para baixo, para uma faixa do solo: cerca de 290 km de largura no Sentinel-2 e 185 km no Landsat. Você precisa estar dentro da faixa.',
      },
      /** "Tilting camera" is *câmera que se inclina* (§4.1); the could verdict quoted as §6 writes it */
      tilting: {
        term: 'Câmeras que se inclinam',
        text: 'Muitos satélites comerciais conseguem apontar de 30 a 45 graus fora da vertical. Se você estava ao alcance, chamamos de “pode ter apontado aqui”.',
      },
      /** *foto*: the sentence is about daylight cameras, whose pictures are photos; radar in the dark does count */
      daylight: { term: 'Luz do dia', text: 'Câmeras comuns precisam do sol. Uma passagem no escuro nunca conta como foto.' },
      /**
       * *capta o eco* (captar, §1.4); the brightness words are the radar note's under the picture (§3.7). One *por
       * isso* only (the guide's *por isso as mostramos*, §1.2): the first "so" is a new sentence with *Assim,*
       */
      radar: {
        term: 'Radar',
        text: 'O Sentinel-1 não precisa do sol. Emite micro-ondas e capta o eco. Assim, vê através das nuvens e de noite, olhando para um dos lados da trajetória. As imagens dele também são públicas, por isso as mostramos, em tons de cinza: terreno irregular e prédios aparecem claros, água calma aparece escura.',
      },
      /** "frame" is *imagem* here (a full-disc picture, not a time-lapse *quadro*) */
      weather: {
        term: 'Satélites meteorológicos',
        text: 'Alguns ficam sobre o equador e observam metade do planeta a cada 10 minutos. Se você está do lado da Terra voltado para eles, aparece em todas as imagens.',
      },
    },
    archives:
      'Depois, buscamos nos arquivos de imagens (Microsoft Planetary Computer, Element 84 e NASA) e associamos cada imagem à passagem em que foi captada. Cada imagem que você vê é a real, recortada em torno do seu ponto.',
    photoFacts: {
      /** "for your screen": *para exibição* (§1.4: no *tela* / *ecrã*) */
      touchUps: {
        term: 'Retoques',
        text: 'As fotos do Sentinel-2 e do Landsat passam por equilíbrio de cores, suavização e um leve realce de nitidez para exibição. O ajuste é o mesmo em toda a imagem. Nada é acrescentado nem removido.',
      },
      /** The photo viewer's north arrow is labelled N, as in English */
      whichWayUp: {
        term: 'Onde fica o norte',
        text: 'As fotos do Sentinel-2 e do Landsat mantêm a grade cartográfica que o próprio arquivo usa para o seu lugar. Por isso, o norte pode não ficar bem para cima, e sim alguns graus para o lado. Quando você abre uma foto, a seta N mostra exatamente onde ele fica.',
      },
    },
  },

  /** After each verdict's definition, as the next sentence (§3.5, word for word) */
  verdictMore: {
    imaged: 'Se aparece aqui, é a imagem real.',
    likely: 'A imagem ainda não é pública, ou foi descartada por causa das nuvens.',
    could: 'Não temos como saber se realmente olhou.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Posições exatas',
      text: 'Os dados orbitais públicos têm precisão de cerca de um quilômetro, e o erro cresce um pouco a cada dia. Os horários podem errar por alguns segundos.',
    },
    secret: {
      term: 'Satélites secretos',
      text: 'Algumas das melhores câmeras em órbita pertencem a forças armadas. Não aparecem aqui.',
    },
    clouds: {
      term: 'Nuvens',
      text: 'Muitas imagens são só nuvens. Quando o arquivo traz essa informação, verificamos o pixel exato sobre o seu ponto e avisamos.',
    },
    delays: { term: 'Atrasos', text: 'As imagens podem levar um ou dois dias para aparecer.' },
  },

  /** Exactly as strong as the English, no more and no less; `kept`, `others` and `links` are §8's, word for word */
  privacy: {
    where: { term: 'Onde é calculado', text: 'Os cálculos das órbitas acontecem no seu navegador.' },
    kept: {
      term: 'O que guardamos',
      text: 'Contamos buscas por cidade e por uma área aproximada de 10 km, nunca o seu ponto exato, e mantemos uma contagem do que é aberto e compartilhado. Nada de endereços IP, nenhum cookie nosso, nada que ligue uma visita à seguinte.',
    },
    others: {
      term: 'Quem mais tem acesso',
      text: 'A maioria dos nomes de lugares vem de uma lista embutida no site. As outras buscas vão para o Open-Meteo, o Photon ou o Nominatim. As imagens carregam direto dos arquivos. A nossa hospedagem conta visualizações de página e velocidade, sem cookies, e pode definir um cookie de segurança para distinguir pessoas de robôs. Nós nunca o lemos.',
    },
    links: {
      term: 'Links de compartilhamento',
      text: 'Só são criados quando você compartilha algo. Quem tiver o link vê o nome do lugar, um ponto arredondado para cerca de 1 km e a passagem que você escolheu.',
    },
  },

  /** Product, agency, licence and people's names as they are; the prose is §8's, OpenStreetMap's own Portuguese wording */
  credits: {
    madeBy: { who: 'Feito por', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' no X'] },
    support: { who: 'Apoie', text: [link('Ajude o Watched a continuar grátis :)')] as AboutPart[] },
    gibs: 'Imagens do GIBS da NASA, parte do EOSDIS. GOES via NOAA e CIRA, Himawari via JMA.',
    archives: {
      who: 'Arquivos',
      text: 'Microsoft Planetary Computer e Element 84 Earth Search; a banda de 15 m do Landsat vem do Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Órbitas', text: 'Conjuntos de elementos do CelesTrak. SGP4 por satellite.js.' },
    placeNames: { who: 'Nomes de lugares', text: 'Photon, da komoot. Dados do mapa © colaboradores do OpenStreetMap (ODbL).' },
    textures: { who: 'Texturas da Terra', text: 'Solar System Scope (CC BY 4.0), a partir do Blue Marble e do Black Marble da NASA.' },
    type: { who: 'Tipografia', text: 'Instrument Sans e Serif, da Instrument; Martian Mono, da Evil Martians (SIL OFL).' },
  },

  /** Infinitives, no pronoun (§1.1); *imagem*, *Ampliar* and *Buscar um lugar* as the viewer and search say them (§4.2) */
  keys: {
    search: 'Buscar um lugar',
    suggestions: 'Navegar pelas sugestões',
    choose: 'Escolher',
    passes: 'Percorrer as passagens',
    photos: 'Imagem anterior / próxima',
    expand: 'Ampliar a imagem',
    zoom: 'Zoom (com a imagem ampliada)',
    play: 'Reproduzir ou pausar a passagem',
    back: 'Voltar ou fechar',
    help: 'Esta página',
  },
  /** The names printed on Brazilian keyboards' caps (§4.2: *Enter*, *Espaço*, *Esc*) */
  keyNames: { enter: 'Enter', space: 'Espaço', esc: 'Esc' },

  /** As the landing's credit says it (§3.7: *Feito por @armaangupt0*) */
  builtBy: (handle: string): AboutPart[] => ['Feito por ', link(handle)],
  /**
   * §8's sentence with *Tudo vem de* for *Feito com*: the note sits on the same mono caps row as builtBy's *Feito
   * por* (and credits.madeBy says it too), where the English varies "Built by" and "Made from"
   */
  footerNote: 'Tudo vem de dados públicos. Não fizemos nenhuma destas imagens.',
}

export default about
