/**
 * The report window as a mono kicker, in the product's one date style: days without zero padding, the
 * month once when both ends share it, the year once.
 *   "1 → 8 NOV 2026 UTC" · "29 OCT → 5 NOV 2026 UTC" · "29 DEC 2026 → 5 JAN 2027 UTC"
 * The words are the visitor's language ('landing' namespace, windowRange), read at call time.
 */
import enLanding from '@/i18n/en/landing'
import { msgs } from '@/i18n/runtime'

export const WINDOW_DAYS = 7

export function windowLabel(nowMs: number, days = WINDOW_DAYS): string {
  return msgs(enLanding).windowRange(nowMs - days * 86_400_000, nowMs)
}
