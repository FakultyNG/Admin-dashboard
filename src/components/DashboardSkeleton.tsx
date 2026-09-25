"use client";

/** Neutral shell shown while auth/profile is restoring on reload. */
export default function DashboardSkeleton() {
  return (
    <div className="flex h-screen w-full bg-[#181818] overflow-hidden">
      <div className="w-[250px] bg-[#1F1F1F] p-6 flex flex-col border-r border-[#2A2A2A] animate-pulse">
        <div className="h-8 w-32 bg-[#333333] rounded mb-12 mx-auto" />
        <div className="flex flex-col items-center mb-10">
          <div className="h-20 w-20 bg-[#333333] rounded-full mb-4" />
          <div className="h-4 w-28 bg-[#333333] rounded mb-2" />
          <div className="h-3 w-20 bg-[#333333] rounded" />
        </div>
        <div className="flex flex-col gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-full bg-[#333333] rounded-md" />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-[70px] bg-[#1F1F1F] flex items-center justify-between px-8 animate-pulse">
          <div className="h-5 w-48 bg-[#333333] rounded" />
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-[#333333] rounded-sm" />
            <div className="h-8 w-8 bg-[#333333] rounded-sm" />
            <div className="h-10 w-10 bg-[#333333] rounded-full" />
          </div>
        </div>

        <div className="p-8 flex-1 animate-pulse">
          <div className="h-5 w-24 bg-[#333333] rounded mb-6" />
          <div className="flex gap-6 mb-10">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[120px] flex-1 bg-[#1F1F1F] rounded-md flex flex-col items-center justify-center gap-3"
              >
                <div className="h-4 w-24 bg-[#333333] rounded" />
                <div className="h-8 w-12 bg-[#333333] rounded" />
              </div>
            ))}
          </div>
          <div className="w-full h-[400px] bg-[#0A0A0A] rounded-md border border-[#2A2A2A]" />
        </div>
      </div>
    </div>
  );
}
