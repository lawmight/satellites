/**
 * English copy for the globe's own words (src/globe): the satellite callouts, the capture line under the place's
 * coordinates, the acquisition countdown, the dropped pin's card and the note shown when there is no 3D view.
 *
 * Why it reads like an instrument: the callouts and readouts are mono labels on the scene, set in capitals by CSS
 * (DESIGN §3), so a translation can be written in its own case. The English keeps the capitals the page has always had
 * in its DOM ("IMAGED"), which look the same. Units are the exception: written lowercase ("km", "m") and kept so in the
 * capitals (api/_lib/i18n/units.ts), in every language. Readouts that are written every frame (the countdown's value,
 * the altitude) read these messages at write time, so a language switch repaints them on the next frame.
 *
 * What is never here, in any language: coordinates ("43.4723°N 80.5449°W"), 24 h clocks ("11:21:13"), time-zone
 * abbreviations ("EST", "UTC+9", "UTC"), NORAD numbers and the "T−00:01:12" countdown are international notation;
 * satellite names come from the catalog; place names from the geocoder. They arrive in the slots as they are.
 *
 * Except for the pin card and the no-3D note, all of this is aria-hidden (decoration over the canvas): never spoken.
 */
import { ns } from '../ns'
import { fmt } from '../../../api/_lib/i18n/format'
import type { Part, Rich } from '../../../api/_lib/i18n/parts'

