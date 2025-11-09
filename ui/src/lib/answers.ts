/**
 * Answers API Client
 * 
 * Fetches zoning answers for a property.
 */

import { ZoningAnswer } from '../engine/answers/rules'
import { mergeWithOverrides, loadOverrides } from '../engine/answers/merge'

export interface AnswersRequest {
  apn?: string
  latitude?: number
  longitude?: number
  city: string
  zone: string
  applyOverrides?: boolean // Whether to apply overrides (default: true)
}

export interface AnswersResponse {
  answers: ZoningAnswer[]
  fetched_at: string
  zone: string
}

/**
 * Get answers for a property
 */
export async function getAnswers(request: AnswersRequest): Promise<AnswersResponse> {
  const ANSWERS_STUB = import.meta.env.VITE_ANSWERS_STUB === '1' || import.meta.env.ANSWERS_STUB === '1'
  const ANSWERS_ENABLE = import.meta.env.VITE_ANSWERS_ENABLE !== 'false'

  if (!ANSWERS_ENABLE) {
    return {
      answers: [],
      fetched_at: new Date().toISOString(),
      zone: request.zone,
    }
  }

  // Stub mode: load from golden fixtures
  if (ANSWERS_STUB) {
    return getStubbedAnswers(request.zone)
  }

  // Real mode: use rules engine (in-process, no network)
  const { getAnswersForZone } = await import('../engine/answers/rules')
  const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()
  let answers = getAnswersForZone(request.zone)
  const msTotal = typeof performance !== 'undefined' ? Math.round(performance.now() - startTime) : 0

  // Apply overrides if enabled (default: true)
  const shouldApplyOverrides = request.applyOverrides !== false
  if (shouldApplyOverrides) {
    const overrides = await loadOverrides()
    answers = answers.map(answer => mergeWithOverrides(answer, overrides, request.apn))
  }

  // Track telemetry
  if (typeof window !== 'undefined' && (window as any).__telem_track) {
    ;(window as any).__telem_track('answer_render', {
      intents_count: answers.length,
      ms_total: msTotal,
    })
  }

  return {
    answers,
    fetched_at: new Date().toISOString(),
    zone: request.zone,
  }
}

/**
 * Get stubbed answers from golden fixtures
 */
async function getStubbedAnswers(zone: string): Promise<AnswersResponse> {
  try {
    // Normalize zone for filename
    const normalizedZone = zone.replace(/-/g, '').toLowerCase()
    const fixturePath = `/engine/answers/goldens/${normalizedZone}.json`

    const response = await fetch(fixturePath)
    if (response.ok) {
      const data = await response.json()
      let answers = data.answers || []
      
      // Apply overrides to stubbed answers (for CI/testing)
      const overrides = await loadOverrides()
      answers = answers.map((answer: ZoningAnswer) => mergeWithOverrides(answer, overrides))
      
      return {
        answers,
        fetched_at: new Date().toISOString(),
        zone: data.zone || zone,
      }
    }
  } catch (error) {
    console.warn('Failed to load stubbed answers:', error)
  }

  // Fallback: return empty answers
  return {
    answers: [],
    fetched_at: new Date().toISOString(),
    zone,
  }
}

