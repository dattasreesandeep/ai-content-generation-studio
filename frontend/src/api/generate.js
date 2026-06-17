import { apiRequest } from './client'

export function generateBlog(data, token) {
  return apiRequest('/generate/blog', {
    method: 'POST',
    body: data,
    token,
  })
}