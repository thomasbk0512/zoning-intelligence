/**
 * Recent searches management
 * Stores up to 3 recent searches in localStorage
 */

const STORAGE_KEY = 'zoning_recent_searches'
const MAX_RECENTS = 3

export interface RecentSearch {
  query: string
  intent?: string
  timestamp: number
  resultType?: 'apn' | 'latlng' | 'nlq'
}

/**
 * Get recent searches from localStorage
 * @returns Array of recent searches (newest first)
 */
export function getRecentSearches() {
  if (typeof window === 'undefined') {
    return []
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }
    
    const recents = JSON.parse(stored)
    // Validate structure
    if (!Array.isArray(recents)) {
      return []
    }
    
    // Sort by timestamp (newest first) and limit
    return recents
      .filter(r => r && r.query && r.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECENTS)
  } catch (error) {
    console.warn('Failed to load recent searches:', error)
    return []
  }
}

/**
 * Add a search to recent searches
 * @param search - Search to add
 */
export function addRecentSearch(search) {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const recents = getRecentSearches()
    
    // Remove duplicates (same query)
    const filtered = recents.filter(r => r.query !== search.query)
    
    // Add new search at the beginning
    const updated = [
      {
        query: search.query,
        intent: search.intent,
        timestamp: Date.now(),
        resultType: search.resultType || 'nlq',
      },
      ...filtered,
    ].slice(0, MAX_RECENTS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.warn('Failed to save recent search:', error)
  }
}

/**
 * Add recent search with deep link
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query
 * @param {string} [params.intent] - Detected intent
 * @param {string} [params.resultType] - Type of result
 * @param {string} [params.deepLink] - Deep link URL
 */
export function addRecent(params) {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    const recents = getRecentSearches()
    
    // Remove duplicates (same query)
    const filtered = recents.filter(r => r.query !== params.query)
    
    // Add new search at the beginning
    const updated = [
      {
        query: params.query,
        intent: params.intent,
        timestamp: Date.now(),
        resultType: params.resultType || 'nlq',
        deepLink: params.deepLink,
      },
      ...filtered,
    ].slice(0, MAX_RECENTS)
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (error) {
    console.warn('Failed to save recent search:', error)
  }
}

/**
 * Clear all recent searches
 */
export function clearRecentSearches() {
  if (typeof window === 'undefined') {
    return
  }
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('Failed to clear recent searches:', error)
  }
}

