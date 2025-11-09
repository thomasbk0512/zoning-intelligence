/**
 * Central UI copy strings
 * No hardcoded strings in components
 */

export const COPY = {
  // Home page
  home: {
    title: 'Zoning Intelligence',
    subtitle: 'Get instant zoning information for any property',
    nlqPlaceholder: "Ask a question... (e.g., 'how tall can I build in SF-3 APN 0204050712')",
    nlqLabel: 'Ask a zoning question',
    searchButton: 'Search',
    searchingButton: 'Searching...',
    advancedSearchLink: 'Advanced Search',
    recentSearchesTitle: 'Recent Searches',
    tryAsking: 'Try asking:',
  },

  // Search page
  search: {
    title: 'Search Property',
    askQuestionLabel: 'Ask a Question',
    askQuestionPlaceholder: "e.g., 'how tall can I build in SF-3 APN 0204050712'",
    askQuestionHelp: 'Ask about setbacks, height limits, lot coverage, or minimum lot size. Include an APN or coordinates.',
    apnLabel: 'APN',
    apnPlaceholder: '0204050712',
    apnHelp: 'Enter 8-12 digits. Spaces and dashes are automatically removed.',
    apnSample: 'Sample',
    latitudeLabel: 'Latitude',
    latitudePlaceholder: '30.2672',
    longitudeLabel: 'Longitude',
    longitudePlaceholder: '-97.7431',
    locationLabel: 'Location (Lat/Lng)',
    cityLabel: 'City',
    cityOptional: '(optional)',
    searchButton: 'Search',
    searchingButton: 'Searching...',
    continueButton: 'Continue with',
    getAnswersButton: 'Get Answers',
  },

  // Parse preview
  parsePreview: {
    detectedIntent: 'Detected Intent',
    multipleIntents: 'Multiple intents detected. Please select one:',
    confidence: {
      high: 'High confidence match',
      medium: 'Medium confidence - please verify',
      low: 'Low confidence - may need clarification',
    },
    guidance: {
      high: 'Ready to search',
      medium: 'Please review the detected intent and location',
      low: 'Try adding more details or an APN/coordinates',
    },
    missingApn: {
      title: 'Missing APN?',
      message: 'Add an APN or coordinates to get instant results.',
      example: 'Example: "front setback for APN 0204050712" or "lot coverage at 30.25, -97.75"',
    },
    location: 'Location',
    zone: 'Zone',
  },

  // Intent chips
  intent: {
    front_setback: 'Front Setback',
    side_setback: 'Side Setback',
    rear_setback: 'Rear Setback',
    max_height: 'Max Height',
    lot_coverage: 'Lot Coverage',
    min_lot_size: 'Min Lot Size',
  },

  // Validation errors
  validation: {
    apnRequired: 'APN is required',
    apnInvalid: 'Invalid APN format',
    latitudeRequired: 'Valid latitude is required',
    longitudeRequired: 'Valid longitude is required',
    latitudeRange: 'Latitude must be between -90 and 90',
    longitudeRange: 'Longitude must be between -180 and 180',
    nlqRequired: 'Please enter a question',
    nlqTooShort: 'Question must be at least 4 characters',
  },

  // City field
  city: {
    austin: 'Austin, TX',
    jurisdiction: 'Jurisdiction: Austin, TX (current coverage)',
  },

  // General
  general: {
    error: 'An unexpected error occurred. Please try again.',
    retry: 'Retry Search',
    readyToSearch: 'Ready to search',
    searching: 'Searching for property...',
  },
}

