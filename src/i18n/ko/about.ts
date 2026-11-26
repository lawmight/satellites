/**
 * Korean copy for the About page (see docs/i18n/ko.md §1.1, §1.3, §3.5, §3.7 "about", §5.7, §8): every heading,
 * paragraph, fact, credit and key.
 *
 * Why it reads this way: About is 한다체 a little looser than the panels, so the reader's questions are first person in
 * -ㄹ까? (내가 보일까?, 이게 위성 전부일까?) and the answers open short (안 보인다. · 꼭 그렇지는 않다. · 전부는
 * 아니다.). The lines are the guide's reference lines word for word. The title is 이렇게 / *돌아간다*. (the accent on
 * 돌아간다 alone, the full stop outside it, the glyphs the embedded accent subset already holds). "We" is never 우리 or
 * 저희: where who acts is the point (the lede, the CelesTrak fetch, what is kept), the actor is named, Watched가 /
 * Watched는 (vowel-final, 워치드), and elsewhere the subject drops. 당신 appears once, in the one sanctioned answer
 * (당신은 그보다 작다.). A verdict is quoted by its exact title in ‘ ’, and the particle after the quote follows the
 * title's last syllable (‘여기를 볼 수도 있었다’로). Particles after the fixed names follow how Korean readers say them
 * (CelesTrak이, Landsat은, Sentinel-2와, Nominatim으로, Blue Marble과). Privacy says exactly what the English says and
 * names who keeps what (Watched는 … 남기지 않는다), with no 익명 or 안심. NASA's Korean name goes once, in the GIBS
 * credit, with NOAA's and JMA's; every other agency stays a Latin acronym, and OpenStreetMap's attribution stays
 * English. A number and its counter touch (물체 16,893개, 6시간마다, 30~45도); a number and an SI unit keep one
 * no-break space (10 m); prose ranges take ~ with no spaces. `loaded` follows the CelesTrak paragraph after a space, and
 * an empty catalog has its own sentence, never 물체 0개.
 */
import type en from '../en/about'
import type { AboutPart, LinkPart } from '../en/about'
import { fmt } from '../../../api/_lib/i18n/format'
import { accent, num, type Part, type Rich } from '../../../api/_lib/i18n/parts'

const f = fmt('ko')

const link = (...parts: Part[]): LinkPart => ({ link: parts })

