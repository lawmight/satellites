/**
 * Korean names for the curated places (see docs/i18n/ko.md §3.8, §8): the landing's three example chips and the
 * "Surprise me" pool, by the same ids as the English (src/i18n/en/plain/placeNames.ts).
 *
 * Why they read this way: these are copy, not data, so each takes the standard Korean exonym (국립국어원 외래어 표기,
 * or the form the Korean press prints), word for word from the guide's table. Generic geographic words attach to a
 * foreign name by the 2017 rule (세인트헬렌스산, 미드호, 보스포루스해협, 키클라데스제도); 폭포, 운하, 댐, 사막, 광산 stay
 * spaced as the press writes them; US states and administrative units take 주, 성, 현 attached (네바다주, 후베이성,
 * 시즈오카현). Country names are what Intl.DisplayNames('ko') gives (오스트레일리아, 튀르키예, 남아프리카; Hong Kong in its
 * short form, 홍콩). A sublabel keeps the English order, most specific first, joined with commas, and "A and B" is
 * A와 B / A과 B by A's last sound. Three choices are deliberate: the Giza chip is 기자 피라미드 (기자 alone reads
 * "journalist"); Groom Lake is a name, 그룸 레이크, as the press writes it; Chernobyl stays 체르노빌, the plant's
 * established name, as the English keeps it, while Kyiv Oblast takes the 2022 form, 키이우주. Chips exist for the first
 * three only, within six syllables. Only what is shown changes: usage stats, lookups and links keep the English label.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: '51구역', label: '51구역', sublabel: '그룸 레이크, 네바다주, 미국' },
  centralPark: { chip: '센트럴 파크', label: '센트럴 파크', sublabel: '뉴욕, 미국' },
  giza: { chip: '기자 피라미드', label: '기자의 피라미드', sublabel: '기자, 이집트' },
  // "Surprise me"
  uluru: { label: '울루루', sublabel: '노던 준주, 오스트레일리아' },
  palmJumeirah: { label: '팜 주메이라', sublabel: '두바이, 아랍에미리트' },
  worldIslands: { label: '더 월드 아일랜드', sublabel: '두바이, 아랍에미리트' },
  grandCanyon: { label: '그랜드 캐니언', sublabel: '애리조나주, 미국' },
  meteorCrater: { label: '미티어 크레이터', sublabel: '애리조나주, 미국' },
  lowerManhattan: { label: '로어 맨해튼', sublabel: '뉴욕, 미국' },
  lasVegasStrip: { label: '라스베이거스 스트립', sublabel: '네바다주, 미국' },
  hooverDam: { label: '후버 댐과 미드호', sublabel: '네바다주와 애리조나주, 미국' },
  goldenGate: { label: '금문교', sublabel: '샌프란시스코, 미국' },
  kennedySpaceCenter: { label: '케네디 우주 센터', sublabel: '플로리다주, 미국' },
  washingtonDc: { label: '워싱턴 D.C.', sublabel: '내셔널 몰, 미국' },
  mountStHelens: { label: '세인트헬렌스산', sublabel: '워싱턴주, 미국' },
  niagaraFalls: { label: '나이아가라 폭포', sublabel: '온타리오주, 캐나다' },
  panamaCanal: { label: '파나마 운하', sublabel: '가툰 갑문, 파나마' },
  rioDeJaneiro: { label: '리우데자네이루', sublabel: '슈가로프산과 코파카바나, 브라질' },
  paris: { label: '파리', sublabel: '일드프랑스, 프랑스' },
  venice: { label: '베네치아', sublabel: '베네토, 이탈리아' },
  vesuvius: { label: '베수비오산', sublabel: '나폴리, 이탈리아' },
  istanbul: { label: '이스탄불', sublabel: '보스포루스해협, 튀르키예' },
  chernobyl: { label: '체르노빌', sublabel: '키이우주, 우크라이나' },
  tableMountain: { label: '테이블산', sublabel: '케이프타운, 남아프리카' },
  kilimanjaro: { label: '킬리만자로산', sublabel: '킬리만자로, 탄자니아' },
  everest: { label: '에베레스트산', sublabel: '네팔과 중국' },
  angkorWat: { label: '앙코르와트', sublabel: '시엠레아프, 캄보디아' },
  singapore: { label: '싱가포르', sublabel: '마리나베이, 싱가포르' },
  hongKong: { label: '홍콩', sublabel: '빅토리아 하버, 홍콩' },
  tokyo: { label: '도쿄', sublabel: '도쿄, 일본' },
  fuji: { label: '후지산', sublabel: '시즈오카현, 일본' },
  sydneyHarbour: { label: '시드니 항', sublabel: '시드니, 오스트레일리아' },
  richat: { label: '리샤트 구조', sublabel: '사하라, 모리타니' },
  greatBlueHole: { label: '그레이트 블루홀', sublabel: '라이트하우스 리프, 벨리즈' },
  boraBora: { label: '보라보라섬', sublabel: '소시에테제도, 프랑스령 폴리네시아' },
  hardyReef: { label: '하디 리프', sublabel: '그레이트배리어리프, 오스트레일리아' },
  male: { label: '말레', sublabel: '북말레 환초, 몰디브' },
  deadSea: { label: '사해 염전', sublabel: '남쪽 분지, 이스라엘과 요르단' },
  binghamCanyon: { label: '빙엄 캐니언 광산', sublabel: '유타주, 미국' },
  mountWhaleback: { label: '마운트 웨일백 광산', sublabel: '필바라, 오스트레일리아' },
  etna: { label: '에트나산', sublabel: '시칠리아, 이탈리아' },
  santorini: { label: '산토리니', sublabel: '키클라데스제도, 그리스' },
  teide: { label: '테이데산', sublabel: '테네리페, 스페인' },
  kilauea: { label: '킬라우에아', sublabel: '하와이주, 미국' },
  craterLake: { label: '크레이터호', sublabel: '오리건주, 미국' },
  glenCanyonDam: { label: '글렌 캐니언 댐', sublabel: '페이지, 애리조나주, 미국' },
  gardenCity: { label: '가든시티 원형 농지', sublabel: '캔자스주, 미국' },
  almeria: { label: '알메리아 온실 단지', sublabel: '안달루시아, 스페인' },
  gibraltar: { label: '지브롤터', sublabel: '지브롤터해협' },
  suezCanal: { label: '수에즈 운하', sublabel: '이스마일리아, 이집트' },
  aswanDam: { label: '아스완 하이 댐', sublabel: '나세르호, 이집트' },
  wadiRum: { label: '와디 럼', sublabel: '아카바, 요르단' },
  sossusvlei: { label: '소서스플라이', sublabel: '나미브 사막, 나미비아' },
  victoriaFalls: { label: '빅토리아 폭포', sublabel: '잠비아와 짐바브웨' },
  threeGorges: { label: '싼샤 댐', sublabel: '후베이성, 중국' },
  shanghai: { label: '상하이', sublabel: '황푸강, 중국' },
  itaipu: { label: '이타이푸 댐', sublabel: '브라질과 파라과이' },
}
export default places
