/**
 * Simplified Chinese copy for the About page (see docs/i18n/zh-Hans.md §1.1, §3.7, §3.8, §8): every heading,
 * paragraph, fact, credit and key.
 *
 * Why it reads this way: About is the owner talking plainly, so it is conversational written Mandarin, 我们 and 你,
 * short answers ("不能。"), never cuter than the results. The title, the lede, the section names, the three short
 * answers, the footer and the verdicts' longer words are the guide's final lines, word for word (这一切 / 如何*运作*。,
 * the accent on the verb). Radar 成像, it is never 拍下; a picture of any kind is 图像, an optical one 照片; "track" is
 * 追踪, never 跟踪. The privacy rows say what is kept and no more. Sentences join with nothing (sentenceGap ''), so the
 * catalog line `loaded` follows the CelesTrak paragraph directly. A number and its measure word or unit are tied with
 * U+00A0 (`7 天`, `10 m`); a year touches its Han (自2015年起). Credits keep every product, agency and person's name,
 * and OpenStreetMap's attribution is the form its Chinese guidelines give (© OpenStreetMap 贡献者).
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('zh-Hans')
const NB = ' '

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: '关于',
  close: '关闭',
  sectionsLabel: '章节',
  title: [['这一切'], ['如何', accent('运作'), '。']] as Rich[],
  lede: '在地球上选一个点。我们算出过去一周有哪些卫星从那里上空飞过，再去找它们拍下的照片。一切都在你的浏览器里运行，用的全是公开数据。',

  sections: {
    short: '简要说明',
    method: '我们如何找出过境',
    words: '标签的含义',
    accuracy: '我们的盲区',
    privacy: '隐私',
    credits: '致谢',
    keys: '键盘',
  },

  short: {
    live: {
      term: '是实时的吗？',
      text: '不完全是。照片拍下后，要过几个小时到一两天才会进入图像库，所以最新的几次过境可能还没有照片。',
    },
    seeMe: { term: '它能看见我吗？', text: `不能。这里最清晰的图像，一个像素也有 10${NB}m 宽。一辆车只占一个像素。画面里认不出你。` },
    every: {
      term: '这是全部卫星吗？',
      text: '不是。军用卫星和侦察卫星大多不在公开目录里，商业公司也不会说它们的相机对准了哪里。',
    },
  },

  method: {
    orbits: [
      '每个在轨物体都有一组公开的数字，用来描述它的轨道。',
      link('CelesTrak'),
      ` 根据美国太空军的追踪数据发布这些数字，我们每 6${NB}小时更新一次。`,
    ] as AboutPart[],
    /** Follows the paragraph above with no space between sentences; an empty catalog is its own sentence, never "0 个" */
    loaded: (count: number, stamp: string): AboutPart[] =>
      count > 0
        ? ['这个页面加载了 ', num(f.int(count)), `${NB}个在轨物体，获取于 `, num(stamp), '。']
        : ['这个页面加载的轨道目录获取于 ', num(stamp), '，里面没有在轨物体。'],
    sgp4: `我们用标准轨道模型 SGP4 推算每颗卫星过去 7${NB}天的轨迹。你选的地点每次进入它的可视范围，我们都会记下来。`,
    facts: {
      straightDown: {
        term: '垂直向下',
        text: `Sentinel-2 和 Landsat 垂直俯视地面上的一条成像带，宽度分别约为 290${NB}km 和 185${NB}km。你得在这条带里。`,
      },
      tilting: {
        term: '可转向相机',
        text: '不少商业卫星能倾斜 30° 至 45°。如果你在卫星够得着的范围内，我们就称之为“能对准这里”。',
      },
      daylight: { term: '日光', text: '普通相机需要阳光。天黑时的过境从不算作照片。' },
      radar: {
        term: '雷达',
        text: 'Sentinel-1 不需要阳光。它发出微波并记录回波，所以能穿透云层，也不受黑夜影响；成像时，视线偏向轨道的一侧。它的图像同样公开，所以我们也展示出来，用灰度呈现：亮处是粗糙的地面和建筑，暗处是平静的水面。',
      },
      weather: {
        term: '气象卫星',
        text: `有几颗悬在赤道上空，每 10${NB}分钟把半个地球扫描一遍。只要你在朝向它们的那半边地球上，每一帧里都有你。`,
      },
    },
    archives:
      '然后我们检索各图像库（Microsoft Planetary Computer、Element 84 和 NASA），把每张图像与获取它的那次过境对应起来。你看到的每张图像都是真实的，只是以你选的位置为中心裁剪过。',
    photoFacts: {
      touchUps: {
        term: '画面处理',
        text: 'Sentinel-2 和 Landsat 的照片会针对你的屏幕做色彩平衡、平滑和轻度锐化，整幅画面的处理方式完全相同。画面里没有添加或去掉任何东西。',
      },
      whichWayUp: {
        term: '哪边朝上',
        text: 'Sentinel-2 和 Landsat 的照片沿用图像库为这个地方划分的地图网格，所以北方可能偏离正上方几度。打开照片时，它的 N 箭头会准确标出北方。',
      },
    },
  },

  /** The guide's longer words (§3.7), said after each verdict's definition */
  verdictMore: {
    imaged: '我们展示的就是真实的图像。',
    likely: '照片还没有公开，或者因为云太多被丢弃了。',
    could: '它到底有没有对准过这里，没有办法知道。',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: '精确位置',
      text: `公开的轨道数据精度在 1${NB}km 左右，而且每天都会漂移一点。时间可能差几秒。`,
    },
    secret: { term: '保密卫星', text: '轨道上最好的一些相机属于军方。它们不会出现在这里。' },
    clouds: {
      term: '云层',
      text: '不少照片拍到的只是云。只要图像库提供了云的信息，我们就会检查你选的位置上方的那个像素，并告诉你结果。',
    },
    delays: { term: '延迟', text: '照片可能要过一两天才会出现。' },
  },

  /** Exactly what the English promises, no more and no less (§8) */
  privacy: {
    where: { term: '在哪里运行', text: '轨道计算都在你的浏览器里完成。' },
    kept: {
      term: '我们保存什么',
      text: `我们按城镇和约 10${NB}km 的大致区域统计搜索，从不记录你的确切位置；我们也统计打开和分享了哪些内容。不记录 IP 地址，不设我们自己的 Cookie，也没有任何能把你的两次访问联系起来的信息。`,
    },
    others: {
      term: '还有谁能看到',
      text: '大多数地名来自网站内置的列表，其他搜索会发给 Open-Meteo、Photon 或 Nominatim。照片直接从各图像库加载。我们的托管服务商不借助 Cookie 统计页面浏览量和加载速度，但可能会设置一个安全 Cookie，用来区分真人和机器人。我们从不读取这个 Cookie。',
    },
    links: {
      term: '分享链接',
      text: `只在你分享时才会生成。任何拿到链接的人都能看到地名、一个精度约 1${NB}km 的位置，以及你选的那次过境。`,
    },
  },

  credits: {
    madeBy: { who: '制作', text: (handle: string): AboutPart[] => ['Armaan，X 上的 ', link(handle)] },
    support: { who: '支持', text: [link('帮 Watched 保持免费 :)')] as AboutPart[] },
    gibs: '图像来自 NASA 的 GIBS（EOSDIS 的一部分）。GOES 图像来自 NOAA 和 CIRA，Himawari 图像来自 JMA。',
    archives: {
      who: '图像库',
      text: `Microsoft Planetary Computer 和 Element 84 Earth Search；Landsat 的 15${NB}m 全色波段来自 Copernicus Data Space Ecosystem。`,
    },
    orbits: { who: '轨道', text: '轨道根数来自 CelesTrak。SGP4 由 satellite.js 实现。' },
    placeNames: { who: '地名', text: 'Photon，由 komoot 开发。地图数据 © OpenStreetMap 贡献者（ODbL）。' },
    textures: { who: '地球纹理', text: 'Solar System Scope（CC BY 4.0），基于 NASA 的 Blue Marble 和 Black Marble。' },
    type: { who: '字体', text: 'Instrument Sans 和 Instrument Serif 由 Instrument 设计，Martian Mono 由 Evil Martians 设计（SIL OFL）。' },
  },

  keys: {
    search: '搜索地点',
    suggestions: '在候选地点之间移动',
    choose: '选择',
    passes: '逐一查看过境',
    photos: '上一张 / 下一张图像',
    expand: '查看大图',
    zoom: '缩放（查看大图时）',
    play: '播放或暂停回放',
    back: '返回或关闭',
    help: '这个页面',
  },
  /** Chinese keyboards print Enter and Esc; the space bar is called 空格 */
  keyNames: { enter: 'Enter', space: '空格', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['由 ', link(handle), ' 制作'],
  footerNote: '由公开数据制作。这些照片没有一张是我们拍的。',
}
export default about
