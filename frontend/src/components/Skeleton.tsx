export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

export function JobCardSkeleton() {
  return (
    <div className="p-4 bg-white rounded-lg shadow space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 bg-white rounded-lg shadow space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}
