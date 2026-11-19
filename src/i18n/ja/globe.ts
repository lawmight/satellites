/**
 * Japanese copy for the globe's own words (see docs/i18n/ja.md §2.3, §3.7, §5.1, §6.4): the satellite callouts, the
 * capture line, the acquisition countdown, the dropped pin's card and the note shown when there is no 3D view.
 *
 * Why it reads this way: the callouts are instrument readouts, so each is a kanji noun before its value: 撮像 ("imaged",
 * the one place the guide allows the word), 取得 for the moment of acquisition, 最接近 for closest approach (a moment,
 * never a distance). "≈" stays in mono (ごろ is for prose). Units are the lowercase Latin symbols (km, m), which the
 * capitals leave as they are (api/_lib/i18n/units.ts). The altitude slot is handed back as the very part it was given
 * (the frame loop finds it by identity). Place and satellite names are data: particles attach straight to them, with
 * no quotes, suffix or pronoun. The spoken pin lines state what happened, then one 〜できる for what the reader can do
 * next.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('ja')

/** What the pin's arrow does, said after it drops. */
const NEXT = 'Enterか矢印ボタンで、上空を通ったものを表示できる。'

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  imaged: (clock: string, zone: string) => `撮像 ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `撮像 ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `取得 ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `取得 ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `取得 · ${satellite}`,
  closestApproachOf: (satellite: string) => `最接近 · ${satellite}`,
  acquiredNow: '取得',
  closestApproachNow: '最接近',

  pin: {
    card: '立てたピン',
    /** 6 glyphs: fits the 156 px column at 13 px. */
    naming: '地名を確認中',
    /** 7 glyphs: fits the 156 px column whole. */
    noName: '近くに地名なし',
    /** Both parts are the geocoder's data ("Waterloo", "Ontario, Canada"), joined as a "where" line is: name first. */
    placeTitle: (name: string, area: string) => `${name}、${area}`,
    searchAria: (place: string) => `${place}の上空を通ったものを表示`,
    searchTitle: 'ここを検索(Enter)',
    removeAria: 'ピンを外す',
    removeTitle: 'ピンを外す(Esc)',
    moveHint: '地球儀を長押しして移動',
    droppedAt: (coords: string) => `${coords}にピンを立てた。`,
    droppedIn: (place: string) => `${place}にピンを立てた。${NEXT}`,
    droppedUnnamed: `ピンを立てた。${NEXT}`,
  },

  noGl: {
    title: '3D表示は利用できない',
    reason: 'このブラウザではWebGL 2がオフ',
  },
}
export default globe
