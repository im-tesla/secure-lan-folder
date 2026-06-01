'use client';
import { FolderEntry } from '@/lib/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Folder } from 'lucide-react';

interface FolderCardProps {
  folder: FolderEntry;
  onClick: (name: string) => void;
}

export function FolderCard({ folder, onClick }: FolderCardProps) {
  return (
    <div
      className="rounded-lg overflow-hidden bg-card border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
      onClick={() => onClick(folder.name)}
    >
      <AspectRatio ratio={1}>
        <div className="w-full h-full flex flex-col items-center justify-center bg-accent/50 gap-2">
          <Folder className="w-10 h-10 text-primary/70" />
        </div>
      </AspectRatio>
      <div className="p-2.5 border-t border-border">
        <p className="text-sm font-medium truncate">{folder.name}</p>
      </div>
    </div>
  );
}
