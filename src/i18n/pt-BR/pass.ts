/**
 * Brazilian Portuguese copy for one pass's paragraph (see src/i18n/en/pass.ts for where each sentence shows and its
 * slots; docs/i18n/pt-BR.md §3.4 is the authority on every sentence here, §5 on the slots, §4.3 on the directions).
 *
 * Why it reads this way:
 *  - In the imaged, likely and could sentences and in `geo.sits`, the satellite is introduced as *O satélite {sat}*:
 *    those verdicts never hold a crewed station (`verdictFor` gives crewed only 'overhead'), and the noun fixes the
 *    gender. Every later sentence has a null subject (*Olhava direto para baixo.*), never *Ele / Ela*, and the
 *    satellite's things take the article, never *seu / sua* (*a faixa*, *o operador*, *o radar*, *o sensor VIIRS*).
 *    `overhead` keeps the bare name, which may be a station (*ISS (ZARYA) passou…*), and `darkStation` says *a estação*.
 *  - The place is bare and never a subject: a direct object (*captou Waterloo*, *cruzou Paris*, *A faixa de 24 km cobriu
 *    Waterloo*), never after *de, em, a, por*; it is referred back to with *o local* / *este lugar* / *este ponto*.
 *  - Height is *a 786 km de altitude* and straight over is *na vertical do local*: *acima* never dangles. Off-nadir in
 *    prose is *fora da vertical*. *Captar* is the instrument's verb; *varrer* only takes the Earth (*varre toda a face
 *    da Terra*), never a place. *Esteve ao alcance*, never *passou ao alcance*.
 *  - A clock takes *às*, or *à* when it starts 00 or 01 (*por volta das / da* the same way), tied to it by a no-break
 *    space; a speed or a distance takes plain *a* (*a 7,46 km/s*). Heading (*rumo ao sul*) and offset (*a oeste do
 *    local*) are two tables, with *leste* in prose (*este* is "this") and *O* for west in the 16-point readouts.
 *  - Numbers go through fmt('pt-BR') (*7,46*, *35.778*, *5,3°*); seats and clocks arrive written and stay as they are.
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('pt-BR')

/** Where the satellite was moving: "rumo ao sul" */
const HEADING: Record<Compass8, string> = {
  n: 'rumo ao norte',
  ne: 'rumo ao nordeste',
  e: 'rumo ao leste',
  se: 'rumo ao sudeste',
  s: 'rumo ao sul',
  sw: 'rumo ao sudoeste',
  w: 'rumo ao oeste',
  nw: 'rumo ao noroeste',
}

/** Where it was from the place ("61 km a oeste do local") or in your sky ("acima do seu horizonte, a oeste") */
const TOWARD: Record<Compass8, string> = {
  n: 'ao norte',
  ne: 'a nordeste',
  e: 'a leste',
  se: 'a sudeste',
  s: 'ao sul',
  sw: 'a sudoeste',
  w: 'a oeste',
  nw: 'a noroeste',
}

const km = (n: number) => num(f.int(n), 'km')
const clock = (time: string, zone: string) => num(time, zone)
/** "às 16:14:21", "à 01:05:00": the clock's hour decides the article; a no-break space ties it to the clock */
const at = (time: string) => `${parseInt(time, 10) <= 1 ? 'à' : 'às'} `
/** "por volta das 07:49", "por volta da 00:49" */
const about = (time: string) => `por volta ${parseInt(time, 10) <= 1 ? 'da' : 'das'} `
/** "passou na vertical do local, a 786 km de altitude, " / "passou a 786 km de altitude, 61 km a oeste do local, " */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset
    ? ['a ', km(altKm), ' de altitude, ', km(offset.km), ` ${TOWARD[offset.dir]} do local, `]
    : ['na vertical do local, a ', km(altKm), ' de altitude, ']
/** " e a cada 10 minutos varre…" / " e a cada minuto varre…" / " e varre…" */
const scans = (cadenceMin?: number): Part[] => {
  const rest = ' varre toda a face da Terra que se vê de lá.'
  if (!cadenceMin) return [` e${rest}`]
  if (Math.round(cadenceMin) <= 1) return [` e a cada minuto${rest}`]
  return [' e a cada ', num(f.int(cadenceMin), 'minutos'), rest]
}

