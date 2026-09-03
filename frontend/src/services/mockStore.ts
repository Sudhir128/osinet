/**
 * OSINET Frontend — Demo Mode Store & OSINT Intelligence Simulator
 * Provides pre-seeded mock cases, targets, audit logs, and simulated intelligence
 * feeds for Shodan, Censys, IPInfo, SerpAPI, Hunter, HIBP, and WhoisXML.
 */
import type { Case, Target, DashboardStats, AuditLog, TargetType, CaseStatus, CasePriority } from '../types';

export interface ProviderStatusItem {
  id: string;
  name: string;
  category: string;
  status: 'ONLINE_SIMULATED' | 'READY';
  description: string;
  latencyMs: number;
  sampleCapabilities: string[];
}

export interface IntelligenceEnrichment {
  targetId: string;
  targetValue: string;
  targetType: TargetType;
  generatedAt: string;
  provenance: string;
  providers: {
    shodan?: {
      ports: number[];
      hostnames: string[];
      isp: string;
      asn: string;
      vulns: string[];
      location: { city: string; country: string; countryCode: string };
    };
    censys?: {
      protocols: string[];
      services: string[];
      certificate?: {
        issuer: string;
        subject: string;
        validUntil: string;
        fingerprintSha256: string;
      };
    };
    ipinfo?: {
      hostname: string;
      city: string;
      region: string;
      country: string;
      loc: string;
      org: string;
      timezone: string;
      privacy: { vpn: boolean; proxy: boolean; tor: boolean; hosting: boolean };
    };
    whois?: {
      registrar: string;
      createdDate: string;
      expiresDate: string;
      domainAgeDays: number;
      nameServers: string[];
      registrantOrg: string;
      dnssec: boolean;
    };
    hibp?: {
      pwnedCount: number;
      breaches: Array<{
        title: string;
        domain: string;
        breachDate: string;
        pwnCount: number;
        dataClasses: string[];
      }>;
    };
    hunter?: {
      domain: string;
      pattern: string;
      organization: string;
      deliverabilityScore: number;
      associatedEmails: string[];
    };
    serpapi?: {
      dorksFound: number;
      findings: Array<{
        source: string;
        snippet: string;
        confidence: 'HIGH' | 'MEDIUM' | 'LOW';
      }>;
    };
  };
}

const STORAGE_KEYS = {
  DEMO_ACTIVE: 'osinet_demo_mode_active',
  CASES: 'osinet_demo_cases',
  TARGETS: 'osinet_demo_targets',
  AUDIT: 'osinet_demo_audit',
  ENRICHMENTS: 'osinet_demo_enrichments',
};

