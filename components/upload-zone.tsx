'use client';
import { useState, useCallback, useRef } from 'react';
import { Upload, X, Check, AlertCircle, FileIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  currentPath: string;
  onUploadComplete: () => void;
}

interface QueuedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UploadZone({ currentPath, onUploadComplete }: UploadZoneProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const addFiles = useCallback((files: FileList | File[]) => {
    const newFiles: QueuedFile[] = Array.from(files).map(f => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      status: 'pending' as const,
    }));
    setQueue(prev => [...prev, ...newFiles]);
  }, []);

  const uploadFile = useCallback(async (qf: QueuedFile) => {
    setQueue(prev => prev.map(q => q.id === qf.id ? { ...q, status: 'uploading' as const } : q));

    const formData = new FormData();
    formData.append('file', qf.file);

    const subpath = currentPath === '/'
      ? qf.file.name
      : `${currentPath.replace(/^\//, '')}/${qf.file.name}`;

    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(subpath)}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Upload failed (${res.status})`);
      }

      setQueue(prev => prev.map(q => q.id === qf.id ? { ...q, status: 'done' as const } : q));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setQueue(prev => prev.map(q => q.id === qf.id ? { ...q, status: 'error' as const, error: message } : q));
    }
  }, [currentPath]);

  const uploadAll = useCallback(async () => {
    const pending = queue.filter(q => q.status === 'pending');
    for (const qf of pending) {
      await uploadFile(qf);
    }
    const stillPending = queue.filter(q => q.status === 'pending' || q.status === 'uploading');
    if (stillPending.length === 0) {
      onUploadComplete();
    }
  }, [queue, uploadFile, onUploadComplete]);

  const clearDone = useCallback(() => {
    setQueue(prev => prev.filter(q => q.status !== 'done'));
  }, []);

  const removeFile = useCallback((id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current = 0;
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  }, [addFiles]);

  const pendingCount = queue.filter(q => q.status === 'pending').length;
  const hasFiles = queue.length > 0;

  return (
    <div className="flex flex-col gap-4 px-4 py-4 max-w-2xl mx-auto w-full">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors',
          dragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground/50'
        )}
      >
        <Upload className={cn('w-10 h-10', dragging ? 'text-primary' : 'text-muted-foreground')} />
        <div className="text-center">
          <p className="text-sm font-medium">
            {dragging ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Uploads to {currentPath === '/' ? 'root' : currentPath}
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* File queue */}
      {hasFiles && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {queue.length} file{queue.length !== 1 ? 's' : ''} queued
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={clearDone}>
                Clear done
              </Button>
              {pendingCount > 0 && (
                <Button size="sm" onClick={uploadAll}>
                  Upload {pendingCount} file{pendingCount !== 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-1">
            {queue.map(qf => (
              <div
                key={qf.id}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg border border-border text-sm',
                  qf.status === 'error' && 'border-destructive/30 bg-destructive/5'
                )}
              >
                <FileIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="flex-1 truncate">{qf.file.name}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatFileSize(qf.file.size)}
                </span>

                {qf.status === 'pending' && (
                  <span className="text-xs text-muted-foreground">Queued</span>
                )}
                {qf.status === 'uploading' && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                )}
                {qf.status === 'done' && (
                  <Check className="w-4 h-4 text-green-500 shrink-0" />
                )}
                {qf.status === 'error' && (
                  <div className="flex items-center gap-1 shrink-0">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive truncate max-w-[120px]">
                      {qf.error}
                    </span>
                    <button
                      onClick={() => removeFile(qf.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {qf.status === 'pending' && (
                  <button
                    onClick={() => removeFile(qf.id)}
                    className="text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
