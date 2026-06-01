import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
const COOKIE_NAME = 'auth_token';
const TTL_HOURS = 24;

export function getPasswordHash(): string {
  const password = process.env.PASSWORD;
  if (!password) throw new Error('PASSWORD env var not set');
  return bcrypt.hashSync(password, 12);
}

export function verifyPassword(password: string): boolean {
  const hash = getPasswordHash();
  return bcrypt.compareSync(password, hash);
}

export async function createToken(): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${TTL_HOURS}h`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function setAuthCookie(): Promise<void> {
  const token = await createToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: TTL_HOURS * 60 * 60,
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getTokenFromCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}
