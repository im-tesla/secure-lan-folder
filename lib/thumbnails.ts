import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { resolveSafePath } from './files';

const CACHE_DIR = '.thumbnails';

async function ensureCacheDir(basePath: string): Promise<string> {
  const cachePath = path.join(basePath, CACHE_DIR);
  await fs.mkdir(cachePath, { recursive: true });
  return cachePath;
}

function cacheKey(filePath: string, size: number): string {
  const hash = Buffer.from(filePath).toString('base64url');
  return `${hash}_${size}.jpg`;
}

export async function getThumbnail(
  subpath: string,
  size: number = 300
): Promise<{ buffer: Buffer; contentType: string; cached: boolean }> {
  const fullPath = resolveSafePath(subpath);
  const baseDir = path.dirname(fullPath);
  const cacheDir = await ensureCacheDir(baseDir);
  const key = cacheKey(subpath, size);
  const cachePath = path.join(cacheDir, key);

  // Return cached if exists
  try {
    const cached = await fs.readFile(cachePath);
    return { buffer: cached, contentType: 'image/jpeg', cached: true };
  } catch {
    // Cache miss — generate
  }

  const ext = path.extname(fullPath).toLowerCase();
  const isVideo = ['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(ext);

  let buffer: Buffer;

  if (isVideo) {
    // Generate video poster placeholder with play icon
    const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1a1a2e"/><stop offset="100%" style="stop-color:#16213e"/>
      </linearGradient></defs>
      <rect width="${size}" height="${size}" fill="url(#g)" rx="8"/>
      <polygon points="${size * 0.35},${size * 0.25} ${size * 0.35},${size * 0.75} ${size * 0.75},${size * 0.5}" fill="rgba(255,255,255,0.7)"/>
      <rect x="${size * 0.1}" y="${size * 0.85}" width="${size * 0.8}" height="${size * 0.05}" rx="3" fill="rgba(255,255,255,0.3)"/>
    </svg>`;
    buffer = await sharp(Buffer.from(svg)).jpeg().toBuffer();
  } else {
    // Image thumbnail
    buffer = await sharp(fullPath)
      .resize(size, size, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  // Cache it
  await fs.writeFile(cachePath, buffer);
  return { buffer, contentType: 'image/jpeg', cached: false };
}

export async function getRawFile(subpath: string): Promise<{ buffer: Buffer; contentType: string }> {
  const fullPath = resolveSafePath(subpath);
  const buffer = await fs.readFile(fullPath);
  const ext = path.extname(fullPath).toLowerCase();
  const mimes: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska',
  };
  return { buffer, contentType: mimes[ext] || 'application/octet-stream' };
}
