/**
 * Vietnamese copy for the globe's own words (see src/i18n/en/globe.ts; docs/i18n/vi.md §4.1): the satellite callouts,
 * the capture line, the acquisition countdown, the dropped pin's card and the no-3D note.
 *
 * Why it reads like an instrument: callouts and readouts are mono labels on the scene, uppercased by CSS with every
 * mark kept. "Acquired" is *thu nhận*, the remote-sensing term for acquiring an image (*thu nhận ảnh vệ tinh*); the
 * callout's "imaged" is the shorter *Ảnh lúc* ("image at"), true for radar as for a photograph. "Closest approach" is
 * *Tiếp cận gần nhất*. Units stay lowercase in the capitals ("km", "m"). Coordinates, clocks, zone abbreviations,
 * NORAD numbers and the T− countdown arrive as they are.
 */
import type en from '../en/globe'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('vi')

const globe: typeof en = {
  // ── Satellite callouts ──
  noradName: (id: string) => `NORAD ${id}`,
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  imaged: (clock: string, zone: string) => `Ảnh lúc ${clock} ${zone}`,
  imagedAbout: (clock: string, zone: string) => `Ảnh lúc ≈ ${clock} ${zone}`,

  // ── The capture line ──
  acquired: (clock: string, zone: string, resolution: string) => `Thu nhận ${clock} ${zone} · ${resolution}`,
  acquiredAbout: (clock: string, zone: string, resolution: string) => `Thu nhận ≈ ${clock} ${zone} · ${resolution}`,
  resolutionM: (metres: number) => `${f.int(metres)} m`,
  resolutionKm: (km: number) => `${f.int(km)} km`,

  // ── The acquisition countdown ──
  acquisitionOf: (satellite: string) => `Thu nhận · ${satellite}`,
  closestApproachOf: (satellite: string) => `Tiếp cận gần nhất · ${satellite}`,
  acquiredNow: 'Đã thu nhận',
  closestApproachNow: 'Tiếp cận gần nhất',

  pin: {
    card: 'Ghim đã thả',
    naming: 'Đang tìm tên chỗ này',
    /** Must fit whole in 156 px at 13 px (146 px in the bundled sans); *gần đây* also reads "recently" */
    noName: 'Không có địa danh ở gần',
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    searchAria: (place: string) => `Xem những gì đã bay qua ${place}`,
    searchTitle: 'Tìm tại đây (Enter)',
    removeAria: 'Gỡ ghim',
    removeTitle: 'Gỡ ghim (Esc)',
    /**
     * One mono caps line on a 320 px phone: *Nhấn giữ*, the interface term for press-and-hold (a bare *Giữ* is "keep");
     * the object (*ghim*) is named, since Vietnamese drops no pronoun here
     */
    moveHint: 'Nhấn giữ quả địa cầu để dời ghim',
    droppedAt: (coords: string) => `Đã thả ghim tại ${coords}.`,
    droppedIn: (place: string) => `Đã thả ghim ở ${place}. Nhấn Enter hoặc mũi tên để xem những gì đã bay qua đó.`,
    droppedUnnamed: 'Đã thả ghim. Nhấn Enter hoặc mũi tên để xem những gì đã bay qua đó.',
  },

  noGl: {
    title: 'Không có chế độ xem 3D',
    reason: 'Trình duyệt này đang tắt WebGL 2',
  },
}
export default globe
