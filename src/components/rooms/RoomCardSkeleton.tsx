export default function RoomCardSkeleton() {
  return (
    <div className="overflow-hidden bg-stone-900 animate-pulse">
      {/* Image area */}
      <div className="aspect-[4/3] bg-white/[0.06]" />
      {/* Info area */}
      <div className="p-3 sm:p-4 space-y-2">
        <div className="flex justify-between items-center gap-2">
          <div className="h-3.5 w-3/5 bg-white/[0.08]" />
          <div className="h-4 w-10 bg-white/[0.06] shrink-0" />
        </div>
        <div className="h-3 w-2/5 bg-white/[0.05]" />
        <div className="flex justify-between items-center">
          <div className="h-3 w-1/3 bg-white/[0.05]" />
          <div className="h-4 w-16 bg-white/[0.08]" />
        </div>
      </div>
    </div>
  );
}
