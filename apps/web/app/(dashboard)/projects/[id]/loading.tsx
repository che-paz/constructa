export default function ProjectDetailLoading() {
  return (
    <div className="animate-pulse space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-md bg-muted" />
          <div className="h-4 w-32 rounded-md bg-muted" />
        </div>
        <div className="h-10 w-full rounded-md bg-muted sm:w-36" />
      </div>
      <div className="flex gap-2 overflow-hidden border-b pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-16 shrink-0 rounded-md bg-muted" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="h-40 rounded-xl bg-muted" />
    </div>
  );
}
