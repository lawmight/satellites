/**
 * French copy for one pass's paragraph: the sentences under a pass's picture or plan view (see src/i18n/en/pass.ts for
 * each sentence's slots; docs/i18n/fr.md §3.4 gives the reference line for every case, and is the authority here).
 *
 * Why it reads this way:
 *  - The agreement trap (fr.md §1.3): nothing agrees with a satellite's name or the place's. A satellite takes *avoir*
 *    verbs and the imparfait only (*a survolé*, *a longé*, *a balayé*, *avait … à portée*, *a imagé*, *ne passe pas*),
 *    never *être* + participle, and is never *il* / *elle*: the next sentence says *son capteur*, *son radar*, *son
 *    imageur*, *sa fauchée*, *sa position*, *son opérateur*, nouns whose gender is known, and those agree normally
 *    (*Dépointé de 18,0°, son capteur…*, *la station … elle*).
 *  - The place follows a transitive verb (*a intégré Waterloo à…*, *couvrait Waterloo*, *aurait pu observer Waterloo*),
 *    never *de* or *à*, and gets no article: most names arrive in English (*Pacific Ocean*), and French would need an
 *    article or a contraction the code cannot supply (§5.1). Sentences with no place slot say *ce lieu*.
 *  - Sentences start with the time, like a log entry (*À 16:14:21 UTC, Sentinel-2C a survolé ce lieu…*, §2.2). The
 *    instrument *pointe* (*pointait droit vers le sol*, *à 5,4° de la verticale*); *viser* is kept for the verdict.
 *  - What we cannot know is said calmly: *Nous ne pouvons pas savoir si une image a été prise.* *Impossible de…* is
 *    kept for the archive that could not be searched (§1.1).
 *  - Directions are whole phrases from two closed tables, one after *filant* / *en progressant* (*vers l’est*), one
 *    for an offset or a bearing in the sky (*à l’est*), so code never joins a preposition to a word (§4.2). Heading
 *    readouts use the French 16-point letters with O (*SSO*, *ONO*).
 *  - Numbers come from fmt('fr') (decimal comma, U+202F thousands); each with its unit is a num() part, so it moves
 *    with its words. The percent is written inside the number after a no-break space (*25 %*, §6.2), so plain text
 *    gets it too. The geostationary seat arrives as "0.2°W" and prose spells it out (*par 0,2° ouest*, §4.2).
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('fr')

/** Where the satellite was moving: *filant vers le sud*, *en progressant vers l’est* */
const MOVING: Record<Compass8, string> = {
  n: 'vers le nord',
  ne: 'vers le nord-est',
  e: 'vers l’est',
  se: 'vers le sud-est',
  s: 'vers le sud',
  sw: 'vers le sud-ouest',
  w: 'vers l’ouest',
  nw: 'vers le nord-ouest',
}

/** Where it was from the place, or where to look in the sky: *à 61 km à l’ouest*, *au-dessus de votre horizon, au nord* */
const SIDE: Record<Compass8, string> = {
  n: 'au nord',
  ne: 'au nord-est',
  e: 'à l’est',
  se: 'au sud-est',
  s: 'au sud',
  sw: 'au sud-ouest',
  w: 'à l’ouest',
  nw: 'au nord-ouest',
}

const km = (n: number) => num(f.int(n), 'km')
const metres = (n: number) => num(f.int(n), 'm')
const degrees = (n: number) => num(f.dec(n, 1), '°')
const clock = (time: string, zone: string) => num(time, zone)

/** "0.2°W" → "0,2° ouest": a longitude in prose (fr.md §4.2); anything unexpected is kept as it came */
function seatInProse(seat: string): string {
  const m = /^(\d+)\.(\d+)°([EW])$/.exec(seat)
  return m ? `${m[1]},${m[2]}°\u00a0${m[3] === 'E' ? 'est' : 'ouest'}` : seat
}

/** "786 km d’altitude" / "786 km d’altitude, à 61 km à l’ouest" */
const altitude = (altKm: number, offset?: Offset): Part[] =>
  offset ? [km(altKm), ' d’altitude, à ', km(offset.km), ` ${SIDE[offset.dir]}`] : [km(altKm), ' d’altitude']

