import { Skeleton } from "./Skeleton";

export function TableSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-border-ink" />
          <Skeleton className="h-4 w-96 bg-border-ink/50" />
        </div>
        <Skeleton className="h-10 w-32 bg-border-ink" />
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Skeleton className="h-10 flex-1 bg-border-ink/50" />
        <Skeleton className="h-10 flex-1 bg-border-ink/50" />
        <Skeleton className="h-10 flex-[2] bg-border-ink/50" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4 border border-border-ink bg-surface">
            <Skeleton className="h-12 w-12 rounded-sm bg-border-ink" />
            <div className="flex-1 space-y-3 py-1">
              <Skeleton className="h-4 w-1/4 bg-border-ink" />
              <div className="flex gap-2">
                <Skeleton className="h-3 w-16 bg-border-ink/50" />
                <Skeleton className="h-3 w-24 bg-border-ink/50" />
                <Skeleton className="h-3 w-20 bg-border-ink/50" />
              </div>
            </div>
            <div className="w-24 flex items-center justify-end">
              <Skeleton className="h-8 w-8 bg-border-ink" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
