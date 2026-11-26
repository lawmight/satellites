/**
 * Russian copy for the HUD, the instrument chrome in the four corners (see docs/i18n/ru.md §3.8, §6.6, §7): the About
 * link, the scene line, the orbit catalog's status and the sub-solar readout.
 *
 * Why these words: every corner line is a mono label, so the words are nouns («Повтор», «Каталог», «Подсолнечная
 * точка») kept close to the English length (on a 375 px phone «Как это работает» and the sun line nearly touch).
 * Coordinates, clocks, ISO stamps and "GMST" arrive as they are. Ages use the GOST unit symbols, which never inflect
 * («мин», «ч»); «дн.» keeps its period, as Intl prints it, so the age needs no plural forms. «устарел» follows the age
 * («3 дн. назад, устарел»): before it, «Устарел, 3 дн. назад» read "went stale 3 days ago". It agrees with «каталог»,
 * the only thing it is ever said of.
 */
import type en from '../en/hud'
import { fmt } from '../../../api/_lib/i18n/format'
import { num, type Rich } from '../../../api/_lib/i18n/parts'
import type { AgeUnit } from '@/ui/hud/readouts'

const f = fmt('ru')

/** The catalog's compact age: «<1 мин», «42 мин», «5 ч», «3 дн.» */
function age(unit: AgeUnit, n: number): string {
  if (unit === 'underMinute') return '<1\u00a0мин'
  if (unit === 'minute') return `${f.int(n)}\u00a0мин`
  if (unit === 'hour') return `${f.int(n)}\u00a0ч`
  return `${f.int(n)}\u00a0дн.`
}

const hud: typeof en = {
  about: 'Как это работает',
  sourceLink: 'Открытый код',
  sourceLinkLabel: 'Открытый код: проект на GitHub',
  home: 'Watched, на главную',
  regionTime: 'Время',
  regionCatalog: 'Каталог орбит',
  regionSun: 'Солнце',

  // The replay's simulated clock: «Повтор», never «Кадр», which would read as the time an image was taken.
  scene: 'Повтор',
  sun: (lat: string, lon: string) => `Солнце ${lat} ${lon}`,
  subsolar: 'Подсолнечная точка',
  gmst: (time: string) => `GMST ${time}`,

  objects: (n: number) =>
    `${Number.isInteger(n) ? f.int(n) : f.dec(n, 1)}\u00a0${f.plural(n, { one: 'объект', few: 'объекта', many: 'объектов', other: 'объекта' })}`,
  // Where a count of many would stand: «— объектов» reads as «16 893 объектов» will.
  objectsPending: (count: string): Rich => [num(count), '\u00a0объектов'],
  catalog: 'Каталог',
  fetched: (stamp: string) => `Получен ${stamp}`,
  catalogAge: (unit: AgeUnit, n: number, stale: boolean) => `${age(unit, n)} назад${stale ? ', устарел' : ''}`,
  catalogUnavailable: 'Каталог недоступен',
  catalogLoading: 'Загрузка каталога',
}
export default hud