// Initial realistic OSINT cases
const INITIAL_CASES: Case[] = [
  {
    id: 'c-8f4b-001',
    title: 'Operation Nightshade: APT29 Infrastructure Tracking',
    client_ref: 'SEC-INTEL-2026-09A',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    jurisdiction: 'Global / NATO Coalition',
    description:
      'Tracking malicious C2 infrastructure nodes and credential staging servers linked to suspected Cozy Bear APT targeting defense contractors.',
    owner_id: 'usr-demo-lead',
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c-8f4b-002',
    title: 'FinTech Wire Fraud & Synthetic Identity Laundering',
    client_ref: 'FIN-FRAUD-781',
    status: 'OPEN',
    priority: 'HIGH',
    jurisdiction: 'US-EAST / Financial Crime Unit',
    description:
      'Intake investigation into high-volume fraudulent ACH transactions routed through disposable fintech neo-banks and SMS VoIP services.',
    owner_id: 'usr-demo-lead',
    created_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c-8f4b-003',
    title: 'Corporate Executive VIP Impersonation Recon',
    client_ref: 'EXEC-SEC-2026',
    status: 'OPEN',
    priority: 'MEDIUM',
    jurisdiction: 'EMEA / Corporate Security',
    description:
      'Reconnaissance on typo-squatted domains and social media sockpuppets spoofing C-suite leadership ahead of quarterly earnings release.',
    owner_id: 'usr-demo-lead',
    created_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c-8f4b-004',
    title: 'Dark Basin Phishing Cluster Analysis',
    client_ref: 'PHISH-CAMP-409',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    jurisdiction: 'International Cyber Taskforce',
    description:
      'Reverse analysis of reverse-proxy phishing kits harvesting multi-factor authentication tokens targeting human rights attorneys.',
    owner_id: 'usr-demo-lead',
    created_at: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
  },
  {
    id: 'c-8f4b-005',
    title: 'Ransomware Decryptor Torrent Artifact Audit',
    client_ref: 'RANSOM-FORENSIC-11',
    status: 'CLOSED',
    priority: 'LOW',
    jurisdiction: 'Cyber Defense Agency',
    description:
      'Verification of rogue torrent swarms distributing fake BlackCat ransomware decryptor binaries containing backdoored loaders.',
    owner_id: 'usr-demo-lead',
    created_at: new Date(Date.now() - 240 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
];

// Initial realistic OSINT targets
const INITIAL_TARGETS: Target[] = [
  {
    id: 'tgt-001',
    case_id: 'c-8f4b-001',
    type: 'IP',
    raw_value: '198.51.100.42',
    normalized_value: '198.51.100.42',
    notes: 'Primary C2 listener detected hosting Cobalt Strike beacon profile.',
    created_by: 'usr-demo-lead',
    created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tgt-002',
    case_id: 'c-8f4b-001',
    type: 'DOMAIN',
    raw_value: 'https://malicious-c2-update.org',
    normalized_value: 'malicious-c2-update.org',
    notes: 'Dynamic DNS staging endpoint registered via privacy-guarded registrar.',
    created_by: 'usr-demo-lead',
    created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tgt-003',
    case_id: 'c-8f4b-001',
    type: 'EMAIL',
    raw_value: 'Apt.Operator@ProtonMail.com',
    normalized_value: 'apt.operator@protonmail.com',
    notes: 'Registrant contact associated with WHOIS certificate footprint.',
    created_by: 'usr-demo-lead',
    created_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tgt-004',
    case_id: 'c-8f4b-002',
    type: 'PHONE',
    raw_value: '+1 (415) 555-0199',
    normalized_value: '+14155550199',
    notes: 'VoIP burner number used in 2FA bypass confirmation calls.',
    created_by: 'usr-demo-lead',
    created_at: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tgt-005',
    case_id: 'c-8f4b-002',
    type: 'USERNAME',
    raw_value: '  mule_broker_99  ',
    normalized_value: 'mule_broker_99',
    notes: 'Telegram handle advertising escrow cash-out laundering channels.',
    created_by: 'usr-demo-lead',
    created_at: new Date(Date.now() - 55 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 55 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tgt-006',
    case_id: 'c-8f4b-003',
    type: 'DOMAIN',
    raw_value: 'acme-corp-investors.net',
    normalized_value: 'acme-corp-investors.net',
    notes: 'Typo-squat mimicking official IR portal, TLS cert issued 2 days ago.',
    created_by: 'usr-demo-lead',
    created_at: new Date(Date.now() - 90 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 90 * 3600 * 1000).toISOString(),
  },
  {
    id: 'tgt-007',
    case_id: 'c-8f4b-003',
    type: 'PERSON',
    raw_value: 'Alexander   Vance',
    normalized_value: 'Alexander Vance',
    notes: 'Executive subject targeted for spearphishing and SIM swap attack.',
    created_by: 'usr-demo-lead',
    created_at: new Date(Date.now() - 85 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 85 * 3600 * 1000).toISOString(),
  },
];

const INITIAL_AUDIT: AuditLog[] = [
  {
    id: 'aud-001',
    actor_id: 'usr-demo-lead',
    action: 'CASE_CREATED',
    entity_type: 'CASE',
    entity_id: 'c-8f4b-001',
    metadata: { title: 'Operation Nightshade: APT29 Infrastructure Tracking' },
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'aud-002',
    actor_id: 'usr-demo-lead',
    action: 'TARGET_ADDED',
    entity_type: 'TARGET',
    entity_id: 'tgt-001',
    metadata: { type: 'IP', value: '198.51.100.42' },
    created_at: new Date(Date.now() - 30 * 3600 * 1000).toISOString(),
  },
  {
    id: 'aud-003',
    actor_id: 'usr-demo-lead',
    action: 'INTELLIGENCE_ENRICHMENT_RUN',
    entity_type: 'TARGET',
    entity_id: 'tgt-001',
    metadata: { providers: ['shodan', 'ipinfo', 'censys'] },
    created_at: new Date(Date.now() - 15 * 3600 * 1000).toISOString(),
  },
  {
    id: 'aud-004',
    actor_id: 'usr-demo-lead',
    action: 'CASE_STATUS_UPDATED',
    entity_type: 'CASE',
    entity_id: 'c-8f4b-001',
    metadata: { old_status: 'OPEN', new_status: 'IN_PROGRESS' },
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

export const OSINT_PROVIDERS: ProviderStatusItem[] = [
  {
    id: 'shodan',
    name: 'Shodan Scanner',
    category: 'INFRASTRUCTURE',
    status: 'ONLINE_SIMULATED',
    description: 'Internet-connected device and port scan search engine.',
    latencyMs: 82,
    sampleCapabilities: ['Host Discovery', 'Open Port Mapping (22, 80, 443, 8080)', 'Vulnerability CVE Correlation'],
  },
  {
    id: 'censys',
    name: 'Censys Search',
    category: 'INFRASTRUCTURE',
    status: 'ONLINE_SIMULATED',
    description: 'Continuous attack surface and certificate intelligence.',
    latencyMs: 114,
    sampleCapabilities: ['TLS/SSL Certificate Chain', 'Cipher Suite Verification', 'Virtual Host Footprinting'],
  },
  {
    id: 'ipinfo',
    name: 'IPInfo Geolocation & ASN',
    category: 'NETWORK',
    status: 'ONLINE_SIMULATED',
    description: 'Accurate IP geolocation, ASN BGP routing, and VPN/hosting detection.',
    latencyMs: 45,
    sampleCapabilities: ['Precise Geo-coordinates', 'Autonomous System Number', 'Datacenter / TOR / Proxy Detection'],
  },
  {
    id: 'whoisxml',
    name: 'WhoisXML API',
    category: 'DOMAIN_DNS',
    status: 'ONLINE_SIMULATED',
    description: 'Domain registrar records, historic WHOIS, and DNS telemetry.',
    latencyMs: 95,
    sampleCapabilities: ['Registrar Information', 'Domain Age & Expiration', 'Name Server Configuration'],
  },
  {
    id: 'hibp',
    name: 'Have I Been Pwned (HIBP)',
    category: 'IDENTITY',
    status: 'ONLINE_SIMULATED',
    description: 'Breached credentials and compromised identity intelligence.',
    latencyMs: 70,
    sampleCapabilities: ['Breach Occurrence Verification', 'Paste Site Leaks', 'Data Class Exposure Identification'],
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    category: 'IDENTITY',
    status: 'ONLINE_SIMULATED',
    description: 'Corporate domain email pattern discovery and verification.',
    latencyMs: 120,
    sampleCapabilities: ['Email Pattern Detection', 'Corporate Domain Directory', 'Deliverability Confidence'],
  },
  {
    id: 'serpapi',
    name: 'SerpAPI (Google OSINT Dorks)',
    category: 'OPEN_WEB',
    status: 'ONLINE_SIMULATED',
    description: 'Google Dork search and public web footprint indexing.',
    latencyMs: 160,
    sampleCapabilities: ['Indexed Sensitive Documents', 'Pastebin Footprint', 'Social Platform Correlation'],
  },
  {
    id: 'mock-dev',
    name: 'OSINET Architecture Engine',
    category: 'INTERNAL',
    status: 'READY',
    description: 'Core correlation pipeline, normalizer, and provenance hashing.',
    latencyMs: 5,
    sampleCapabilities: ['Target E.164 Normalization', 'SHA-256 Chain of Custody', 'RBAC Enforcement'],
  },
];

class MockStoreService {
  private isInitialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (typeof window === 'undefined') return;
    if (!this.isInitialized) {
      if (!localStorage.getItem(STORAGE_KEYS.CASES)) {
        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
      }
      if (!localStorage.getItem(STORAGE_KEYS.TARGETS)) {
        localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(INITIAL_TARGETS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.AUDIT)) {
        localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT));
      }
      this.isInitialized = true;
    }
  }

  public isDemoActive(): boolean {
    if (typeof window === 'undefined') return true;
    const item = localStorage.getItem(STORAGE_KEYS.DEMO_ACTIVE);
    return item === null ? true : item === 'true'; // Default active so app works seamlessly
  }

  public setDemoActive(active: boolean) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.DEMO_ACTIVE, String(active));
  }

  public getDashboardStats(): DashboardStats {
    const cases = this.getCases();
    return {
      total: cases.length,
      open: cases.filter((c) => c.status === 'OPEN').length,
      in_progress: cases.filter((c) => c.status === 'IN_PROGRESS').length,
      on_hold: cases.filter((c) => c.status === 'ON_HOLD').length,
      closed: cases.filter((c) => c.status === 'CLOSED').length,
      archived: cases.filter((c) => c.status === 'ARCHIVED').length,
    };
  }

  public getCases(filter?: { search?: string; status?: string; priority?: string }): Case[] {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CASES);
      let cases: Case[] = raw ? JSON.parse(raw) : INITIAL_CASES;

      if (filter?.search) {
        const q = filter.search.toLowerCase();
        cases = cases.filter(
          (c) =>
            c.title.toLowerCase().includes(q) ||
            (c.client_ref && c.client_ref.toLowerCase().includes(q)) ||
            (c.description && c.description.toLowerCase().includes(q))
        );
      }
      if (filter?.status) {
        cases = cases.filter((c) => c.status === filter.status);
      }
      if (filter?.priority) {
        cases = cases.filter((c) => c.priority === filter.priority);
      }

      return cases;
    } catch {
      return INITIAL_CASES;
    }
  }

  public getCaseById(id: string): Case | null {
    const cases = this.getCases();
    return cases.find((c) => c.id === id) ?? null;
  }

  public createCase(data: {
    title: string;
    client_ref?: string;
    priority?: CasePriority;
    jurisdiction?: string;
    description?: string;
    retention_at?: string;
  }): Case {
    this.ensureInitialized();
    const newCase: Case = {
      id: 'c-' + Math.random().toString(36).substring(2, 9),
      title: data.title,
      client_ref: data.client_ref || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'OPEN',
      priority: data.priority || 'MEDIUM',
      jurisdiction: data.jurisdiction || 'Federal Jurisdiction',
      description: data.description || '',
      owner_id: 'usr-demo-lead',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      retention_at: data.retention_at,
    };

    const cases = [newCase, ...this.getCases()];
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.logAudit('CASE_CREATED', 'CASE', newCase.id, { title: newCase.title });
    return newCase;
  }

  public updateCase(id: string, updates: Partial<Case>): Case | null {
    this.ensureInitialized();
    const cases = this.getCases();
    const idx = cases.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    const updated = {
      ...cases[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    cases[idx] = updated;
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.logAudit('CASE_UPDATED', 'CASE', id, updates as Record<string, unknown>);
    return updated;
  }

  public getTargets(caseId: string): Target[] {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TARGETS);
      const targets: Target[] = raw ? JSON.parse(raw) : INITIAL_TARGETS;
      return targets.filter((t) => t.case_id === caseId);
    } catch {
      return INITIAL_TARGETS.filter((t) => t.case_id === caseId);
    }
  }

  public createTarget(caseId: string, data: { type: TargetType; raw_value: string; notes?: string }): Target {
    this.ensureInitialized();
    // Normalize target values cleanly
    let normalized = data.raw_value.trim();
    if (data.type === 'EMAIL') normalized = normalized.toLowerCase();
    if (data.type === 'DOMAIN') {
      normalized = normalized.toLowerCase().replace(/^(https?:\/\/)/, '').replace(/\/.*$/, '');
    }
    if (data.type === 'PHONE') {
      normalized = normalized.replace(/[^\d+]/g, '');
    }

    const newTarget: Target = {
      id: 'tgt-' + Math.random().toString(36).substring(2, 9),
      case_id: caseId,
      type: data.type,
      raw_value: data.raw_value,
      normalized_value: normalized,
      notes: data.notes || '',
      created_by: 'usr-demo-lead',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const raw = localStorage.getItem(STORAGE_KEYS.TARGETS);
    const targets: Target[] = raw ? JSON.parse(raw) : INITIAL_TARGETS;
    targets.unshift(newTarget);
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets));
    this.logAudit('TARGET_ADDED', 'TARGET', newTarget.id, {
      type: newTarget.type,
      value: newTarget.normalized_value,
    });
    return newTarget;
  }

  public getAuditLogs(): AuditLog[] {
    this.ensureInitialized();
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUDIT);
      return raw ? JSON.parse(raw) : INITIAL_AUDIT;
    } catch {
      return INITIAL_AUDIT;
    }
  }

  public logAudit(action: string, entity_type: string, entity_id?: string, metadata?: Record<string, unknown>) {
    try {
      const log: AuditLog = {
        id: 'aud-' + Math.random().toString(36).substring(2, 8),
        actor_id: 'usr-demo-lead',
        action,
        entity_type,
        entity_id,
        metadata,
        created_at: new Date().toISOString(),
      };
      const logs = [log, ...this.getAuditLogs()].slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(logs));
    } catch {
      // Ignored
    }
  }

  /**
   * Generates tailored simulated OSINT intelligence feeds
   * mimicking real Shodan, Censys, IPInfo, WhoisXML, HIBP, Hunter, and SerpAPI.
   */
  public generateEnrichment(target: Target): IntelligenceEnrichment {
    const isIp = target.type === 'IP';
    const isDomain = target.type === 'DOMAIN';
    const isEmail = target.type === 'EMAIL';
    const isPhone = target.type === 'PHONE';
    const isUsername = target.type === 'USERNAME';
    const isPerson = target.type === 'PERSON';

    const enrichment: IntelligenceEnrichment = {
      targetId: target.id,
      targetValue: target.normalized_value,
      targetType: target.type,
      generatedAt: new Date().toISOString(),
      provenance: 'OSINET Simulated Sandbox · Verified against Mock Intelligence Feeds',
      providers: {},
    };

    if (isIp || isDomain) {
      enrichment.providers.shodan = {
        ports: [22, 80, 443, 8080, 8443],
        hostnames: [target.normalized_value, `c2-gateway.${target.normalized_value}`],
        isp: 'Cloudflare / DigitalOcean Host Cluster',
        asn: 'AS13335 (Cloudflare, Inc.)',
        vulns: ['CVE-2023-4863 (WebP Heap Overflow)', 'CVE-2023-38606 (Kernel Memory Integrity)'],
        location: {
          city: 'Frankfurt am Main',
          country: 'Germany',
          countryCode: 'DE',
        },
      };

      enrichment.providers.censys = {
        protocols: ['443/https', '80/http', '22/ssh', '8080/http-alt'],
        services: ['OpenSSL 3.0.8', 'nginx/1.24.0', 'OpenSSH 8.9p1 Ubuntu'],
        certificate: {
          issuer: 'Let\'s Encrypt Authority R3',
          subject: `CN=${target.normalized_value}`,
          validUntil: new Date(Date.now() + 65 * 24 * 3600 * 1000).toISOString(),
          fingerprintSha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
        },
      };

      enrichment.providers.ipinfo = {
        hostname: `${target.normalized_value}.static.customer.de`,
        city: 'Frankfurt',
        region: 'Hesse',
        country: 'DE',
        loc: '50.1109,8.6821',
        org: 'AS13335 Cloudflare, Inc.',
        timezone: 'Europe/Berlin',
        privacy: {
          vpn: false,
          proxy: true,
          tor: false,
          hosting: true,
        },
      };

      enrichment.providers.whois = {
        registrar: 'NameCheap, Inc. / Withheld for Privacy',
        createdDate: '2024-03-12T14:22:10Z',
        expiresDate: '2027-03-12T14:22:10Z',
        domainAgeDays: 540,
        nameServers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'],
        registrantOrg: 'Privacy Service Provided by Withheld for Privacy ehf',
        dnssec: true,
      };
    }

    if (isEmail) {
      enrichment.providers.hibp = {
        pwnedCount: 3,
        breaches: [
          {
            title: 'Collection #1 Breach Compilation',
            domain: 'collection1.intel',
            breachDate: '2019-01-07',
            pwnCount: 772904991,
            dataClasses: ['Email addresses', 'Passwords', 'Plaintext credentials'],
          },
          {
            title: 'RedLine Stealer Botnet Dump',
            domain: 'botnet-telemetry.onion',
            breachDate: '2023-11-14',
            pwnCount: 4200000,
            dataClasses: ['Browser Autofill', 'Cookies', 'System Information'],
          },
          {
            title: 'Exploit.in Credential Archive',
            domain: 'exploit.in',
            breachDate: '2016-10-15',
            pwnCount: 593000000,
            dataClasses: ['Email addresses', 'Hashed passwords'],
          },
        ],
      };

      enrichment.providers.hunter = {
        domain: target.normalized_value.split('@')[1] || 'domain.com',
        pattern: '{first}.{last}',
        organization: 'Secure Communications Gateway Network',
        deliverabilityScore: 94,
        associatedEmails: [
          target.normalized_value,
          `admin@${target.normalized_value.split('@')[1]}`,
          `contact@${target.normalized_value.split('@')[1]}`,
        ],
      };
    }

    if (isUsername || isPerson || isPhone) {
      enrichment.providers.serpapi = {
        dorksFound: 4,
        findings: [
          {
            source: 'GitHub Public Commits & Leaks',
            snippet: `Found references to target handle "${target.normalized_value}" in automated deployment scripts.`,
            confidence: 'HIGH',
          },
          {
            source: 'Pastebin / Ghostbin Leaks',
            snippet: `Configuration dump containing "${target.normalized_value}" with timestamped proxy lists.`,
            confidence: 'MEDIUM',
          },
          {
            source: 'Telegram Channel Scrape',
            snippet: `Active member in cryptocurrency escrow channel associated with ${target.normalized_value}.`,
            confidence: 'HIGH',
          },
          {
            source: 'LinkedIn & Social Footprint',
            snippet: `Verified profiles matching full name in European Financial Services directory.`,
            confidence: 'MEDIUM',
          },
        ],
      };
    }

    this.logAudit('INTELLIGENCE_ENRICHMENT_RUN', 'TARGET', target.id, {
      type: target.type,
      providers: Object.keys(enrichment.providers),
    });

    return enrichment;
  }

  public resetToDefaults() {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(INITIAL_TARGETS));
    localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT));
  }
}

export const mockStore = new MockStoreService();
