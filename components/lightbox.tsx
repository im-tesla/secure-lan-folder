'use client';
import { useEffect, useCallback, useState, useRef } from 'react';
import { FileEntry, formatSize } from '@/lib/types';
import { X, ChevronLeft, ChevronRight, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LightboxProps {
  media: FileEntry[];
  initialIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDelete: (file: FileEntry) => void;
}

export function Lightbox({ media, initialIndex, onClose, onNavigate, onDelete }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const current = media[index];
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (current?.isVideo && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [index, current]);

  const goNext = useCallback(() => {
    if (index < media.length - 1) {
      const next = index + 1;
      setIndex(next);
      onNavigate(next);
    }
  }, [index, media.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      const prev = index - 1;
      setIndex(prev);
      onNavigate(prev);
    }
  }, [index, onNavigate]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goPrev, goNext]);

  useEffect(() => {
    let startX = 0;
    function handleTouchStart(e: TouchEvent) { startX = e.touches[0].clientX; }
    function handleTouchEnd(e: TouchEvent) {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 80) {
        if (diff > 0) goNext(); else goPrev();
      }
    }
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goNext, goPrev]);

  if (!current) return null;

  const getFullSrc = (file: FileEntry) =>
    file.thumbnailUrl.replace('size=300', 'size=1920');

  const getVideoSrc = (file: FileEntry) =>
    file.thumbnailUrl.replace('size=300', 'raw=true');

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm text-white/70">{index + 1} / {media.length}</span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost" size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => onDelete(current)}
          >
            <Trash2 className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-0 px-2 relative">
        {index > 0 && (
          <Button
            variant="ghost" size="icon"
            className="absolute left-2 z-10 text-white/50 hover:text-white hover:bg-white/10 w-12 h-12"
            onClick={goPrev}
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
        )}

        {current.isVideo ? (
          <video
            ref={videoRef}
            controls
            playsInline
            preload="metadata"
            disableRemotePlayback
            className="max-w-full max-h-full object-contain touch-auto"
          >
            <source src={getVideoSrc(current)} type={current.mime} />
          </video>
        ) : (
          <img
            src={getFullSrc(current)}
            alt={current.name}
            className="max-w-full max-h-full object-contain select-none touch-auto"
            draggable={false}
          />
        )}

        {index < media.length - 1 && (
          <Button
            variant="ghost" size="icon"
            className="absolute right-2 z-10 text-white/50 hover:text-white hover:bg-white/10 w-12 h-12"
            onClick={goNext}
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        )}
      </div>

      <div className="px-4 py-3 text-white flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{current.name}</p>
          <p className="text-xs text-white/50">{formatSize(current.size)}</p>
        </div>
      </div>

      <div className="px-4 pb-4 flex gap-1.5 overflow-x-auto">
        {media.map((file, i) => (
          <button
            key={file.name}
            onClick={() => { setIndex(i); onNavigate(i); }}
            className={`relative w-10 h-10 rounded flex-shrink-0 overflow-hidden border-2 transition-all ${
              i === index ? 'border-primary' : 'border-transparent opacity-50'
            }`}
          >
            {file.isVideo ? (
              <>
                <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-3 h-3 text-white fill-white" />
                </div>
              </>
            ) : (
              <img src={file.thumbnailUrl} alt="" className="w-full h-full object-cover" />
            )}
          </button>
        ))}
      </div>

      <div className="text-center pb-3 text-white/30 text-xs">
        {current.isVideo ? '▶ playing  ·  ' : ''}← swipe →  ·  pinch to zoom
      </div>
    </div>
  );
}
