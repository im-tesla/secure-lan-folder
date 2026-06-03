import { NextRequest, NextResponse } from 'next/server';
import { getThumbnail } from '@/lib/thumbnails';
import { verifyToken } from '@/lib/auth';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { Readable } from 'stream';
import { resolveSafePath } from '@/lib/files';
import path from 'path';

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
      const fullPath = resolveSafePath(subpath);
      const ext = path.extname(fullPath).toLowerCase();
      const mimes: Record<string, string> = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
        '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
        '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska',
      };
      const contentType = mimes[ext] || 'application/octet-stream';

      const fileStat = await stat(fullPath);
      const fileSize = fileStat.size;

      const rangeHeader = request.headers.get('range');

      let status = 200;
      let start = 0;
      let end = fileSize - 1;

      if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
        if (match) {
          const s = match[1] ? parseInt(match[1], 10) : 0;
          const e = match[2] ? parseInt(match[2], 10) : fileSize - 1;

          if (match[1] === '' && match[2] !== '') {
            // Suffix range: "bytes=-N"
            start = Math.max(fileSize - e, 0);
            end = fileSize - 1;
          } else {
            start = Math.max(s, 0);
            end = Math.min(e, fileSize - 1);
          }

          if (start > end || start >= fileSize) {
            return new NextResponse('Range Not Satisfiable', {
              status: 416,
              headers: { 'Content-Range': `bytes */${fileSize}` },
            });
          }

          status = 206;
        }
      }

      const chunkSize = end - start + 1;
      const nodeStream = createReadStream(fullPath, { start, end });
      const webStream = Readable.toWeb(nodeStream);

      const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Cache-Control': 'no-cache',
      };

      if (status === 206) {
        headers['Content-Range'] = `bytes ${start}-${end}/${fileSize}`;
      }

      // TypeScript: Node.js ReadableStream is runtime-compatible with Web ReadableStream
      return new Response(webStream as unknown as ReadableStream, { status, headers });
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
