/**
 * Scout Routes — the missing link.
 *
 * server.ts has imported `./routes/scout.routes.js` since before this file
 * existed, which meant the backend could not even compile, let alone boot.
 * The 10-agent orchestrator (backend/src/agents/*) was fully implemented
 * and completely unreachable — there was no HTTP surface for it at all.
 *
 * Design notes / deliberate guardrails (read before removing them):
 *
 * 1. STORAGE: scouting.service.ts persists to Postgres via
 *    `config/database.pg.ts`, but every other read path in this app
 *    (business.service.ts, housing.service.ts, message.service.ts) reads
 *    from the SQLite file at config/database.ts. Nothing in this repo
 *    currently runs a configured Postgres instance. Rather than wire the
 *    frontend up to a database that doesn't exist yet, this route writes
 *    scan results into the SAME SQLite database everything else already
 *    reads from, via businessService.upsertFromScout / housingService
 *    .upsertFromScout. That is what actually makes "scan results show up
 *    as message contacts" true. See the audit report for the longer-term
 *    recommendation (Postgres + PostGIS once you have real write volume).
 *
 * 2. COST CONTROL: the orchestrator fans out to 10 agents, each hitting
 *    Nearby Search across ~7-30 place types, and calls Place Details
 *    (a billed call) for every single result, including duplicates found
 *    under multiple types, before any de-duplication happens. Left
 *    unguarded, this racks up Google billing fast and scales with every
 *    pixel of GPS jitter if triggered on every location update (which the
 *    old frontend hook did). This route enforces:
 *      - a hard radius cap
 *      - a server-side cooldown per rounded lat/lng cell (independent of
 *        the in-memory 5-minute cache inside ScoutingService, which is
 *        lost on every server restart)
 *      - a clear error instead of silently returning empty data when
 *        GOOGLE_MAPS_API_KEY is not configured
 */

import { Router } from 'express';
import { createOrchestrator } from '../agents/orchestrator.agent.js';
import { businessService } from '../services/business.service.js';
import { housingService } from '../services/housing.service.js';
import { config } from '../config/env.js';

const router = Router();

const MAX_RADIUS_KM = 10;
const SCAN_COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes per area
const lastScanByCell = new Map<string, number>();

let orchestrator: ReturnType<typeof createOrchestrator> | null = null;
function getOrchestrator() {
  if (!orchestrator) {
    orchestrator = createOrchestrator({ googleMapsApiKey: config.googleMapsApiKey });
  }
  return orchestrator;
}

function cellKey(lat: number, lng: number, radiusKm: number): string {
  // Round to ~1km grid so nearby scan requests share a cooldown instead of
  // re-triggering a full 10-agent scan on every meter of GPS drift.
  return `${lat.toFixed(2)}:${lng.toFixed(2)}:${radiusKm}`;
}

/**
 * POST /api/scout/scan
 * Trigger a real scan of an area using the agentic scouting system.
 * Body: { lat: number, lng: number, radiusKm?: number }
 */
router.post('/scan', async (req, res) => {
  try {
    const { lat, lng } = req.body || {};
    let { radiusKm = 5 } = req.body || {};

    if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'lat and lng (numbers) are required' });
    }

    if (!config.googleMapsApiKey) {
      // This used to silently return an empty/fake result. Failing loudly
      // is the correct behavior — a 500 that says exactly what's missing,
      // not a UI that quietly shows nothing and lets you think it worked.
      return res.status(503).json({
        success: false,
        error: 'GOOGLE_MAPS_API_KEY is not configured on the server. Real scanning cannot run without it.',
      });
    }

    radiusKm = Math.min(Math.max(Number(radiusKm) || 5, 1), MAX_RADIUS_KM);

    const key = cellKey(lat, lng, radiusKm);
    const lastScan = lastScanByCell.get(key);
    if (lastScan && Date.now() - lastScan < SCAN_COOLDOWN_MS) {
      const businesses = businessService.getNearby(lat, lng, radiusKm, 100);
      const housing = housingService.getNearby(lat, lng, radiusKm, 50);
      return res.json({
        success: true,
        fromCooldown: true,
        businesses,
        housing,
        metadata: { note: `Area scanned within the last ${SCAN_COOLDOWN_MS / 60000} minutes; returning stored results instead of re-billing Google.` },
      });
    }

    const result = await getOrchestrator().scanArea({ lat, lng, radiusKm });
    lastScanByCell.set(key, Date.now());

    for (const business of result.businesses) {
      try {
        businessService.upsertFromScout(business as any);
      } catch (err) {
        console.error(`[scout.routes] Failed to store business ${business.name}:`, err);
      }
    }
    for (const listing of result.housingListings) {
      try {
        housingService.upsertFromScout(listing as any);
      } catch (err) {
        console.error(`[scout.routes] Failed to store listing ${listing.title}:`, err);
      }
    }

    res.json({
      success: result.success,
      businesses: result.businesses,
      housing: result.housingListings,
      errors: result.errors,
      metadata: result.metadata,
    });
  } catch (error) {
    console.error('[scout.routes] Scan failed:', error);
    res.status(500).json({ success: false, error: 'Scan failed' });
  }
});

/**
 * GET /api/scout/businesses?lat=&lng=&radiusKm=
 * Reads whatever has already been scanned and stored — does not trigger a
 * new scan. This is what the map/discover UI should poll.
 */
router.get('/businesses', (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = Math.min(parseFloat((req.query.radiusKm as string) || '5') || 5, MAX_RADIUS_KM);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'lat and lng are required' });
    }

    const businesses = businessService.getNearby(lat, lng, radiusKm, 100);
    res.json(businesses);
  } catch (error) {
    console.error('[scout.routes] Failed to get businesses:', error);
    res.status(500).json({ success: false, error: 'Failed to get businesses' });
  }
});

/**
 * GET /api/scout/housing?lat=&lng=&radiusKm=
 */
router.get('/housing', (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radiusKm = Math.min(parseFloat((req.query.radiusKm as string) || '5') || 5, MAX_RADIUS_KM);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'lat and lng are required' });
    }

    const housing = housingService.getNearby(lat, lng, radiusKm, 50);
    res.json(housing);
  } catch (error) {
    console.error('[scout.routes] Failed to get housing:', error);
    res.status(500).json({ success: false, error: 'Failed to get housing' });
  }
});

/**
 * GET /api/scout/agents
 * Status of the 10 registered scanner agents.
 */
router.get('/agents', (_req, res) => {
  try {
    const status = getOrchestrator().getAgentStatus();
    const agents = Object.entries(status).map(([name, enabled]) => ({
      name,
      status: enabled ? 'idle' : 'disabled',
    }));
    res.json(agents);
  } catch (error) {
    console.error('[scout.routes] Failed to get agent status:', error);
    res.status(500).json({ success: false, error: 'Failed to get agent status' });
  }
});

export const scoutRoutes = router;
export default router;
