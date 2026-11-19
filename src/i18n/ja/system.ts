/**
 * Japanese copy for the shared primitives (see docs/i18n/ja.md §1.2, §3.7): a close button's default name and the bottom
 * sheet's grip. Controls are a dictionary-form verb with its object (閉じる, パネルを広げる), the iOS and Android norm:
 * Japanese has no neutral plain imperative, and a polite request (〜してください) would break the plain register.
 */
import type en from '../en/system'

const system: typeof en = {
  close: '閉じる',
  expandPanel: 'パネルを広げる',
  collapsePanel: 'パネルをたたむ',
}
export default system
