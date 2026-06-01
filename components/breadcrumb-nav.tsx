'use client';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BreadcrumbNavProps {
  path: string;
  onNavigate: (path: string) => void;
}

export function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  const segments = path === '/' ? [] : path.split('/').filter(Boolean);

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border overflow-x-auto">
      {segments.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => {
            const up = '/' + segments.slice(0, -1).join('/');
            onNavigate(up || '/');
          }}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}
      <Breadcrumb>
        <BreadcrumbList className="text-base">
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => onNavigate('/')} className="cursor-pointer">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          {segments.map((seg, i) => (
            <span key={i} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {i === segments.length - 1 ? (
                  <BreadcrumbPage>{seg}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => onNavigate('/' + segments.slice(0, i + 1).join('/'))}
                    className="cursor-pointer"
                  >
                    {seg}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </span>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
