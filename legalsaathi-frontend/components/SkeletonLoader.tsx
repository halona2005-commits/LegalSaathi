function Pulse({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-700/50 ${className}`}
      aria-hidden="true"
    />
  );
}

export function MessageSkeleton() {
  return (
    <div className="flex justify-start" aria-label="Loading response">
      <div className="max-w-[75%] w-full">
        <div className="flex items-center gap-2 mb-2">
          <Pulse className="w-6 h-6 rounded-full flex-shrink-0" />
          <Pulse className="w-24 h-3 rounded" />
          <Pulse className="w-12 h-3 rounded" />
        </div>
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl rounded-tl-sm px-4 py-3 space-y-2.5">
          <Pulse className="h-3 w-full rounded" />
          <Pulse className="h-3 w-5/6 rounded" />
          <Pulse className="h-3 w-4/6 rounded" />
          <div className="pt-1">
            <Pulse className="h-5 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}