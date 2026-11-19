/**
 * Brazilian Portuguese copy for the passes: the list grouped by verdict and the view of one pass (see
 * src/i18n/en/passView.ts for where each line shows; docs/i18n/pt-BR.md is the authority on every word here).
 *
 * Why it reads this way: the unit is *passagem* (f.), never *passe* or *passo*, and every verdict counts it, so the
 * verdict a count arrives with does not change the word (pt-BR.md §3.5). Its form follows pt-BR's plural rules, which
 * put 0 in `one`: every count tests for 0 in code and gives it the plural (§5). Words that agree with a pass agree with
 * *passagem* (*Última*); the satellite count is the invariable *sat.* (§4.1). A satellite is never referred to by a
 * pronoun or *seu / sua*; the only satellite named after a preposition comes after *O satélite* (`noImage.openArchive`,
 * §5). Off-nadir is *fora do nadir* in mono readouts and *fora da vertical* in prose (§3.4). The notes under pictures and
 * the spot lines are the guide's own (§3.7). Labels are stored in sentence case and sized for the strip's four cells
 * and the two-column grid (§7); compass points arrive as the 16-point set with O (`SSO`). Days ("sexta-feira, 6 de
 * novembro"), clocks and "how long ago" arrive written; a clock takes *às*, or *à* when it starts 00 or 01, and a
 * spoken day takes *no* (domingo, sábado) or *na* (the -feira days) (§5). Numbers go through fmt('pt-BR'), with a
 * no-break space between a number and its unit (§6).
 */
import type en from '../en/passView'
import type { Verdict } from '@/ui/results/lib/meta'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type NumPart } from '../../../api/_lib/i18n/parts'

const f = fmt('pt-BR')
/** "às 16:14", "à 01:05" (the clock's hour decides the article; a no-break space ties it to the clock, as in pass.ts) */
const at = (clock: string) => `${parseInt(clock, 10) <= 1 ? 'à' : 'às'} ${clock}`
/** "no domingo, 1º de novembro", "na sexta-feira, 6 de novembro" (a day that is not a Portuguese weekday stays bare) */
const onDay = (day: string) =>
  /^(domingo|sábado)/i.test(day) ? `no ${day}` : /^(segunda|terça|quarta|quinta|sexta)/i.test(day) ? `na ${day}` : day
/** A count's unit, in the form the number takes (0 takes the plural) */
const passes = (n: number) => (n === 0 ? 'passagens' : f.plural(n, { one: 'passagem', many: 'passagens', other: 'passagens' }))
/** "Mostrar 1 satélite", "Mostrar todos os 40 satélites" */
const showAll = (n: number, one: string, other: string) =>
  n === 0
    ? `Mostrar 0 ${other}`
    : f.plural(n, { one: `Mostrar ${f.int(n)} ${one}`, many: `Mostrar todos os ${f.int(n)} ${other}`, other: `Mostrar todos os ${f.int(n)} ${other}` })
/** "a cada 10 minutos", "a cada minuto" */
const every = (min: number) => (Math.round(min) <= 1 ? 'a cada minuto' : `a cada ${f.int(min)} minutos`)

