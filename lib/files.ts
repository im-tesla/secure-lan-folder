import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { FileEntry, FolderEntry, DirectoryListing } from './types';

const FOLDER_PATH = process.env.FOLDER_PATH || process.cwd();

function getMime(ext: string): string {
  const mimes: Record<string, string> = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp', '.tiff': 'image/tiff',
    '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo', '.mkv': 'video/x-matroska',
  };
  return mimes[ext.toLowerCase()] || 'application/octet-stream';
}

function isVideo(ext: string): boolean {
  return ['.mp4', '.webm', '.mov', '.avi', '.mkv'].includes(ext.toLowerCase());
}

function isImage(ext: string): boolean {
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'].includes(ext.toLowerCase());
}

export function resolveSafePath(subpath: string): string {
  const base = path.resolve(FOLDER_PATH);
  const fullPath = path.resolve(path.join(base, subpath));
  if (!fullPath.startsWith(base + path.sep) && fullPath !== base) {
    throw new Error('Path traversal detected');
  }
  return fullPath;
}

export async function listDirectory(subpath: string, sort: string = 'date'): Promise<DirectoryListing> {
  // Normalize: strip leading/trailing slashes, treat empty or "/" as root
  const normalized = subpath.replace(/^\/+|\/+$/g, '');
  const base = path.resolve(FOLDER_PATH);
  const dirPath = normalized ? resolveSafePath(normalized) : base;
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const folders: FolderEntry[] = [];
  const files: FileEntry[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!entry.name.startsWith('.')) {
        folders.push({ name: entry.name });
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (isImage(ext) || isVideo(ext)) {
        const fullPath = path.join(dirPath, entry.name);
        const stat = await fs.stat(fullPath);
        const relativePath = normalized ? `${normalized}/${entry.name}` : entry.name;
        files.push({
          name: entry.name,
          ext,
          size: stat.size,
          created: stat.birthtime.toISOString(),
          modified: stat.mtime.toISOString(),
          mime: getMime(ext),
          isVideo: isVideo(ext),
          isImage: isImage(ext),
          thumbnailUrl: `/api/thumbnail?path=${encodeURIComponent(relativePath)}&size=300`,
        });
      }
    }
  }

  switch (sort) {
    case 'name':
      files.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'random':
      for (let i = files.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [files[i], files[j]] = [files[j], files[i]];
      }
      break;
    case 'date':
    default:
      files.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
      break;
  }

  folders.sort((a, b) => a.name.localeCompare(b.name));

  return { path: subpath || '/', folders, files };
}

export async function deleteFile(subpath: string): Promise<void> {
  const fullPath = resolveSafePath(subpath);
  await fs.unlink(fullPath);
}
