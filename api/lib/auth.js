export function checkAdminPassword(password) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return true // no password set = open access
  return password === expected
}

export function checkContactPasscode(passcode) {
  const expected = process.env.CONTACT_PASSCODE
  if (!expected) return true
  return passcode === expected
}
