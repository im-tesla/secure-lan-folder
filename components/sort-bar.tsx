'use client';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/custom-select';
import { LayoutGrid, List } from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'date', label: 'Date (newest)' },
  { value: 'name', label: 'A → Z' },
  { value: 'random', label: 'Random' },
];

interface SortBarProps {
  sort: string;
  onSortChange: (sort: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export function SortBar({ sort, onSortChange, view, onViewChange }: SortBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border">
      <CustomSelect options={SORT_OPTIONS} value={sort} onChange={onSortChange} />
      <div className="flex rounded-md overflow-hidden border border-border">
        <Button
          variant={view === 'grid' ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8 rounded-none"
          onClick={() => onViewChange('grid')}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={view === 'list' ? 'default' : 'ghost'}
          size="icon"
          className="h-8 w-8 rounded-none"
          onClick={() => onViewChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
