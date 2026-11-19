/**
 * Korean copy for the globe's own words (see docs/i18n/ko.md §2.3, §3.7 globe, §4, §5.1, §6.4): the satellite
 * callouts, the capture line, the acquisition countdown, the dropped pin's card and the note shown when there is no 3D
 * view.
 *
 * Why it reads this way: the callouts are instrument readouts, so each is a Sino-Korean noun before its value: 포착 for
 * the moment a picture is acquired (the one place the guide allows it, mono readouts only, never in a sentence) and
 * 최근접 for closest approach (a moment, never a distance). "≈" stays in mono (쯤 is for prose). Units are written in
 * lowercase as Korean writes them (10 m, 2 km, 786 km) and stay so in the capitals CSS gives the Latin, as in English
 * (api/_lib/i18n/units.ts). The altitude slot is handed back as the very part it was given (the frame loop finds it by
 * identity). A place or coordinates in a sentence take only invariant particles (에, 상공을 after the buffer 상공), so
 * no particle has to agree with a name in any script. The spoken pin lines say what happened, then
 * what pressing Enter does as a conditional (-면 … 보인다), never a command.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('ko')

/** What the pin's arrow does, said after it drops. */
const NEXT = 'Enter나 화살표를 누르면 그 상공을 지나간 위성이 보인다.'

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  imaged: (clock: string, zone: string) => `포착 ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `포착 ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `포착 ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `포착 ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `포착 · ${satellite}`,
  closestApproachOf: (satellite: string) => `최근접 · ${satellite}`,
  acquiredNow: '포착',
  closestApproachNow: '최근접',

  pin: {
    card: '꽂은 핀',
    /** 8 syllables: fits the 156 px column at 13 px (and ellipsises if not). */
    naming: '이 지점 이름 찾는 중',
    /** 10 syllables and 4 spaces, about 140 px at 13 px: fits the 156 px column whole. */
    noName: '근처에 이름 있는 곳 없음',
    /** Both parts are the geocoder's data ("Waterloo", "Ontario, Canada"), joined as a "where" line is: name first. */
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `${place} 상공을 지나간 위성 보기`,
    searchTitle: '여기서 검색(Enter)',
    removeAria: '핀 빼기',
    removeTitle: '핀 빼기(Esc)',
    /**
     * Names the pin: with the object dropped, 길게 눌러 옮기기 reads as moving the globe itself (a -어 clause shares its
     * object). Same shape as the landing's 지구본을 클릭해 핀 꽂기. 16 syllables, about 250 px at 11 px: fits the 320 px phone.
     */
    moveHint: '지구본 아무 곳이나 길게 눌러 핀 옮기기',
    droppedAt: (coords: string) => `${coords}에 핀을 꽂았다.`,
    droppedIn: (place: string) => `${place}에 핀을 꽂았다. ${NEXT}`,
    droppedUnnamed: `핀을 꽂았다. ${NEXT}`,
  },

  noGl: {
    title: '3D 보기 불가',
    reason: '이 브라우저에서 WebGL 2가 꺼져 있다',
  },
}
export default globe
