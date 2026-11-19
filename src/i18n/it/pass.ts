/**
 * Italian copy for one pass's paragraph (see src/i18n/en/pass.ts; docs/i18n/it.md §2, §3.4, §5.1, §5.2, §6).
 *
 * Why it reads this way:
 *  - Every pass sentence has one shape: what crossed (*ha attraversato il cielo*, the constant prose verb), where
 *    (*`786 km` sopra di te*, or *a `705 km` di quota, `61 km` a ovest*), when (*alle `16:14:21 UTC`*), then how it
 *    moved, verbless (*verso sud a `7,46 km/s`*), never *procedendo* (police-report register).
 *  - Nothing agrees with a satellite's name, whose gender we can't know (stations are feminine): *avere* perfects,
 *    the present or the imperfetto with an invariable complement (*era a portata*, *guardava*), gerunds for pointing
 *    (*puntando*, *guardando*). The subject of a second sentence is dropped (*Guardava…*), never *Esso*. No article
 *    before a name, only simple prepositions after one.
 *  - The place is a bare direct object at the end of its clause (*ha ripreso Waterloo*, *La sua fascia comprendeva
 *    Waterloo*, *ha raggiunto Paris*), never after a preposition and never resumed with *lo / la*: later sentences
 *    say *questo punto*. English's article before seas and deserts is not added.
 *  - Directions take two tables: a position after *a* (*a ovest*, *a nord-est*, never *ad est*) and a motion after
 *    *verso* (*verso sud*). The readout abbreviations stay the international letters (N, NNE … NNW): instrument
 *    symbols, like km and UTC, and Italian *O* would sit next to digits where it looks like 0.
 *  - The geostationary seat is the one prose longitude: it arrives as *0.2°W* and is written as an Italian number and
 *    word (*a `0,2°` ovest*). "At about" is *intorno alle*; the scan line moves *spostandosi verso nord*.
 *  - Numbers come from fmt('it') (*7,46*, *35.778*, *4,8°*), each a num() part so it keeps the mono face.
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('it')

/** Where something is from the place, after *a*: *`61 km` a ovest*, *a nord-est* */
const AT: Record<Compass8, string> = {
  n: 'a nord',
  ne: 'a nord-est',
  e: 'a est',
  se: 'a sud-est',
  s: 'a sud',
  sw: 'a sud-ovest',
  w: 'a ovest',
  nw: 'a nord-ovest',
}
/** Which way something moved, after *verso*: *verso sud* */
const TOWARD: Record<Compass8, string> = {
  n: 'verso nord',
  ne: 'verso nord-est',
  e: 'verso est',
  se: 'verso sud-est',
  s: 'verso sud',
  sw: 'verso sud-ovest',
  w: 'verso ovest',
  nw: 'verso nord-ovest',
}

const km = (n: number) => num(f.int(n), 'km')
const deg1 = (n: number) => num(f.dec(n, 1), '°')
const metres = (n: number) => num(f.int(n), 'm')
const clock = (time: string, zone: string) => num(time, zone)
/**
 * *ogni minuto* · *ogni `10 minuti`*: a cadence, its unit set like a number's. Exact millions take *di* as plain text
 * outside the number (*ogni `1.000.000` di minuti*).
 */
const every = (min: number): Part[] =>
  f.plural<Part[]>(min, {
    one: ['ogni minuto'],
    many: ['ogni ', num(f.int(min)), ' di minuti'],
    other: ['ogni ', num(f.int(min), 'minuti')],
  })
/** *`786 km` sopra di te* · *a `705 km` di quota, `61 km` a ovest,* (the comma closes the inserted offset) */
const where = (altKm: number, offset?: Offset): Part[] =>
  offset ? ['a ', km(altKm), ' di quota, ', km(offset.km), ` ${AT[offset.dir]}, `] : [km(altKm), ' sopra di te ']

/**
 * The seat as it arrives (*0.2°W*, *140.8°E*: international notation) rewritten as prose: *a `0,2°` ovest*. Anything
 * else is kept as it came, after *a*.
 */
function seat(s: string): Part[] {
  const m = /^(\d+(?:\.\d+)?)°\s*([EW])$/.exec(s.trim())
  if (!m) return [`a ${s}`]
  return ['a ', num(f.dec(Number(m[1]), 1), '°'), m[2] === 'W' ? ' ovest' : ' est']
}

