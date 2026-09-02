/**
 * OSINET Backend — Mock Development Provider
 *
 * ⚠️  DEVELOPMENT/TESTING ONLY — NOT A REAL INTELLIGENCE SOURCE ⚠️
 *
 * This provider returns clearly labeled mock data for architecture
 * testing and frontend development. It will NEVER be called for real
 * investigations.
 *
 * Registered only when NODE_ENV=development.
 */
import { BaseProvider } from './ProviderInterface';
import type { ProviderCapability, ProviderResult } from '../../types';

export class MockDevProvider extends BaseProvider {
  constructor() {
    super({
      name: 'mock-dev',
      category: 'MOCK_DEV',
    });
  }

  async validateConfig(): Promise<boolean> {
    return true; // No config required
  }

  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    return { healthy: true, latencyMs: 0 };
  }

  getCapabilities(): ProviderCapability[] {
    return [
      {
        name: 'mock_ip_lookup',
        description: '⚠️ DEV ONLY — Returns mock IP data. NOT real intelligence.',
        inputTypes: ['IP'],
        outputTypes: ['mock_host_info'],
      },
      {
        name: 'mock_domain_lookup',
        description: '⚠️ DEV ONLY — Returns mock domain data. NOT real intelligence.',
        inputTypes: ['DOMAIN'],
        outputTypes: ['mock_domain_info'],
      },
    ];
  }

  async execute<T = unknown>(
    operation: string,
    input: string
  ): Promise<ProviderResult<T>> {
    const mockData: Record<string, unknown> = {
      _warning: 'DEVELOPMENT MOCK DATA — NOT REAL INTELLIGENCE',
      _provider: 'mock-dev',
      operation,
      input,
      timestamp: new Date().toISOString(),
      result: {
        label: `[MOCK] Result for "${input}"`,
        details: 'This is synthetic test data for architecture validation only.',
      },
    };

    return {
      provider: this.name,
      category: this.category,
      success: true,
      data: mockData as T,
      retrievedAt: new Date().toISOString(),
      provenanceNote: this.getProvenanceNote(),
    };
  }

  normalize<T = unknown>(rawData: unknown): T {
    return rawData as T;
  }

  getProvenanceNote(): string {
    return (
      'DEVELOPMENT MOCK PROVIDER — Data is entirely synthetic. ' +
      'Do not use for any real investigation. ' +
      'Replace with real provider integration before production use.'
    );
  }
}
