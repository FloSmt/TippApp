import * as bcrypt from 'bcrypt';

export async function comparePasswords(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}
