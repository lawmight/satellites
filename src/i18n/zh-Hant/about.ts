/**
 * Traditional Chinese copy for the About page (see docs/i18n/zh-Hant.md §1.1, §3.6, §3.7, §8, Appendix A): every
 * heading, paragraph, fact, credit and key.
 *
 * Why it reads this way: About is the owner talking plainly, a shade warmer than the results but still written standard
 * Chinese: 你 and 我們, short answers first (看不到。), no particles, no reassurance. The title, the lede, the section
 * names, the three short answers, the verdicts' longer words and the privacy rows are the guide's final lines, word for
 * word (這一切 / 如何*運作*。: the accent on the verb, so the accent subset carries 運 and 作). The privacy rows promise
 * exactly what the English promises: the stored location is 約 10 km 的大致範圍 (a 0.1° cell, never 見方), Cookie stays
 * Latin, a bot is 自動程式. Sentences join with nothing (sentenceGap ''), so `loaded` follows the CelesTrak paragraph
 * directly and each verdict's longer word follows its definition. A number in running text is tied to its unit or
 * measure word with U+00A0 (`10 km`, `6 小時`), as the landing does, so a wrapped paragraph never strands a unit; the
 * space before the number stays breakable. Product, agency, licence and person names, the key caps and OpenStreetMap's
 * attribution stay as they are. Hong Kong's 日 / 私隱 / 鳴謝 / 屏幕 / 甚麼 / 字體 / 地址 belong to the zh-Hant-HK overlay:
 * §1.4's keys, plus method.sgp4, whose 過去 7 天 is the lede's (noted on the key).
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('zh-Hant')
/** Ties a number to its unit or measure word in running text */
const NB = ' '

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: '關於',
  close: '關閉',
  sectionsLabel: '章節',
  title: [['這一切'], ['如何', accent('運作'), '。']] as Rich[],
  lede: `在地球上選一個地點。我們算出過去 7${NB}天有哪些衛星飛過那裡，再去找出它們拍下的照片。一切都在你的瀏覽器裡完成，用的都是公開資料。`,

  sections: {
    short: '簡單來說',
    method: '我們如何找出過境',
    words: '標籤的意思',
    accuracy: '我們的盲點',
    privacy: '隱私',
    credits: '致謝',
    keys: '鍵盤',
  },

  short: {
    live: {
      term: '是即時的嗎？',
      text: '不完全是。照片在拍攝後幾小時到一兩天才會進入影像庫，所以最新的過境可能還沒有照片。',
    },
    seeMe: {
      term: '它看得到我嗎？',
      text: `看不到。這裡的一個像素最細也有 10${NB}m 寬，一輛車只佔一個像素。畫面裡認不出你。`,
    },
    every: {
      term: '這是全部的衛星嗎？',
      text: '不是。軍事和偵察衛星大多不在公開目錄裡，商業公司也不會說明鏡頭對準哪裡。',
    },
  },

  method: {
    orbits: [
      '每個在軌道上的物體都有一組描述其路徑的公開數字。',
      link('CelesTrak'),
      ` 根據美國太空軍的追蹤資料公開這些數字，我們每 6${NB}小時取得一份最新的。`,
    ] as AboutPart[],
    /** Follows the paragraph above with no space; one form for every count (zh has only `other`), 0 included */
    loaded: (count: number, stamp: string): AboutPart[] => [
      '這個頁面載入了 ',
      num(f.int(count)),
      `${NB}個物體，目錄更新於 `,
      num(stamp),
      '。',
    ],
    /**
     * zh-Hant-HK overlay (§1.4: 日 for every catalog-built day count, as in the lede; §1.4's key list misses this one):
     * `我們用標準軌道模型 SGP4 推算每顆衛星過去 7${NB}日的軌道，記下你選的地點每一次進入它可視範圍的時刻。`
     */
    sgp4: `我們用標準軌道模型 SGP4 推算每顆衛星過去 7${NB}天的軌道，記下你選的地點每一次進入它可視範圍的時刻。`,
    facts: {
      straightDown: {
        term: '正下方',
        text: `Sentinel-2 和 Landsat 直視正下方的一條地面帶，Sentinel-2 約 290${NB}km 寬，Landsat 約 185${NB}km。你必須在這條帶內。`,
      },
      /** Quotes the verdict name (§3.6) in 「」 */
      tilting: {
        term: '可傾斜的鏡頭',
        text: '很多商業衛星能傾斜 30° 至 45°。只要你在它的可轉向範圍內，我們就稱為「或許曾對準這裡」。',
      },
      daylight: { term: '日光', text: '一般相機需要陽光。天黑時的過境不會算作照片。' },
      radar: {
        term: '雷達',
        text: 'Sentinel-1 不需要陽光。它發出微波並記錄回波，所以能穿透雲層、在夜間觀測，視線偏向軌道的一側。它的影像也是公開的，所以我們會以灰階顯示：亮的是粗糙地面和建築物，暗的是平靜的水面。',
      },
      weather: {
        term: '氣象衛星',
        text: `有幾顆定點在赤道上空，每 10${NB}分鐘注視半個地球。只要你在它們那一側，每一張影像都涵蓋你所在的地方。`,
      },
    },
    archives:
      '接著我們搜尋影像庫（Microsoft Planetary Computer、Element 84 和 NASA），把每張影像配對到拍下它的那次過境。你看到的每一張影像都是真的，以你選的地點為中心裁切。',
    photoFacts: {
      touchUps: {
        term: '修飾',
        text: 'Sentinel-2 和 Landsat 的照片經過色彩平衡、平滑和輕微銳化，以適合你的螢幕，整張照片的處理方式都一樣。沒有添加或移除任何東西。',
      },
      whichWayUp: {
        term: '哪邊朝上',
        text: 'Sentinel-2 和 Landsat 的照片沿用影像庫為這個地點使用的地圖網格，所以北方可能偏離正上方幾度。打開照片時，它的 N 箭頭會指出確切方向。',
      },
    },
  },

  /** The guide's longer words (§3.6), said right after each verdict's definition */
  verdictMore: {
    imaged: '我們顯示的，就是真實的影像。',
    likely: '影像還沒公開，或是因為雲太多被捨棄了。',
    could: '我們無從得知它是否真的看了。',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: '確切位置',
      text: `公開的軌道資料精確到約 1${NB}km，而且每天會稍微漂移。時間可能有幾秒誤差。`,
    },
    secret: { term: '秘密衛星', text: '軌道上一些最好的相機屬於軍方。它們不會出現在這裡。' },
    clouds: {
      term: '雲',
      text: '很多照片拍到的只有雲。只要影像庫提供資訊，我們會檢查你選的地點正上方的那個像素，並如實說明。',
    },
    delays: { term: '延遲', text: '照片可能要一兩天才會出現。' },
  },

  /** Exactly what the English promises, no more and no less (§8) */
  privacy: {
    where: { term: '在哪裡運算', text: '軌道計算在你的瀏覽器裡進行。' },
    kept: {
      term: '我們保留什麼',
      text: `我們按城鎮和約 10${NB}km 的大致範圍統計搜尋次數，從不記錄你的精確位置，也會統計哪些內容被開啟和分享。不記錄 IP 位址，沒有我們自己的 Cookie，也沒有任何能把你的兩次造訪連起來的資料。`,
    },
    others: {
      term: '還有誰看得到',
      text: '大多數地名來自網站內建的清單。其他搜尋會送到 Open-Meteo、Photon 或 Nominatim。照片直接從影像庫載入。我們的主機服務會統計瀏覽次數和速度，不使用 Cookie，但可能設定一個安全 Cookie 來分辨真人和自動程式。我們從不讀取它。',
    },
    links: {
      term: '分享連結',
      text: `只在你分享時才會建立。任何拿到連結的人都會看到地名、取整到約 1${NB}km 的位置，以及你選的那次過境。`,
    },
  },

  credits: {
    madeBy: { who: '製作', text: (handle: string): AboutPart[] => ['Armaan，X 上的 ', link(handle)] },
    support: { who: '支持', text: [link('幫 Watched 保持免費 :)')] as AboutPart[] },
    gibs: '影像來自 NASA 的 GIBS（EOSDIS 的一部分）。GOES 經由 NOAA 和 CIRA，Himawari 經由 JMA。',
    archives: {
      who: '影像庫',
      text: `Microsoft Planetary Computer 和 Element 84 Earth Search；Landsat 的 15${NB}m 波段來自 Copernicus Data Space Ecosystem。`,
    },
    orbits: { who: '軌道', text: '軌道根數來自 CelesTrak。SGP4 由 satellite.js 提供。' },
    /** OpenStreetMap's attribution stays in the words it prescribes */
    placeNames: { who: '地名', text: 'Photon by komoot。地圖資料 © OpenStreetMap contributors (ODbL)。' },
    textures: { who: '地球貼圖', text: 'Solar System Scope（CC BY 4.0），來自 NASA Blue Marble 和 Black Marble。' },
    type: { who: '字型', text: 'Instrument Sans 和 Serif 由 Instrument 設計，Martian Mono 由 Evil Martians 設計（SIL OFL）。' },
  },

  keys: {
    search: '搜尋地點',
    suggestions: '在建議中移動',
    choose: '選擇',
    passes: '逐次切換過境',
    photos: '上一張／下一張',
    expand: '放大影像',
    zoom: '縮放（放大後）',
    play: '開始或暫停重播',
    back: '返回或關閉',
    help: '本頁',
  },
  /** The key caps as keyboards in both regions print them (空白鍵 / 空格鍵 split the regions) */
  keyNames: { enter: 'Enter', space: 'Space', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['由 ', link(handle), ' 製作'],
  footerNote: '以公開資料製作。這些照片都不是我們拍的。',
}
export default about
