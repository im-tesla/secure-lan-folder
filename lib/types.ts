export interface FileEntry {
  name: string;
  ext: string;
  size: number;
  created: string;
  modified: string;
  mime: string;
  isVideo: boolean;
  isImage: boolean;
  thumbnailUrl: string;
}

export interface FolderEntry {
  name: string;
}

export interface DirectoryListing {
  path: string;
  folders: FolderEntry[];
  files: FileEntry[];
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
