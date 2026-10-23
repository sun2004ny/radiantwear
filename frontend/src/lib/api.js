/**
 * api.js — Central fetch helper for RadiantWear
 *
 * In development:  VITE_API_BASE_URL is empty → calls go to '/api/...'
 *                  Vite's proxy forwards them to localhost:5000
 *
 * In production:   VITE_API_BASE_URL is set to the Render backend URL
 *                  e.g. "https://radiantwear-backend.onrender.com"
 *                  Calls become "https://radiantwear-backend.onrender.com/api/..."
 */

const BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Drop-in replacement for fetch() that automatically prepends the backend URL.
 * Usage: apiFetch('/api/products')  →  works in both dev and production
 */
export function apiFetch(path, options = {}) {
  return fetch(`${BASE}${path}`, options);
}

export default apiFetch;
