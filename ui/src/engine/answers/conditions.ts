/**
 * Lot Exception Conditions
 * 
 * Predicates and adjustments for lot-specific exceptions.
 */

import type { CodeCitation } from './rules'

export type ExceptionPredicate = 'corner_lot' | 'flag_lot' | 'min_frontage' | 'steep_slope'

export interface LotContext {
  corner?: boolean
  flag?: boolean
  frontage?: number // feet
  width?: number // feet
  slope?: number // percent grade
}

export interface ExceptionAdjustment {
  intent: string
  op: 'max' | 'min' | 'add' | 'replace'
  value: number
  unit: string
}

export interface ExceptionRule {
  id: string
  predicate: ExceptionPredicate
  adjustments: ExceptionAdjustment[]
  citations: CodeCitation[]
}

/**
 * Check if lot is a corner lot
 */
export function isCornerLot(context: LotContext): boolean {
  return context.corner === true
}

/**
 * Check if lot is a flag lot
 */
export function isFlagLot(context: LotContext): boolean {
  return context.flag === true
}

/**
 * Check if lot has minimum frontage requirement
 */
export function hasMinFrontage(context: LotContext, threshold: number = 50): boolean {
  return context.frontage !== undefined && context.frontage < threshold
}

/**
 * Check if lot has steep slope
 */
export function hasSteepSlope(context: LotContext, threshold: number = 15): boolean {
  return context.slope !== undefined && context.slope > threshold
}

/**
 * Evaluate exception predicate
 */
export function evaluatePredicate(
  predicate: ExceptionPredicate,
  context: LotContext
): boolean {
  switch (predicate) {
    case 'corner_lot':
      return isCornerLot(context)
    case 'flag_lot':
      return isFlagLot(context)
    case 'min_frontage':
      return hasMinFrontage(context)
    case 'steep_slope':
      return hasSteepSlope(context)
    default:
      return false
  }
}

/**
 * Load exception rules
 */
export async function loadExceptionRules(): Promise<ExceptionRule[]> {
  try {
    const response = await fetch('/engine/answers/config/exceptions.json')
    if (response.ok) {
      const data = await response.json()
      return Array.isArray(data) ? data : []
    }
  } catch (error) {
    console.warn('Failed to load exception rules:', error)
  }
  return []
}
