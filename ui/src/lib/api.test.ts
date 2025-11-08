import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getZoningByAPN, getZoningByLatLng, APIError } from './api'
import { validateZoningResult } from './validate'

// Mock axios module
const mockGet = vi.fn()
const mockCreate = vi.fn(() => ({
  get: mockGet,
}))

vi.mock('axios', () => {
  return {
    default: {
      create: mockCreate,
      isAxiosError: vi.fn((error: any) => error?.isAxiosError === true || error?.code !== undefined),
    },
    isAxiosError: vi.fn((error: any) => error?.isAxiosError === true || error?.code !== undefined),
  }
})

const mockZoningResult = {
  apn: '0204050712',
  jurisdiction: 'Austin, TX',
  zone: 'SF-3',
  setbacks_ft: {
    front: 25,
    side: 5,
    rear: 10,
    street_side: 0,
  },
  height_ft: 35,
  far: 0.4,
  lot_coverage_pct: 40,
  overlays: [],
  sources: [{ type: 'map', cite: 'austin_zoning_v2024' }],
  notes: '',
  run_ms: 150,
}

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGet.mockClear()
    mockCreate.mockReturnValue({ get: mockGet })
    // Reset mock implementation
    mockGet.mockImplementation(() => Promise.resolve({ data: {} }))
  })

  describe('getZoningByAPN', () => {
    it('should return valid zoning result', async () => {
      mockGet.mockResolvedValue({ data: mockZoningResult })

      const result = await getZoningByAPN('0204050712', 'austin')
      expect(validateZoningResult(result)).toBe(true)
      expect(result.apn).toBe('0204050712')
      expect(mockGet).toHaveBeenCalledWith('/zoning', {
        params: { apn: '0204050712', city: 'austin' },
      })
    })

    it('should throw APIError on network error', async () => {
      const networkError = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
        isAxiosError: true,
        response: undefined,
      }
      mockGet.mockRejectedValue(networkError)

      await expect(getZoningByAPN('0204050712')).rejects.toThrow(APIError)
    })

    it('should throw APIError on timeout', async () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout',
        isAxiosError: true,
        response: undefined,
      }
      mockGet.mockRejectedValue(timeoutError)

      await expect(getZoningByAPN('0204050712')).rejects.toThrow(APIError)
    })
  })

  describe('getZoningByLatLng', () => {
    it('should return valid zoning result', async () => {
      mockGet.mockResolvedValue({ data: mockZoningResult })

      const result = await getZoningByLatLng(30.2672, -97.7431, 'austin')
      expect(validateZoningResult(result)).toBe(true)
      expect(mockGet).toHaveBeenCalledWith('/zoning', {
        params: { latitude: 30.2672, longitude: -97.7431, city: 'austin' },
      })
    })
  })
})

