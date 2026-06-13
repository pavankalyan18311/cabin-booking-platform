export default function RoomCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/8 animate-pulse aspect-[3/4]">
      <div className="h-3/4 bg-white/[0.04]" />
      <div className="p-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="h-3 w-8 bg-white/8 rounded-full" />
          <div className="h-5 w-14 bg-white/[0.06] rounded-lg" />
        </div>
        <div className="h-4 w-3/4 bg-white/8 rounded-lg" />
        <div className="flex justify-between items-center">
          <div className="h-3 w-1/2 bg-white/[0.06] rounded-lg" />
          <div className="h-4 w-16 bg-white/8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
