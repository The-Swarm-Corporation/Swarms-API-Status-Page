export const MOCK_OVERALL_STATUS = {
  timestamp: new Date().toISOString(),
  status: "unknown",
  issuesFound: 0,
  totalEndpoints: 0,
  monitoringInterval: 5,
  emergencyMode: false,
  enabled: false,
}

export const MOCK_ENDPOINT_STATUS = {}

export const MOCK_DAILY_STATUS = (endpoint: string, days = 30) => {
  return [] // Return empty array - no mock history
}

export const MOCK_METRICS = []

export const MOCK_ENDPOINTS = []
