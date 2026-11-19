/**
 * "Use my location": geolocation → reverse geocode → onPlace. Drives the store's 'locating' phase.
 * Each attempt has a token so a cancelled or superseded attempt can never submit late.
 *
 * A failure is kept as its code, not its sentence: the landing words it in the visitor's language when it renders
 * ('landing' locateErrors), so a language switch also rewords a notice already on screen.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { LocateError, locateMe, reversePlace } from '@/imagery'
import { useApp } from '@/state/store'
import type { Place } from '@/types'

/** Why locating failed: a LocateError's code, or 'other' (the reverse geocoder, the network). */
export type LocateFailure = LocateError['code'] | 'other'

export type LocateState =
  | { kind: 'idle' }
  | { kind: 'locating'; step: 'position' | 'naming'; t0: number }
  | { kind: 'error'; code: LocateFailure }

export function useLocate(onPlace: (p: Place) => void) {
  const [state, setState] = useState<LocateState>({ kind: 'idle' })
  const token = useRef(0)
  const abort = useRef<AbortController | null>(null)
  const onPlaceRef = useRef(onPlace)
  onPlaceRef.current = onPlace

  const leaveLocatingPhase = () => {
    const app = useApp.getState()
    if (app.phase === 'locating') app.setPhase('idle')
  }

  const start = useCallback(async () => {
    const my = ++token.current
    abort.current?.abort()
    useApp.getState().setPhase('locating')
    setState({ kind: 'locating', step: 'position', t0: performance.now() })
    try {
      const pos = await locateMe()
      if (token.current !== my) return
      setState((st) => (st.kind === 'locating' ? { ...st, step: 'naming' } : st))
      const ctrl = new AbortController()
      abort.current = ctrl
      const place = await reversePlace(pos.lat, pos.lon, ctrl.signal)
      if (token.current !== my) return
      setState({ kind: 'idle' })
      onPlaceRef.current({ ...place, source: 'geolocation' })
      // If the receiver didn't move the app on (it normally starts computing), don't strand it.
      leaveLocatingPhase()
    } catch (err) {
      if (token.current !== my) return
      leaveLocatingPhase()
      setState({ kind: 'error', code: err instanceof LocateError ? err.code : 'other' })
    }
  }, [])

  const cancel = useCallback(() => {
    token.current++
    abort.current?.abort()
    leaveLocatingPhase()
    setState({ kind: 'idle' })
  }, [])

  const dismiss = useCallback(() => setState((st) => (st.kind === 'error' ? { kind: 'idle' } : st)), [])

  // Unmounting (the app moved on) invalidates any attempt still in flight.
  useEffect(
    () => () => {
      token.current++
      abort.current?.abort()
    },
    [],
  )

  return { state, start, cancel, dismiss }
}
