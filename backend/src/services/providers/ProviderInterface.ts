/**
 * OSINET Backend — Provider Interface (Abstraction Layer)
 *
 * All intelligence providers must implement this interface.
 * This abstraction allows providers to be swapped without rewriting
 * the investigation engine.
 *
 * Currently: abstraction only — no live providers integrated.
 * Future providers: Shodan, Censys, IPinfo, Hunter, SerpApi, HIBP, WhoisXML.
 */
import type { ProviderCategory, ProviderCapability, ProviderResult } from '../../types';

export interface ProviderConfig {
  name: string;
  category: ProviderCategory;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  timeout?: number;
  rateLimit?: {
    requestsPerSecond: number;
    requestsPerDay?: number;
  };
}

export interface ProviderUsageRecord {
  provider: string;
  operation: string;
  inputType: string;
  timestamp: string;
  creditsUsed?: number;
  estimatedCost?: number;
  cacheHit: boolean;
}

export abstract class BaseProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  get name(): string {
    return this.config.name;
  }

  get category(): ProviderCategory {
    return this.config.category;
  }

  /**
   * Validate that the provider's configuration is complete and correct.
   * Returns true if the provider is ready to use.
   */
  abstract validateConfig(): Promise<boolean>;

  /**
   * Perform a health check against the provider API.
   * Should not charge quota/credits.
   */
  abstract healthCheck(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }>;

  /**
   * Return the capabilities of this provider.
   */
  abstract getCapabilities(): ProviderCapability[];

  /**
   * Execute a provider query.
   * @param operation — The named operation (e.g. 'reverse_ip', 'domain_whois')
   * @param input — The input value to query
   */
  abstract execute<T = unknown>(
    operation: string,
    input: string
  ): Promise<ProviderResult<T>>;

  /**
   * Normalize raw provider data into OSINET's standard entity format.
   */
  abstract normalize<T = unknown>(rawData: unknown): T;

  /**
   * Return a provenance note describing data origin, freshness, and terms.
   */
  abstract getProvenanceNote(): string;

  /**
   * Record usage for quota tracking and cost estimation.
   */
  recordUsage(operation: string, inputType: string, cacheHit = false): ProviderUsageRecord {
    return {
      provider: this.name,
      operation,
      inputType,
      timestamp: new Date().toISOString(),
      cacheHit,
    };
  }
}

// ========================
// Provider Registry
// Future: register providers here and resolve by category/capability
// ========================
export class ProviderRegistry {
  private providers: Map<string, BaseProvider> = new Map();

  register(provider: BaseProvider): void {
    this.providers.set(provider.name, provider);
  }

  get(name: string): BaseProvider | undefined {
    return this.providers.get(name);
  }

  getByCategory(category: ProviderCategory): BaseProvider[] {
    return Array.from(this.providers.values()).filter(
      (p) => p.category === category
    );
  }

  list(): Array<{ name: string; category: ProviderCategory }> {
    return Array.from(this.providers.values()).map((p) => ({
      name: p.name,
      category: p.category,
    }));
  }
}

// Singleton registry
export const providerRegistry = new ProviderRegistry();
