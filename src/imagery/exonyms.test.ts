import { afterEach, describe, expect, it } from 'vitest'
import { setBundleForTests } from '@/i18n/runtime'
import enGeo from '@/i18n/en/geo'
import koExonyms from '@/i18n/ko/exonyms'
import { exonym, parseExonyms } from './exonyms'
import { displayLabel, displaySublabel } from './geocode'

/** A small German table, in the generated tables' format. */
const DE = 'DE:Munich=München;Cologne=Köln;*Bavaria=Bayern;*North Rhine-Westphalia=Nordrhein-Westfalen|IT:Milan=Mailand;*Lombardy=Lombardei|GB:London=London'
const UK = 'UA:Kyiv=Київ;Lviv=Львів;*Lviv=Львівська область;*Kyiv City=місто Київ|PL:Warsaw=Варшава'

describe('exonyms', () => {
  afterEach(() => setBundleForTests('en', null))

  it('parses the table by country, towns apart from regions, keyed as typed', () => {
    const t = parseExonyms(`${DE}|:Sea of Japan=동해|junk|XX:noequals;=nothing;empty=`)
    expect(t.towns.get('DE|munich')).toBe('München')
    expect(t.towns.get('IT|milan')).toBe('Mailand')
    expect(t.regions.get('DE|bavaria')).toBe('Bayern')
    expect(t.regions.get('DE|north rhine westphalia')).toBe('Nordrhein-Westfalen')
    expect(t.towns.get('|sea of japan')).toBe('동해')
    expect(t.towns.size + t.regions.size).toBe(8)
  })

  it('names nothing in English, or in a language without a table', () => {
    expect(exonym('Munich', 'de', 'label')).toBe('Munich')
    setBundleForTests('fr', {})
    expect(exonym('Munich', 'de', 'label')).toBe('Munich')
  })

  it("looks a name up in the place's own country only", () => {
    setBundleForTests('de', { exonyms: { names: DE } })
    expect(exonym('Munich', 'de', 'label')).toBe('München')
    expect(exonym('MUNICH', 'DE', 'label')).toBe('München')
    expect(exonym('Munich', 'us', 'label')).toBe('Munich') // Munich, North Dakota
    expect(exonym('Munich', undefined, 'label')).toBe('Munich') // a link carries no country
    expect(exonym('Milan', 'it', 'label')).toBe('Mailand')
    expect(exonym('Milan', 'us', 'label')).toBe('Milan')
  })

  it('reads a label among towns first and a part of the where line among regions first', () => {
    setBundleForTests('uk', { exonyms: { names: UK } })
    expect(exonym('Lviv', 'ua', 'label')).toBe('Львів')
    expect(exonym('Lviv', 'ua', 'where')).toBe('Львівська область')
    expect(exonym('Kyiv City', 'ua', 'label')).toBe('місто Київ') // only a region by that name
  })

  it('shows Korean readers 동해, 독도, 백두산 and 황해 where the data names them otherwise, and nothing else', () => {
    setBundleForTests('ko', { exonyms: koExonyms })
    const shown = (label: string, countryCode?: string) => displayLabel({ label, countryCode })
    // As the offline list and Photon spell them, with the country they give.
    expect([shown('Sea of Japan'), shown('Yellow Sea'), shown('Liancourt Rocks', 'kr'), shown('Dokdo', 'KR')]).toEqual(['동해', '황해', '독도', '독도'])
    expect([shown('Paektu-san', 'cn'), shown('Paektu Mountain', 'kp'), shown('Changbai Mountain', 'cn'), shown('Baekdu Mountain')]).toEqual(['백두산', '백두산', '백두산', '백두산'])
    // A restaurant in Tokyo, a bar in Greece, the town of Changbai and the islands of Japan called Takeshima keep their names.
    expect([shown('Sea of Japan', 'jp'), shown('Yellow Sea', 'gr'), shown('Changbai', 'cn'), shown('Takeshima', 'jp')]).toEqual([
      'Sea of Japan',
      'Yellow Sea',
      'Changbai',
      'Takeshima',
    ])
    expect(displaySublabel({ sublabel: 'North Gyeongsang, South Korea', countryCode: 'kr' })).toBe('North Gyeongsang, 대한민국')
  })

  it('shows the label and the where line in the visitor’s language, and keeps the Place English', () => {
    const where = (rest: string | undefined, country: string) => (rest === undefined ? country : `${rest}, ${country}`)
    setBundleForTests('de', { exonyms: { names: DE }, geo: { ...enGeo, where } })
    const munich = { label: 'Munich', sublabel: 'Bavaria, Germany', countryCode: 'de' }
    expect([displayLabel(munich), displaySublabel(munich)]).toEqual(['München', 'Bayern, Deutschland'])
    // Each part of the where line, in its order and punctuation; parts it has no name for stay as they came.
    expect(displaySublabel({ sublabel: 'Cologne, North Rhine-Westphalia, Germany', countryCode: 'de' })).toBe('Köln, Nordrhein-Westfalen, Deutschland')
    expect(displaySublabel({ sublabel: 'Bus stop, Milan, Lombardy, Italy', countryCode: 'it' })).toBe('Bus stop, Mailand, Lombardei, Italien')
    // A where line that does not end with the place's country is a curated place's copy, or a geocoder's own: as it came.
    expect(displaySublabel({ sublabel: 'Bavaria, Deutschland', countryCode: 'de' })).toBe('Bavaria, Deutschland')
    expect(munich).toEqual({ label: 'Munich', sublabel: 'Bavaria, Germany', countryCode: 'de' })
    setBundleForTests('en', null)
    expect([displayLabel(munich), displaySublabel(munich)]).toEqual(['Munich', 'Bavaria, Germany'])
  })
})