const pass: typeof en = {
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
    ssw: 'SSW',
    sw: 'SW',
    wsw: 'WSW',
    w: 'W',
    wnw: 'WNW',
    nw: 'NW',
    nnw: 'NNW',
  },

  // ── a geostationary scan ────────────────────────────────────────────────────────────────
  geo: {
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} non passa. Resta a `,
      km(o.altKm),
      ' sopra l’equatore',
      ...(o.seat !== undefined ? [', ', ...seat(o.seat), ','] : []),
      ' e scandisce l’intera faccia della Terra sotto di sé',
      ...(o.cadenceMin ? [' ', ...every(o.cadenceMin), '.'] : ['.']),
    ],
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `La linea di questa scansione ha raggiunto ${o.place} intorno alle `,
      clock(o.time, o.zone),
      `, spostandosi ${TOWARD[o.heading]}.`,
    ],
    infrared:
      'Qui era buio, quindi questa è un’immagine all’infrarosso: le cime delle nuvole per temperatura, le più fredde sono le più chiare.',
  },

  // ── "Osservato" ───────────────────────────────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    `${o.sat} ha attraversato il cielo `,
    ...where(o.altKm, o.offset),
    'alle ',
    clock(o.time, o.zone),
    `, ${TOWARD[o.heading]} a `,
    num(f.dec(o.speedKmS, 2), 'km/s'),
    '.',
  ],
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `Il suo strumento ${o.sensor} ha ripreso ${o.place} nel mosaico giornaliero a colori naturali della NASA, a `,
    metres(o.gsdM),
    ' per pixel.',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Il suo radar, puntato ',
    deg1(o.deg),
    ` di lato, ha ripreso ${o.place} a `,
    metres(o.gsdM),
    o.dark ? ' per pixel, al buio.' : ' per pixel.',
  ],
  lookingDown: 'Guardava dritto verso il basso.',
  lookingOff: (deg: number): Rich => ['Guardava a ', deg1(deg), ' dalla verticale.'],
  cloudCover: (pct: number): Rich => ['Copertura nuvolosa sull’intera scena: ', num(f.int(pct), '%'), '.'],

  // ── "Probabilmente osservato" ─────────────────────────────────────────────────────────────
  likely: {
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      `${o.sat} ha attraversato il cielo `,
      ...where(o.altKm, o.offset),
      'alle ',
      clock(o.time, o.zone),
      ...(o.swathKm ? [', con questo punto dentro la sua fascia di ', km(o.swathKm), '.'] : ['.']),
    ],
    archiveFailed: 'Era giorno: dovrebbe aver registrato questo punto. Per ora non siamo riusciti a consultare l’archivio.',
    noScene:
      'Per questo passaggio non esiste una scena. Sentinel-2 registra solo terre emerse e acque costiere, e potrebbe non aver programmato questo punto.',
    notYet:
      'Era giorno: quasi certamente l’ha registrato. ' +
      'Non è ancora stata pubblicata nessuna scena di questo passaggio; gli archivi possono tardare di un giorno o più.',
    dark: 'Qui era buio. Di notte gli strumenti meteo continuano a scandire nell’infrarosso: il suo ha visto le tue nuvole, non le tue strade.',
    mosaicUnconfirmed: 'Non siamo riusciti a confermare sul tuo punto il mosaico giornaliero della NASA di questo passaggio.',
    notPublished: 'Le sue immagini servono alle previsioni del tempo; non sono pubblicate come foto che possiamo mostrare.',
  },

  // ── "Poteva puntare qui" ──────────────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      `${o.sat} era a portata alle `,
      clock(o.time, o.zone),
      ...(o.offset ? [', ', km(o.offset.km), ` ${AT[o.offset.dir]}.`] : [', proprio sopra di te.']),
    ],
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      'La sua fascia di ',
      km(o.swathKm),
      ` comprendeva ${o.place}. Il suo operatore non pubblica dove ha ripreso: non possiamo sapere se l’ha fatto.`,
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Il radar vede attraverso nuvole e buio. ',
      ...(o.deg === undefined ? ['Avrebbe potuto'] : ['Puntando ', deg1(o.deg), ' di lato, avrebbe potuto']),
      ` mappare ${o.place}.`,
      o.openArchive ? ' Non abbiamo trovato un’immagine pubblicata di questo passaggio.' : ' Non possiamo sapere se l’ha fatto.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined ? ['Guardando dritto verso il basso, '] : ['Puntando a ', deg1(o.deg), ' dalla verticale, ']),
      `avrebbe potuto osservare ${o.place}. Non possiamo sapere se l’ha fatto.`,
    ],
  },

  // ── "Nel tuo cielo" ───────────────────────────────────────────────────────────────────────
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    `${o.sat} ha attraversato il cielo a `,
    km(o.altKm),
    ' di quota alle ',
    clock(o.time, o.zone),
    ', ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' sopra il tuo orizzonte, quasi allo zenit.' : ` sopra il tuo orizzonte, ${AT[o.toward]}.`,
  ],
  darkStation:
    'Da te era buio. Se la stazione era ancora al sole, ha attraversato il tuo cielo come un punto luminoso che non lampeggiava.',
}
export default pass
