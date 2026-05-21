export function TeamSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[rgba(255,255,255,0.02)] border border-white/5 rounded-xl p-5 sm:p-6 text-center">
          <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-5 skeleton rounded-full" />
          <div className="h-5 w-32 mx-auto mb-2 skeleton rounded" />
          <div className="h-3 w-24 mx-auto mb-3 skeleton rounded" />
          <div className="h-4 w-full skeleton rounded" />
        </div>
      ))}
    </div>
  );
}

export function SectionSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`py-16 sm:py-20 lg:py-24 ${className}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="skeleton h-10 w-64 mx-auto mb-4 rounded" />
        <div className="skeleton h-5 w-96 mx-auto mb-12 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
