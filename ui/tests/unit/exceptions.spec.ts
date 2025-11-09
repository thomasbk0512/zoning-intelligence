/**
 * Unit tests for Exceptions
 */

import { describe, it, expect } from 'vitest'
import {
  isCornerLot,
  isFlagLot,
  hasMinFrontage,
  hasSteepSlope,
  evaluatePredicate,
  loadExceptionRules,
} from '../../src/engine/answers/conditions'
import type { LotContext } from '../../src/engine/answers/conditions'

describe('Exception Predicates', () => {
  it('should detect corner lot', () => {
    expect(isCornerLot({ corner: true })).toBe(true)
    expect(isCornerLot({ corner: false })).toBe(false)
    expect(isCornerLot({})).toBe(false)
  })

  it('should detect flag lot', () => {
    expect(isFlagLot({ flag: true })).toBe(true)
    expect(isFlagLot({ flag: false })).toBe(false)
    expect(isFlagLot({})).toBe(false)
  })

  it('should detect minimum frontage', () => {
    expect(hasMinFrontage({ frontage: 40 }, 50)).toBe(true)
    expect(hasMinFrontage({ frontage: 60 }, 50)).toBe(false)
    expect(hasMinFrontage({}, 50)).toBe(false)
  })

  it('should detect steep slope', () => {
    expect(hasSteepSlope({ slope: 20 }, 15)).toBe(true)
    expect(hasSteepSlope({ slope: 10 }, 15)).toBe(false)
    expect(hasSteepSlope({}, 15)).toBe(false)
  })

  it('should evaluate corner_lot predicate', () => {
    expect(evaluatePredicate('corner_lot', { corner: true })).toBe(true)
    expect(evaluatePredicate('corner_lot', { corner: false })).toBe(false)
  })

  it('should evaluate flag_lot predicate', () => {
    expect(evaluatePredicate('flag_lot', { flag: true })).toBe(true)
    expect(evaluatePredicate('flag_lot', { flag: false })).toBe(false)
  })

  it('should evaluate min_frontage predicate', () => {
    expect(evaluatePredicate('min_frontage', { frontage: 40 })).toBe(true)
    expect(evaluatePredicate('min_frontage', { frontage: 60 })).toBe(false)
  })

  it('should evaluate steep_slope predicate', () => {
    expect(evaluatePredicate('steep_slope', { slope: 20 })).toBe(true)
    expect(evaluatePredicate('steep_slope', { slope: 10 })).toBe(false)
  })

  it('should load exception rules without errors', async () => {
    const rules = await loadExceptionRules()
    expect(Array.isArray(rules)).toBe(true)
  })
})
