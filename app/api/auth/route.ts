import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, setAuthCookie, clearAuthCookie, verifyToken, getTokenFromCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    if (!password || !verifyPassword(password)) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    await setAuthCookie();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const token = await getTokenFromCookie();
  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  const valid = await verifyToken(token);
  if (!valid) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  return NextResponse.json({ valid: true });
}
