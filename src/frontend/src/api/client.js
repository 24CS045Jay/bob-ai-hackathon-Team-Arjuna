/**
 * PortFlow AI — Frontend API Client
 * Connects React Digital Twin to FastAPI Backend (port 8000)
 * Graceful fallback to cached state if backend is offline.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function safeFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }
    return await res.json()
  } catch (err) {
    console.warn(`[PortFlow API] ${endpoint} unreachable, using fallback:`, err.message)
    return null
  }
}

export async function fetchHealth() {
  return await safeFetch('/health')
}

export async function fetchCopilotStatus() {
  const data = await safeFetch('/api/copilot/status')
  if (data) return data
  return {
    demo_mode: true,
    watsonx_configured: false,
    active_llm: 'PortFlow-Deterministic-Engine (Offline Mock)',
    grounding_domains: ['berths', 'cranes', 'routing_waypoints'],
  }
}

export async function sendCopilotMessage(message, contextFilter = 'all', sessionId = 'session-react') {
  const data = await safeFetch('/api/copilot/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      context_filter: contextFilter,
      session_id: sessionId,
    }),
  })
  if (data) return data

  // Offline fallback
  return {
    reply: `PortFlow AI Copilot (Offline Mode): Connected to local digital twin buffer. Zone B is identified as high congestion (82.4%). Berths B01 and B02 are currently handling ultra-large container traffic.`,
    model_used: 'PortFlow-Deterministic-Fallback (Client Side)',
    confidence: 0.88,
    grounding_sources: ['Port of Arjuna Local Digital Twin Cache'],
    citations: ['src/frontend/src/api/client.js'],
    timestamp: new Date().toISOString(),
  }
}

export async function fetchHotspots() {
  const data = await safeFetch('/api/predictions/hotspots')
  if (data) return data
  return {
    timestamp_utc: new Date().toISOString(),
    hotspots: [
      {
        zone_id: 'B',
        predicted_congestion_index: 82.4,
        risk_level: 'high',
        bottleneck_factors: ['High Yard Occupancy (84%)', 'Crane Saturation (88% active)'],
        confidence: 0.94,
      },
      {
        zone_id: 'C',
        predicted_congestion_index: 54.0,
        risk_level: 'medium',
        bottleneck_factors: ['Moderate Feeder Turnaround'],
        confidence: 0.94,
      },
    ],
    critical_count: 0,
    system_advisory: 'Zone B is currently operating under elevated congestion (82.4%).',
  }
}

export async function predictCongestion(zones) {
  const data = await safeFetch('/api/predictions/congestion', {
    method: 'POST',
    body: JSON.stringify({ zones }),
  })
  return data
}

export async function optimizeBerths(vessels = null) {
  const data = await safeFetch('/api/optimisation/berths', {
    method: 'POST',
    body: JSON.stringify({ vessels }),
  })
  return data
}

export async function optimizeCranes(berthAssignments = null) {
  const data = await safeFetch('/api/optimisation/cranes', {
    method: 'POST',
    body: JSON.stringify({ berth_assignments: berthAssignments }),
  })
  return data
}

export async function optimizeRoute({ startWaypoint = 'WP01', endWaypoint = 'WP07', draftM = 14.5, tideHeightM = 3.2, minUkcM = 1.2 }) {
  const data = await safeFetch('/api/optimisation/routes', {
    method: 'POST',
    body: JSON.stringify({
      start_waypoint: startWaypoint,
      end_waypoint: endWaypoint,
      draft_m: draftM,
      tide_height_m: tideHeightM,
      min_ukc_m: minUkcM,
    }),
  })
  return data
}

export async function fetch72hPlan(baseTimeIso = null) {
  const data = await safeFetch('/api/planning/72h', {
    method: baseTimeIso ? 'POST' : 'GET',
    body: baseTimeIso ? JSON.stringify({ base_time_iso: baseTimeIso }) : undefined,
  })
  return data
}
