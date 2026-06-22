import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    pages.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-9 w-9 flex items-center justify-center rounded border border-border text-foreground-muted hover:bg-background-tertiary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`dot-${i}`} className="px-2 text-foreground-subtle">…</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={cn(
              'h-9 min-w-9 px-3 flex items-center justify-center rounded text-sm font-medium transition-colors',
              page === currentPage
                ? 'bg-accent text-white'
                : 'border border-border text-foreground-muted hover:bg-background-tertiary',
            )}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-9 w-9 flex items-center justify-center rounded border border-border text-foreground-muted hover:bg-background-tertiary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}