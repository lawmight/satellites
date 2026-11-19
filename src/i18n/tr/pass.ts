/**
 * Turkish copy for one pass's paragraph (see docs/i18n/tr.md §3.4, §4 "Compass", §5.1, §5.2, §5.5, §6.3): the
 * sentences under a pass's picture or plan view, and the 16-point bearings of its readouts.
 *
 * Why it is built this way:
 *  - **A log stamp opens every paragraph**: `16:14:21 UTC. Sentinel-2C, 786 km irtifadan tam tepeden geçti; …`. Turkish
 *    would say *saat 16.14’te*, but the locative would have to harmonise with whatever ends the slot (*UTC’de, EST’de,
 *    UTC+9’da*). As its own sentence the clock stays bare, and the satellite becomes the subject of every sentence that
 *    follows, so dropped subjects and bare possessives (*Radarı, Tam aşağıya bakıyordu*) stay on it. Inside a sentence
 *    a time is `saat yaklaşık [TIME] idi` (*idi* is written apart, so it never harmonises).
 *  - **No suffix on an inserted value** (§5): the place never takes a case ending. The paragraph sits under a headline
 *    that names the place, so its oblique cases are the deictic *burası* and its forms (*burayı, buranın 61 km
 *    batısından*); the place itself is inserted only as a subject (*Waterloo, uydunun … içindeydi*) or before the
 *    invariant postposition *üzerinden*. Suffixes sit on fixed words after a number (*290 km’lik*, *10 dakikada*),
 *    inside the number part's unit, so the suffix is set in the same face as the unit it belongs to.
 *  - **The re-mention rule** (§5.2): after a sentence whose subject is the place, *burası* or an impersonal statement
 *    (*Gündüzdü*, *Burada hava karanlıktı*), the satellite is named again with the fixed word *uydu* (*Uydu,
 *    kamerasını…*, *uydunun tarama şeridi*), or a bare *gördü* would attach to the place.
 *  - **Directions are closed sets written out in full** (§4, §5.6): four tables, one per case form (*güneye doğru*,
 *    *buranın 61 km batısından*, *kuzeybatıdaydı*), so nothing inserted is inflected. Readout bearings are the Turkish
 *    meteorological letters (*K … GGB … KKB*), never mixed with English ones.
 *  - Numbers come from fmt('tr') (*7,46 km/sn*, *35.778 km*, *5,3°*, *%25* with the sign first, inside the number
 *    part); a name directly followed by a number takes a comma (*Sentinel-2C, 786 km …*). The geostationary seat
 *    arrives in international notation (*0.2°W*), so an invariant word follows it (*boylamında*).
 */
import type en from '../en/pass'
import type { Offset } from '../en/pass'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Part, type Rich } from '../../../api/_lib/i18n/parts'
import type { Compass8 } from '@/ui/results/lib/copy'

const f = fmt('tr')

/** Where the satellite was moving, before *doğru*: "güneye doğru ilerliyordu" */
const TOWARD: Record<Compass8, string> = {
  n: 'kuzeye',
  ne: 'kuzeydoğuya',
  e: 'doğuya',
  se: 'güneydoğuya',
  s: 'güneye',
  sw: 'güneybatıya',
  w: 'batıya',
  nw: 'kuzeybatıya',
}

/** Where it passed from the place, after *buranın [KM] km*: "buranın 61 km batısından geçti" */
const OF_HERE: Record<Compass8, string> = {
  n: 'kuzeyinden',
  ne: 'kuzeydoğusundan',
  e: 'doğusundan',
  se: 'güneydoğusundan',
  s: 'güneyinden',
  sw: 'güneybatısından',
  w: 'batısından',
  nw: 'kuzeybatısından',
}

/** Where it stood in the sky, as a past predicate: "ufkunun 62° üzerinde, kuzeybatıdaydı" */
const WAS_IN: Record<Compass8, string> = {
  n: 'kuzeydeydi',
  ne: 'kuzeydoğudaydı',
  e: 'doğudaydı',
  se: 'güneydoğudaydı',
  s: 'güneydeydi',
  sw: 'güneybatıdaydı',
  w: 'batıdaydı',
  nw: 'kuzeybatıdaydı',
}

const km = (n: number) => num(f.int(n), 'km')
const deg1 = (n: number) => num(f.dec(n, 1), '°')
const clock = (time: string, zone: string) => num(time, zone)
/** The paragraph's log stamp: "16:14:21 UTC. " */
const stamp = (time: string, zone: string): Part[] => [clock(time, zone), '. ']
/** "Sentinel-2C, 786 km irtifadan tam tepeden geçti" / "…, 786 km irtifadan, buranın 61 km batısından geçti" */
const crossedAt = (sat: string, altKm: number, offset?: Offset): Part[] =>
  offset
    ? [`${sat}, `, km(altKm), ' irtifadan, buranın ', km(offset.km), ` ${OF_HERE[offset.dir]} geçti`]
    : [`${sat}, `, km(altKm), ' irtifadan tam tepeden geçti']