/** Overhead (within 15 km) the satellite flew over the place; off to one side it skirted it (fr.md §3.4) */
const flewBy = (offset?: Offset) => (offset ? 'a longé' : 'a survolé')

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
    ssw: 'SSO',
    sw: 'SO',
    wsw: 'OSO',
    w: 'O',
    wnw: 'ONO',
    nw: 'NO',
    nnw: 'NNO',
  },

  // ── a geostationary scan ───────────────────────────────────────────────────────────────────
  geo: {
    // *Sa position est fixe*: an epicene subject, not a participle hung on the satellite (fr.md §5.2). Two sentences.
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }) => {
      const c = o.cadenceMin ? Math.max(1, Math.round(o.cadenceMin)) : 0
      return [
        `${o.sat} ne passe pas. Sa position est fixe, à `,
        km(o.altKm),
        o.seat !== undefined ? ` au-dessus de l’équateur, par ${seatInProse(o.seat)}.` : ' au-dessus de l’équateur.',
        ...(c === 0
          ? [' Son imageur balaie toute la face visible de la Terre.']
          : c === 1
            ? [' Son imageur balaie toute la face visible de la Terre toutes les minutes.']
            : [' Son imageur balaie toute la face visible de la Terre toutes les ', num(f.int(c), f.plural(c, { one: 'minute', many: 'de minutes', other: 'minutes' })), '.']),
      ]
    },
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }) => [
      `La ligne de ce balayage a atteint ${o.place} vers `,
      clock(o.time, o.zone),
      `, en progressant ${MOVING[o.heading]}.`,
    ],
    infrared: 'Il faisait nuit ici, l’image est donc en infrarouge\u00a0: le sommet des nuages selon sa température, plus clair quand il est plus froid.',
  },

  // ── a pass with a picture ("Observé") ──────────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }) => [
    'À ',
    clock(o.time, o.zone),
    `, ${o.sat} ${flewBy(o.offset)} ce lieu à `,
    ...altitude(o.altKm, o.offset),
    `, filant ${MOVING[o.heading]} à `,
    num(f.dec(o.speedKmS, 2), 'km/s'),
    '.',
  ],
  mosaic: (o: { sensor: string; place: string; gsdM: number }) => [
    `Son imageur ${o.sensor} a intégré ${o.place} à la mosaïque quotidienne en couleurs naturelles de la NASA, à `,
    metres(o.gsdM),
    ' par pixel.',
  ],
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }) => [
    'Son radar, dépointé de ',
    degrees(o.deg),
    ` sur le côté, a imagé ${o.place} à `,
    metres(o.gsdM),
    o.dark ? ' par pixel, dans le noir.' : ' par pixel.',
  ],
  lookingDown: 'Son capteur pointait droit vers le sol.',
  lookingOff: (deg: number) => ['Son capteur pointait à ', degrees(deg), ' de la verticale.'],
  cloudCover: (pct: number) => ['Couverture nuageuse de la scène\u00a0: ', num(`${f.int(pct)}\u00a0%`), '.'],

  // ── "Probablement observé" ─────────────────────────────────────────────────────────────────
  likely: {
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }) => [
      'À ',
      clock(o.time, o.zone),
      `, ${o.sat} ${flewBy(o.offset)} ce lieu à `,
      ...altitude(o.altKm, o.offset),
      ...(o.swathKm ? [', dans sa fauchée de ', km(o.swathKm), '.'] : ['.']),
    ],
    archiveFailed: 'Il faisait jour\u00a0: son capteur aurait enregistré cet endroit. Impossible d’interroger les archives pour l’instant.',
    noScene:
      'Aucune scène n’existe pour ce passage. Sentinel-2 n’enregistre que les terres et les eaux côtières, et n’a peut-être pas programmé cet endroit.',
    notYet:
      'Il faisait jour\u00a0: son capteur a presque certainement enregistré cet endroit. ' +
      'Aucune scène de ce passage n’est encore publiée\u202f; les archives peuvent avoir un jour de retard ou plus.',
    // *ils* is *les imageurs* (masculine plural, known): never the satellite (fr.md §2.4).
    dark: 'Il faisait nuit ici. Les imageurs météo balaient aussi la nuit, en infrarouge\u00a0: ils ont vu vos nuages, pas vos rues.',
    mosaicUnconfirmed: 'La mosaïque quotidienne de la NASA pour ce passage n’a pas pu être confirmée à l’endroit même.',
    notPublished: 'Ses images alimentent les prévisions météo\u202f; elles ne sont pas publiées sous une forme que nous pouvons montrer.',
  },

  // ── "Aurait pu viser ici" ──────────────────────────────────────────────────────────────────
  could: {
    // *avait … à portée* in a whole sentence (the verdict's verb slot stays *pouvait viser*, fr.md §3.6).
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }) => [
      'À ',
      clock(o.time, o.zone),
      `, ${o.sat} avait ce lieu à portée`,
      ...(o.offset ? [', à ', km(o.offset.km), ` ${SIDE[o.offset.dir]}.`] : [', juste à la verticale.']),
    ],
    // Turned around: *Sa fauchée … couvrait [PLACE]*, never the place as subject (fr.md §5.1). *il* is *son opérateur*.
    insideSwath: (o: { place: string; swathKm: number }) => [
      'Sa fauchée de ',
      km(o.swathKm),
      ` couvrait ${o.place}. Son opérateur ne publie pas les lieux qu’il a imagés\u00a0: nous ne pouvons pas savoir si une image a été prise.`,
    ],
    radar: (o: { place: string; deg?: number; openArchive: boolean }) => [
      'Le radar voit à travers les nuages et la nuit. ',
      ...(o.deg === undefined ? ['Son radar'] : ['Dépointé de ', degrees(o.deg), ' sur le côté, son radar']),
      ` aurait pu cartographier ${o.place}.`,
      o.openArchive ? ' Nous n’avons trouvé aucune image publiée de ce passage.' : ' Nous ne pouvons pas savoir si une image a été prise.',
    ],
    // *dépointé*, *pointé* agree with *son capteur* (masculine): correct (fr.md §3.4).
    camera: (o: { place: string; deg?: number }) => [
      ...(o.deg === undefined ? ['Pointé à la verticale, '] : ['Dépointé de ', degrees(o.deg), ', ']),
      `son capteur aurait pu observer ${o.place}. Nous ne pouvons pas savoir si une image a été prise.`,
    ],
  },

  // ── "Survolé" ──────────────────────────────────────────────────────────────────────────────
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }) => [
    'À ',
    clock(o.time, o.zone),
    `, ${o.sat} a survolé ce lieu à `,
    km(o.altKm),
    ' d’altitude, à ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' au-dessus de votre horizon, presque à la verticale.' : ` au-dessus de votre horizon, ${SIDE[o.toward]}.`,
  ],
  // *elle* is *la station*, named in the same sentence; *sans clignoter*, because *fixe* would say it stood still.
  darkStation: 'Il faisait nuit chez vous. Si la station était encore éclairée par le soleil, elle a traversé votre ciel comme un point brillant, sans clignoter.',
}
export default pass
