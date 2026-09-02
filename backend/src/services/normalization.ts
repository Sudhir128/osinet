/**
 * OSINET Backend — Target Normalization Service
 *
 * Implements deterministic normalization for supported target types.
 * Uses libphonenumber-js for phone number normalization.
 * Does NOT call external APIs — pure local normalization only.
 */
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import type { TargetType } from '../types';
import { logger } from '../utils/logger';

export interface NormalizationResult {
  normalized: string;
  valid: boolean;
  warnings: string[];
}

export function normalizeTarget(
  type: TargetType,
  rawValue: string
): NormalizationResult {
  const trimmed = rawValue.trim();
  const warnings: string[] = [];

  switch (type) {
    case 'EMAIL':
      return normalizeEmail(trimmed, warnings);

    case 'DOMAIN':
      return normalizeDomain(trimmed, warnings);

    case 'IP':
      return normalizeIP(trimmed, warnings);

    case 'URL':
      return normalizeURL(trimmed, warnings);

    case 'USERNAME':
      return normalizeUsername(trimmed, warnings);

    case 'PHONE':
      return normalizePhone(trimmed, warnings);

    case 'PERSON':
    case 'COMPANY':
      // Normalize to trimmed, collapsed whitespace
      return {
        normalized: trimmed.replace(/\s+/g, ' '),
        valid: trimmed.length > 0,
        warnings,
      };

    default:
      return { normalized: trimmed, valid: true, warnings };
  }
}

function normalizeEmail(value: string, warnings: string[]): NormalizationResult {
  const lower = value.toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const valid = emailRegex.test(lower);
  if (!valid) warnings.push('Value does not appear to be a valid email address');
  return { normalized: lower, valid, warnings };
}

function normalizeDomain(value: string, warnings: string[]): NormalizationResult {
  let domain = value.toLowerCase();
  // Remove protocol
  domain = domain.replace(/^https?:\/\//i, '');
  // Remove path/query
  domain = domain.split('/')[0];
  // Remove www. prefix for normalization (preserve in normalized_value)
  domain = domain.split('?')[0].split('#')[0];
  // Remove trailing dot
  domain = domain.replace(/\.$/, '');

  const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;
  const valid = domainRegex.test(domain);
  if (!valid) warnings.push('Value may not be a valid domain name');

  return { normalized: domain, valid, warnings };
}

function normalizeIP(value: string, warnings: string[]): NormalizationResult {
  const trimmed = value.trim();
  const ipv4Regex =
    /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::[\dA-Fa-f:]*|[\dA-Fa-f:]+::[\dA-Fa-f:]*)$/;

  const isV4 = ipv4Regex.test(trimmed);
  const isV6 = ipv6Regex.test(trimmed);

  if (!isV4 && !isV6) {
    warnings.push('Value does not appear to be a valid IPv4 or IPv6 address');
    return { normalized: trimmed, valid: false, warnings };
  }

  return { normalized: trimmed.toLowerCase(), valid: true, warnings };
}

function normalizeURL(value: string, warnings: string[]): NormalizationResult {
  try {
    const url = new URL(value);
    // Canonical form: scheme + host + pathname + search
    const normalized = url.toString();
    return { normalized, valid: true, warnings };
  } catch {
    warnings.push('Value does not appear to be a valid URL');
    return { normalized: value, valid: false, warnings };
  }
}

function normalizeUsername(value: string, warnings: string[]): NormalizationResult {
  const normalized = value.trim();
  if (normalized.length === 0) {
    warnings.push('Username cannot be empty');
    return { normalized, valid: false, warnings };
  }
  return { normalized, valid: true, warnings };
}

function normalizePhone(value: string, warnings: string[]): NormalizationResult {
  try {
    // Attempt international parse — no default region (requires E.164 or region prefix)
    const parsed = parsePhoneNumberFromString(value);
    if (parsed && parsed.isValid()) {
      return { normalized: parsed.format('E.164'), valid: true, warnings };
    }

    // Try with common region hint (US/EU) — log warning
    warnings.push(
      'Phone number could not be definitively normalized. ' +
      'Provide in E.164 format (+countrycode number) for reliable normalization.'
    );
    return { normalized: value.trim(), valid: false, warnings };
  } catch (err) {
    logger.warn('[Normalization] Phone parse error', { error: String(err) });
    warnings.push('Phone normalization failed — stored as raw value');
    return { normalized: value.trim(), valid: false, warnings };
  }
}
