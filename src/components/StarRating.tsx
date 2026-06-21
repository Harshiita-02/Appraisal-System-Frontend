import { Icons } from './Icons';

interface StarRatingProps {
  value: number | null | undefined;
  max?: number;
}

export function StarRating({ value, max = 5 }: StarRatingProps) {
  if (value === null || value === undefined) {
    return <span className="text-sm text-[rgb(var(--text-muted))]">—</span>;
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Icons.Star
          key={i}
          filled={i < Math.round(value)}
          className={`h-4 w-4 ${
            i < Math.round(value) ? 'text-amber-400' : 'text-surface-300 dark:text-surface-700'
          }`}
        />
      ))}
    </div>
  );
}