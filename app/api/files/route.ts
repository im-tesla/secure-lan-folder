import { NextRequest, NextResponse } from 'next/server';
import { listDirectory, deleteFile } from '@/lib/files';
import { verifyToken } from '@/lib/auth';

async function checkAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return false;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subpath = searchParams.get('path') || '';
  const sort = searchParams.get('sort') || 'date';

  try {
    const listing = await listDirectory(subpath, sort);
    return NextResponse.json(listing);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Path traversal')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subpath = searchParams.get('path');

  if (!subpath) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }

  try {
    await deleteFile(subpath);
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('Path traversal')) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
