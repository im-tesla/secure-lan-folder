import { NextRequest, NextResponse } from 'next/server';
import { getThumbnail, getRawFile } from '@/lib/thumbnails';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const subpath = searchParams.get('path');
  const rawSize = parseInt(searchParams.get('size') || '300');
  const size = Math.min(Math.max(rawSize, 50), 1920);
  const raw = searchParams.get('raw') === 'true';

  if (!subpath) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }

  try {
    if (raw) {
      const { buffer, contentType } = await getRawFile(subpath);
      return new NextResponse(new Uint8Array(buffer), {
        headers: { 'Content-Type': contentType },
      });
    }

    const { buffer, contentType } = await getThumbnail(subpath, size);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
