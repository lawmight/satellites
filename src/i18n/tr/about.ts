/**
 * Turkish copy for the About page ("Nasıl çalışır?", src/ui/pages/AboutPage.tsx; see src/i18n/en/about.ts, and
 * docs/i18n/tr.md §3.11, which is the authority on every word here and gives the title, the lede, the section names,
 * the three questions, the method lines, the privacy row, the credit labels and the keys word for word).
 *
 * Why it reads this way:
 *  - The title is a question, `Nasıl / *çalışır*?`: *Nasıl çalışır.* reads as a broken sentence in Turkish, so the
 *    question mark stands where English has its full stop, outside the accent (§3.11).
 *  - The reader is *sen*, a little more conversational than the results; "we" is the verb ending (*hesaplıyoruz,
 *    sayarız, gösteriyoruz*) and the pronoun *biz* appears only for contrast (*biz çekmedik*; the host's cookie that
 *    *biz* never read, §1.4). "Your spot" is *seçtiğin nokta*, never *senin noktan*. The questions end with *mı/mi*
 *    written apart (§1.1, §6.1).
 *  - *fotoğraf* only where the English says photo about Sentinel-2, Landsat or daylight cameras; anything that can be
 *    radar, a mosaic or a full-disc frame is *görüntü* (§4), so the privacy row says the images load from the
 *    archives. The tilting row quotes the verdict's title in “…” (*“Buraya bakabilirdi”*, §3.6), and verdictMore is
 *    §3.6's longer word, said after each definition from the 'verdicts' namespace (*bakıp bakmadığını* follows the
 *    could definition's *Operatörü bakıp bakmadığını söylemiyor.*).
 *  - The loaded count and the fetch stamp are mono parts that never take a suffix: the count stands before its
 *    singular noun (*16.893 nesne*, *1 nesne*), the stamp after *indirildi:* in parentheses, as the results' notes
 *    print it (§3.8, §5.3).
 *  - Numbers typed into the text are fixed copy: a no-break space before the unit (*10 m, 290 km*), a suffix on the
 *    unit where Turkish needs one (*10 km’lik, 1 km’ye*), and names suffixed with U+2019 by pronunciation
 *    (*Sentinel-2’de, Landsat’ta, Photon’a, Nominatim’e, Open-Meteo’ya, X’te, GIBS’ten*, §6.1). The north arrow is
 *    *K*, as the photo viewer labels it.
 *  - The licence lines stay English in the page itself; the credit prose is translated around the names, with
 *    OpenStreetMap's attribution kept in its own English words (§6.9). The privacy rows say exactly what the English
 *    says, with no reassurance formula and no promise added (§8.1).
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('tr')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: 'Hakkında',
  close: 'Kapat',
  sectionsLabel: 'Bölümler',
  /** "Nasıl / *çalışır*?" (§3.11): the accent on the verb, the question mark outside it */
  title: [['Nasıl'], [accent('çalışır'), '?']] as Rich[],
  lede: 'Yeryüzünde bir nokta seç. Son bir haftada üzerinden hangi uyduların geçtiğini hesaplıyor, sonra çektikleri fotoğrafları bulup getiriyoruz. Her şey tarayıcında, kamuya açık verilerle çalışıyor.',

  sections: {
    short: 'Kısaca',
    method: 'Geçişleri nasıl buluyoruz',
    words: 'Etiketlerin anlamı',
    accuracy: 'Göremediklerimiz',
    privacy: 'Gizlilik',
    credits: 'Kaynaklar',
    keys: 'Klavye',
  },

  /** §3.11, word for word */
  short: {
    live: {
      term: 'Canlı mı?',
      text: 'Tam olarak değil. Fotoğraflar, çekildikten birkaç saat ile iki gün sonra arşive düşer; bu yüzden en yeni geçişlerin henüz fotoğrafı olmayabilir.',
    },
    seeMe: {
      term: 'Beni görebilir mi?',
      text: 'Hayır. Buradaki bir piksel en iyi durumda 10 m genişliğinde. Bir araba tek bir piksel. Görüntüde sen yoksun.',
    },
    every: {
      term: 'Bunlar bütün uydular mı?',
      text: 'Hayır. Askerî ve casus uyduların çoğu kamuya açık kataloglarda yok; şirketler de kameralarını nereye çevirdiklerini söylemiyor.',
    },
  },

  method: {
    /**
     * §3.11: the link stays on CelesTrak's name, which opens the second sentence as its subject. *Uzay Kuvvetlerinin*
     * takes no apostrophe: TDK writes suffixes on institution names straight on (*Türk Dil Kurumunun*)
     */
    orbits: [
      'Yörüngedeki her nesnenin yolunu tanımlayan, kamuya açık bir sayı kümesi var. ',
      link('CelesTrak'),
      ' bunları ABD Uzay Kuvvetlerinin takibinden yayımlar; biz de her altı saatte bir taze bir kopyasını alırız.',
    ] as AboutPart[],
    /** "Bu sayfa 16.893 nesne yükledi (indirildi: 2026-11-08 03:34Z)." The noun stays singular after any count */
    loaded: (count: number, stamp: string): AboutPart[] => [
      'Bu sayfa ',
      num(f.int(count)),
      ' nesne yükledi (indirildi: ',
      num(stamp),
      ').',
    ],
    sgp4: 'SGP4 ile, yani standart yörünge modeliyle, her uydunun son yedi gününü hesaplıyor ve seçtiğin noktanın onun görebildiği alana girdiği her anı not ediyoruz.',
    facts: {
      straightDown: {
        term: 'Tam aşağı',
        text: 'Sentinel-2 ve Landsat yerdeki bir şeride tam aşağıya bakar. Bu şeridin genişliği Sentinel-2’de yaklaşık 290 km, Landsat’ta 185 km. Şeridin içinde olmalısın.',
      },
      /** §3.11: the could verdict's title in “…” (§3.6) */
      tilting: {
        term: 'Eğilebilen kameralar',
        text: 'Birçok ticari uydu kamerasını 30–45 derece eğebilir. Menzilindeysen buna “Buraya bakabilirdi” diyoruz.',
      },
      /** Parallel to the radar row: *gerektirir* / *gerektirmez* */
      daylight: {
        term: 'Gün ışığı',
        text: 'Sıradan kameralar güneş ışığı gerektirir. Karanlıktaki bir geçiş hiçbir zaman fotoğraf sayılmaz.',
      },
      /** A radar image is never *fotoğraf*; "through cloud and at night" as the pass view says it (§3.4 could.radar) */
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 güneş ışığı gerektirmez. Mikrodalga gönderir ve yankısını kaydeder; bu yüzden yer izinin bir yanına bakarak bulutun ve karanlığın içinden görür. Görüntüleri de kamuya açık olduğu için onları gri tonlarda gösteriyoruz. Engebeli arazi ve binalar parlak, durgun su karanlık görünür.',
      },
      /** "frame" is *kare* (§4); *izler*: satellites watching places, the product's verb */
      weather: {
        term: 'Meteoroloji uyduları',
        text: 'Birkaçı ekvatorun üzerinde durur ve her 10 dakikada bir gezegenin yarısını izler. Dünya’nın onlara bakan yüzündeysen her karede varsın.',
      },
    },
    /** "cropped": *kesit*, the glossary's crop of a scene (§4); "the pass that took it": *çekildiği geçiş* */
    archives:
      'Sonra görüntü arşivlerini (Microsoft Planetary Computer, Element 84 ve NASA) tarıyor ve her görüntüyü çekildiği geçişle eşleştiriyoruz. Gördüğün her görüntü gerçek: seçtiğin noktanın çevresinden alınmış bir kesit.',
    photoFacts: {
      /**
       * *Rötuş* (§4); the last sentence is the glossary's; *renklerini ayarlıyoruz* as the time-lapse note says it.
       * One object, *fotoğrafları*, so *ekranına göre* covers all three steps and nothing reads as smoothing colours
       */
      touchUps: {
        term: 'Rötuş',
        text: 'Sentinel-2 ve Landsat fotoğraflarını ekranına göre yumuşatıyor, hafifçe keskinleştiriyor ve renklerini ayarlıyoruz. Fotoğrafın her yeri aynı biçimde işlenir. Hiçbir şey eklenmez ya da çıkarılmaz.',
      },
      /** The glossary's *Kuzey nerede*; the viewer's north arrow is labelled K */
      whichWayUp: {
        term: 'Kuzey nerede',
        text: 'Sentinel-2 ve Landsat fotoğrafları, seçtiğin yer için arşivin kendi harita ızgarasını korur; bu yüzden kuzey tam yukarıdan birkaç derece sapabilir. Bir fotoğrafı açtığında üzerindeki K oku kuzeyin tam yerini gösterir.',
      },
    },
  },

  /** §3.6, after each definition as the next sentence */
  verdictMore: {
    imaged: 'Gösteriyorsak, o gerçek görüntünün ta kendisi.',
    likely: 'Görüntü henüz kamuya açılmadı ya da bulut yüzünden elendi.',
    could: 'Gerçekten bakıp bakmadığını bilmenin yolu yok.',
    overhead: '',
  },

  accuracy: {
    /** "drifts a little each day": the margin grows; times *kayabilir*, as the engine notes say it (§3.10) */
    positions: {
      term: 'Kesin konumlar',
      text: 'Kamuya açık yörünge verilerinin hata payı yaklaşık bir kilometre; bu pay her gün biraz büyür. Geçiş saatleri birkaç saniye kayabilir.',
    },
    secret: { term: 'Gizli uydular', text: 'Yörüngedeki en iyi kameraların bir kısmı ordulara ait. Burada görünmezler.' },
    /** "say so": whether the pixel over the spot is cloud (the spot line says clear, cirrus, cloud or shadow) */
    clouds: {
      term: 'Bulutlar',
      text: 'Pek çok fotoğrafta yalnızca bulut var. Arşiv bu bilgiyi verdiğinde seçtiğin noktanın tam üzerindeki pikseli kontrol ediyor ve orada bulut olup olmadığını söylüyoruz.',
    },
    delays: { term: 'Gecikmeler', text: 'Fotoğrafların görünmesi bir iki gün sürebilir.' },
  },

  /** Exactly the English, no more and no less (§8.1); `kept` is §3.11's, word for word */
  privacy: {
    where: { term: 'Nerede çalışıyor', text: 'Yörüngeler tarayıcında hesaplanır.' },
    kept: {
      /** Not *Ne saklıyoruz*: alone as a heading it reads first as "What are we hiding" */
      term: 'Ne kaydediyoruz',
      text: 'Arama sayılarını kasaba ve yaklaşık 10 km’lik bir alan düzeyinde tutarız, tam noktanı asla. Neyin açıldığını ve paylaşıldığını da sayarız. IP adresi yok, bize ait çerez yok, bir ziyareti ötekine bağlayan hiçbir şey yok.',
    },
    others: {
      term: 'Başka kim görüyor',
      text: 'Yer adlarının çoğu siteye yerleşik bir listeden gelir. Diğer aramalar Open-Meteo’ya, Photon’a ya da Nominatim’e gider. Görüntüler doğrudan arşivlerden yüklenir. Sitemizi barındıran hizmet, çerez kullanmadan sayfa görüntülemelerini sayar ve sayfa hızını ölçer. İnsanları botlardan ayırmak için bir güvenlik çerezi yerleştirebilir. Bu çerezi biz hiç okumayız.',
    },
    links: {
      term: 'Paylaşım bağlantıları',
      text: 'Yalnızca bir şey paylaştığında oluşturulur. Bağlantısı olan herkes yerin adını, yaklaşık 1 km’ye yuvarlanmış bir noktayı ve seçtiğin geçişi görür.',
    },
  },

  /** §3.11's labels and lines; product, agency, licence and people's names as they are, *via* as *üzerinden* */
  credits: {
    madeBy: { who: 'Yapan', text: (handle: string): AboutPart[] => ['Armaan, X’te ', link(handle)] },
    support: { who: 'Destek', text: [link('Watched’ın ücretsiz kalmasına destek ol :)')] as AboutPart[] },
    gibs: 'Görüntüler NASA GIBS’ten (EOSDIS’in bir parçası). GOES, NOAA ve CIRA üzerinden; Himawari, JMA üzerinden.',
    archives: {
      who: 'Arşivler',
      text: 'Microsoft Planetary Computer ve Element 84 Earth Search; Landsat’ın 15 m’lik bandı Copernicus Data Space Ecosystem’den.',
    },
    orbits: { who: 'Yörüngeler', text: 'CelesTrak yörünge elemanları; SGP4 için satellite.js.' },
    /** OpenStreetMap's attribution in its own English words (§3.11) */
    placeNames: { who: 'Yer adları', text: 'Photon (komoot). Map data © OpenStreetMap contributors (ODbL).' },
    textures: { who: 'Dünya dokuları', text: 'Solar System Scope (CC BY 4.0), NASA’nın Blue Marble ve Black Marble görüntülerinden.' },
    type: { who: 'Yazı tipleri', text: 'Instrument Sans ve Serif (Instrument), Martian Mono (Evil Martians), SIL OFL.' },
  },

  /** §3.11: sen imperatives (bare stems) or nouns; *görüntü* and *Büyüt* as the viewer says them, *Tekrar* the replay */
  keys: {
    search: 'Bir yer ara',
    suggestions: 'Öneriler arasında gezin',
    choose: 'Seç',
    passes: 'Geçişler arasında ilerle',
    photos: 'Önceki / sonraki görüntü',
    expand: 'Görüntüyü büyüt',
    /** Beside + − 0: both directions, as Turkish software names the zoom control (*Yakınlaştır/Uzaklaştır*) */
    zoom: 'Yakınlaştır / uzaklaştır (büyütülmüşken)',
    play: 'Tekrarı oynat ya da duraklat',
    back: 'Geri ya da kapat',
    help: 'Bu sayfa',
  },
  /** The names printed on Turkish keyboards' caps (§3.11, §4) */
  keyNames: { enter: 'Enter', space: 'Boşluk', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['Yapan: ', link(handle)],
  footerNote: 'Kamuya açık verilerden yapıldı. Bu fotoğrafların hiçbirini biz çekmedik.',
}

export default about
