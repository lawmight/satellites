/**
 * Spanish copy for the shared primitives (see docs/i18n/es.md §1, §4): the few words a component says itself. They are
 * actions, so they are infinitives (*Cerrar*, *Expandir panel*), the platform convention that addresses no one.
 */
import type en from '../en/system'

const system: typeof en = {
  close: 'Cerrar',
  expandPanel: 'Expandir panel',
  collapsePanel: 'Contraer panel',
}
export default system
