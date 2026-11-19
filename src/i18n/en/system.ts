/**
 * English copy for the shared primitives (src/ui/system): the few words a component says itself rather than taking
 * from its caller (the bottom sheet's grip, a close button's default name). Everything else a primitive shows is
 * passed in by the screen that uses it, from that screen's namespace.
 */
import { ns } from '../ns'

export default ns('system', {
  /** A panel's close (×) button: its accessible name and hover tooltip, unless the panel names it */
  close: 'Close',
  /** The phone bottom sheet's grip (aria only): pressing it raises the sheet to its next height */
  expandPanel: 'Expand panel',
  /** The same grip once the sheet is at its full height: pressing it lowers the sheet */
  collapsePanel: 'Collapse panel',
})
