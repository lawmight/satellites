/**
 * Japanese copy the report engine emits (see docs/i18n/ja.md §3.7 "engine"): the computing readout's progress lines
 * and the footnotes about degraded data.
 *
 * Why the words are these: the readout is one mono line of about 20 full-width glyphs, so its rows are nouns ending in
 * 中 (軌道を計算中), with the count before its counter (衛星400基, シーン12件, 通過31回, 画像29枚) and no space between
 * them. "Propagating" is 計算 (軌道伝播 is correct but opaque to most readers). The footnotes say what failed, then what
 * that means for the numbers, in plain form with no apology; they quote the verdict titles in 「」 exactly as
 * ./verdicts.ts writes them (「見ていた」, 「おそらく見ていた」). 該当する stands for both "that pass" and "those
 * passes", since Japanese has one plural form, and a "k of n" count puts the total first (35枚のうち12枚). Proper
 * names stay as they are and take particles directly: NASA GIBSは, Sentinel-2とLandsat.
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ja')

const engine: typeof en = {
  progress: {
    loadingCatalog: '軌道カタログを読み込み中',
    /** "カタログ · 物体数 16,912": the HUD's readout word for catalog objects */
    catalog: ({ objects }: { objects: number }) => `カタログ · 物体数 ${f.int(objects)}`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) => `衛星${f.int(orbits)}基の軌道を計算中 · ${f.int(days)}日間`,
    propagating: ({ done, total }: { done: number; total: number }) => `軌道を計算中 · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Sentinel-2とLandsatのアーカイブを検索中',
    matching: ({ scenes, passes }: { scenes: number; passes: number }) => `シーン${f.int(scenes)}件を通過${f.int(passes)}回と照合中`,
    /** A daily mosaic is 日別画像; in this one line "NASA's weather pictures" says it in fewer glyphs */
    verifyingWeatherStart: 'NASAの気象画像を確認中',
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) => `NASAの気象画像を確認中 · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `通過${f.int(passes)}回 · 画像${f.int(images)}枚`,
  },

  note: {
    archiveSlow: 'Sentinel-2とLandsatのアーカイブの応答が遅すぎたため、通過は軌道計算のみで示している。',
    archiveDown: 'Sentinel-2とLandsatのアーカイブに接続できなかったため、通過は軌道計算のみで示している。',
    sentinel2Thumbnails: 'Sentinel-2はEarth Searchから取得した。一部のシーンは切り抜きではなく、シーン全体の縮小画像で表示している。',
    sentinel2EarthSearch: 'Sentinel-2はEarth Searchから取得した（Planetary Computerの検索が利用できないため）。',
    sentinel2Down: 'Sentinel-2のアーカイブに接続できず、Sentinel-2の画像が欠けている可能性がある。',
    landsatDown: 'Landsatのアーカイブに接続できず、Landsatの画像が欠けている可能性がある。',
    openOcean: 'この地点はSentinel-2の観測計画の範囲外（外洋）。',
    elementsOld: ({ days }: { days: number }) => `軌道要素は${f.int(days)}日前のもので、通過時刻は数分ずれることがある。`,
    elementsNewer: 'これらの通過は、その後に公開された軌道要素から再構成したもので、時刻が数分ずれることがある。',
    /** One form for every count (1 included): 該当する covers "that pass" and "those passes" */
    gibsUnconfirmed: ({ n }: { n: number }) =>
      `NASA GIBSはVIIRSの画像${f.int(n)}枚の確認に時間がかかった。VIIRSは毎日地球全体を観測しているため、該当する通過は「見ていた」に数えている。`,
    gibsSlowAll: 'NASA GIBSが時間内に応答しなかったため、気象衛星の画像は表示していない。',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBSは気象衛星の画像${f.int(total)}枚のうち${f.int(missing)}枚を時間内に返さなかった。該当する通過は「おそらく見ていた」として示している。`,
    gibsDownAll: 'NASA GIBSに接続できなかったため、気象衛星の画像は表示していない。',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBSは気象衛星の画像${f.int(total)}枚のうち${f.int(missing)}枚を返せなかった。該当する通過は「おそらく見ていた」として示している。`,
  },
}
export default engine
