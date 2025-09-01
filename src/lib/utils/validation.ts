// Input validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

export function validatePassword(password: string): boolean {
  // Minimum 8 characters, at least one letter and one number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /\d/.test(password)
}

export function validateName(name: string): boolean {
  return name.length >= 2 && name.length <= 50 && /^[a-zA-Z\s\-]+$/.test(name)
}

export function validateSongId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return /^\d+$/.test(id)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

export function sanitizeSearchQuery(query: string): string {
  return query.trim().toLowerCase().slice(0, 50)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}
