import { Star } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export function StarRating({ rating, max = 5, size = 'sm', showCount, count }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(sizeClass, i < Math.floor(rating) ? 'fill-viz-3 text-viz-3' : 'fill-none text-foreground-subtle')}
          />
        ))}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-foreground-muted">({count})</span>
      )}
    </div>
  );
}