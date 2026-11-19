/**
 * Indonesian copy for the About page ("Cara kerjanya", src/ui/pages/AboutPage.tsx; see src/i18n/en/about.ts, and
 * docs/i18n/id.md §3.9, which gives most lines here word for word and is the authority on every one).
 *
 * Why it reads this way: the answers are ours (*kami*, never *kita*) and speak to one reader (*kamu / -mu*); the
 * questions are the reader's own, so they use *-ku* (*Bisakah satelit melihatku?*). The privacy rows say exactly what
 * the English says and promise nothing more (*area selebar sekitar 10 km*, never *sel* or `~`). *foto* only where the
 * item is certainly a Sentinel-2 or Landsat photograph (the delay, touch-up, north-up and cloud rows); anything that
 * can be radar, a mosaic or a geostationary frame is *citra*. Satellites get no pronoun: *-nya* on a noun, *satelit
 * ini*. Numbers written into the text keep a no-break space before their unit (*10 m*); the loaded count and the
 * fetch stamp arrive as mono parts, the count grouped by fmt('id') (*16.893*), the stamp kept as it is.
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('id')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: 'Tentang',
  close: 'Tutup',
  sectionsLabel: 'Bagian',
  /** "Cara / *kerjanya*." (id.md §3.9): the accent on the word that means "works", the full stop outside it */
  title: [['Cara'], [accent('kerjanya'), '.']] as Rich[],
  lede: 'Pilih satu titik di Bumi. Kami menghitung satelit mana saja yang melintas di atasnya dalam seminggu terakhir, lalu mencari citra yang direkamnya. Semuanya berjalan di perangkatmu, dengan data publik.',

  sections: {
    short: 'Versi singkat',
    method: 'Cara kami mencari lintasan',
    words: 'Arti label',
    accuracy: 'Yang tidak bisa kami lihat',
    privacy: 'Privasi',
    credits: 'Kredit',
    keys: 'Papan ketik',
  },

  short: {
    live: {
      term: 'Apakah ini langsung?',
      text: 'Tidak sepenuhnya. Foto masuk ke arsip beberapa jam hingga dua hari setelah diambil, jadi lintasan terbaru mungkin belum punya foto.',
    },
    seeMe: {
      term: 'Bisakah satelit melihatku?',
      text: 'Tidak. Paling tajam, satu piksel di sini selebar 10 m. Mobil pun hanya satu piksel. Kamu tidak akan terlihat.',
    },
    every: {
      term: 'Apakah ini semua satelit?',
      text: 'Tidak. Satelit militer dan satelit mata-mata sebagian besar tidak ada di katalog publik, dan perusahaan tidak menyebutkan ke mana kamera mereka diarahkan.',
    },
  },

  method: {
    /** The link stays on CelesTrak's name; US Space Force is a name and stays */
    orbits: [
      'Setiap objek di orbit punya sekumpulan angka publik yang menggambarkan jalurnya. ',
      link('CelesTrak'),
      ' memublikasikannya dari data pelacakan US Space Force, dan kami mengambil salinan terbarunya setiap enam jam.',
    ] as AboutPart[],
    /** "Halaman ini memuat 16.893 objek, yang diambil pada 2026-11-08 03:34Z." (one noun form for any count) */
    loaded: (count: number, stamp: string): AboutPart[] => [
      'Halaman ini memuat ',
      num(f.int(count)),
      ' objek, yang diambil pada ',
      num(stamp),
      '.',
    ],
    sgp4: 'Kami menghitung jalur setiap satelit dengan SGP4, model orbit standar, untuk tujuh hari terakhir. Lalu kami mencatat setiap kali titikmu berada dalam jangkauannya.',
    facts: {
      straightDown: {
        term: 'Lurus ke bawah',
        text: 'Kamera Sentinel-2 dan Landsat menghadap lurus ke bawah, ke satu jalur di permukaan. Lebarnya sekitar 290 km untuk Sentinel-2 dan 185 km untuk Landsat. Kamu harus berada di dalam jalur itu.',
      },
      /** Quotes the could verdict's title as the results show it (id.md §3.7) */
      tilting: {
        term: 'Kamera yang bisa dimiringkan',
        text: 'Banyak satelit komersial bisa miring 30 hingga 45 derajat. Jika kamu berada dalam jangkauan, kami menyebutnya “mungkin mengarah ke sini”.',
      },
      daylight: {
        term: 'Siang hari',
        text: 'Kamera biasa butuh sinar matahari. Lintasan dalam gelap tidak pernah dihitung sebagai foto.',
      },
      /** Radar is never *foto* (id.md §4.1) */
      radar: {
        term: 'Radar',
        text: 'Sentinel-1 tidak butuh matahari. Satelit ini memancarkan gelombang mikro dan merekam pantulannya, jadi bisa menembus awan dan tetap melihat pada malam hari. Radarnya menghadap ke satu sisi jejak permukaannya. Citranya juga dipublikasikan, jadi kami menampilkannya dalam warna abu-abu: terang berarti tanah kasar dan bangunan, gelap berarti air yang tenang.',
      },
      weather: {
        term: 'Satelit cuaca',
        text: 'Beberapa di antaranya berada di atas khatulistiwa dan mengawasi separuh planet setiap 10 menit. Jika kamu berada di sisi Bumi yang menghadapnya, kamu ada di setiap citranya.',
      },
    },
    archives:
      'Setelah itu, kami menelusuri arsip citra (Microsoft Planetary Computer, Element 84, dan NASA). Setiap citra kami cocokkan dengan lintasan yang merekamnya. Semua citra yang kamu lihat itu asli, dipotong di sekitar titikmu.',
    photoFacts: {
      touchUps: {
        term: 'Sentuhan akhir',
        text: 'Foto Sentinel-2 dan Landsat diseimbangkan warnanya, dihaluskan, dan sedikit dipertajam untuk layarmu, dengan cara yang sama di seluruh gambar. Tidak ada yang ditambahkan atau dihilangkan.',
      },
      /** The photo viewer's north arrow is labelled U (*utara*): "panah U-nya" */
      whichWayUp: {
        term: 'Arah atas',
        text: 'Foto Sentinel-2 dan Landsat memakai grid peta bawaan arsip untuk tempatmu. Karena itu, utara bisa bergeser beberapa derajat dari arah lurus ke atas. Saat kamu membuka foto, panah U-nya menunjukkan arahnya dengan tepat.',
      },
    },
  },

  /** After each verdict's definition, as the next sentence (id.md §3.7) */
  verdictMore: {
    imaged: 'Jika kami menampilkannya, itulah citra aslinya.',
    likely: 'Citranya belum dipublikasikan, atau dibuang karena tertutup awan.',
    could: 'Tidak ada cara untuk tahu apakah kamera itu benar-benar melihat ke sini.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: 'Posisi persis',
      text: 'Data orbit publik akurat hingga sekitar satu kilometer, dan sedikit bergeser setiap hari. Waktu lintasan bisa meleset beberapa detik.',
    },
    secret: { term: 'Satelit rahasia', text: 'Beberapa kamera terbaik di orbit dimiliki militer. Satelitnya tidak muncul di sini.' },
    clouds: {
      term: 'Awan',
      text: 'Banyak foto hanya berisi awan. Jika arsip mencatat awannya, kami memeriksa piksel persis di titikmu, lalu menyebutkan hasilnya.',
    },
    delays: { term: 'Keterlambatan', text: 'Foto bisa baru muncul satu atau dua hari kemudian.' },
  },

  /** Exactly the English, no more and no less (id.md §3.9) */
  privacy: {
    where: { term: 'Tempat berjalannya', text: 'Perhitungan orbit berjalan di browser, di perangkatmu sendiri.' },
    kept: {
      term: 'Yang kami simpan',
      text: 'Kami menghitung pencarian per kota dan per area selebar sekitar 10 km, tidak pernah titik persismu, dan mencatat jumlah yang dibuka dan dibagikan. Tanpa alamat IP, tanpa cookie milik kami, tanpa apa pun yang menghubungkan satu kunjungan dengan kunjungan berikutnya.',
    },
    others: {
      term: 'Siapa lagi yang melihatnya',
      text: 'Sebagian besar nama tempat berasal dari daftar yang tertanam di situs ini. Pencarian lain dikirim ke Open-Meteo, Photon, atau Nominatim. Citra dimuat langsung dari arsip. Host kami menghitung kunjungan halaman dan kecepatan, tanpa cookie, dan mungkin memasang satu cookie keamanan untuk membedakan manusia dari bot. Kami tidak pernah membacanya.',
    },
    links: {
      term: 'Tautan berbagi',
      text: 'Hanya dibuat saat kamu membagikan sesuatu. Siapa pun yang punya tautannya bisa melihat nama tempat, titik yang dibulatkan ke sekitar 1 km, dan lintasan yang kamu pilih.',
    },
  },

  /** Product, agency, licence and people's names as they are; OpenStreetMap's own Indonesian attribution */
  credits: {
    madeBy: { who: 'Dibuat oleh', text: (handle: string): AboutPart[] => ['Armaan, ', link(handle), ' di X'] },
    gibs: 'Citra dari GIBS milik NASA, bagian dari EOSDIS. GOES melalui NOAA dan CIRA, Himawari melalui JMA.',
    archives: {
      who: 'Arsip',
      text: 'Microsoft Planetary Computer dan Element 84 Earth Search; kanal 15 m Landsat dari Copernicus Data Space Ecosystem.',
    },
    orbits: { who: 'Orbit', text: 'Elemen orbit dari CelesTrak. SGP4 oleh satellite.js.' },
    placeNames: { who: 'Nama tempat', text: 'Photon oleh komoot. Data peta © kontributor OpenStreetMap (ODbL).' },
    textures: { who: 'Tekstur Bumi', text: 'Solar System Scope (CC BY 4.0), dari NASA Blue Marble dan Black Marble.' },
    type: { who: 'Jenis huruf', text: 'Instrument Sans dan Serif oleh Instrument, Martian Mono oleh Evil Martians (SIL OFL).' },
  },

  keys: {
    search: 'Cari tempat',
    suggestions: 'Pindah di antara saran',
    choose: 'Pilih',
    passes: 'Telusuri lintasan',
    photos: 'Citra sebelumnya / berikutnya',
    expand: 'Perbesar citra',
    zoom: 'Perbesar/perkecil di penampil',
    play: 'Putar atau jeda tayangan ulang',
    back: 'Kembali, atau tutup',
    help: 'Halaman ini',
  },
  /** The names printed on Indonesian keyboards' caps */
  keyNames: { enter: 'Enter', space: 'Spasi', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['Dibuat oleh ', link(handle)],
  footerNote: 'Dibuat dari data publik. Tidak satu pun citra ini kami rekam sendiri.',
}

export default about
