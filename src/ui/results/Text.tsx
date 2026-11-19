/**
 * Renders copy built in lib/copy.ts: prose with numbers set in mono (DESIGN §3), through the shared rich-copy renderer
 * (src/i18n/Rich.tsx), so a number keeps its look (and its bidi isolation in right-to-left text) wherever a language
 * puts it in the sentence. Sentences join with the language's own gap: a space, or nothing in Chinese and Japanese.
 */
import { Fragment } from 'react'
import { LOCALE_INFO } from '../../../api/_lib/i18n/locales'
import { Rich } from '@/i18n/Rich'
import { useLocale } from '@/i18n/runtime'
import type { Sentence } from './lib/copy'
import s from './results.module.css'

const CLASSES = { num: s.num, unit: s.unit }

export function SentenceText({ parts }: { parts: Sentence }) {
  return <Rich parts={parts} classes={CLASSES} />
}

export function Paragraph({ sentences, className }: { sentences: Sentence[]; className?: string }) {
  const gap = LOCALE_INFO[useLocale()].sentenceGap
  return (
    <p className={className ?? s.prose}>
      {sentences.map((sentence, i) => (
        <Fragment key={i}>
          {i && gap ? gap : null}
          <SentenceText parts={sentence} />
        </Fragment>
      ))}
    </p>
  )
}
