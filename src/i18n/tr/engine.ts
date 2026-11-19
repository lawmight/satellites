/**
 * Turkish copy the report engine emits (see docs/i18n/tr.md §3.10 "engine", §3.6, §5.3): the computing readout's
 * progress rows and the report's footnotes about missing or less exact data.
 *
 * Why these forms:
 *  - Progress rows are one mono line of about 40 characters beside the row's number on a 390 px phone, written in
 *    sentence case and uppercased by CSS with Turkish rules (*YÖRÜNGE KATALOĞU YÜKLENİYOR*). A running step is a
 *    passive present continuous (*yükleniyor, hesaplanıyor, aranıyor*), the status-line form of §1.1; a counter follows
 *    ` · `. The longest, *Sentinel-2 + Landsat arşivleri aranıyor*, is 39 characters.
 *  - A noun after a numeral is always singular (*16.893 nesne*, *412 yörünge*, *31 geçiş*), so the two plural forms
 *    are equal except where the English says "one" as a word (`gibsUnconfirmed`: *bir VIIRS görüntüsünü … bu geçiş*).
 *    No suffix sits on a number: it goes on the fixed noun after it (*31 geçişle*, *5 günlük*), and *tane* carries the
 *    partitive (*31 … görüntüsünden 4 tanesini*). A name directly followed by a number takes a comma (*NASA GIBS, 4*).
 *  - Footnotes say what failed and what that means for the numbers, as plain past or present sentences, never
 *    *-mektedir*. Where the English quotes a verdict, Turkish quotes its title in quotation marks (*“İzledi” sayılır*,
 *    *“Muhtemelen izledi” olarak gösteriliyor*), the words every other screen uses (§3.6).
 *  - Names stay as they are (NASA GIBS, VIIRS, Sentinel-2, Landsat, Earth Search, Planetary Computer); a suffix on a
 *    fixed name follows its pronunciation (*Sentinel-2’nin*, *NASA GIBS’e*).
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('tr')
/** "16.893 nesne", "1 geçiş": a grouped count and its noun, singular after any number, never parted */
const count = (n: number, noun: string) => `${f.int(n)} ${noun}`
/** "bu geçiş" / "bu geçişler": the passes the note is about, one or several */
const thosePasses = (n: number) => f.plural(n, { one: 'bu geçiş', other: 'bu geçişler' })

const engine: typeof en = {
  progress: {
    loadingCatalog: 'Yörünge kataloğu yükleniyor',
    catalog: ({ objects }: { objects: number }) => `Katalog · ${count(objects, 'nesne')}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) =>
      `${count(orbits, 'yörünge')} hesaplanıyor · ${count(days, 'gün')}`,
    propagating: ({ done, total }: { done: number; total: number }) => `Yörüngeler hesaplanıyor · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Sentinel-2 + Landsat arşivleri aranıyor',
    // The instrumental sits on the fixed noun (*31 geçişle*), never on the number.
    matching: ({ scenes, passes }: { scenes: number; passes: number }) =>
      `${count(scenes, 'sahne')} ${count(passes, 'geçişle')} eşleştiriliyor`,
    verifyingWeatherStart: 'NASA mozaikleri doğrulanıyor',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `NASA mozaikleri doğrulanıyor · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `${count(passes, 'geçiş')} · ${count(images, 'görüntü')}`,
  },

  note: {
    archiveSlow: 'Sentinel-2 ve Landsat arşivleri geç yanıt verdi; geçişler yalnızca yörünge geometrisinden gösteriliyor.',
    archiveDown: 'Sentinel-2 ve Landsat arşivlerine ulaşılamadı; geçişler yalnızca yörünge geometrisinden gösteriliyor.',
    // The scenes are what was listed (*Sentinel-2 sahneleri*), and the word keeps the two names apart.
    sentinel2Thumbnails:
      'Sentinel-2 sahneleri Earth Search üzerinden listelendi; bazıları kesit değil, sahnenin tamamının küçük resmi olarak görünüyor.',
    sentinel2EarthSearch: 'Sentinel-2 sahneleri Earth Search üzerinden listelendi (Planetary Computer araması kullanılamıyor).',
    sentinel2Down: 'Sentinel-2 arşivine ulaşılamıyor; Sentinel-2 görüntüleri eksik olabilir.',
    landsatDown: 'Landsat arşivine ulaşılamıyor; Landsat görüntüleri eksik olabilir.',
    openOcean: 'Bu nokta Sentinel-2’nin çekim planının dışında (açık deniz).',
    // `days` is always 3 or more: *5 günlük* ("5 days old"), the suffix on the fixed noun.
    elementsOld: ({ days }: { days: number }) =>
      `Yörünge elemanları ${count(days, 'günlük')}; geçiş saatleri birkaç dakika kayabilir.`,
    elementsNewer: 'Bu geçişler daha yeni yörünge elemanlarıyla yeniden hesaplandı; saatleri birkaç dakika kayabilir.',
    // The English says "one" as a word, and its pronoun changes ("that pass" / "those passes"): two real forms. The
    // note is shown only while the images are still unconfirmed, so *doğrulamakta gecikti* ("was slow to confirm"),
    // never *geç doğruladı* ("confirmed late"). The planet is *gezegen*, as in the sats blurbs.
    gibsUnconfirmed: ({ n }: { n: number }) =>
      f.plural(n, {
        one: 'NASA GIBS bir VIIRS görüntüsünü doğrulamakta gecikti; VIIRS her gün bütün gezegeni görüntülediği için bu geçiş “İzledi” sayılır.',
        other: `NASA GIBS, ${f.int(n)} VIIRS görüntüsünü doğrulamakta gecikti; VIIRS her gün bütün gezegeni görüntülediği için bu geçişler “İzledi” sayılır.`,
      }),
    gibsSlowAll: 'NASA GIBS zamanında yanıt vermedi; meteoroloji uydusu görüntüleri gösterilmiyor.',
    // `missing` can be 1: then the note is about one pass (*bu geçiş*).
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS, ${f.int(total)} meteoroloji uydusu görüntüsünden ${f.int(missing)} tanesini zamanında göndermedi; ` +
      `${thosePasses(missing)} “Muhtemelen izledi” olarak gösteriliyor.`,
    gibsDownAll: 'NASA GIBS’e ulaşılamadı; meteoroloji uydusu görüntüleri gösterilmiyor.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS, ${f.int(total)} meteoroloji uydusu görüntüsünden ${f.int(missing)} tanesini gönderemedi; ` +
      `${thosePasses(missing)} “Muhtemelen izledi” olarak gösteriliyor.`,
  },
}

export default engine
