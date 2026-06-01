import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

const JWT_SECRET = new TextEncoder().encode(requireEnv('JWT_SECRET'));
const COOKIE_NAME = 'auth_token';
const TTL_HOURS = 24;

// Pre-compute the password hash once at module load
const PASSWORD_HASH = bcrypt.hashSync(requireEnv('PASSWORD'), 12);

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function verifyPassword(password: string): string | null {
  if (!password) return 'Password required';

  const key = 'global';
  const now = Date.now();
  const entry = loginAttempts.get(key);

  if (entry && now < entry.resetAt && entry.count >= MAX_ATTEMPTS) {
    const minutesLeft = Math.ceil((entry.resetAt - now) / 60000);
    return `Too many attempts. Try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`;
  }

  if (!entry || now >= entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
  } else {
    entry.count++;
  }

  if (!bcrypt.compareSync(password, PASSWORD_HASH)) {
    return 'Invalid password';
  }

  // Reset on success
  loginAttempts.delete(key);
  return null;
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
