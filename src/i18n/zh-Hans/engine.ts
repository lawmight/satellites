/**
 * Simplified Chinese copy the report engine emits (see docs/i18n/zh-Hans.md, Appendix A "Computing and app chrome"):
 * the computing readout's progress rows and the report's footnotes about degraded data.
 *
 * Why the words are these: the rows are an instrument's readouts, verb first where the English has one (正在加载, 推算,
 * 匹配), noun phrases otherwise; they sit in one narrow mono line, so they stay short. Orbits are 条, objects 个在轨物体,
 * images 张, passes 次, and a number is tied to its measure word by U+00A0, so "16,917 个" never splits. "Scenes" are
 * 图像 (场景 is a film or 3D scene, 景 jargon). An archive is 图像库; NASA, NASA GIBS, VIIRS, Sentinel-2, Landsat, Earth
 * Search and Planetary Computer stay as they are. The footnotes quote the results' verdict words in “” (“注视过”,
 * “很可能注视过”), so a reader recognises the verdict the note is about; zh has one plural form, so a note whose English
 * changes with the count changes only where Chinese words do (一张 for "one").
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('zh-Hans')
const NB = ' '
/** "16,917 个在轨物体", "7 天": a grouped count, U+00A0, its measure word (and noun) */
const count = (n: number, unit: string) => `${f.int(n)}${NB}${unit}`

const engine: typeof en = {
  progress: {
    loadingCatalog: '正在加载轨道目录',
    catalog: ({ objects }: { objects: number }) => `目录 · ${count(objects, '个在轨物体')}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) => `推算 ${count(orbits, '条轨道')} · ${count(days, '天')}`,
    propagating: ({ done, total }: { done: number; total: number }) => `正在推算轨道 · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: '正在检索 Sentinel-2 + Landsat 图像库',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) => `匹配 ${count(scenes, '张图像')}与 ${count(passes, '次过境')}`,
    verifyingWeatherStart: '正在核对 NASA 气象拼接图',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `正在核对 NASA 气象拼接图 · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `${count(passes, '次过境')} · ${count(images, '张图像')}`,
  },

  note: {
    archiveSlow: 'Sentinel-2 和 Landsat 图像库响应太慢；过境只根据轨道几何显示。',
    archiveDown: '无法连接 Sentinel-2 和 Landsat 图像库；过境只根据轨道几何显示。',
    sentinel2Thumbnails: 'Sentinel-2 的图像列表来自 Earth Search；部分图像显示的是整幅缩略图，而不是裁剪后的画面。',
    sentinel2EarthSearch: 'Sentinel-2 的图像列表来自 Earth Search（Planetary Computer 检索不可用）。',
    sentinel2Down: 'Sentinel-2 图像库无法连接；Sentinel-2 图像可能缺失。',
    landsatDown: 'Landsat 图像库无法连接；Landsat 图像可能缺失。',
    openOcean: '这个位置不在 Sentinel-2 的成像计划内（开阔海域）。',
    /** "off by" is 误差 (a measurement's error); 相差 would ask "differ from what?". The two notes are worded alike */
    elementsOld: ({ days }: { days: number }) => `轨道根数是 ${count(days, '天')}前的，所以过境时间可能有几分钟误差。`,
    elementsNewer: '这些过境由较新的轨道根数回推得出，所以时间可能有几分钟误差。',
    /** `n` counts down to 1 as late confirmations arrive: "一张" and "那次过境" for one, as the English says "one" */
    gibsUnconfirmed: ({ n }: { n: number }) =>
      n === 1
        ? 'NASA GIBS 没能及时确认一张 VIIRS 图像；VIIRS 每天都对整个地球成像，所以那次过境仍算作“注视过”。'
        : `NASA GIBS 没能及时确认 ${count(n, '张')} VIIRS 图像；VIIRS 每天都对整个地球成像，所以那些过境仍算作“注视过”。`,
    gibsSlowAll: 'NASA GIBS 没有及时响应，所以不显示气象卫星图像。',
    /** `missing` can be 1: 相应的过境 ("the passes concerned") reads for one and for many */
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS 没有及时返回 ${count(total, '张')}气象卫星图像中的 ${count(missing, '张')}；相应的过境显示为“很可能注视过”。`,
    gibsDownAll: '无法连接 NASA GIBS，所以不显示气象卫星图像。',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS 未能返回 ${count(total, '张')}气象卫星图像中的 ${count(missing, '张')}；相应的过境显示为“很可能注视过”。`,
  },
}

export default engine
