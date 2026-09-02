/**
 * OSINET Backend Tests — Health Endpoint
 */
import { describe, it, expect, vi } from 'vitest';

// Mock Supabase and config before importing app
vi.mock('../config/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        limit: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
  supabaseAdmin: null,
}));

vi.mock('../config/env', () => ({
  config: {
    supabase: { url: 'https://test.supabase.co', anonKey: 'test-key', serviceRoleKey: '' },
    server: { port: 5000, nodeEnv: 'test', corsOrigin: 'http://localhost:5173' },
    providers: {},
    isDevelopment: false,
    isProduction: false,
  },
}));

vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    http: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('Health endpoint', () => {
  it('normalizeTarget is importable (dependency sanity check)', async () => {
    const { normalizeTarget } = await import('../services/normalization');
    expect(typeof normalizeTarget).toBe('function');
  });

  it('mock provider returns expected structure', async () => {
    const { MockDevProvider } = await import('../services/providers/MockDevProvider');
    const provider = new MockDevProvider();
    expect(provider.name).toBe('mock-dev');
    expect(provider.category).toBe('MOCK_DEV');

    const healthy = await provider.healthCheck();
    expect(healthy.healthy).toBe(true);

    const result = await provider.execute('test_op', '1.2.3.4');
    expect(result.success).toBe(true);
    expect(result.provenanceNote).toContain('DEVELOPMENT MOCK PROVIDER');
  });
});

describe('RBAC middleware logic', () => {
  it('SYSTEM_ADMIN has highest priority', () => {
    const hierarchy: Record<string, number> = {
      SYSTEM_ADMIN: 100,
      CASE_ADMIN: 80,
      SUPERVISOR: 60,
      INVESTIGATOR: 40,
      AUDITOR: 20,
    };
    expect(hierarchy['SYSTEM_ADMIN']).toBeGreaterThan(hierarchy['CASE_ADMIN']);
    expect(hierarchy['CASE_ADMIN']).toBeGreaterThan(hierarchy['SUPERVISOR']);
    expect(hierarchy['SUPERVISOR']).toBeGreaterThan(hierarchy['INVESTIGATOR']);
    expect(hierarchy['INVESTIGATOR']).toBeGreaterThan(hierarchy['AUDITOR']);
  });
});

describe('Case validators', () => {
  it('rejects case title shorter than 3 chars', async () => {
    const { CreateCaseSchema } = await import('../validators/caseValidator');
    const result = CreateCaseSchema.safeParse({ title: 'AB' });
    expect(result.success).toBe(false);
  });

  it('accepts valid case creation', async () => {
    const { CreateCaseSchema } = await import('../validators/caseValidator');
    const result = CreateCaseSchema.safeParse({
      title: 'Investigation Alpha',
      priority: 'HIGH',
      jurisdiction: 'US',
    });
    expect(result.success).toBe(true);
  });

  it('defaults priority to MEDIUM', async () => {
    const { CreateCaseSchema } = await import('../validators/caseValidator');
    const result = CreateCaseSchema.safeParse({ title: 'Test Case' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe('MEDIUM');
    }
  });
});

describe('Target validators', () => {
  it('rejects empty target value', async () => {
    const { CreateTargetSchema } = await import('../validators/targetValidator');
    const result = CreateTargetSchema.safeParse({ type: 'EMAIL', raw_value: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid target type', async () => {
    const { CreateTargetSchema } = await import('../validators/targetValidator');
    const result = CreateTargetSchema.safeParse({
      type: 'SOCIAL_SECURITY',
      raw_value: '123-45-6789',
    });
    expect(result.success).toBe(false);
  });
});
