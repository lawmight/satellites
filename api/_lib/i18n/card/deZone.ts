/**
 * German names for Europe's time-zone abbreviations (docs/i18n/de.md §6.3): every German message with a `zone` slot,
 * in the app's catalog (src/i18n/de/*) and the share card's (./de.ts), passes it through `zoneDe`.
 *
 * Why one helper, here: code writes the zone in international notation ("CET", "EST", "UTC+9", src/ui/results/lib/
 * time.ts zoneAbbr), and a German reader knows Central European Time as MEZ / MESZ, never CET. The card is built on the
 * server, which never imports the app (src/), while the app may import api/_lib/i18n, so the one table both speak lives
 * beside the card's copy and the two can never disagree. Only the six European names change; every other abbreviation
 * (EST, JST, GMT, BST, AEDT, UTC, UTC−9) is international and stays as it came.
 */

const DE_ZONES: Record<string, string> = {
  CET: 'MEZ',
  CEST: 'MESZ',
  WET: 'WEZ',
  WEST: 'WESZ',
  EET: 'OEZ',
  EEST: 'OESZ',
}

/** "CET" → "MEZ", "CEST" → "MESZ", "EET" → "OEZ" …; anything else as it is ("EST", "UTC+9"). */
export const zoneDe = (zone: string): string => DE_ZONES[zone] ?? zone