const pass: typeof en = {
  // The glossary's 16 points (§4.3): O for oeste, never W or L; NO is noroeste.
  compass16: {
    n: 'N',
    nne: 'NNE',
    ne: 'NE',
    ene: 'ENE',
    e: 'E',
    ese: 'ESE',
    se: 'SE',
    sse: 'SSE',
    s: 'S',
    ssw: 'SSO',
    sw: 'SO',
    wsw: 'OSO',
    w: 'O',
    wnw: 'ONO',
    nw: 'NO',
    nnw: 'NNO',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    // The seat is a coordinate, as code writes it (*em 0.2°W*). Without it, no comma before *e* (same subject).
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `O satélite ${o.sat} não passa. Fica a `,
      km(o.altKm),
      o.seat !== undefined ? ` de altitude sobre o equador, em ${o.seat},` : ' de altitude sobre o equador',
      ...scans(o.cadenceMin),
    ],
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `A linha desta varredura cruzou ${o.place} ${about(o.time)}`,
      clock(o.time, o.zone),
      `, ${HEADING[o.heading]}.`,
    ],
    infrared: 'Estava escuro aqui, por isso esta imagem é no infravermelho: o topo das nuvens pela temperatura; quanto mais frio, mais claro.',
  },

  // ── a pass with a picture ("Observou") ───────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `O satélite ${o.sat} passou `,
    ...where(o.altKm, o.offset),
    at(o.time),
    clock(o.time, o.zone),
    `, ${HEADING[o.heading]} a `,
    num(f.dec(o.speedKmS, 2), 'km/s'),
    '.',
  ],
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `O sensor ${o.sensor} captou ${o.place} para o mosaico diário da NASA em cores naturais, a `,
    num(f.int(o.gsdM), 'm'),
    ' por pixel.',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'O radar, apontando ',
    num(f.dec(o.deg, 1), '°'),
    ` para o lado, captou ${o.place} a `,
    num(f.int(o.gsdM), 'm'),
    o.dark ? ' por pixel, no escuro.' : ' por pixel.',
  ],
  lookingDown: 'Olhava direto para baixo.',
  lookingOff: (deg: number): Rich => ['Olhava ', num(f.dec(deg, 1), '°'), ' fora da vertical.'],
  cloudCover: (pct: number): Rich => ['Cobertura de nuvens na cena: ', num(f.int(pct), '%'), '.'],

  // ── "Deve ter observado" ─────────────────────────────────────────────────────────────
  likely: {
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `O satélite ${o.sat} passou `,
      ...where(o.altKm, o.offset),
      at(o.time),
      clock(o.time, o.zone),
      ...(o.swathKm ? [', com este lugar dentro da faixa de ', km(o.swathKm), '.'] : ['.']),
    ],
    archiveFailed: 'Era dia, por isso teria captado este ponto. Não foi possível consultar o arquivo agora.',
    noScene: 'Não existe cena desta passagem. O Sentinel-2 só capta terra e águas costeiras, e pode não ter programado este ponto.',
    notYet:
      'Era dia, por isso quase certamente captou este ponto. ' +
      'Nenhuma cena desta passagem foi publicada ainda; a publicação pode levar um dia ou mais.',
    // Said only of weather satellites at night, never of a station: *deste satélite* is safe here.
    dark: 'Estava escuro aqui. À noite, o sensor deste satélite trabalha no infravermelho: viu as suas nuvens, não as suas ruas.',
    mosaicUnconfirmed: 'Não foi possível confirmar no seu ponto o mosaico diário da NASA desta passagem.',
    notPublished: 'As imagens deste satélite alimentam a previsão do tempo; não são publicadas como imagens que possamos mostrar.',
  },

  // ── "Pode ter apontado aqui" ──────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `O satélite ${o.sat} esteve ao alcance ${at(o.time)}`,
      clock(o.time, o.zone),
      ...(o.offset ? [', ', km(o.offset.km), ` ${TOWARD[o.offset.dir]} do local.`] : [', na vertical do local.']),
    ],
    // The place is the swath's object, never the subject (*Waterloo estava dentro…* would need it to agree).
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'A faixa de ',
      km(o.swathKm),
      ` cobriu ${o.place}. O operador não publica onde captou imagens, por isso não temos como saber se observou este lugar.`,
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'O radar vê através das nuvens e do escuro. ',
      ...(o.deg === undefined ? [] : ['Apontando ', num(f.dec(o.deg, 1), '°'), ' para o lado, ']),
      `${o.deg === undefined ? 'Pode' : 'pode'} ter mapeado ${o.place}.`,
      // "of it": an image of this place, not any image of the pass (Sentinel-1 publishes the rest of its ground).
      o.openArchive ? ' Não encontramos nenhuma imagem publicada deste lugar nesta passagem.' : ' Não temos como saber se mapeou.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['Olhando direto para baixo, '] : ['Apontando ', num(f.dec(o.deg, 1), '°'), ' fora da vertical, ']),
      `pode ter observado ${o.place}. Não temos como saber se observou.`,
    ],
  },

  // ── "Sobrevoou" ──────────────────────────────────────────────────────────────────────────
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat} passou a `,
    km(o.altKm),
    ` de altitude ${at(o.time)}`,
    clock(o.time, o.zone),
    ', ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' acima do seu horizonte, quase a pino.' : ` acima do seu horizonte, ${TOWARD[o.toward]}.`,
  ],
  darkStation:
    'Estava escuro onde você está. Se a estação ainda estava sob a luz do sol, cruzou o seu céu como um ponto brilhante que não pisca.',
}

export default pass
