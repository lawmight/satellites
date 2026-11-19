/**
 * A curated place (an example chip, a Surprise me pick) in the visitor's language. Kept apart from ./places.ts, which
 * must stay free of the i18n runtime (scripts/build-places.ts imports it under plain Node).
 *
 * In English this returns the very object it was given (or the curated one), so nothing about an English search
 * changes. In another language it returns a copy with the translated chip, label and sublabel, and `canonicalLabel`
 * set to the English label: usage stats and record_lookup keep that (englishPlace in ./places.ts gives the whole
 * English place), so counts never split by language. Read at call time: never cache the result across a switch.
 */
import enPlaces from '@/i18n/en/places'
import { msgs } from '@/i18n/runtime'
import type { Place } from '@/types'
import { curatedId, curatedPlace, type ExamplePlace } from './places'

/** `place` in the active language: translated if it is a curated place, else as it is. */
export function localizedPlace<P extends Place | ExamplePlace>(place: P): P {
  const id = curatedId(place)
  if (!id) return place
  const m = msgs(enPlaces)
  const english = curatedPlace(id)
  // English: the curated object itself (a copy made in another language goes back to it).
  if (m === enPlaces) return (place.canonicalLabel === undefined ? place : english) as P
  // A stale translation bundle (an older deploy's) may lack a newer id: its English names, never a crash.
  const t: { chip?: string; label: string; sublabel: string } = m[id] ?? enPlaces[id]
  return { ...place, ...(t.chip !== undefined ? { chip: t.chip } : null), label: t.label, sublabel: t.sublabel, canonicalLabel: english.label }
}
