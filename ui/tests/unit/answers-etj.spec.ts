/**
 * Unit tests for ETJ Answers
 */

import { describe, it, expect } from 'vitest'
import { getAnswersForZone } from '../../src/engine/answers/rules'

describe('ETJ Answers', () => {
  it('should return answers for SF-3 in ETJ', () => {
    const answers = getAnswersForZone('SF-3', 'travis_etj')
    expect(answers.length).toBe(6)
    
    const frontSetback = answers.find(a => a.intent === 'front_setback')
    expect(frontSetback).toBeDefined()
    expect(frontSetback?.value).toBe(25)
    expect(frontSetback?.unit).toBe('ft')
    expect(frontSetback?.citations[0].code_id).toBe('travis_etj_ord_2024')
    expect(frontSetback?.citations[0].section).toBe('3.3.1')
  })

  it('should return answers for SF-2 in ETJ', () => {
    const answers = getAnswersForZone('SF-2', 'travis_etj')
    expect(answers.length).toBe(6)
    
    const minLotSize = answers.find(a => a.intent === 'min_lot_size')
    expect(minLotSize).toBeDefined()
    expect(minLotSize?.value).toBe(6000)
    expect(minLotSize?.unit).toBe('sqft')
    expect(minLotSize?.citations[0].code_id).toBe('travis_etj_ord_2024')
  })

  it('should return answers for SF-1 in ETJ', () => {
    const answers = getAnswersForZone('SF-1', 'travis_etj')
    expect(answers.length).toBe(6)
    
    const frontSetback = answers.find(a => a.intent === 'front_setback')
    expect(frontSetback).toBeDefined()
    expect(frontSetback?.value).toBe(30)
    expect(frontSetback?.citations[0].code_id).toBe('travis_etj_ord_2024')
  })

  it('should have at least one citation per answered intent', () => {
    const answers = getAnswersForZone('SF-3', 'travis_etj')
    answers.forEach(answer => {
      if (answer.status === 'answered') {
        expect(answer.citations.length).toBeGreaterThanOrEqual(1)
        expect(answer.citations[0].code_id).toBe('travis_etj_ord_2024')
      }
    })
  })
})

