/**
 * Japanese copy for the app's own words (see docs/i18n/ja.md §1.3, §3.1, §3.7): the fault notice, the controller's
 * progress lines and the browser tab's title.
 *
 * Why it reads this way: a fault says what failed, then where to act, in plain form with no apology and no ！; the next
 * step is a noun ending (再試行。), because a bare dictionary verb there would read as the app announcing what it will
 * do. The label is 障害, the instrument word for a failure (never エラー！ or 異常). The tab title is the brand, then the
 * hero's sentence without its 。. The stats log the ENGLISH fault sentences, never these.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · 今週、何かがあなたを見ていた',

  notice: {
    label: '障害',
    fallback: '問題が起きた。',
    tryAgain: '再試行',
    trying: '再試行中…',
    back: '戻る',
  },

  faults: {
    catalog: '軌道カタログを読み込めなかった。接続を確かめてから再試行。',
    compute: 'この場所の通過を計算中に問題が起きた。少し待って再試行。',
  },

  progress: {
    catalog: '軌道要素を読み込み中',
    done: 'レポート完成',
  },
}
export default app
