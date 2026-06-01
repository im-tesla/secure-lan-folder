'use client';
import useSWR from 'swr';
import { DirectoryListing } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error('Failed to fetch');
  return r.json();
});

export function useFiles(path: string, sort: string, seed?: number) {
  const seedParam = sort === 'random' ? `&seed=${seed ?? 0}` : '';
  const key = `/api/files?path=${encodeURIComponent(path)}&sort=${sort}${seedParam}`;
  const { data, error, isLoading, mutate } = useSWR<DirectoryListing>(key, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 2000,
  });
  return { data, error, isLoading, mutate };
}
