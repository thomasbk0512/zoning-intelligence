/**
 * Telemetry Runtime
 * 
 * Privacy-safe, token-light telemetry with in-memory queue,
 * multiple transports, and sampling support.
 */

import type { TelemetryEvent } from './events'

// Configuration
const TELEM_ENABLE = import.meta.env.VITE_TELEM_ENABLE !== 'false' // Default true
const TELEM_TRANSPORT = import.meta.env.VITE_TELEM_TRANSPORT || 
  (import.meta.env.DEV ? 'console' : 'console')
const TELEM_SAMPLING_RATE = parseFloat(import.meta.env.VITE_TELEM_SAMPLING_RATE || '1.0')

// Session and build IDs
const SESSION_ID = generateSessionId()
const BUILD_ID = import.meta.env.VITE_BUILD_ID || 'dev'

// In-memory event queue
let eventQueue: TelemetryEvent[] = []
let currentRoute = '/'

// Flush configuration
const FLUSH_INTERVAL_MS = 30000 // 30 seconds
const MAX_QUEUE_SIZE = 100
let flushTimer: number | null = null

/**
 * Initialize telemetry
 */
export function initTelemetry(initialRoute: string = '/') {
  if (!TELEM_ENABLE || TELEM_TRANSPORT === 'noop') {
    return
  }

  currentRoute = initialRoute
  startFlushTimer()

  // Flush on page unload
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', flush)
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flush()
      }
    })
  }

  // Expose flush function and track function for E2E tests
  if (typeof window !== 'undefined') {
    ;(window as any).__telem_flush = flush
    ;(window as any).__telem_get_queue = () => [...eventQueue]
    ;(window as any).__telem_track = (eventType: string, payload: any) => {
      track({ event_type: eventType as any, ...payload } as any)
    }
  }
}

/**
 * Track an event
 */
export function track(event: Omit<TelemetryEvent, 'timestamp' | 'session_id' | 'build_id' | 'route' | 'schema_version'>) {
  if (!TELEM_ENABLE || TELEM_TRANSPORT === 'noop') {
    return
  }

  // Apply sampling
  if (Math.random() > TELEM_SAMPLING_RATE) {
    return
  }

  const fullEvent: TelemetryEvent = {
    ...event,
    timestamp: Date.now(),
    session_id: SESSION_ID,
    build_id: BUILD_ID,
    route: currentRoute,
    schema_version: '1.0.0',
  } as TelemetryEvent

  eventQueue.push(fullEvent)

  // Flush if queue is too large
  if (eventQueue.length >= MAX_QUEUE_SIZE) {
    flush()
  }
}

/**
 * Update current route
 */
export function setRoute(route: string) {
  currentRoute = route
}

/**
 * Flush events to transport
 */
export function flush(): TelemetryEvent[] {
  if (eventQueue.length === 0) {
    return []
  }

  const events = [...eventQueue]
  eventQueue = []

  switch (TELEM_TRANSPORT) {
    case 'console':
      events.forEach(event => {
        console.log('[TELEMETRY]', JSON.stringify(event))
      })
      break

    case 'beacon':
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const endpoint = import.meta.env.VITE_TELEM_ENDPOINT || '/telemetry'
        const blob = new Blob([events.map(e => JSON.stringify(e)).join('\n')], {
          type: 'application/x-ndjson',
        })
        navigator.sendBeacon(endpoint, blob)
      }
      break

    case 'noop':
      // No-op
      break
  }

  return events
}

/**
 * Start periodic flush timer
 */
function startFlushTimer() {
  if (flushTimer !== null) {
    return
  }

  flushTimer = window.setInterval(() => {
    flush()
  }, FLUSH_INTERVAL_MS)
}

/**
 * Generate session ID
 */
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Get current queue (for testing)
 */
export function getQueue(): TelemetryEvent[] {
  return [...eventQueue]
}

