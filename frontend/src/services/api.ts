/**
 * OSINET Frontend — API Service with Built-in Demo Mode Engine
 * Intercepts calls when demo mode is active or when real backend endpoints
 * are unavailable, providing seamless simulated OSINT intelligence feeds.
 */
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { supabase } from '../lib/supabase';
import { mockStore } from './mockStore';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

// Attach Supabase JWT when present
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch {
    // Ignore in demo/fallback mode
  }
  return config;
});

function mockResponse(data: any, status = 200): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 201 ? 'Created' : 'OK',
    headers: {} as any,
    config: {} as any,
  };
}

// Helper to simulate mock backend dispatch
function handleMockRequest(url: string, method: string, data?: any): AxiosResponse | null {
  const cleanUrl = url.replace(/^\/?api\/v1\/?/, '/');

  // Stats
  if (cleanUrl.startsWith('/cases/stats/dashboard') && method === 'get') {
    return mockResponse({ success: true, data: mockStore.getDashboardStats() });
  }

  // Targets in a case: /cases/:id/targets
  const targetsMatch = cleanUrl.match(/^\/cases\/([^/?]+)\/targets/);
  if (targetsMatch) {
    const caseId = targetsMatch[1];
    if (method === 'get') {
      return mockResponse({ success: true, data: mockStore.getTargets(caseId) });
    }
    if (method === 'post') {
      const newTarget = mockStore.createTarget(caseId, data || {});
      return mockResponse({ success: true, data: newTarget }, 201);
    }
  }

  // Single case: /cases/:id
  const singleCaseMatch = cleanUrl.match(/^\/cases\/([^/?]+)$/);
  if (singleCaseMatch && singleCaseMatch[1] !== 'stats' && singleCaseMatch[1] !== 'new') {
    const caseId = singleCaseMatch[1];
    if (method === 'get') {
      const c = mockStore.getCaseById(caseId);
      if (!c) {
        return mockResponse({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found' } }, 404);
      }
      return mockResponse({ success: true, data: c });
    }
    if (method === 'patch') {
      const updated = mockStore.updateCase(caseId, data || {});
      return mockResponse({ success: true, data: updated });
    }
  }

  // List cases: /cases or /cases?search=...
  if (cleanUrl.startsWith('/cases') && method === 'get') {
    const queryIdx = cleanUrl.indexOf('?');
    const params = new URLSearchParams(queryIdx !== -1 ? cleanUrl.substring(queryIdx) : '');
    const search = params.get('search') || undefined;
    const status = params.get('status') || undefined;
    const priority = params.get('priority') || undefined;

    const cases = mockStore.getCases({ search, status, priority });
    return mockResponse({
      success: true,
      data: cases,
      meta: { total: cases.length, page: 1, limit: 20 },
    });
  }

  // Create case: POST /cases
  if (cleanUrl === '/cases' && method === 'post') {
    const newCase = mockStore.createCase(data || {});
    return mockResponse({ success: true, data: newCase }, 201);
  }

  // Audit: /audit
  if (cleanUrl.startsWith('/audit') && method === 'get') {
    return mockResponse({ success: true, data: mockStore.getAuditLogs() });
  }

  return null;
}

// Intercept requests if Demo Mode is active
api.interceptors.request.use((config) => {
  if (mockStore.isDemoActive()) {
    const method = (config.method || 'get').toLowerCase();
    const mockRes = handleMockRequest(config.url || '', method, config.data);
    if (mockRes) {
      // Simulate slight network latency for realistic feel (40ms)
      config.adapter = () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockRes), 40);
        });
    }
  }
  return config;
});

// Fallback response error handling: if real network fails, use mockStore fallback
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (config) {
      const method = (config.method || 'get').toLowerCase();
      const mockRes = handleMockRequest(config.url || '', method, config.data);
      if (mockRes) {
        console.info('[OSINET Demo Mode] Handled request via simulated sandbox:', config.url);
        return mockRes;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
