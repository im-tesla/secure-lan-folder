import { NextRequest, NextResponse } from 'next/server';
import { listDirectory, deleteFile, resolveSafePath } from '@/lib/files';
import { verifyToken } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

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

export async function POST(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // --- diagnostic logging ---
  const contentType = request.headers.get('content-type') ?? 'missing';
  const contentLength = request.headers.get('content-length') ?? 'missing';
  console.log('[UPLOAD DIAG] Content-Type:', contentType);
  console.log('[UPLOAD DIAG] Content-Length:', contentLength);

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      // If formData parsed but no file, show what keys were present
      const keys = Array.from(formData.keys());
      console.log('[UPLOAD DIAG] FormData parsed OK but no file. Keys present:', keys);
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const subpath = searchParams.get('path');

    if (!subpath) {
      return NextResponse.json({ error: 'Path required' }, { status: 400 });
    }

    const fullPath = resolveSafePath(subpath);
    const dir = path.dirname(fullPath);
    await fs.mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fullPath, buffer);

    console.log('[UPLOAD DIAG] Success — file:', file.name, 'size:', file.size);
    return NextResponse.json({ ok: true, name: file.name, size: file.size });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : '(no stack)';
    console.error('[UPLOAD DIAG] FAILED:', message);
    console.error('[UPLOAD DIAG] Stack:', stack);

    // If formData failed, try reading raw body to see what we actually received
    try {
      const rawBytes = await request.arrayBuffer();
      console.log('[UPLOAD DIAG] Raw body size (via arrayBuffer):', rawBytes.byteLength, 'bytes');
      // Peek at first 200 bytes to see if the multipart structure looks correct
      const peek = Buffer.from(rawBytes).toString('utf-8', 0, Math.min(200, rawBytes.byteLength));
      console.log('[UPLOAD DIAG] Body peek (first 200 chars):', peek);
      // Check for closing boundary in last 100 bytes
      const tail = Buffer.from(rawBytes).subarray(Math.max(0, rawBytes.byteLength - 100)).toString('utf-8');
      console.log('[UPLOAD DIAG] Body tail (last 100 chars):', tail);
    } catch (rawErr) {
      console.error('[UPLOAD DIAG] Could not read raw body either:', rawErr);
    }

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
