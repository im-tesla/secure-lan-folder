'use client';
import { useEffect } from 'react';
import { FileEntry } from '@/lib/types';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerProps {
  file: FileEntry;
  currentPath: string;
  onClose: () => void;
}

export function VideoPlayer({ file, currentPath, onClose }: VideoPlayerProps) {
  const relativePath = currentPath === '/'
    ? file.name
    : `${currentPath.replace(/^\//, '')}/${file.name}`;
  const videoUrl = `/api/thumbnail?path=${encodeURIComponent(relativePath)}&raw=true`;

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-black border-border overflow-hidden" showCloseButton={false}>
        <div className="relative">
          <div className="absolute top-3 right-3 z-10">
            <Button
              variant="ghost" size="icon"
              className="text-white/70 hover:text-white hover:bg-white/10"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full max-h-[85vh]"
            playsInline
          >
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="px-4 py-2 bg-card border-t border-border">
          <p className="text-sm font-medium">{file.name}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
