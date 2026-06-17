import { apiRequest } from './client'

/**
 * Expected Phase 1 contract (documented here since no schema exists yet —
 * align the FastAPI routes to this, or update these three functions to match
 * whatever the backend ends up returning):
 *
 * POST /auth/register
 *   body:  { name: string, email: string, password: string }
 *   200:   { access_token: string, token_type: "bearer", user: { id, name, email } }
 *
 * POST /auth/login
 *   body:  { email: string, password: string }
 *   200:   { access_token: string, token_type: "bearer", user: { id, name, email } }
 *
 * GET /auth/me
 *   header: Authorization: Bearer <token>
 *   200:    { id, name, email }
 */

export function registerUser({ name, email, password }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  })
}

export function loginUser({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function fetchCurrentUser(token) {
  return apiRequest('/auth/me', {
    method: 'GET',
    token,
  })
}
