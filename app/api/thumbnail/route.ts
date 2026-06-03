import { NextRequest, NextResponse } from 'next/server';
import { getThumbnail } from '@/lib/thumbnails';
import { verifyToken } from '@/lib/auth';
import { resolveSafePath } from '@/lib/files';
import { promises as fs } from 'fs';
import path from 'path';

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.bmp': 'image/bmp', '.tiff': 'image/tiff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
  '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska',
};

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
      return serveRawFile(subpath, request);
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

async function serveRawFile(subpath: string, request: NextRequest): Promise<Response> {
  const fullPath = resolveSafePath(subpath);
  const buffer = await fs.readFile(fullPath);
  const fileSize = buffer.length;
  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_MAP[ext] || 'application/octet-stream';

  const rangeHeader = request.headers.get('range');

  if (!rangeHeader) {
    // Full file — signal range support so Safari will send Range next time
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
      },
    });
  }

  // Parse Range: "bytes=start-end" | "bytes=start-" | "bytes=-suffix"
  const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
  if (!match) {
    // Unparseable range — return full file
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
      },
    });
  }

  let start: number;
  let end: number;

  if (match[1] === '' && match[2] !== '') {
    // Suffix range: "bytes=-N" → last N bytes
    const suffixLen = parseInt(match[2], 10);
    start = Math.max(fileSize - suffixLen, 0);
    end = fileSize - 1;
  } else {
    start = match[1] ? parseInt(match[1], 10) : 0;
    end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
    if (start < 0) start = 0;
    if (end >= fileSize) end = fileSize - 1;
  }

  if (start > end || start >= fileSize) {
    return new Response('', {
      status: 416,
      headers: {
        'Content-Range': `bytes */${fileSize}`,
      },
    });
  }

  const chunk = buffer.subarray(start, end + 1);

  return new Response(chunk, {
    status: 206,
    headers: {
      'Content-Type': contentType,
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Content-Length': String(chunk.length),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-store',
    },
  });
}
