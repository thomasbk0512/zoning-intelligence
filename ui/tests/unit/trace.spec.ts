/**
 * Unit tests for Answer Traces
 */

import { describe, it, expect } from 'vitest'
import { buildTrace, createRuleStep, createOverlayStep, createExceptionStep } from '../../src/engine/answers/trace'
import type { ZoningAnswer } from '../../src/engine/answers/rules'
import type { AnswerTrace } from '../../src/engine/answers/trace'

describe('Answer Traces', () => {
  it('should build trace with rule step only', () => {
    const answer: ZoningAnswer = {
      intent: 'front_setback',
      status: 'answered',
      value: 25,
      unit: 'ft',
      rationale: 'Minimum front yard setback',
      citations: [
        {
          code_id: 'austin_ldc_2024',
          section: '25-2-492',
          anchor: '(B)(1)',
        },
      ],
      answer_id: 'SF-3:front_setback',
      provenance: 'rule',
    }

    const steps = [
      createRuleStep('rule.SF3.front', 25, '25', answer.citations),
    ]

    const trace = buildTrace(answer, 'austin', 'SF-3', steps)

    expect(trace.answer_id).toBe('SF-3:front_setback')
    expect(trace.steps.length).toBe(1)
    expect(trace.steps[0].type).toBe('rule')
    expect(trace.final_value).toBe(25)
    expect(trace.provenance).toBe('rule')
    expect(trace.conflict).toBe(false)
  })

  it('should build trace with rule + overlay steps', () => {
    const answer: ZoningAnswer = {
      intent: 'front_setback',
      status: 'answered',
      value: 30,
      unit: 'ft',
      rationale: 'Adjusted by overlay',
      citations: [],
      answer_id: 'SF-3:front_setback',
      provenance: 'overlay',
    }

    const ruleStep = createRuleStep(
      'rule.SF3.front',
      25,
      '25',
      [{ code_id: 'austin_ldc_2024', section: '25-2-492' }]
    )
    const overlayStep = createOverlayStep(
      'overlay.WQZ.min25',
      'min',
      25,
      30,
      30,
      [{ code_id: 'austin_ldc_2024', section: '25-2-492' }]
    )

    const trace = buildTrace(answer, 'austin', 'SF-3', [ruleStep, overlayStep])

    expect(trace.steps.length).toBe(2)
    expect(trace.steps[0].type).toBe('rule')
    expect(trace.steps[1].type).toBe('overlay')
    expect(trace.final_value).toBe(30)
    expect(trace.provenance).toBe('overlay')
  })

  it('should build trace with conflict', () => {
    const answer: ZoningAnswer = {
      intent: 'front_setback',
      status: 'needs_review',
      citations: [],
      answer_id: 'SF-3:front_setback',
      provenance: 'rule',
    }

    const steps = [
      createRuleStep('rule.SF3.front', 25, '25', []),
    ]

    const trace = buildTrace(answer, 'austin', 'SF-3', steps)

    expect(trace.conflict).toBe(true)
    expect(trace.final_value).toBeNull()
    expect(trace.provenance).toBe('conflict')
  })

  it('should require first step to be rule', () => {
    const answer: ZoningAnswer = {
      intent: 'front_setback',
      status: 'answered',
      value: 25,
      unit: 'ft',
      citations: [],
      answer_id: 'SF-3:front_setback',
      provenance: 'rule',
    }

    const steps = [
      createOverlayStep('overlay.WQZ', 'min', 20, 25, 25, []),
    ]

    expect(() => buildTrace(answer, 'austin', 'SF-3', steps)).toThrow()
  })
})

