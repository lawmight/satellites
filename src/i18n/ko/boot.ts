/**
 * The three Korean strings the loading screen shows before the app runs (src/i18n/bootText.ts; docs/i18n/ko.md §3.1,
 * §3.7 "app, boot text"). They are read before any bundle loads, so they live apart from it.
 *
 * Why these words: status lines are nouns with no ending, and where no plain noun fits, a native verb + -는 중
 * (불러오는 중), so the loading screen's name is the brand, then that status: Watched 불러오는 중. The brand stays in
 * Latin and nothing follows it but a space, so no particle has to agree with it. The slow line is one short centred
 * mono line: the cause as a -어 clause, then the same status with 아직 for "still" (연결이 느려 아직 불러오는 중), never
 * an apology or a 기다려 주세요. The tab title is the brand, then the hero's sentence without its time phrase and full
 * stop (무언가 당신을 지켜봤다): tabs cut after about 25–30 Latin widths and Hangul is double width, so the full
 * 지난 일주일, … would lose its verb. It is identical to app.documentTitle, which takes over once the app runs.
 */
import type { BootText } from '../bootText.ts'

export default {
  loading: 'Watched 불러오는 중',
  slow: '연결이 느려 아직 불러오는 중',
  title: 'Watched · 무언가 당신을 지켜봤다',
} satisfies BootText
