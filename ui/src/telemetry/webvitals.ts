/**
 * Web Vitals Integration
 * 
 * Reports Core Web Vitals metrics as telemetry events.
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals'
import { track } from './index'

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
  if (typeof window === 'undefined') {
    return
  }

  // Track FCP (First Contentful Paint)
  onFCP((metric: Metric) => {
    track({
      event_type: 'web_vitals',
      metric: 'FCP',
      value: metric.value,
      rating: metric.rating,
    })
  })

  // Track LCP (Largest Contentful Paint)
  onLCP((metric: Metric) => {
    track({
      event_type: 'web_vitals',
      metric: 'LCP',
      value: metric.value,
      rating: metric.rating,
    })
  })

  // Track CLS (Cumulative Layout Shift)
  onCLS((metric: Metric) => {
    track({
      event_type: 'web_vitals',
      metric: 'CLS',
      value: metric.value,
      rating: metric.rating,
    })
  })

  // Track INP (Interaction to Next Paint)
  onINP((metric: Metric) => {
    track({
      event_type: 'web_vitals',
      metric: 'INP',
      value: metric.value,
      rating: metric.rating,
    })
  })

  // Track TTFB (Time to First Byte)
  onTTFB((metric: Metric) => {
    track({
      event_type: 'web_vitals',
      metric: 'TTFB',
      value: metric.value,
      rating: metric.rating,
    })
  })
}

