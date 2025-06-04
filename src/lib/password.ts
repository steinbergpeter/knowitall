import bcrypt from 'bcrypt'

// Hash a password (for user or project)
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  const salt = await bcrypt.genSalt(saltRounds)
  const hashedPassword = await bcrypt.hash(password, salt)
  return hashedPassword
}

// Compare a plain password to a hash
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, hash)
  return isMatch
}