const passView: typeof en = {
  // ── the list ─────────────────────────────────────────────────────────────────────────────
  empty:
    'Nenhum satélite que rastreamos passou sobre este lugar nesta janela de tempo. Isso é raro; as notas acima dizem se alguma fonte de dados falhou.',
  // One nowrap line after "Observou" in the group header: 321 of the 324 px a 360 px phone leaves (mono caps, 11 px).
  imagedOrder: 'mais perto, depois recentes',
  count: (n: number, _verdict: Verdict) => `${f.int(n)} ${passes(n)}`,
  countStack: (n: number, _verdict: Verdict): NumPart => num(f.int(n), passes(n)),
  // "sat." is the glossary's invariable abbreviation, for every count.
  sats: (n: number) => `${f.int(n)} sat.`,
  showAllSats: (n: number) => showAll(n, 'satélite', 'satélites'),
  // A list row is an *item*, never a *linha* (a scan line).
  showAllRows: (n: number) => showAll(n, 'item', 'itens'),
  showMore: (n: number) => `Mostrar mais ${f.int(n)}`,
  left: (n: number) => `${f.int(n)} ${n === 0 ? 'restantes' : f.plural(n, { one: 'restante', many: 'restantes', other: 'restantes' })}`,
  showFewer: 'Mostrar menos',
  tag: {
    mosaic: 'Mosaico',
    radar: 'Radar',
    cloudedPct: (pct: number) => `Nublado · ${f.int(pct)}%`,
    cloudedAtSpot: 'Nublado · no ponto',
  },
  rowLabel: (o: { sat: string; verb: string; day: string; time: string; zone: string; ago: string; cloudPct?: number; clouded: boolean }) =>
    [
      o.sat,
      o.verb,
      `${o.day}, ${at(o.time)} ${o.zone}`,
      o.ago,
      o.cloudPct !== undefined ? `nuvens ${f.int(o.cloudPct)} por cento` : undefined,
      o.clouded ? 'encoberto' : undefined,
    ]
      .filter(Boolean)
      .join(', '),
  offNadir: (deg: number) => `${f.dec(deg, 1)}° fora do nadir`,
  offNadirShort: (deg: number) => `${f.dec(deg, 1)}°`,
  distanceKm: (km: number) => `${f.int(km)} km`,
  cloudPct: (pct: number) => `nuvens ${f.int(pct)}%`,
  expandLabel: (sat: string, day: string, time: string) => `Ampliar a imagem: ${sat}, ${day}, ${at(time)}`,
  expandTitle: 'Ampliar a imagem',
  satLabel: (o: { sat: string; operator?: string; passes: number; verdict: Verdict; day: string; time: string }) =>
    `${o.sat}${o.operator ? `, ${o.operator}` : ''}, ${f.int(o.passes)} ${passes(o.passes)}, a última ${onDay(o.day)}, ${at(o.time)}`,
  latest: 'Última ',
  closest: 'Mais perto ',
  cloudChip: 'Nuvem',

  // ── one pass ─────────────────────────────────────────────────────────────────────────────
  photosSection: 'Imagens',
  planSection: 'Vista de cima',
  geometry: 'Geometria',
  replay: 'Rever',
  fullDiscNote: (pixel: string, cadenceMin?: number) =>
    `Uma imagem de disco completo: tudo o que o satélite vê, em uma só imagem, a ${pixel} por pixel aqui. Pouco detalhada, mas real, e a mais recente publicada; o satélite faz uma igual ${
      cadenceMin ? every(cadenceMin) : 'a cada poucos minutos'
    }, a semana inteira.`,
  mosaicNote: (gsdM: number) =>
    `Um mosaico diário: a NASA junta as faixas de cada dia em uma só imagem, a ${f.int(gsdM)} m por pixel. Pouco detalhado, mas real, e do dia desta passagem.`,
  radarNote:
    'Uma imagem de radar, não uma fotografia: o Sentinel-1 emite micro-ondas e capta o eco, por isso nuvens e escuridão não atrapalham. O brilho mostra quanto o solo devolve o sinal: prédios e terreno irregular aparecem claros, água calma aparece escura.',
  noImage: {
    openArchive: (sat: string) => `O satélite ${sat} não tem imagem deste ponto nesta passagem. Vista de cima da passagem.`,
    radarPrivate: 'Sem imagem pública: o arquivo deste operador de radar é privado. Vista de cima da passagem.',
    commercialPrivate: 'Sem imagem pública: arquivos comerciais são privados. Vista de cima da passagem.',
    noneToShow: 'Nenhuma imagem para mostrar desta passagem. Vista de cima da passagem.',
    archiveDown: 'Não foi possível consultar o arquivo agora. Vista de cima da passagem.',
    noScene: 'Não existe cena desta passagem. Vista de cima da passagem.',
    notYet: 'Nenhuma cena publicada corresponde a esta passagem ainda. Cenas do Sentinel-2 e do Landsat costumam aparecer em até um dia.',
    crewed: 'Estações tripuladas levam câmeras, mas as fotos delas não são publicadas por lugar e horário.',
    unavailable: 'A imagem desta passagem não está disponível.',
  },
  links: {
    openToSave: 'Abrir imagem para salvar',
    downloading: 'Baixando…',
    download: 'Baixar imagem',
    viewSource: (archive: string) => `Ver na fonte · ${archive}`,
  },
  spot: {
    checking: 'Lendo o pixel do seu ponto…',
    clear: 'Céu limpo sobre o seu ponto.',
    cirrus: 'Cirros finos sobre o seu ponto; podem suavizar a imagem.',
    cloud: 'Nuvem sobre o seu ponto.',
    shadow: 'O seu ponto estava na sombra de uma nuvem.',
  },

  // ── the readout strip ────────────────────────────────────────────────────────────────────
  strip: {
    altitude: 'Altitude',
    elevation: 'Elevação',
    offNadir: 'Fora do nadir',
    pixel: 'Pixel',
    band: 'Banda',
    sun: 'Sol',
    cloud: 'Nuvens',
    cloudAtSpot: 'Nuvem no ponto',
  },
  // IR, never IV: "Banda IV" would read "band 4" (§4.1).
  band: { infrared: 'IR', visible: 'Visível', colour: 'Em cores' },
  spotValue: { clear: 'Limpo', cirrus: 'Cirros', cloud: 'Nuvem', shadow: 'Sombra' },
  unit: {
    km: 'km',
    m: 'm',
    kmS: 'km/s',
    up: 'acima',
    mosaic: 'mosaico',
    scene: 'cena',
    sun: { day: 'dia', twilight: 'crepúsculo', night: 'noite' },
  },

  // ── 01 / Geometria ───────────────────────────────────────────────────────────────────────
  geo: {
    closestUtc: 'Mais perto · UTC',
    closestLocal: 'Mais perto · local',
    groundDistance: 'Distância no solo',
    elevationFromYou: 'Elevação no seu céu',
    groundSpeed: 'Velocidade no solo',
    heading: 'Rumo',
    sunElevation: 'Elevação do sol',
    fieldOfRegard: 'Inclinação máx.',
    swath: 'Faixa',
    inSwath: 'Na faixa',
    inView: 'Ao alcance',
    window: 'Janela',
    noradPass: 'NORAD · passagem',
    // Nowrap grid labels, as long as the English: *varredura* alone is the scan's line here (the value is its time).
    scanUtc: 'Varredura aqui · UTC',
    scanLocal: 'Varredura aqui · local',
    aboveEquator: 'Sobre o equador em',
    inYourSky: 'No seu céu',
    scanDirection: 'Sentido da varredura',
    // The line moves, not the satellite: *Vel.* (a standard abbreviation, mono only, §6) keeps *da linha* in the cell.
    lineSpeed: 'Vel. da linha aqui',
    coverage: 'Cobertura',
    thisScan: 'Esta varredura',
    noradScan: 'NORAD · varredura',
  },
  northToSouth: 'Norte → sul',
  southToNorth: 'Sul → norte',
  timeRange: (from: string, to: string) => `${from} → ${to}`,
  sunPhase: { day: 'Dia', twilight: 'Crepúsculo', night: 'Noite' },
  fullDisc: 'Disco completo',
  everyMin: (n: number) => `a cada ${f.int(n)} min`,
  upCompass: (compass: string) => `acima · ${compass}`,
  // Portuguese abbreviations keep their period (§6).
  heading: (compass: string, ascending: boolean) => `${compass} · ${ascending ? 'Asc.' : 'Desc.'}`,
}

export default passView
