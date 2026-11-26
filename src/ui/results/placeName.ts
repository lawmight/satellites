/**
 * A place's name as the results show it: in the active language, read when it is shown.
 *
 * Why not `place.label`: a curated place (an example chip, a Surprise me pick, or a link to one) is copy, and its name
 * is written into the place when it is picked or a link is opened, in the language of that moment
 * (ui/landing/curated.ts localizedPlace, app/links.ts linkPlaceIn); the report keeps that name. Read here at render
 * instead, under a component's useMsgs subscription, a language switch with the results up renames it with the rest of
 * the panel. Any other place's label is data (the geocoder's or the offline list's English words), shown under the
 * name the visitor's language gives that town or region (imagery displayLabel: München, Київ), else as it came.
 *
 * In English this is `place.label` itself, so nothing an English visitor sees changes. Never store or send what it
 * returns: links, shares and the usage stats name a place by its English label (canonicalLabel, canonicalPlace).
 */
import { linkPlaceIn } from '@/app/links'
import enPlaces from '@/i18n/en/places'
import { msgs } from '@/i18n/runtime'
import { displayLabel, linkedForName } from '@/imagery'
import type { Place } from '@/types'
import { localizedPlace } from '@/ui/landing/curated'
import { curatedId } from '@/ui/landing/places'

/** `place`'s name in the active language (a curated place's from the 'places' namespace), else its label as shown. */
export function placeName(place: Place): string {
  return copyName(place) ?? displayLabel(place.source === 'url' ? linkedForName(englishLink(place)) : place)
}

/**
 * `place`'s name when the language's copy gives it (a curated place, or a link to one the language renames), else
 * undefined: its name is data, shown under the language's place names (displayLabel), which may still be on their way.
 * A link to a curated place is named again from its English label (canonicalLabel, once a language renamed it), as
 * opening the link names it. Any other link's place by its label, in the country the offline list gives that name at
 * its point (imagery linkedForName: a link carries no country of its own).
 */
export function copyName(place: Place): string | undefined {
  if (curatedId(place)) return localizedPlace(place).label
  if (place.source !== 'url') return undefined
  const english = englishLink(place)
  const linked = linkPlaceIn(english, msgs(enPlaces))
  return linked === english ? undefined : linked.label
}

/** A link's place under its English label (the place itself unless a language renamed it). */
function englishLink(place: Place): Place {
  const { canonicalLabel, ...rest } = place
  return canonicalLabel === undefined ? place : { ...rest, label: canonicalLabel }
}
