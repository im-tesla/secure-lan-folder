'use client';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Video, FileIcon, HardDrive } from 'lucide-react';

interface StatsResponse {
  totalFiles: number;
  imageCount: number;
  videoCount: number;
  totalSize: number;
}

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch');
  return r.json();
});

function formatGB(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function pct(part: number, total: number): string {
  if (total === 0) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

export function StatsPanel() {
  const { data, error, isLoading } = useSWR<StatsResponse>('/api/stats', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
        <p className="text-xl font-medium">Could not load stats</p>
        <p className="text-sm">{error ? String(error) : 'No data available'}</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Files',
      value: data.totalFiles.toLocaleString(),
      icon: <FileIcon className="w-5 h-5" />,
    },
    {
      label: 'Photos',
      value: `${data.imageCount.toLocaleString()} (${pct(data.imageCount, data.totalFiles)})`,
      icon: <Image className="w-5 h-5" />,
    },
    {
      label: 'Videos',
      value: `${data.videoCount.toLocaleString()} (${pct(data.videoCount, data.totalFiles)})`,
      icon: <Video className="w-5 h-5" />,
    },
    {
      label: 'Total Size',
      value: formatGB(data.totalSize),
      icon: <HardDrive className="w-5 h-5" />,
    },
  ];

  return (
    <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <Card key={s.label} size="sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-muted-foreground">
                {s.icon}
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
