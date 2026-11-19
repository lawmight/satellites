import { afterEach, describe, expect, it } from 'vitest'
import enApp from '@/i18n/en/app'
import enEngine from '@/i18n/en/engine'
import { refText } from '@/i18n/messageRef'
import { msgs, setBundleForTests } from '@/i18n/runtime'
import { appRefText, CATALOG_FAULT, COMPUTE_FAULT, PROGRESS_CATALOG, PROGRESS_DONE } from './messageRefs'

describe('the messages the controller leaves in the store', () => {
  afterEach(() => setBundleForTests('en', null))

  it('read in English exactly as the store held them before they were refs', () => {
    expect(appRefText(CATALOG_FAULT, enApp)).toBe('Could not load the orbit catalog. Check your connection and try again.')
    expect(appRefText(COMPUTE_FAULT, enApp)).toBe('Something went wrong computing passes for this place. Try again in a moment.')
    expect(appRefText(PROGRESS_CATALOG, enApp)).toBe('Loading orbital elements')
    expect(appRefText(PROGRESS_DONE, enApp)).toBe('Report ready')
  })

  it('render in the active language, while the English object stays English', () => {
    setBundleForTests('de', { app: { ...enApp, faults: { ...enApp.faults, catalog: 'Der Bahnkatalog konnte nicht geladen werden.' } } })
    expect(appRefText(CATALOG_FAULT, msgs(enApp))).toBe('Der Bahnkatalog konnte nicht geladen werden.')
    expect(appRefText(CATALOG_FAULT, enApp)).toBe('Could not load the orbit catalog. Check your connection and try again.')
  })

  it("render through the shared ref renderer beside the engine's, as the computing readout shows store.progress", () => {
    const both = { engine: enEngine, app: enApp }
    expect(refText(PROGRESS_CATALOG, both)).toBe('Loading orbital elements')
    expect(refText({ id: 'engine.progress.loadingCatalog' }, both)).toBe('LOADING ORBITAL CATALOG')
    expect(refText(COMPUTE_FAULT, both, { english: true })).toBe(appRefText(COMPUTE_FAULT, enApp))
  })

  it('know nothing of other namespaces, other groups, or keys that are not messages', () => {
    expect(appRefText(undefined, enApp)).toBeUndefined()
    expect(appRefText({ id: 'engine.progress.catalog' }, enApp)).toBeUndefined()
    expect(appRefText({ id: 'app.notice.label' }, enApp)).toBeUndefined()
    expect(appRefText({ id: 'app.faults.constructor' }, enApp)).toBeUndefined()
    expect(appRefText({ id: 'app.faults' }, enApp)).toBeUndefined()
  })
})
