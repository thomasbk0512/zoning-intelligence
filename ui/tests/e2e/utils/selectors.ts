/**
 * Centralized selectors for E2E tests
 * Uses data-testid attributes for stable, semantic selectors
 */

export const selectors = {
  // Home page
  homeCtaSearch: '[data-testid="home-cta-search"]',
  
  // Search page
  searchForm: '[data-testid="search-form"]',
  searchInputApn: '[data-testid="search-input-apn"]',
  searchInputLatitude: '[data-testid="search-input-latitude"]',
  searchInputLongitude: '[data-testid="search-input-longitude"]',
  searchSubmitButton: '[data-testid="search-submit-button"]',
  searchError: '[data-testid="search-error"]',
  searchRetryButton: '[data-testid="search-retry-button"]',
  
  // Results page
  resultsTitle: '[data-testid="results-title"]',
  resultsContent: '[data-testid="results-content"]',
  resultsPrintButton: '[data-testid="results-print-button"]',
  resultsNewSearchButton: '[data-testid="results-new-search-button"]',
  
  // Common
  ariaLiveRegion: '[role="status"][aria-live]',
  ariaAlert: '[role="alert"]',
} as const

