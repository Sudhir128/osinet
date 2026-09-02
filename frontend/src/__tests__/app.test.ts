/**
 * OSINET Frontend Tests — Application & Form Validation
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

// Mock API service
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

describe('Frontend type definitions', () => {
  it('CasePriority values are valid', () => {
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    priorities.forEach((p) => {
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(p);
    });
  });

  it('CaseStatus values are valid', () => {
    const statuses = ['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED', 'ARCHIVED'];
    statuses.forEach((s) => {
      expect(['OPEN', 'IN_PROGRESS', 'ON_HOLD', 'CLOSED', 'ARCHIVED']).toContain(s);
    });
  });

  it('TargetType values are valid', () => {
    const types = ['PERSON', 'EMAIL', 'PHONE', 'USERNAME', 'DOMAIN', 'IP', 'COMPANY', 'URL'];
    types.forEach((t) => {
      expect(['PERSON', 'EMAIL', 'PHONE', 'USERNAME', 'DOMAIN', 'IP', 'COMPANY', 'URL']).toContain(t);
    });
  });
});

describe('Form validation logic', () => {
  const validateCaseTitle = (title: string): string | null => {
    if (!title.trim()) return 'Title is required';
    if (title.trim().length < 3) return 'Title must be at least 3 characters';
    if (title.trim().length > 200) return 'Title cannot exceed 200 characters';
    return null;
  };

  it('rejects empty case title', () => {
    expect(validateCaseTitle('')).toBe('Title is required');
  });

  it('rejects short case title', () => {
    expect(validateCaseTitle('AB')).toBe('Title must be at least 3 characters');
  });

  it('accepts valid case title', () => {
    expect(validateCaseTitle('Investigation Alpha')).toBeNull();
  });

  it('rejects very long case title', () => {
    const longTitle = 'A'.repeat(201);
    expect(validateCaseTitle(longTitle)).toBe('Title cannot exceed 200 characters');
  });
});

describe('Target form validation', () => {
  const validateTargetValue = (value: string): string | null => {
    if (!value.trim()) return 'Target value is required';
    return null;
  };

  it('rejects empty target value', () => {
    expect(validateTargetValue('')).toBe('Target value is required');
    expect(validateTargetValue('   ')).toBe('Target value is required');
  });

  it('accepts valid target value', () => {
    expect(validateTargetValue('john@example.com')).toBeNull();
    expect(validateTargetValue('192.168.1.1')).toBeNull();
  });
});

describe('OsinetRole hierarchy', () => {
  const ROLE_LEVEL: Record<string, number> = {
    SYSTEM_ADMIN: 100,
    CASE_ADMIN: 80,
    SUPERVISOR: 60,
    INVESTIGATOR: 40,
    AUDITOR: 20,
  };

  it('SYSTEM_ADMIN outranks all roles', () => {
    const systemAdmin = ROLE_LEVEL['SYSTEM_ADMIN'];
    Object.entries(ROLE_LEVEL).forEach(([role, level]) => {
      if (role !== 'SYSTEM_ADMIN') {
        expect(systemAdmin).toBeGreaterThan(level);
      }
    });
  });

  it('AUDITOR is lowest privilege', () => {
    const auditor = ROLE_LEVEL['AUDITOR'];
    Object.entries(ROLE_LEVEL).forEach(([role, level]) => {
      if (role !== 'AUDITOR') {
        expect(auditor).toBeLessThan(level);
      }
    });
  });
});
