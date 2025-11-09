/**
 * Telemetry Event Contracts (PII-Safe)
 * 
 * No raw queries, APNs, addresses, or coordinates are captured.
 * Only lengths, booleans, counts, durations, and enums.
 */

export const EVENT_SCHEMA_VERSION = '1.0.0'

export type TelemetryEvent =
  | PageViewEvent
  | SearchSubmitEvent
  | ValidationErrorEvent
  | ResultsRenderEvent
  | ErrorShownEvent
  | WebVitalsEvent
  | AnswerRenderEvent
  | CitationOpenedEvent

export interface BaseEvent {
  event_type: string
  timestamp: number
  session_id: string
  build_id: string
  route: string
  schema_version: string
}

export interface PageViewEvent extends BaseEvent {
  event_type: 'page_view'
  referrer_type: 'internal' | 'external' | 'direct'
}

export interface SearchSubmitEvent extends BaseEvent {
  event_type: 'search_submit'
  mode: 'apn' | 'latlng'
  query_len: number // Length of query string (not the query itself)
  valid: boolean
}

export interface ValidationErrorEvent extends BaseEvent {
  event_type: 'validation_error'
  field: 'apn' | 'lat' | 'lng'
  reason: 'format' | 'range' | 'required'
}

export interface ResultsRenderEvent extends BaseEvent {
  event_type: 'results_render'
  result_count: number // Always 1 for single-parcel results
  fetch_ms: number
  render_ms: number
  schema_fields: number // Count of fields rendered (should be 11)
}

export interface ErrorShownEvent extends BaseEvent {
  event_type: 'error_shown'
  surface: 'results' | 'search'
  code: string // Error code (e.g., 'NETWORK_ERROR', 'NOT_FOUND', 'VALIDATION_ERROR')
}

export interface WebVitalsEvent extends BaseEvent {
  event_type: 'web_vitals'
  metric: 'FCP' | 'LCP' | 'CLS' | 'INP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
}

export interface AnswerRenderEvent extends BaseEvent {
  event_type: 'answer_render'
  intents_count: number
  ms_total: number
}

export interface CitationOpenedEvent extends BaseEvent {
  event_type: 'citation_opened'
  code_id: string
}

/**
 * JSON Schema for validation
 */
export const TELEMETRY_SCHEMA = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  definitions: {
    baseEvent: {
      type: 'object',
      required: ['event_type', 'timestamp', 'session_id', 'build_id', 'route', 'schema_version'],
      properties: {
        event_type: { type: 'string' },
        timestamp: { type: 'number' },
        session_id: { type: 'string' },
        build_id: { type: 'string' },
        route: { type: 'string' },
        schema_version: { type: 'string' },
      },
    },
    pageViewEvent: {
      allOf: [
        { $ref: '#/definitions/baseEvent' },
        {
          type: 'object',
          required: ['event_type', 'referrer_type'],
          properties: {
            event_type: { const: 'page_view' },
            referrer_type: { enum: ['internal', 'external', 'direct'] },
          },
        },
      ],
    },
    searchSubmitEvent: {
      allOf: [
        { $ref: '#/definitions/baseEvent' },
        {
          type: 'object',
          required: ['event_type', 'mode', 'query_len', 'valid'],
          properties: {
            event_type: { const: 'search_submit' },
            mode: { enum: ['apn', 'latlng'] },
            query_len: { type: 'number', minimum: 0 },
            valid: { type: 'boolean' },
          },
        },
      ],
    },
    validationErrorEvent: {
      allOf: [
        { $ref: '#/definitions/baseEvent' },
        {
          type: 'object',
          required: ['event_type', 'field', 'reason'],
          properties: {
            event_type: { const: 'validation_error' },
            field: { enum: ['apn', 'lat', 'lng'] },
            reason: { enum: ['format', 'range', 'required'] },
          },
        },
      ],
    },
    resultsRenderEvent: {
      allOf: [
        { $ref: '#/definitions/baseEvent' },
        {
          type: 'object',
          required: ['event_type', 'result_count', 'fetch_ms', 'render_ms', 'schema_fields'],
          properties: {
            event_type: { const: 'results_render' },
            result_count: { type: 'number', minimum: 0 },
            fetch_ms: { type: 'number', minimum: 0 },
            render_ms: { type: 'number', minimum: 0 },
            schema_fields: { type: 'number', minimum: 0 },
          },
        },
      ],
    },
    errorShownEvent: {
      allOf: [
        { $ref: '#/definitions/baseEvent' },
        {
          type: 'object',
          required: ['event_type', 'surface', 'code'],
          properties: {
            event_type: { const: 'error_shown' },
            surface: { enum: ['results', 'search'] },
            code: { type: 'string' },
          },
        },
      ],
    },
    webVitalsEvent: {
      allOf: [
        { $ref: '#/definitions/baseEvent' },
        {
          type: 'object',
          required: ['event_type', 'metric', 'value', 'rating'],
          properties: {
            event_type: { const: 'web_vitals' },
            metric: { enum: ['FCP', 'LCP', 'CLS', 'INP', 'TTFB'] },
            value: { type: 'number', minimum: 0 },
            rating: { enum: ['good', 'needs-improvement', 'poor'] },
          },
        },
      ],
    },
  },
  oneOf: [
    { $ref: '#/definitions/pageViewEvent' },
    { $ref: '#/definitions/searchSubmitEvent' },
    { $ref: '#/definitions/validationErrorEvent' },
    { $ref: '#/definitions/resultsRenderEvent' },
    { $ref: '#/definitions/errorShownEvent' },
    { $ref: '#/definitions/webVitalsEvent' },
  ],
} as const

