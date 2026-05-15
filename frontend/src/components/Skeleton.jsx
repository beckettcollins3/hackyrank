export function Skeleton({ className = "", rounded = "rounded-lg" }) {
  return <div className={`skeleton ${rounded} ${className}`} />;
}

export function VideoSkeleton() {
  return (
    <div className="h-[100dvh] w-full flex items-center justify-center bg-graphite-900">
      <div className="size-full skeleton" />
    </div>
  );
}

export function RowSkeleton({ count = 5 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-2xl glass"
        >
          <Skeleton className="size-10" rounded="rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2.5 w-1/2" />
          </div>
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

export function GridSkeleton({ count = 9 }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="aspect-[9/16] w-full" rounded="rounded-md" />
      ))}
    </div>
  );
}
