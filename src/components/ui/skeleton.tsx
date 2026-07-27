export function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-9 w-48 bg-border rounded-md"></div>
          <div className="h-5 w-64 bg-border rounded-md mt-2"></div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="h-9 w-32 bg-border rounded-md"></div>
          <div className="h-10 w-36 bg-button/50 rounded-md"></div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-lg border border-border p-6 shadow-sm">
            <div className="h-5 w-32 bg-border rounded-md mb-2"></div>
            <div className="h-8 w-24 bg-border rounded-md"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions / Search Bar */}
      <div className="bg-surface rounded-lg border border-border p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="w-full h-10 bg-border rounded-md"></div>
          </div>
          <div className="w-24 h-10 bg-border rounded-md"></div>
        </div>
      </div>
    </div>
  )
}

export function MembersSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="h-9 w-32 bg-border rounded-md"></div>
          <div className="h-5 w-64 bg-border rounded-md mt-2"></div>
        </div>
        <div className="flex flex-row items-center gap-2">
          <div className="h-10 w-32 bg-border rounded-md"></div>
          <div className="h-10 w-36 bg-button/50 rounded-md"></div>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border shadow-sm mb-6 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 h-10 bg-border rounded-md"></div>
          <div className="w-24 h-10 bg-border rounded-md"></div>
        </div>
      </div>

      <div className="bg-surface rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto p-4">
          <div className="w-full h-8 bg-background mb-4 rounded-md"></div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="w-full h-12 bg-border/30 mb-2 rounded-md"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
