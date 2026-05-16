import { Skeleton } from "@/components/ui/skeleton";

export default function SplashScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col p-4 md:p-8 space-y-6">
      <Skeleton className="h-16 w-full rounded-xl" />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full max-w-5xl mx-auto">
        <Skeleton className="h-32 md:h-48 w-full rounded-2xl" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
