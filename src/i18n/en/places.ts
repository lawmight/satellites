/**
 * The curated places' names: the landing's three example chips and the "Surprise me" pool, keyed by a stable id. They
 * are copy (shown in the visitor's language), unlike every other place name, which is data from a geocoder or the
 * offline list and shown as it comes.
 *
 * TRANSLATORS: the English text, with the notes on each field (chip, label, sublabel), is ./plain/placeNames.ts, one
 * entry per id. It lives there, with no imports, because scripts/build-places.ts reads the same English names under
 * plain Node (the offline place list carries them), where this runtime cannot load. Translate it here as usual
 * (src/i18n/<locale>/places.ts, typed against this namespace): every id, its own { chip?, label, sublabel }.
 *
 * What usage stats, record_lookup and shares keep stays the English label and sublabel (Place.canonicalLabel,
 * englishPlace in src/ui/landing/places.ts), so counts never split by language.
 */
import { ns } from '../ns'
import { CURATED_NAMES } from './plain/placeNames'

export default ns('places', CURATED_NAMES)
