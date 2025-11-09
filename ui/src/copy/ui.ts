/**
 * Central UI copy strings
 * No hardcoded strings in components
 */

export const COPY = {
  // Scope
  scope: {
    banner: 'Austin, TX + Travis County ETJ',
    coverage: 'Coverage: Austin & ETJ',
  },

  // Home page
  home: {
    title: 'Zoning Intelligence',
    subtitle: 'Instant zoning answers for Austin, TX parcels.',
    nlqPlaceholder: "Ask a question or paste an APN… e.g., 'front setback SF-3 APN 0204050712'",
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
    askQuestionPlaceholder: "Ask a question or paste an APN… e.g., 'front setback SF-3 APN 0204050712'",
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
    coverageLine: 'Coverage: Austin & ETJ',
  },

  // Parse preview
  parsePreview: {
    detectedIntent: 'Detected Intent',
    multipleIntents: 'Multiple intents detected. Please select one:',
    confidence: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    guidance: {
      high: 'Ready to search',
      medium: 'Please review the detected intent and location',
      low: 'Low confidence — add APN or coordinates to route directly.',
    },
    missingApn: {
      title: 'Missing APN?',
      message: 'Add an APN (0204050712) or coordinates (30.25,-97.75).',
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

  // Error messages
  errors: {
    network: {
      title: 'Connection Error',
      message: 'Unable to connect to the server.',
      suggestions: [
        'Check your internet connection',
        'Verify the backend server is running',
        'Try refreshing the page',
      ],
      retry: 'Retry Connection',
    },
    timeout: {
      title: 'Request Timeout',
      message: 'The request took too long to complete.',
      suggestions: [
        'The server may be busy. Please try again.',
        'Check your internet connection speed',
      ],
      retry: 'Try Again',
    },
    server: {
      title: 'Server Error',
      message: 'The server encountered an error processing your request.',
      suggestions: [
        'Please try again in a few moments',
        'If the problem persists, contact support',
      ],
      retry: 'Retry',
    },
    notFound: {
      title: 'Property Not Found',
      message: 'No property found matching your search.',
      suggestions: [
        'Double-check the APN or coordinates',
        'Try a different search method',
      ],
    },
    unknown: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred.',
      suggestions: [
        'Please try again',
        'If the problem continues, refresh the page',
      ],
      retry: 'Try Again',
    },
  },
}

