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
  // Round to the nearest half star so fractional ratings (e.g. 4.3, 4.7) render accurately.
  const rounded = Math.max(0, Math.min(max, Math.round(rating * 2) / 2));

  return (
    <div className="flex items-center gap-1">
      <div className="flex" role="img" aria-label={`${rating.toFixed(1)} out of ${max} stars`}>
        {Array.from({ length: max }).map((_, i) => {
          const fillAmount = Math.max(0, Math.min(1, rounded - i));
          if (fillAmount >= 1) {
            return (
              <Star key={i} className={cn(sizeClass, 'fill-viz-3 text-viz-3')} aria-hidden="true" />
            );
          }
          if (fillAmount > 0) {
            // Half (or partial) star: overlay a clipped filled star on top of an empty one.
            return (
              <span key={i} className={cn('relative inline-block', sizeClass)} aria-hidden="true">
                <Star className={cn(sizeClass, 'absolute inset-0 fill-none text-foreground-subtle')} />
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillAmount * 100}%` }}
                >
                  <Star className={cn(sizeClass, 'fill-viz-3 text-viz-3')} />
                </span>
              </span>
            );
          }
          return (
            <Star key={i} className={cn(sizeClass, 'fill-none text-foreground-subtle')} aria-hidden="true" />
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-foreground-muted">({count})</span>
      )}
    </div>
  );
}
