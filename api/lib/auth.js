import bcryptjs from 'bcryptjs'

export async function hashPassword(value) {
  return bcryptjs.hash(value, 10)
}

export async function verifyPassword(password, hash) {
  return bcryptjs.compare(password, hash)
}

export async function checkAdminPassword(portfolio, password) {
  const hash = portfolio?.meta?.adminPasswordHash
  if (!hash) return true // no password set = open access
  return verifyPassword(password, hash)
}
