'use client';
import { FileEntry, formatSize } from '@/lib/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Play, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FileCardProps {
  file: FileEntry;
  imageIndex: number;
  onClick: (file: FileEntry, imageIndex: number) => void;
  onDelete: (file: FileEntry) => void;
}

export function FileCard({ file, imageIndex, onClick, onDelete }: FileCardProps) {
  return (
    <div
      className="group relative rounded-lg overflow-hidden bg-card border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
      onClick={() => onClick(file, imageIndex)}
    >
      <AspectRatio ratio={1}>
        <img
          src={file.thumbnailUrl}
          alt={file.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </AspectRatio>

      {file.isVideo && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs px-2 py-0.5">
            Video
          </Badge>
        </>
      )}

      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 left-2 w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(file);
        }}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>

      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
        <p className="text-sm text-white font-medium truncate">{file.name}</p>
        <p className="text-xs text-white/60 mt-0.5">{formatSize(file.size)}</p>
      </div>
    </div>
  );
}