export default ns('globe', {
  // ── Satellite callouts: the box beside a satellite on the globe (one nowrap line each; mono caps by CSS) ──

  /** A satellite's name before the catalog's names have loaded: its NORAD catalog number (5 digits). "NORAD" is an acronym, usually kept. */
  noradName: (id: string) => `NORAD ${id}`,
  /**
   * The desktop callout's line under the name: the catalog number, then the altitude in kilometres. `norad` and
   * `altitude` are the two values, set in bold: place them as they are, never rebuild them (the altitude is rewritten
   * live, a few times a second). "km" is the unit, lowercase in the capitals like every unit.
   */
  calloutMeta: (norad: Part, altitude: Part): Rich => ['NORAD ', norad, ' · ', altitude, ' km'],
  /** The same line for the selected pass that took a picture: `imaged` is the imaged / imagedAbout message, after the altitude. */
  calloutMetaImaged: (norad: Part, altitude: Part, imaged: string): Rich => ['NORAD ', norad, ' · ', altitude, ' km', ' · ', imaged],
  /** Phones: the one-line callout after the satellite's name (which is cut with an ellipsis first): a middle dot, the altitude, its unit. */
  calloutMetaCompact: (altitude: Part): Rich => ['· ', altitude, ' km'],
  /**
   * When the picture was taken, at the place. `clock` is the 24 h time there ("11:21:13"), `zone` its abbreviation
   * ("EST", "CET", "UTC+9", or "UTC" before the zone is known): both international, insert them as they are. "IMAGED"
   * is the instrument's verb (the prose elsewhere says "watched").
   */
  imaged: (clock: string, zone: string) => `IMAGED ${clock} ${zone}`,
  /** The same for a geostationary scan, whose time is known to about a minute: "≈" means "about"; `clock` has no seconds ("11:21"). */
  imagedAbout: (clock: string, zone: string) => `IMAGED ≈ ${clock} ${zone}`,

  // ── The capture line under the place's coordinates, at the moment of the picture (signal colour, one nowrap line) ──

  /** "ACQUIRED 11:21:13 EST · 10 m": the picture's local time and its ground resolution (a resolution message). Slots as in `imaged`. */
  acquired: (clock: string, zone: string, resolution: string) => `ACQUIRED ${clock} ${zone} · ${resolution}`,
  /** The same for a geostationary scan (time to about a minute, no seconds; "≈" means "about"). */
  acquiredAbout: (clock: string, zone: string, resolution: string) => `ACQUIRED ≈ ${clock} ${zone} · ${resolution}`,
  /** Ground resolution in metres: the size of one pixel on the ground ("10 m"; the unit keeps its case). */
  resolutionM: (metres: number) => `${fmt('en').int(metres)} m`,
  /** Ground resolution in kilometres, for coarse pictures (weather satellites: "1 km", "2 km"). */
  resolutionKm: (km: number) => `${fmt('en').int(km)} km`,

  // ── The acquisition countdown, top right under the clock while a pass replays (right-aligned; may wrap if narrow) ──

  /** Its label over the countdown, for a pass that took a picture: `satellite` is the satellite's name ("SENTINEL-2C"), as the catalog gives it. */
  acquisitionOf: (satellite: string) => `ACQUISITION · ${satellite}`,
  /** Its label for a pass without a picture: the moment the satellite is nearest the place. */
  closestApproachOf: (satellite: string) => `CLOSEST APPROACH · ${satellite}`,
  /** Replaces the countdown ("T−00:00:03") at the moment of the picture: the picture is taken. Mono 12 px, one line. */
  acquiredNow: 'ACQUIRED',
  /** Replaces the countdown at closest approach, for a pass without a picture. */
  closestApproachNow: 'CLOSEST APPROACH',

  /**
   * The card beside a pin dropped on the globe: the spot's name and coordinates, an orange arrow that searches it, and
   * a ×. The text column is a FIXED 196 px (156 px on phones): the card never resizes when the name arrives.
   */
  pin: {
    /** The card's accessible name (screen readers): the pin the visitor dropped on the globe. */
    card: 'Dropped pin',
    /** While the spot's name is being looked up (under a second, usually): sans 13 px, cut with an ellipsis past 156 px. */
    naming: 'Naming this spot',
    /** No place name near the pin (open sea, ice). Must fit whole in 156 px at 13 px. */
    noName: 'No named place nearby',
    /** The spot's full name (tooltip; and what screen readers hear in `droppedIn`): its name, then the area it is in, both as the geocoder gives them ("Waterloo", "Ontario, Canada"). */
    placeTitle: (name: string, area: string) => `${name}, ${area}`,
    /** The orange arrow's accessible name: `place` is the spot's name, or its coordinates ("43.4723°N 80.5449°W"). */
    searchAria: (place: string) => `Show what passed over ${place}`,
    /** The arrow's tooltip: the Enter key does the same. */
    searchTitle: 'Search here (Enter)',
    /** The ×'s accessible name. */
    removeAria: 'Remove the pin',
    /** The ×'s tooltip: the Esc key does the same. */
    removeTitle: 'Remove the pin (Esc)',
    /**
     * Under the card of a pin the landing's "Drop a pin" button put in the middle of the globe: how to move it (press
     * and hold on a touch screen; a mouse click works too). Mono caps by CSS on one line that never wraps: keep it
     * short (it must fit a 320 px phone).
     */
    moveHint: 'Hold the globe anywhere to move it',
    /** Spoken as the pin drops, before its name is known: `coords` like "43.4723°N 80.5449°W". */
    droppedAt: (coords: string) => `Pin dropped at ${coords}.`,
    /** Spoken once the name is in: `place` as in placeTitle. "The arrow" is the card's orange button. */
    droppedIn: (place: string) => `Pin dropped in ${place}. Press Enter or the arrow to see what passed over it.`,
    /** Spoken when the spot has no name. */
    droppedUnnamed: 'Pin dropped. Press Enter or the arrow to see what passed over it.',
  },

  /**
   * The note under a still drawing of the globe when the browser cannot show the 3D view: two centred lines, mono
   * caps by CSS, each on one line that must fit a 375 px phone.
   */
  noGl: {
    title: '3D view unavailable',
    /** "WebGL 2" is the browser feature's name: keep it. */
    reason: 'WebGL 2 is off in this browser',
  },
})
