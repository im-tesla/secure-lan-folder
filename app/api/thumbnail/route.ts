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
      const fileSize = buffer.length;
      const rangeHeader = request.headers.get('range');

      if (rangeHeader) {
        // Parse Range header: "bytes=start-end" or "bytes=start-" or "bytes=-suffix"
        const parts = rangeHeader.replace(/bytes=/, '').split('-');
        const start = parts[0] ? parseInt(parts[0], 10) : 0;
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        // Handle suffix range: "bytes=-N" means last N bytes
        let chunkStart: number;
        let chunkEnd: number;
        if (rangeHeader.includes('bytes=-') && !rangeHeader.includes('bytes=0-') && rangeHeader.split('-')[0] === 'bytes=') {
          // Suffix range: "bytes=-2048"
          chunkStart = Math.max(fileSize - start, 0); // start here is actually the suffix length
          chunkEnd = fileSize - 1;
        } else {
          chunkStart = Math.max(start, 0);
          chunkEnd = Math.min(end, fileSize - 1);
        }

        if (chunkStart > chunkEnd || chunkStart >= fileSize) {
          return new NextResponse('Range Not Satisfiable', {
            status: 416,
            headers: {
              'Content-Range': `bytes */${fileSize}`,
            },
          });
        }

        const chunkSize = chunkEnd - chunkStart + 1;
        const chunk = buffer.subarray(chunkStart, chunkEnd + 1);

        return new NextResponse(new Uint8Array(chunk), {
          status: 206,
          headers: {
            'Content-Type': contentType,
            'Content-Range': `bytes ${chunkStart}-${chunkEnd}/${fileSize}`,
            'Content-Length': String(chunkSize),
            'Accept-Ranges': 'bytes',
            'Cache-Control': 'no-cache',
          },
        });
      }

      // No range header — return full file, but signal range support
      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          'Content-Type': contentType,
          'Content-Length': String(fileSize),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache',
        },
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
