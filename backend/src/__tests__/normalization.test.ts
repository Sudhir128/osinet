/**
 * OSINET Backend Tests — Target Normalization
 * Tests the pure normalization logic — no Supabase required.
 */
import { describe, it, expect } from 'vitest';
import { normalizeTarget } from '../services/normalization';

describe('normalizeTarget — EMAIL', () => {
  it('lowercases email addresses', () => {
    const result = normalizeTarget('EMAIL', 'JOHN.DOE@EXAMPLE.COM');
    expect(result.normalized).toBe('john.doe@example.com');
    expect(result.valid).toBe(true);
  });

  it('trims whitespace', () => {
    const result = normalizeTarget('EMAIL', '  user@example.com  ');
    expect(result.normalized).toBe('user@example.com');
  });

  it('flags invalid email', () => {
    const result = normalizeTarget('EMAIL', 'not-an-email');
    expect(result.valid).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('normalizeTarget — DOMAIN', () => {
  it('removes protocol prefix', () => {
    const result = normalizeTarget('DOMAIN', 'https://example.com/path');
    expect(result.normalized).toBe('example.com');
  });

  it('lowercases domain', () => {
    const result = normalizeTarget('DOMAIN', 'EXAMPLE.COM');
    expect(result.normalized).toBe('example.com');
  });

  it('removes trailing dot', () => {
    const result = normalizeTarget('DOMAIN', 'example.com.');
    expect(result.normalized).toBe('example.com');
  });
});

describe('normalizeTarget — IP', () => {
  it('accepts valid IPv4', () => {
    const result = normalizeTarget('IP', '192.168.1.1');
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe('192.168.1.1');
  });

  it('rejects invalid IP', () => {
    const result = normalizeTarget('IP', '999.999.999.999');
    expect(result.valid).toBe(false);
  });

  it('accepts valid IPv6', () => {
    const result = normalizeTarget('IP', '2001:db8::1');
    expect(result.valid).toBe(true);
  });
});

describe('normalizeTarget — URL', () => {
  it('canonicalizes valid URL', () => {
    const result = normalizeTarget('URL', 'https://example.com/path?q=1');
    expect(result.valid).toBe(true);
    expect(result.normalized).toContain('example.com');
  });

  it('flags invalid URL', () => {
    const result = normalizeTarget('URL', 'not a url');
    expect(result.valid).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('normalizeTarget — USERNAME', () => {
  it('trims whitespace', () => {
    const result = normalizeTarget('USERNAME', '  investigator42  ');
    expect(result.normalized).toBe('investigator42');
    expect(result.valid).toBe(true);
  });

  it('rejects empty username', () => {
    const result = normalizeTarget('USERNAME', '   ');
    expect(result.valid).toBe(false);
  });
});

describe('normalizeTarget — PHONE', () => {
  it('normalizes valid E.164 phone', () => {
    const result = normalizeTarget('PHONE', '+14155552671');
    // libphonenumber-js should parse this correctly
    expect(result.normalized).toMatch(/^\+/);
  });

  it('warns about ambiguous phone without country code', () => {
    const result = normalizeTarget('PHONE', '5551234');
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});

describe('normalizeTarget — PERSON', () => {
  it('collapses whitespace', () => {
    const result = normalizeTarget('PERSON', 'John   Smith');
    expect(result.normalized).toBe('John Smith');
  });
});
