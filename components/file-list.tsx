'use client';
import { FileEntry, FolderEntry, formatSize } from '@/lib/types';
import { Folder, File, Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileListProps {
  folders: FolderEntry[];
  files: FileEntry[];
  onFolderClick: (name: string) => void;
  onFileClick: (file: FileEntry, index: number) => void;
  onDelete: (file: FileEntry) => void;
}

export function FileList({ folders, files, onFolderClick, onFileClick, onDelete }: FileListProps) {
  let imageCounter = 0;

  return (
    <div className="space-y-0.5">
      <div className="grid grid-cols-[1fr_90px_130px_40px] gap-2 px-3 py-2.5 text-sm text-muted-foreground border-b border-border">
        <span>Name</span>
        <span className="text-right">Size</span>
        <span className="text-right">Date</span>
        <span></span>
      </div>

      {folders.map(folder => (
        <div
          key={folder.name}
          className="grid grid-cols-[1fr_90px_130px_40px] gap-2 px-3 py-2.5 rounded-md hover:bg-accent cursor-pointer items-center"
          onClick={() => onFolderClick(folder.name)}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Folder className="w-4 h-4 text-primary/70 shrink-0" />
            <span className="text-sm truncate font-medium">{folder.name}</span>
          </div>
          <span className="text-xs text-muted-foreground text-right">—</span>
          <span className="text-xs text-muted-foreground text-right">—</span>
          <span></span>
        </div>
      ))}

      {files.map(file => {
        const idx = file.isImage ? imageCounter++ : -1;
        return (
          <div
            key={file.name}
            className="grid grid-cols-[1fr_90px_130px_40px] gap-2 px-3 py-2.5 rounded-md hover:bg-accent cursor-pointer items-center"
            onClick={() => onFileClick(file, idx)}
          >
            <div className="flex items-center gap-2 min-w-0">
              {file.isVideo ? (
                <Play className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <File className="w-4 h-4 text-muted-foreground shrink-0" />
              )}
              <span className="text-sm truncate">{file.name}</span>
            </div>
            <span className="text-xs text-muted-foreground text-right">{formatSize(file.size)}</span>
            <span className="text-xs text-muted-foreground text-right">
              {new Date(file.created).toLocaleDateString()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file);
              }}
            >
              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
