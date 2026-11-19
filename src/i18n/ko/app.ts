/**
 * Korean copy for the app's own words (see docs/i18n/ko.md §1.1, §1.2, §3.1, §3.7 app): the fault notice, the
 * controller's progress lines and the browser tab's title. The usage stats keep logging the ENGLISH fault sentences
 * (src/i18n/en/app.ts), so nothing here changes what the admin page counts.
 *
 * Why it reads this way: the tab title is the brand, then the hero's sentence without its time phrase (무언가 당신을
 * 지켜봤다), because tabs cut after ~25–30 Latin widths and Hangul is double width: the tab keeps the verb. Notices are
 * 한다체 with no apology: what failed, then one way out with -면 된다. Buttons are nouns (다시 시도), the busy one a noun
 * with 중…; "Back" is 처음으로, since it goes to the landing and 뒤로 would mean "previous". Progress rows are mono
 * status lines in -는 중 (불러오는 중), the done one in 됨.
 */
import type en from '../en/app'

const app: typeof en = {
  documentTitle: 'Watched · 무언가 당신을 지켜봤다',

  notice: {
    label: '오류',
    fallback: '문제가 생겼다.',
    tryAgain: '다시 시도',
    trying: '다시 시도 중…',
    back: '처음으로',
  },

  faults: {
    catalog: '궤도 카탈로그를 불러오지 못했다. 연결을 확인하고 다시 시도하면 된다.',
    compute: '이 장소의 통과를 계산하다가 문제가 생겼다. 잠시 후 다시 시도하면 된다.',
  },

  progress: {
    catalog: '궤도 요소 불러오는 중',
    done: '보고서 준비됨',
  },
}
export default app
