/**
 * Traditional Chinese copy the report engine emits (see docs/i18n/zh-Hant.md §4.1, §5.3, Appendix A): the computing
 * readout's progress rows and the report's footnotes about degraded data.
 *
 * Why the words are these: the progress rows are mono instrument lines in a narrow column, so they are nouns and short
 * verb phrases with each count as number + counter + noun (`16,893 個物體`, `412 條軌道`, `12 張影像`, `31 次過境`): zh
 * has one plural category, so every count is one form, and nothing is spelled out. Orbital elements are 軌道根數 in
 * readouts and 軌道資料 in prose; scenes are 影像 (never 場景); the archives are 影像庫. The footnotes quote the verdict
 * titles exactly (注視過, 很可能注視過), and say 相關過境 so one sentence reads for one pass or many. Names (NASA GIBS,
 * VIIRS, Sentinel-2, Landsat, Earth Search, Planetary Computer) stay as they are, spaced from Han by one space.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('zh-Hant')

const engine: typeof en = {
  progress: {
    loadingCatalog: '正在載入軌道目錄',
    catalog: ({ objects }: { objects: number }) => `目錄 · ${f.int(objects)} 個物體`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) => `推算 ${f.int(orbits)} 條軌道 · ${f.int(days)} 天`,
    propagating: ({ done, total }: { done: number; total: number }) => `推算軌道 · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: '正在搜尋 Sentinel-2 + Landsat 影像庫',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) => `配對 ${f.int(scenes)} 張影像與 ${f.int(passes)} 次過境`,
    verifyingWeatherStart: '正在核對 NASA 氣象拼接影像',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `正在核對 NASA 氣象拼接影像 · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `${f.int(passes)} 次過境 · ${f.int(images)} 張影像`,
  },

  note: {
    archiveSlow: 'Sentinel-2 和 Landsat 影像庫回應太慢；過境僅依軌道幾何推算。',
    archiveDown: '無法連上 Sentinel-2 和 Landsat 影像庫；過境僅依軌道幾何推算。',
    sentinel2Thumbnails: 'Sentinel-2 經由 Earth Search 列出；部分影像只能顯示整幅縮圖，無法裁切。',
    sentinel2EarthSearch: 'Sentinel-2 經由 Earth Search 列出（Planetary Computer 搜尋無法使用）。',
    sentinel2Down: '無法連上 Sentinel-2 影像庫；可能缺少 Sentinel-2 影像。',
    landsatDown: '無法連上 Landsat 影像庫；可能缺少 Landsat 影像。',
    openOcean: '這個地點在 Sentinel-2 的觀測計畫之外（遠洋）。',
    /** `days` is 3 or more */
    elementsOld: ({ days }: { days: number }) => `軌道資料已是 ${f.int(days)} 天前的，過境時間可能有幾分鐘誤差。`,
    elementsNewer: '這些過境是用較新的軌道資料重建的，時間可能有幾分鐘誤差。',
    /** 相關過境 reads for one pass and for many, so the count down to 1 needs no second form */
    gibsUnconfirmed: ({ n }: { n: number }) =>
      `NASA GIBS 未能及時確認 ${f.int(n)} 張 VIIRS 影像；VIIRS 每天拍遍全球，所以相關過境仍算作注視過。`,
    gibsSlowAll: 'NASA GIBS 沒有及時回應，所以不顯示氣象衛星影像。',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS 未能及時傳回 ${f.int(total)} 張氣象衛星影像中的 ${f.int(missing)} 張；相關過境顯示為很可能注視過。`,
    gibsDownAll: '無法連上 NASA GIBS，所以不顯示氣象衛星影像。',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS 有 ${f.int(missing)} 張氣象衛星影像（共 ${f.int(total)} 張）沒有傳回；相關過境顯示為很可能注視過。`,
  },
}

export default engine
