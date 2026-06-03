'use client';
import { cn } from '@/lib/utils';
import { FolderOpen, Upload } from 'lucide-react';

type Tab = 'browse' | 'upload';

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'browse', label: 'Browse', icon: <FolderOpen className="w-4 h-4" /> },
  { id: 'upload', label: 'Upload', icon: <Upload className="w-4 h-4" /> },
];

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="flex border-b border-border px-4">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            active === tab.id
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