const about: typeof en = {
  bar: '소개',
  close: '닫기',
  sectionsLabel: '목차',
  /** Two display lines; the accent is 돌아간다 alone ("works", and "goes round"), the full stop outside it, touching. */
  title: [['이렇게'], [accent('돌아간다'), '.']] as Rich[],
  /** A conditional, not a command (고르면 …), with the actor named (Watched가) */
  lede: '지구 위 한 지점을 고르면, Watched가 지난 일주일 동안 어떤 위성이 그 상공을 지나갔는지 계산하고, 그 위성들이 찍은 이미지를 찾아온다. 모든 과정은 브라우저에서, 공개 데이터로 돌아간다.',

  sections: {
    short: '짧게 말하면',
    method: '통과를 찾는 방법',
    words: '분류가 뜻하는 것',
    accuracy: '보이지 않는 것',
    privacy: '개인정보',
    credits: '크레딧',
    keys: '키보드',
  },

  short: {
    live: {
      term: '실시간일까?',
      text: '꼭 그렇지는 않다. 이미지는 찍힌 뒤 몇 시간에서 이틀쯤 지나야 아카이브에 올라온다. 그래서 가장 최근 통과에는 아직 이미지가 없을 수 있다.',
    },
    seeMe: { term: '내가 보일까?', text: '안 보인다. 여기서는 픽셀 하나가 아무리 작아도 10 m다. 자동차 한 대가 픽셀 하나다. 당신은 그보다 작다.' },
    every: {
      term: '이게 위성 전부일까?',
      text: '전부는 아니다. 군사 위성과 정찰위성은 대부분 공개 카탈로그에 없다. 기업들은 카메라를 어디로 돌리는지 밝히지 않는다.',
    },
  },

  method: {
    orbits: [
      '궤도에 있는 모든 물체에는 그 경로를 나타내는 공개된 숫자 묶음이 있다. ',
      link('CelesTrak'),
      '이 미국 우주군의 추적 자료로 이를 공개하고, Watched는 6시간마다 새로 받아 온다.',
    ] as AboutPart[],
    /** After the paragraph above, past a space: the count in mono with 개 right after it, the stamp as it comes. */
    loaded: (count: number, stamp: string): AboutPart[] =>
      count > 0
        ? ['이 페이지는 물체 ', num(f.int(count)), '개를 불러왔다(받은 시각 ', num(stamp), ').']
        : ['이 페이지가 불러온 물체는 없다(받은 시각 ', num(stamp), ').'],
    sgp4: '각 위성의 지난 7일 궤도를 표준 궤도 모델인 SGP4로 계산하고, 이 지점이 위성의 시야 안에 든 때를 모두 기록한다.',
    facts: {
      straightDown: {
        term: '바로 아래',
        text: 'Sentinel-2와 Landsat은 바로 아래의 띠 모양 땅을 본다. 폭은 Sentinel-2가 약 290 km, Landsat이 약 185 km다. 이 띠 안에 있어야 한다.',
      },
      /** Quotes the could verdict's title (§3.5) in ‘ ’; 로 follows its last syllable, 다 */
      tilting: {
        term: '기울이는 카메라',
        text: '상업 위성 상당수는 30~45도까지 기울일 수 있다. 그 범위 안에 있었다면 ‘여기를 볼 수도 있었다’로 분류한다.',
      },
      daylight: { term: '낮', text: '일반 카메라에는 햇빛이 필요하다. 어둠 속 통과는 사진으로 세지 않는다.' },
      radar: {
        term: '레이더',
        text: 'Sentinel-1에는 햇빛이 필요 없다. 마이크로파를 쏘고 그 반사파를 기록하므로, 구름을 뚫고 밤에도 본다. 시선은 궤도 한쪽 옆으로 비스듬히 향한다. 이미지도 공개되므로 회색으로 보여 준다. 밝은 곳은 거친 지면과 건물, 어두운 곳은 잔잔한 물이다.',
      },
      weather: {
        term: '기상위성',
        text: '몇몇은 적도 위에 머물며 10분마다 지구의 절반을 지켜본다. 그 절반 안에 있다면 모든 프레임에 들어 있다.',
      },
    },
    /** NASA stays the acronym here: its Korean name goes once on the page, in the GIBS credit */
    archives:
      '그다음 이미지 아카이브(Microsoft Planetary Computer, Element 84, NASA)를 검색해, 각 이미지를 찍은 통과와 짝짓는다. 보이는 이미지는 모두 실제 이미지를 이 지점 주변으로 잘라 낸 것이다.',
    photoFacts: {
      touchUps: {
        term: '보정',
        text: 'Sentinel-2와 Landsat 사진은 화면에 맞춰 색 균형을 잡고, 매끄럽게 다듬은 뒤 살짝 선명하게 한다. 사진 전체에 같은 방식으로 적용한다. 더하거나 빼는 것은 없다.',
      },
      /** "N 화살표": the viewer's north arrow, labelled N */
      whichWayUp: {
        term: '어느 쪽이 위인가',
        text: 'Sentinel-2와 Landsat 사진은 아카이브의 지도 격자를 그대로 쓴다. 그래서 북쪽이 정확히 위에서 몇 도 어긋날 수 있다. 이미지를 열면 N 화살표가 정확한 방향을 가리킨다.',
      },
    },
  },

  /**
   * Read straight after each verdict's definition (§3.5), as its next sentence, so likely and could lean on it rather
   * than repeat it: likely keeps the definition's subject (이곳을 찍은 이미지는) and says 공개 전, not 공개되지 않았 again;
   * could answers the definition's 실제로 이쪽을 봤는지 with 그래서, a short last sentence.
   */
  verdictMore: {
    imaged: '보여 주는 이미지는 모두 실제 이미지다.',
    likely: '아직 공개 전이거나, 구름 때문에 버려졌다.',
    could: '그래서 알 길이 없다.',
    overhead: '',
  },

  accuracy: {
    positions: {
      term: '정확한 위치',
      text: '공개 궤도 자료의 오차는 약 1 km이고, 날마다 조금씩 커진다. 시각은 몇 초 틀릴 수 있다.',
    },
    secret: { term: '비밀 위성', text: '궤도에서 가장 좋은 카메라 가운데 일부는 군대의 것이다. 여기에는 나오지 않는다.' },
    clouds: {
      term: '구름',
      text: '구름만 찍힌 사진이 많다. 아카이브가 알려 주면 이 지점 바로 위의 픽셀을 확인하고 그렇다고 밝힌다.',
    },
    delays: { term: '지연', text: '사진이 올라오기까지 하루이틀 걸릴 수 있다.' },
  },

  /** Exactly what the English says, with the keeper named (Watched는); never 익명, 안심, 철저히 보호 */
  privacy: {
    where: { term: '계산되는 곳', text: '궤도 계산은 브라우저 안에서 이뤄진다.' },
    kept: {
      term: '남기는 것',
      text: 'Watched는 검색을 도시와 약 10 km 크기의 구역 단위로만 세고, 정확한 지점은 남기지 않는다. 무엇이 열리고 공유됐는지도 집계한다. IP 주소도, 자체 쿠키도, 한 방문과 다음 방문을 잇는 정보도 남기지 않는다.',
    },
    others: {
      term: '다른 곳이 보는 것',
      text: '대부분의 장소 이름은 사이트에 내장된 목록에서 나온다. 그 밖의 검색은 Open-Meteo, Photon 또는 Nominatim으로 간다. 이미지는 아카이브에서 바로 불러온다. 호스팅 업체는 쿠키 없이 페이지 조회 수와 속도를 집계하고, 사람과 봇을 구분하려고 보안 쿠키 하나를 둘 수 있다. Watched는 그 쿠키를 읽지 않는다.',
    },
    links: {
      term: '공유 링크',
      text: '무언가를 공유할 때만 만든다. 링크가 있으면 누구나 장소 이름, 약 1 km 단위로 반올림한 지점, 고른 통과를 볼 수 있다.',
    },
  },

  credits: {
    /** "Armaan, X @armaangupt0": the handle is the link */
    madeBy: { who: '만든 사람', text: (handle: string): AboutPart[] => ['Armaan, X ', link(handle)] },
    support: { who: '후원', text: [link('Watched가 계속 무료일 수 있게 도와주세요 :)')] as AboutPart[] },
    /** The one place NASA, NOAA and JMA carry their Korean names; the particle follows the acronym (NOAA(…)와) */
    gibs: '이미지: NASA(미국 항공우주국)의 GIBS(EOSDIS의 일부). GOES는 NOAA(미국 해양대기청)와 CIRA, Himawari는 JMA(일본 기상청) 제공.',
    archives: {
      who: '아카이브',
      text: 'Microsoft Planetary Computer와 Element 84 Earth Search. Landsat의 15 m 밴드는 Copernicus Data Space Ecosystem에서 받았다.',
    },
    orbits: { who: '궤도', text: '궤도 요소는 CelesTrak, SGP4는 satellite.js.' },
    /** OpenStreetMap's attribution as its guidelines word it, in English */
    placeNames: { who: '장소 이름', text: 'komoot의 Photon. 지도 데이터 © OpenStreetMap contributors (ODbL).' },
    textures: { who: '지구 텍스처', text: 'Solar System Scope(CC BY 4.0), NASA Blue Marble과 Black Marble 기반.' },
    type: { who: '서체', text: 'Instrument의 Instrument Sans와 Serif, Evil Martians의 Martian Mono(SIL OFL).' },
  },

  keys: {
    search: '장소 검색',
    suggestions: '추천 목록 이동',
    choose: '선택',
    passes: '통과 넘기기',
    photos: '이전 / 다음 이미지',
    expand: '이미지 크게 보기',
    zoom: '확대 / 축소(크게 볼 때)',
    play: '다시 보기 재생 또는 일시정지',
    back: '뒤로 또는 닫기',
    help: '이 페이지',
  },
  /** As printed on Korean keyboards; the unlabelled space bar is 스페이스 */
  keyNames: { enter: 'Enter', space: '스페이스', esc: 'Esc' },

  builtBy: (handle: string): AboutPart[] => ['만든 사람 ', link(handle)],
  footerNote: '공개 데이터로 만들었다. 여기 있는 이미지는 하나도 직접 찍지 않았다.',
}
export default about
