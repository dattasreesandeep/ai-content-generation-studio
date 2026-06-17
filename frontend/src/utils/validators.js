const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  return null
}

export function validatePassword(password) {
  if (!password) return 'Password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  return null
}

export function validateName(name) {
  if (!name.trim()) return 'Name is required.'
  if (name.trim().length < 2) return 'Name must be at least 2 characters.'
  return null
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return 'Confirm your password.'
  if (password !== confirmPassword) return 'Passwords do not match.'
  return null
}
