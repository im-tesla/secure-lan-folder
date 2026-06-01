'use client';
import { FileEntry, FolderEntry } from '@/lib/types';
import { FileCard } from './file-card';
import { FolderCard } from './folder-card';

interface FileGridProps {
  folders: FolderEntry[];
  files: FileEntry[];
  onFolderClick: (name: string) => void;
  onFileClick: (file: FileEntry, index: number) => void;
  onDelete: (file: FileEntry) => void;
}

export function FileGrid({ folders, files, onFolderClick, onFileClick, onDelete }: FileGridProps) {
  let imageCounter = 0;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
      {folders.map(folder => (
        <FolderCard key={folder.name} folder={folder} onClick={onFolderClick} />
      ))}

      {files.map(file => {
        const idx = file.isImage ? imageCounter++ : -1;
        return (
          <FileCard
            key={file.name}
            file={file}
            imageIndex={idx}
            onClick={onFileClick}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
}
