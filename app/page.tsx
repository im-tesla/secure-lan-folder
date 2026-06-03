'use client';
import { useState, useCallback } from 'react';
import { useFiles } from '@/hooks/use-files';
import { TabBar } from '@/components/tab-bar';
import { SortBar } from '@/components/sort-bar';
import { BreadcrumbNav } from '@/components/breadcrumb-nav';
import { FileGrid } from '@/components/file-grid';
import { FileList } from '@/components/file-list';
import { Lightbox } from '@/components/lightbox';
import { DeleteDialog } from '@/components/delete-dialog';
import { UploadZone } from '@/components/upload-zone';
import { FileEntry } from '@/lib/types';
import { Shield } from 'lucide-react';

type Tab = 'browse' | 'upload';

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('browse');
  const [currentPath, setCurrentPath] = useState('/');
  const [sort, setSort] = useState('date');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [randomSeed, setRandomSeed] = useState(0);
  const { data, error, isLoading, mutate } = useFiles(currentPath, sort, randomSeed);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FileEntry | null>(null);

  const mediaFiles = data?.files.filter(f => f.isImage || f.isVideo) || [];

  const handleFileClick = useCallback((file: FileEntry, _imageIndex: number) => {
    const mediaIdx = mediaFiles.findIndex(f => f.name === file.name);
    if (mediaIdx !== -1) setLightboxIndex(mediaIdx);
  }, [mediaFiles]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const relativePath = currentPath === '/'
      ? deleteTarget.name
      : `${currentPath.replace(/^\//, '')}/${deleteTarget.name}`;
    await fetch(`/api/files?path=${encodeURIComponent(relativePath)}`, { method: 'DELETE' });
    setDeleteTarget(null);
    setLightboxIndex(null);
    mutate();
  }, [deleteTarget, currentPath, mutate]);

  const handleUploadComplete = useCallback(() => {
    mutate();
  }, [mutate]);

  const folderName = currentPath === '/' ? 'Files' : currentPath.split('/').filter(Boolean).pop() || 'Files';

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold tracking-tight truncate">{folderName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Secure LAN folder browser</p>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar active={tab} onChange={setTab} />

      {/* Upload tab */}
      {tab === 'upload' && (
        <div className="flex-1">
          <UploadZone currentPath={currentPath} onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Browse tab */}
      {tab === 'browse' && (
        <>
          <BreadcrumbNav path={currentPath} onNavigate={setCurrentPath} />

          <SortBar
            sort={sort}
            onSortChange={(s) => {
              setSort(s);
              if (s === 'random') setRandomSeed(Date.now());
            }}
            view={view}
            onViewChange={setView}
          />

          <main className="flex-1 p-2">
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!isLoading && !data && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
                <p className="text-xl font-medium">Could not load files</p>
                <p className="text-sm">
                  {error ? String(error) : 'Check that FOLDER_PATH in .env.local exists and is readable.'}
                </p>
              </div>
            )}

            {!isLoading && data && view === 'grid' && (
              <FileGrid
                folders={data.folders}
                files={data.files}
                onFolderClick={(name) => {
                  const newPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
                  setCurrentPath(newPath);
                }}
                onFileClick={handleFileClick}
                onDelete={setDeleteTarget}
              />
            )}

            {!isLoading && data && view === 'list' && (
              <FileList
                folders={data.folders}
                files={data.files}
                onFolderClick={(name) => {
                  const newPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
                  setCurrentPath(newPath);
                }}
                onFileClick={handleFileClick}
                onDelete={setDeleteTarget}
              />
            )}

            {!isLoading && data && data.folders.length === 0 && data.files.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <p className="text-xl font-medium">Empty folder</p>
                <p className="text-base mt-2">No photos or videos here</p>
              </div>
            )}
          </main>
        </>
      )}

      {/* Overlays */}
      {lightboxIndex !== null && (
        <Lightbox
          media={mediaFiles}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onDelete={(file) => { setDeleteTarget(file); }}
        />
      )}

      <DeleteDialog
        open={!!deleteTarget}
        fileName={deleteTarget?.name || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
