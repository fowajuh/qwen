import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm bg-runway-sand/70",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-[manifest-sweep_1.4s_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-cloud-white/60 after:to-transparent",
        className,
      )}
    />
  );
}

export function StubSkeleton() {
  return (
    <div className="ticket-stub rounded-sm space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/** Premium skeleton screen for listing cards grid */
export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-white shadow-lg">
          <Skeleton className="h-48 w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Premium skeleton for listing detail page */
export function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="relative h-[60vh] w-full bg-slate-100">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <div className="flex items-center justify-between border-b border-slate-100 pb-8">
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-7 w-40" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-6 flex justify-between">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="mb-6 space-y-3">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Premium skeleton for trip cards carousel */
export function TripCarouselSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex gap-4 overflow-x-auto -mx-5 px-5 scrollbar-hide">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shrink-0 w-[85%] md:w-[420px]">
          <div className="rounded-lg overflow-hidden bg-departure-navy h-[380px]">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Premium skeleton for profile stats grid */
export function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-6 shadow-lg">
          <Skeleton className="h-4 w-20 mb-3" />
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Premium skeleton for search results with map layout */
export function SearchResultsSkeleton() {
  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <div className="hidden lg:block w-3/5 bg-slate-100">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="w-full lg:w-2/5 p-4 space-y-4 overflow-y-auto">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-white p-4 shadow-lg">
            <div className="flex gap-4">
              <Skeleton className="h-24 w-24 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Loading spinner with billion-dollar aesthetics */
export function PremiumLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{label}</p>
    </div>
  );
}
