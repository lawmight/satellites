/**
 * Italian copy for the shared primitives (see docs/i18n/it.md §1, §4): the few words a component says itself. They are
 * actions, so they are second-person singular imperatives (*Chiudi*, *Espandi il pannello*), never infinitives, which
 * read as a manual. The grip's names are aria only, so they keep the article a spoken sentence has.
 */
import type en from '../en/system'

const system: typeof en = {
  close: 'Chiudi',
  expandPanel: 'Espandi il pannello',
  collapsePanel: 'Riduci il pannello',
}
export default system
