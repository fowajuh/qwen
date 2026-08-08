/**
 * NEXA Agentic Scouting System - Orchestrator
 * Coordinates all 10 specialized agents for comprehensive area scanning
 */

import { BaseAgent, BusinessData, HousingData, ScoutingResult } from './base.agent.js';
import { GooglePlacesAgent } from './google-places.agent.js';
import { HousingScannerAgent } from './housing-scanner.agent.js';
import { ServicesScannerAgent } from './services-scanner.agent.js';
import { RetailScannerAgent } from './retail-scanner.agent.js';
import { HealthcareScannerAgent, EducationScannerAgent, EntertainmentScannerAgent, FinanceScannerAgent, TransportationScannerAgent, POIScannerAgent } from './specialized-scanners.agent.js';

export interface AgentOrchestratorConfig {
  googleMapsApiKey: string;
  enableAllAgents?: boolean;
  enabledAgents?: string[];
  maxConcurrentScans?: number;
}

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent> = new Map();
  private config: AgentOrchestratorConfig;

  constructor(config: AgentOrchestratorConfig) {
    this.config = config;
    this.initializeAgents();
  }

  private initializeAgents(): void {
    const defaultConfig = {
      apiKey: this.config.googleMapsApiKey,
      enabled: true,
      rateLimitPerMinute: 100,
      retryAttempts: 3,
      timeoutMs: 10000,
    };

    // Register all 10 agents
    this.agents.set('google_places', new GooglePlacesAgent(defaultConfig));
    this.agents.set('housing_scanner', new HousingScannerAgent(defaultConfig));
    this.agents.set('services_scanner', new ServicesScannerAgent(defaultConfig));
    this.agents.set('retail_scanner', new RetailScannerAgent(defaultConfig));
    this.agents.set('healthcare_scanner', new HealthcareScannerAgent(defaultConfig));
    this.agents.set('education_scanner', new EducationScannerAgent(defaultConfig));
    this.agents.set('entertainment_scanner', new EntertainmentScannerAgent(defaultConfig));
    this.agents.set('finance_scanner', new FinanceScannerAgent(defaultConfig));
    this.agents.set('transportation_scanner', new TransportationScannerAgent(defaultConfig));
    this.agents.set('poi_scanner', new POIScannerAgent(defaultConfig));

    console.log(`[AgentOrchestrator] Initialized ${this.agents.size} specialized agents`);
  }

  async scanArea(location: { lat: number; lng: number; radiusKm: number }): Promise<{
    success: boolean;
    businesses: BusinessData[];
    housingListings: HousingData[];
    errors: string[];
    metadata: {
      scannedArea: { centerLat: number; centerLng: number; radiusKm: number };
      timestamp: string;
      totalRecordsFound: number;
      agentsUsed: string[];
      scanDurationMs: number;
    };
  }> {
    const startTime = Date.now();
    const allBusinesses: BusinessData[] = [];
    const allHousingListings: HousingData[] = [];
    const allErrors: string[] = [];
    const agentsUsed: string[] = [];

    console.log(`[AgentOrchestrator] Starting scan at ${location.lat},${location.lng} with ${location.radiusKm}km radius`);

    // Run all enabled agents in parallel
    const promises = Array.from(this.agents.entries())
      .filter(([_, agent]) => agent.isEnabled())
      .map(async ([agentName, agent]) => {
        try {
          console.log(`[AgentOrchestrator] Running ${agentName}...`);
          const result = await agent.scan(location);
          
          if (result.success) {
            allBusinesses.push(...result.businesses);
            allHousingListings.push(...result.housingListings);
            agentsUsed.push(agentName);
            
            if (result.errors.length > 0) {
              allErrors.push(...result.errors.map(e => `[${agentName}] ${e}`));
            }
            
            console.log(`[AgentOrchestrator] ${agentName} found ${result.metadata.recordsFound} records`);
          }
        } catch (error) {
          allErrors.push(`[${agentName}] Critical error: ${(error as Error).message}`);
          console.error(`[AgentOrchestrator] ${agentName} failed:`, error);
        }
      });

    await Promise.all(promises);

    // Deduplicate businesses by google_place_id
    const uniqueBusinesses = this.deduplicateBusinesses(allBusinesses);
    const uniqueHousing = this.deduplicateHousing(allHousingListings);

    const duration = Date.now() - startTime;

    console.log(`[AgentOrchestrator] Scan completed in ${duration}ms. Found ${uniqueBusinesses.length} businesses, ${uniqueHousing.length} housing listings`);

    return {
      success: uniqueBusinesses.length > 0 || uniqueHousing.length > 0,
      businesses: uniqueBusinesses,
      housingListings: uniqueHousing,
      errors: allErrors,
      metadata: {
        scannedArea: {
          centerLat: location.lat,
          centerLng: location.lng,
          radiusKm: location.radiusKm,
        },
        timestamp: new Date().toISOString(),
        totalRecordsFound: uniqueBusinesses.length + uniqueHousing.length,
        agentsUsed,
        scanDurationMs: duration,
      },
    };
  }

  private deduplicateBusinesses(businesses: BusinessData[]): BusinessData[] {
    const seen = new Set<string>();
    return businesses.filter(b => {
      const key = b.google_place_id || `${b.latitude}-${b.longitude}-${b.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private deduplicateHousing(housing: HousingData[]): HousingData[] {
    const seen = new Set<string>();
    return housing.filter(h => {
      const key = h.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  getAgentNames(): string[] {
    return Array.from(this.agents.keys());
  }

  getAgentStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};
    this.agents.forEach((agent, name) => {
      status[name] = agent.isEnabled();
    });
    return status;
  }
}

// Export singleton instance factory
export function createOrchestrator(config: AgentOrchestratorConfig): AgentOrchestrator {
  return new AgentOrchestrator(config);
}
