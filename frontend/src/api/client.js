const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TOKEN_STORAGE_KEY = 'ai_content_studio_token'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
  }
}

/**
 * Normalizes whatever shape FastAPI/Pydantic sends back on error into a
 * single readable string, since validation errors, HTTPException details,
 * and network failures all look different.
 */
function extractErrorMessage(status, body) {
  if (!body) return `Request failed with status ${status}`

  // FastAPI HTTPException -> { "detail": "Invalid credentials" }
  if (typeof body.detail === 'string') return body.detail

  // Pydantic validation errors -> { "detail": [{ "msg": "...", "loc": [...] }, ...] }
  if (Array.isArray(body.detail)) {
    return body.detail
      .map((item) => item.msg || 'Invalid input')
      .join(' ')
  }

  if (typeof body.message === 'string') return body.message

  return `Request failed with status ${status}`
}

/**
 * Core request helper. Attaches the bearer token automatically when present,
 * parses JSON safely, and throws a normalized Error so callers only need one
 * catch block.
 */
export async function apiRequest(path, { method = 'GET', body, token, signal } = {}) {
  const headers = {
    Accept: 'application/json',
  }

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    })
  } catch (networkError) {
    throw new Error(
      'Could not reach the server. Check your connection or try again shortly.'
    )
  }

  let parsedBody = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      parsedBody = await response.json()
    } catch {
      parsedBody = null
    }
  }

  if (!response.ok) {
    const message = extractErrorMessage(response.status, parsedBody)
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return parsedBody
}