const pass: typeof en = {
  // The Turkish meteorological letters (K kuzey, D doğu, G güney, B batı), clockwise from north.
  compass16: {
    n: 'K',
    nne: 'KKD',
    ne: 'KD',
    ene: 'DKD',
    e: 'D',
    ese: 'DGD',
    se: 'GD',
    sse: 'GGD',
    s: 'G',
    ssw: 'GGB',
    sw: 'GB',
    wsw: 'BGB',
    w: 'B',
    wnw: 'BKB',
    nw: 'KB',
    nnw: 'KKB',
  },

  // ── a geostationary scan ─────────────────────────────────────────────────────────────────
  geo: {
    // *geçip gitmez*, never a bare *geçmez* ("fails"). The aorist: what it always does.
    sits: (o: { sat: string; altKm: number; seat?: string; cadenceMin?: number }): Rich => [
      `${o.sat} geçip gitmez. Ekvatorun `,
      km(o.altKm),
      o.seat !== undefined ? ` yukarısında, ${o.seat} boylamında durur` : ' yukarısında durur',
      ...(o.cadenceMin
        ? f.plural<Part[]>(o.cadenceMin, {
            one: [' ve altındaki Dünya yüzünü her dakika baştan sona tarar.'],
            other: [' ve altındaki Dünya yüzünü her ', num(f.int(o.cadenceMin), 'dakikada'), ' bir baştan sona tarar.'],
          })
        : [' ve altındaki Dünya yüzünü baştan sona tarar.']),
    ],
    // The place before the invariant postposition; the time as `saat … idi`.
    reached: (o: { place: string; time: string; zone: string; heading: Compass8 }): Rich => [
      `Bu taramanın çizgisi ${TOWARD[o.heading]} doğru ilerlerken ${o.place} üzerinden geçti; saat yaklaşık `,
      clock(o.time, o.zone),
      ' idi.',
    ],
    infrared: 'Burada hava karanlıktı, bu yüzden görüntü kızılötesi: bulut tepeleri sıcaklığa göre, soğuk olan daha açık renkte.',
  },

  // ── a pass with a picture ────────────────────────────────────────────────────────────────
  crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; heading: Compass8; speedKmS: number }): Rich => [
    ...stamp(o.time, o.zone),
    ...crossedAt(o.sat, o.altKm, o.offset),
    '; ',
    num(f.dec(o.speedKmS, 2), 'km/sn'),
    ` hızla ${TOWARD[o.heading]} doğru ilerliyordu.`,
  ],
  // The instrument is named, so the sentence never opens on a bare possessive; the place is *burayı*. The pixel sits
  // inside the clause, as in radarImaged (*piksel başına … çözünürlükle*), never as a verbless tail after a semicolon.
  mosaic: (o: { sensor: string; place: string; gsdM: number }): Rich => [
    `${o.sensor} görüntüleyicisi burayı taradı ve piksel başına `,
    num(f.int(o.gsdM), 'm'),
    ' çözünürlükle NASA’nın günlük gerçek renkli mozaiğine kattı.',
  ],
  // *Radarı*: the satellite is the topic since the log stamp's sentence.
  radarImaged: (o: { deg: number; place: string; gsdM: number; dark: boolean }): Rich => [
    'Radarı ',
    deg1(o.deg),
    o.dark ? ' yana bakarak burayı karanlıkta, piksel başına ' : ' yana bakarak burayı piksel başına ',
    num(f.int(o.gsdM), 'm'),
    ' çözünürlükle görüntüledi.',
  ],
  lookingDown: 'Tam aşağıya bakıyordu.',
  lookingOff: (deg: number): Rich => ['Dikeyden ', deg1(deg), ' eğik bakıyordu.'],
  // The percent sign goes first, inside the number part (§6.3).
  cloudCover: (pct: number): Rich => ['Sahne genelinde bulut örtüsü: ', num(`%${f.int(pct)}`), '.'],

  // ── "Muhtemelen izledi" ──────────────────────────────────────────────────────────────────
  likely: {
    // The swath sentence's subject is *Burası*, and *uydunun* names the satellite again (§5.2). The suffix sits inside
    // the number part's unit (*km’lik*), so it is set in the unit's face, not in body text after it.
    crossed: (o: { sat: string; altKm: number; offset?: Offset; time: string; zone: string; swathKm?: number }): Rich => [
      ...stamp(o.time, o.zone),
      ...crossedAt(o.sat, o.altKm, o.offset),
      ...(o.swathKm ? ['. Burası, uydunun ', num(f.int(o.swathKm), 'km’lik'), ' tarama şeridi içindeydi.'] : ['.']),
    ],
    archiveFailed: 'Gündüzdü; uydu bu noktayı kaydetmiş olmalı. Arşiv şu an aranamadı.',
    noScene: 'Bu geçiş için sahne yok. Sentinel-2 yalnızca karaları ve kıyı sularını kaydeder; bu noktayı planlamamış olabilir.',
    notYet:
      'Gündüzdü; uydu bu noktayı neredeyse kesinlikle kaydetti. ' +
      'Bu geçişten henüz sahne yayımlanmadı; arşivler bir gün ya da daha fazla gecikebilir.',
    dark: 'Burada hava karanlıktı. Meteoroloji görüntüleyicileri geceleri kızılötesiyle taramayı sürdürür; yani uydu sokaklarını değil, bulutlarını gördü.',
    mosaicUnconfirmed: 'Bu geçişin NASA günlük mozaiği seçtiğin noktada doğrulanamadı.',
    notPublished: 'Uydunun görüntüleri hava tahminlerini besliyor; burada gösterilebilecek biçimde yayımlanmıyor.',
  },

  // ── "Buraya bakabilirdi" ─────────────────────────────────────────────────────────────────
  could: {
    withinView: (o: { sat: string; time: string; zone: string; offset?: Offset }): Rich => [
      ...stamp(o.time, o.zone),
      ...(o.offset
        ? [`${o.sat}, buranın `, km(o.offset.km), ` ${OF_HERE[o.offset.dir]} geçti; burası uydunun görüş alanı içindeydi.`]
        : [`${o.sat} tam tepeden geçti; burası uydunun görüş alanı içindeydi.`]),
    ],
    // The place is the subject, then a comma before *uydunun*; the second sentence names *Uydunun operatörü*. The
    // suffix sits inside the unit (*km’lik*), as in likely.crossed.
    insideSwath: (o: { place: string; swathKm: number }): Rich => [
      `${o.place}, uydunun `,
      num(f.int(o.swathKm), 'km’lik'),
      ' tarama şeridi içindeydi. Uydunun operatörü nereleri görüntülediğini yayımlamıyor; bu yüzden görüntüleyip görüntülemediğini bilemeyiz.',
    ],
    // After the impersonal first sentence, *Uydu* names it again.
    radar: (o: { place: string; deg?: number; openArchive: boolean }): Rich => [
      'Radar bulutun ve karanlığın içinden görür. ',
      ...(o.deg === undefined ? ['Uydu burayı haritalayabilirdi.'] : ['Uydu, ', deg1(o.deg), ' yana bakarak burayı haritalayabilirdi.']),
      o.openArchive ? ' Bu geçişten yayımlanmış bir görüntüsünü bulamadık.' : ' Bunu yapıp yapmadığını bilemeyiz.',
    ],
    camera: (o: { place: string; deg?: number }): Rich => [
      ...(o.deg === undefined
        ? ['Uydu, tam aşağıya bakarak burayı izleyebilirdi.']
        : ['Uydu, kamerasını dikeyden ', deg1(o.deg), ' eğseydi burayı izleyebilirdi.']),
      ' İzleyip izlemediğini bilemeyiz.',
    ],
  },

  // ── "Tepeden geçti" ──────────────────────────────────────────────────────────────────────
  // "your horizon" is the possessive *ufkunun*; near the zenith a direction means nothing: *neredeyse tam tependeydi*.
  overhead: (o: { sat: string; altKm: number; time: string; zone: string; elevationDeg: number; toward?: Compass8 }): Rich => [
    ...stamp(o.time, o.zone),
    `${o.sat}, `,
    km(o.altKm),
    ' irtifadan geçti; ufkunun ',
    num(f.int(o.elevationDeg), '°'),
    o.toward === undefined ? ' üzerinde, neredeyse tam tependeydi.' : ` üzerinde, ${WAS_IN[o.toward]}.`,
  ],
  // *Burada*, the place's deictic everywhere else (likely.dark, geo.infrared): after *…kuzeybatıdaydı.* an *Orada*
  // would point at where the station was. The condition is past, like the inference it leads to.
  darkStation: 'Burada hava karanlıktı. İstasyon hâlâ güneş ışığındaydıysa gökyüzünden parlak, sabit bir nokta olarak geçmiş olmalı.',
}

export default pass
