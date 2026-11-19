/**
 * Japanese names for the curated places (see docs/i18n/ja.md §3.8, §8): the landing's three example chips and the
 * "Surprise me" pool, by the same ids as the English (src/i18n/en/plain/placeNames.ts).
 *
 * Why they read this way: these are copy, not data, so each takes the exonym Japanese newspapers print (共同通信 style,
 * no ヴ: ベネチア, ビクトリア), word for word from the guide's table. A sublabel keeps the English small → large order,
 * joined with 、, so it reads like the geocoder's "where" lines beside it. Three choices are deliberate: 富士山 names
 * both prefectures (its summit's boundary is undetermined, so one would read as taking a side), the Garden City circles
 * are 円形農地 (ミステリーサークル would mean a hoax), and Ukrainian names take the forms used since 2022 (チョルノービリ,
 * キーウ州). ザ・ワールド keeps its ザ because it is the established name. Chips exist for the first three only, at
 * about 8 glyphs. Only what is shown changes: usage stats, lookups and links keep the English label.
 */
import type en from '../en/places'

const places: typeof en = {
  // The example chips
  area51: { chip: 'エリア51', label: 'エリア51', sublabel: 'グルーム・レイク、ネバダ州、アメリカ' },
  centralPark: { chip: 'セントラルパーク', label: 'セントラルパーク', sublabel: 'ニューヨーク、アメリカ' },
  giza: { chip: 'ギザ', label: 'ギザの三大ピラミッド', sublabel: 'ギザ、エジプト' },
  // "Surprise me"
  uluru: { label: 'ウルル', sublabel: '北部準州、オーストラリア' },
  palmJumeirah: { label: 'パーム・ジュメイラ', sublabel: 'ドバイ、アラブ首長国連邦' },
  worldIslands: { label: 'ザ・ワールド', sublabel: 'ドバイ、アラブ首長国連邦' },
  grandCanyon: { label: 'グランド・キャニオン', sublabel: 'アリゾナ州、アメリカ' },
  meteorCrater: { label: 'バリンジャー・クレーター', sublabel: 'アリゾナ州、アメリカ' },
  lowerManhattan: { label: 'ロウアー・マンハッタン', sublabel: 'ニューヨーク、アメリカ' },
  lasVegasStrip: { label: 'ラスベガス・ストリップ', sublabel: 'ネバダ州、アメリカ' },
  hooverDam: { label: 'フーバーダムとミード湖', sublabel: 'ネバダ州とアリゾナ州、アメリカ' },
  goldenGate: { label: 'ゴールデンゲート', sublabel: 'サンフランシスコ、アメリカ' },
  kennedySpaceCenter: { label: 'ケネディ宇宙センター', sublabel: 'フロリダ州、アメリカ' },
  washingtonDc: { label: 'ワシントンD.C.', sublabel: 'ナショナル・モール、アメリカ' },
  mountStHelens: { label: 'セントヘレンズ山', sublabel: 'ワシントン州、アメリカ' },
  niagaraFalls: { label: 'ナイアガラの滝', sublabel: 'オンタリオ州、カナダ' },
  panamaCanal: { label: 'パナマ運河', sublabel: 'ガトゥン閘門、パナマ' },
  rioDeJaneiro: { label: 'リオデジャネイロ', sublabel: 'ポン・ジ・アスーカルとコパカバーナ、ブラジル' },
  paris: { label: 'パリ', sublabel: 'イル＝ド＝フランス、フランス' },
  venice: { label: 'ベネチア', sublabel: 'ベネト州、イタリア' },
  vesuvius: { label: 'ベスビオ山', sublabel: 'ナポリ、イタリア' },
  istanbul: { label: 'イスタンブール', sublabel: 'ボスポラス海峡、トルコ' },
  chernobyl: { label: 'チョルノービリ', sublabel: 'キーウ州、ウクライナ' },
  tableMountain: { label: 'テーブルマウンテン', sublabel: 'ケープタウン、南アフリカ' },
  kilimanjaro: { label: 'キリマンジャロ', sublabel: 'キリマンジャロ州、タンザニア' },
  everest: { label: 'エベレスト', sublabel: 'ネパールと中国' },
  angkorWat: { label: 'アンコール・ワット', sublabel: 'シェムリアップ、カンボジア' },
  singapore: { label: 'シンガポール', sublabel: 'マリーナベイ、シンガポール' },
  hongKong: { label: '香港', sublabel: 'ビクトリア・ハーバー、香港' },
  tokyo: { label: '東京', sublabel: '東京都、日本' },
  /** Both prefectures on purpose (§3.8): the summit's boundary is undetermined */
  fuji: { label: '富士山', sublabel: '静岡県と山梨県、日本' },
  sydneyHarbour: { label: 'シドニー湾', sublabel: 'シドニー、オーストラリア' },
  richat: { label: 'リシャット構造', sublabel: 'サハラ砂漠、モーリタニア' },
  greatBlueHole: { label: 'グレート・ブルーホール', sublabel: 'ライトハウス・リーフ、ベリーズ' },
  boraBora: { label: 'ボラボラ島', sublabel: 'ソシエテ諸島、フランス領ポリネシア' },
  hardyReef: { label: 'ハーディ・リーフ', sublabel: 'グレート・バリア・リーフ、オーストラリア' },
  male: { label: 'マレ', sublabel: '北マレ環礁、モルディブ' },
  deadSea: { label: '死海の塩田', sublabel: '死海南部、イスラエルとヨルダン' },
  binghamCanyon: { label: 'ビンガム・キャニオン鉱山', sublabel: 'ユタ州、アメリカ' },
  mountWhaleback: { label: 'マウント・ホエールバック鉱山', sublabel: 'ピルバラ、オーストラリア' },
  etna: { label: 'エトナ山', sublabel: 'シチリア、イタリア' },
  santorini: { label: 'サントリーニ島', sublabel: 'キクラデス諸島、ギリシャ' },
  teide: { label: 'テイデ山', sublabel: 'テネリフェ島、スペイン' },
  kilauea: { label: 'キラウエア', sublabel: 'ハワイ州、アメリカ' },
  craterLake: { label: 'クレーターレイク', sublabel: 'オレゴン州、アメリカ' },
  glenCanyonDam: { label: 'グレンキャニオン・ダム', sublabel: 'ペイジ、アリゾナ州、アメリカ' },
  /** Centre-pivot fields: never ミステリーサークル (a hoax) */
  gardenCity: { label: 'ガーデンシティの円形農地', sublabel: 'カンザス州、アメリカ' },
  almeria: { label: 'アルメリアの温室群', sublabel: 'アンダルシア州、スペイン' },
  /** The strait, with no country, as in the English */
  gibraltar: { label: 'ジブラルタル', sublabel: 'ジブラルタル海峡' },
  suezCanal: { label: 'スエズ運河', sublabel: 'イスマイリア、エジプト' },
  aswanDam: { label: 'アスワン・ハイ・ダム', sublabel: 'ナセル湖、エジプト' },
  wadiRum: { label: 'ワディ・ラム', sublabel: 'アカバ、ヨルダン' },
  sossusvlei: { label: 'ソーサスフレイ', sublabel: 'ナミブ砂漠、ナミビア' },
  victoriaFalls: { label: 'ビクトリアの滝', sublabel: 'ザンビアとジンバブエ' },
  threeGorges: { label: '三峡ダム', sublabel: '湖北省、中国' },
  shanghai: { label: '上海', sublabel: '黄浦江、中国' },
  itaipu: { label: 'イタイプダム', sublabel: 'ブラジルとパラグアイ' },
}
export default places
