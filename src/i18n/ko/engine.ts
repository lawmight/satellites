/**
 * Korean copy the report engine emits (see docs/i18n/ko.md §3.7 "engine"): the computing readout's progress rows and
 * the footnotes about degraded data.
 *
 * Why the words are these: a progress row is one mono line of about 22 Hangul syllables plus digits on a 390 px phone,
 * so rows are status nouns ending in 중 (궤도 412개 계산 중), with no particle, and each count is written noun first with
 * its counter attached (물체 16,917개, 장면 12개, 통과 31회, 이미지 29장): objects, orbits and scenes are 개, passes
 * 회, images 장. "Propagating" is 계산 (전파 is opaque to most readers), a weather mosaic is 기상 합성 이미지 (모자이크
 * means censorship blurring). The footnotes say what failed, then what that means for the numbers, in 한다체 with no
 * apology; they quote the verdict titles in ‘ ’ exactly as ./verdicts.ts writes them (‘지켜봤다’, ‘아마 지켜봤다’), and
 * 해당 통과 stands for both "that pass" and "those passes", since ko has one plural form. A "k of n" count puts the total
 * first (35장 중 12장). Fixed names take the particle their Korean reading needs (NASA GIBS가, Sentinel-2와 Landsat).
 */
import type en from '../en/engine'
import { fmt } from '../../../api/_lib/i18n/format'

const f = fmt('ko')

const engine: typeof en = {
  progress: {
    loadingCatalog: '궤도 카탈로그 불러오는 중',
    /** "카탈로그 · 물체 16,917개" (catalog objects are 물체, counted in 개) */
    catalog: ({ objects }: { objects: number }) => `카탈로그 · 물체 ${f.int(objects)}개`,
    propagateStart: ({ orbits, days }: { orbits: number; days: number }) => `궤도 ${f.int(orbits)}개 계산 중 · ${f.int(days)}일`,
    propagating: ({ done, total }: { done: number; total: number }) => `궤도 계산 중 · ${f.int(done)} / ${f.int(total)}`,
    searchingArchives: 'Sentinel-2 + Landsat 아카이브 검색 중',
    /** "장면 12개와 통과 31회 대조 중": 개 ends in a vowel, so 와 is fixed */
    matching: ({ scenes, passes }: { scenes: number; passes: number }) => `장면 ${f.int(scenes)}개와 통과 ${f.int(passes)}회 대조 중`,
    verifyingWeatherStart: 'NASA 기상 합성 이미지 확인 중',
    /** The running count stands in for 중 (the row is already at its width budget) */
    verifyingWeather: ({ settled, total }: { settled: number; total: number }) =>
      `NASA 기상 합성 이미지 확인 · ${f.int(settled)} / ${f.int(total)}`,
    done: ({ passes, images }: { passes: number; images: number }) => `통과 ${f.int(passes)}회 · 이미지 ${f.int(images)}장`,
  },

  note: {
    archiveSlow: 'Sentinel-2와 Landsat 아카이브의 응답이 너무 늦어, 통과는 궤도 계산만으로 보여 준다.',
    archiveDown: 'Sentinel-2와 Landsat 아카이브에 연결하지 못해, 통과는 궤도 계산만으로 보여 준다.',
    sentinel2Thumbnails: 'Sentinel-2 목록은 Earth Search에서 받았다. 일부 장면은 잘라 낸 부분이 아니라 장면 전체의 작은 이미지로 보인다.',
    sentinel2EarthSearch: 'Sentinel-2 목록은 Earth Search에서 받았다(Planetary Computer 검색 불가).',
    sentinel2Down: 'Sentinel-2 아카이브에 연결할 수 없다. Sentinel-2 이미지가 빠졌을 수 있다.',
    landsatDown: 'Landsat 아카이브에 연결할 수 없다. Landsat 이미지가 빠졌을 수 있다.',
    openOcean: '이 지점은 Sentinel-2의 관측 계획 밖(먼바다)이다.',
    elementsOld: ({ days }: { days: number }) => `궤도 요소가 ${f.int(days)}일 전 것이어서, 통과 시각이 몇 분 어긋날 수 있다.`,
    elementsNewer: '이 통과들은 그 뒤에 나온 궤도 요소로 다시 계산했다. 그래서 시각이 몇 분 어긋날 수 있다.',
    /** One form for every count, 1 included: 해당 통과 covers "that pass" and "those passes". 관측한다: "images" is a verb */
    gibsUnconfirmed: ({ n }: { n: number }) =>
      `NASA GIBS가 VIIRS 이미지 ${f.int(n)}장을 제때 확인하지 못했다. VIIRS는 날마다 지구 전체를 관측하므로, 해당 통과는 ‘지켜봤다’로 센다.`,
    gibsSlowAll: 'NASA GIBS가 제때 응답하지 않아 기상위성 이미지는 보여 주지 않는다.',
    gibsSlowSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS가 기상위성 이미지 ${f.int(total)}장 중 ${f.int(missing)}장을 제때 보내지 않았다. 해당 통과는 ‘아마 지켜봤다’로 보여 준다.`,
    gibsDownAll: 'NASA GIBS에 연결할 수 없어 기상위성 이미지는 보여 주지 않는다.',
    gibsDownSome: ({ missing, total }: { missing: number; total: number }) =>
      `NASA GIBS가 기상위성 이미지 ${f.int(total)}장 중 ${f.int(missing)}장을 보내지 못했다. 해당 통과는 ‘아마 지켜봤다’로 보여 준다.`,
  },
}
export default engine
