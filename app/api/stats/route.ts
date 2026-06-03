import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { resolveSafePath, isImage, isVideo } from '@/lib/files';
import { promises as fs } from 'fs';
import path from 'path';

const FOLDER_PATH = process.env.FOLDER_PATH || process.cwd();

async function checkAuth(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('auth_token')?.value;
  if (!token) return false;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  if (!(await checkAuth(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let totalFiles = 0;
    let imageCount = 0;
    let videoCount = 0;
    let totalSize = 0;

    const base = resolveSafePath('/');
    const entries = await fs.readdir(base, { recursive: true, withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile()) continue;
      if (entry.name.startsWith('.')) continue;

      const ext = path.extname(entry.name).toLowerCase();
      if (!isImage(ext) && !isVideo(ext)) continue;

      const fullPath = path.join(entry.parentPath ?? base, entry.name);
      const stat = await fs.stat(fullPath);

      totalFiles++;
      totalSize += stat.size;
      if (isVideo(ext)) videoCount++;
      if (isImage(ext)) imageCount++;
    }

    return NextResponse.json({ totalFiles, imageCount, videoCount, totalSize });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
