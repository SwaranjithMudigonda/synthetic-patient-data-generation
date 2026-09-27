/**
 * Centralized API Client for SYNTHIA
 * Handles requests to FastAPI backend with Supabase Bearer token injection,
 * proxy support, and fallback handling.
 */
import { getSession } from './authService';

const BACKEND_URL = (import.meta.env && import.meta.env.VITE_BACKEND_URL)
  || (typeof window !== 'undefined' && window.SYNTHIA_BACKEND_URL)
  || '';

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Inject Supabase Bearer token if not explicitly provided
  if (!headers['Authorization']) {
    try {
      const session = await getSession();
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (e) {
      // Proceed without token if session lookup fails
    }
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);
    
    // Check if response is JSON
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.error || `HTTP error ${res.status}`);
      }
      return data;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP error ${res.status}`);
    }

    return res;
  } catch (err) {
    console.error(`[API Error] ${endpoint}:`, err);
    throw err;
  }
}

export default { request };
