/**
 * Japanese copy for the About page (see docs/i18n/ja.md §1.1, §1.4, §3.5, §3.7, §8): every heading, paragraph, fact,
 * credit and key.
 *
 * Why it reads this way: About is the long-form register, plain form (常体) and a little conversational, so its
 * questions end in ？ and its answers are short (見えない。違う。). It starts from the guide's reference lines (§3.7): the
 * title このサイトの／*仕組み*。 (the accent on 仕組み alone, the full stop outside it), the three short answers, the
 * privacy rows, the keys and the footer word for word. Where a reference line read wrong on the page, native review
 * rewrote it, and the guide's own rules decide: CelesTrak publishes but このサイト fetches (a zero subject after a
 * て-join would make CelesTrak do both); the radar images are shown because they are public, and grey is a separate
 * sentence; no それ / それら for "it" / "they" (§2.4); two names are AとB (§5.4), and the font licence and the
 * textures' source are sentences of their own, so neither reads as one more name in a list. "We" otherwise has no
 * subject at all (保存するもの, 数えている); 私たち appears only where a contrast needs it (その中身を私たちが読むことはない。),
 * and あなた only in the one sanctioned answer (あなたの姿は写らない。). A verdict is quoted by its exact title in 「」
 * (「向ければ見えた」と呼ぶ). verdictMore is read straight after each verdict's definition (§3.5), so it refers back to it
 * instead of repeating it (確かめる方法もない。, not a second 実際に見たかどうか). Privacy says what the English says and
 * nothing more: never 匿名 or 安心. Sentences join with nothing (sentenceGap ''), so `loaded` (このページは…) follows
 * the CelesTrak paragraph directly. A number and its counter touch (6時間, 宇宙物体16,893個); a number and an SI unit
 * keep one no-break space (10 m); prose ranges take 〜 (U+301C). Credits keep every product, agency, licence and
 * person's name, JMA is 気象庁, and OpenStreetMap's attribution stays in English, as its guidelines word it.
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('ja')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: '概要',
  close: '閉じる',
  sectionsLabel: 'セクション',
  /** Two display lines, the accent on 仕組み alone and the full stop outside it; the parts touch. */
  title: [['このサイトの'], [accent('仕組み'), '。']] as Rich[],
  lede: '地球上の好きな地点を選ぶと、過去1週間にその上空を通った衛星を割り出し、それぞれが撮った画像を探しに行く。すべてブラウザの中で、公開データだけを使って動いている。',

  sections: {
    short: '要点',
    method: '通過の求め方',
    words: 'ラベルの意味',
    accuracy: '見えないもの',
    privacy: 'プライバシー',
    credits: 'クレジット',
    keys: 'キーボード',
  },

  short: {
    live: {
      term: 'リアルタイム？',
      text: '完全にではない。画像がアーカイブに届くのは撮られてから数時間〜2日後なので、最新の通過にはまだ画像がないことがある。',
    },
    seeMe: { term: '自分の姿は見える？', text: '見えない。いちばん細かくても1ピクセルは10 m。車は1ピクセルに収まる。あなたの姿は写らない。' },
    every: {
      term: 'これで全部の衛星？',
      text: '違う。軍事衛星や偵察衛星の多くは公開カタログに載っていないし、企業はカメラをどこに向けたかを明かさない。',
    },
  },

  method: {
    orbits: [
      '軌道上のすべての物体には、その経路を表す公開の数値がある。',
      link('CelesTrak'),
      'が米宇宙軍の追跡データから公開している。このサイトは、その最新版を6時間ごとに取得している。',
    ] as AboutPart[],
    /**
     * Follows the paragraph above with no space between sentences. The count is mono with 個 right after it; the stamp
     * reads like the HUD's readout (取得 2026-11-08 03:34Z) inside prose parentheses. An empty catalog gets its own
     * sentence, never 0個.
     */
    loaded: (count: number, stamp: string): AboutPart[] =>
      count > 0
        ? ['このページは宇宙物体', num(f.int(count)), '個を読み込んだ（取得 ', num(stamp), '）。']
        : ['このページが読み込んだ宇宙物体はない（取得 ', num(stamp), '）。'],
    sgp4: '各衛星を標準の軌道モデルSGP4で過去7日間ぶん計算し、この地点が見える範囲に入った時刻をすべて記録する。',
    facts: {
      straightDown: {
        term: '真下を見る',
        text: 'Sentinel-2とLandsatは真下の帯状の地面を見る。幅はSentinel-2が約290 km、Landsatが約185 km。この帯の外は写らない。',
      },
      /** Quotes the could verdict's exact title (§3.5) */
      tilting: {
        term: '傾くカメラ',
        text: '多くの商業衛星はカメラを30〜45°傾けられる。その届く範囲にいた場合を、「向ければ見えた」と呼ぶ。',
      },
      daylight: { term: '日中', text: '普通のカメラには太陽が必要。暗いなかの通過は、写真として数えない。' },
      radar: {
        term: 'レーダー',
        text: 'Sentinel-1に太陽はいらない。マイクロ波を出してその反射を記録するので、雲を通して、夜でも見える。見るのは軌道の片側。画像も公開されているので表示する。グレーの画像で、明るいのは凹凸のある地面や建物、暗いのは静かな水面。',
      },
      weather: {
        term: '気象衛星',
        text: '何基かは赤道の上空にとどまり、10分ごとに地球の半分を見ている。衛星から見える側にいれば、どのフレームにも入っている。',
      },
    },
    archives:
      '次に画像アーカイブ（Microsoft Planetary Computer、Element 84、NASA）を検索し、見つかった画像を、それぞれ撮られた通過と照合する。表示する画像はどれも実際の画像で、この地点の周りを切り抜いたもの。',
    photoFacts: {
      touchUps: {
        term: '補正',
        text: 'Sentinel-2とLandsatの写真は、画面向けに色を整え、ノイズを抑え、軽くシャープにしている。処理は画像全体に同じようにかけ、何も足さず、何も消さない。',
      },
      whichWayUp: {
        term: '上はどちらか',
        text: 'Sentinel-2とLandsatの写真はアーカイブの地図グリッドのままなので、北が真上から数度ずれることがある。画像を開くと、N矢印が正確な北を示す。',
      },
    },
  },

  /**
   * Said straight after each verdict's definition (§3.5), with no gap between sentences, so each refers back to it
   * rather than repeating its words: その画像 is the definition's 実際の画像, the likely line gives only the two
   * reasons, and the could line answers 運用者は明かしていない with も.
   */
  verdictMore: {
    imaged: '表示するのは、その画像そのもの。',
    likely: '公開待ちか、雲が多くて破棄されたかのどちらか。',
    could: '確かめる方法もない。',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: '正確な位置',
      text: '公開の軌道データの誤差は約1 kmで、日ごとに少しずつ大きくなる。時刻は数秒ずれることがある。',
    },
    secret: { term: '秘密の衛星', text: '軌道上で最も高性能なカメラのいくつかは軍のもので、ここには出てこない。' },
    clouds: {
      term: '雲',
      text: '雲しか写っていない写真は多い。アーカイブが雲の情報を返すときは、この地点にあたるピクセルを確かめ、結果を表示する。',
    },
    delays: { term: '遅れ', text: '画像が出てくるまで1〜2日かかることがある。' },
  },

  /** Exactly what the English promises, no more and no less (§8) */
  privacy: {
    where: { term: 'どこで動くか', text: '軌道はブラウザの中で計算している。' },
    kept: {
      term: '保存するもの',
      text: '検索は町ごと、約10 km四方の区画ごとに数え、正確な地点は記録しない。何が開かれ、共有されたかも集計している。IPアドレスも、独自のCookieも、訪問どうしを結びつけるものも残さない。',
    },
    others: {
      term: 'ほかに見るのは誰か',
      text: '地名の多くはサイトに組み込んだ一覧から出す。それ以外の検索はOpen-Meteo、Photon、Nominatimに送られる。画像はアーカイブから直接読み込む。ホスティング会社はCookieなしでページビューと速度を数え、人とボットを見分けるためにセキュリティ用のCookieを1つ設定することがある。その中身を私たちが読むことはない。',
    },
    links: {
      term: '共有リンク',
      text: '作られるのは何かを共有したときだけ。リンクを持つ人には、地名、約1 kmに丸めた地点、選んだ通過が見える。',
    },
  },

  /**
   * Names stay as written; only the joining words are Japanese (§3.7, §8). Two names are AとB (§5.4); what applies to
   * a whole line (the font licence, the textures' NASA source) is its own short sentence, not one more list item.
   */
  credits: {
    madeBy: { who: '制作', text: (handle: string): AboutPart[] => ['Armaan、Xの', link(handle)] },
    support: { who: '支援', text: [link('Watchedの無料運営を応援する :)')] as AboutPart[] },
    gibs: '画像はNASAのGIBS（EOSDISの一部）から。GOESはNOAAとCIRA経由、Himawariは気象庁経由。',
    archives: {
      who: 'アーカイブ',
      text: 'Microsoft Planetary ComputerとElement 84 Earth Search。Landsatの15 mバンドはCopernicus Data Space Ecosystemから。',
    },
    orbits: { who: '軌道', text: 'CelesTrakの軌道要素。SGP4はsatellite.js。' },
    /** OpenStreetMap's attribution line stays in English, as its guidelines word it (§8) */
    placeNames: { who: '地名', text: 'Photon（komoot）。Map data © OpenStreetMap contributors (ODbL).' },
    textures: { who: '地球のテクスチャ', text: 'Solar System Scope（CC BY 4.0）。元はNASAのBlue MarbleとBlack Marble。' },
    type: { who: '書体', text: 'Instrument SansとInstrument Serif（Instrument）、Martian Mono（Evil Martians）。ライセンスはSIL OFL。' },
  },

  keys: {
    search: '場所を検索',
    suggestions: '候補を移動',
    choose: '決定',
    passes: '通過を順に見る',
    photos: '前 / 次の画像',
    expand: '画像を拡大',
    zoom: 'ズーム（拡大表示中）',
    play: 'リプレイの再生 / 一時停止',
    back: '戻る / 閉じる',
    help: 'このページ',
  },
  /** Japanese keyboards print Enter and Esc; the space bar is スペース */
  keyNames: { enter: 'Enter', space: 'スペース', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['制作 ', link(handle)],
  footerNote: '公開データから作った。ここにある画像は、どれも私たちが撮ったものではない。',
}
export default about
