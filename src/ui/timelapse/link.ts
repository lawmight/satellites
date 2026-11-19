/**
 * The link a time-lapse is shared by: the place link (`/?q=…&n=…`, which computes the week for whoever opens it)
 * plus `tl`, which opens the time-lapse over the results. Nothing is stored. Coordinates are rounded to ~1 km like
 * every share (ui/share/links.ts). The name is the place's canonical one (a curated place's English label, as the place
 * link writes it: src/app/links.ts), so a link never carries the sender's language.
 */
import { roundedPlace, SHARE_DECIMALS } from '@/ui/share/links'

export function timelapseLink(origin: string, place: { label: string; canonicalLabel?: string; lat: number; lon: number }): string {
  const r = roundedPlace(place.lat, place.lon)
  const p = new URLSearchParams()
  p.set('q', `${r.lat.toFixed(SHARE_DECIMALS)},${r.lon.toFixed(SHARE_DECIMALS)}`)
  p.set('n', place.canonicalLabel ?? place.label)
  p.set('tl', '1')
  return `${origin}/?${p.toString()}`
}
