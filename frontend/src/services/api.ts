/**
 * OSINET Frontend — API Service
 * All backend communication goes through this module.
 * Uses Vite's proxy to forward /api requests to the backend.
 */
import axios from 'axios';
import { supabase } from '../lib/supabase';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Supabase JWT to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Pass errors through to calling components without killing Supabase session
    return Promise.reject(error);
  }
);

export default api;
