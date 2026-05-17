import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { History, CalendarDays, CheckCircle2, XCircle } from "lucide-react";

import type { JobSummaryForProvider } from "@/api/JobApi";

interface ServiceProviderJobHistoryProps {
  jobs: JobSummaryForProvider[];
}

type Tab = "all" | "completed" | "cancelled";
type Status = "COMPLETED" | "CANCELLED";

const getHistoryStatus = (j: JobSummaryForProvider): Status | null => {
  // ✅ Completed by provider = global job_status
  if (j.status === "COMPLETED") return "COMPLETED";

  // ✅ Provider cancelled marker = broadcast_status CANCELLED
  if (j.broadcast_status === "CANCELLED") return "CANCELLED";

  // ignore everything else (PENDING / MISSED / ACCEPTED etc)
  return null;
};

const dedupeByJobIdKeepLatest = (items: JobSummaryForProvider[]) => {
  const map = new Map<string, JobSummaryForProvider>();
  for (const j of items) {
    const prev = map.get(j.job_id);
    if (!prev) {
      map.set(j.job_id, j);
      continue;
    }
    const prevT = new Date(prev.created_at).getTime();
    const curT = new Date(j.created_at).getTime();
    if (curT >= prevT) map.set(j.job_id, j);
  }
  return Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const badgeClass = (s: Status) => {
  switch (s) {
    case "COMPLETED":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "CANCELLED":
    default:
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300";
  }
};

const iconNode = (s: Status) => {
  switch (s) {
    case "COMPLETED":
      return <CheckCircle2 size={18} className="text-teal-600 dark:text-teal-400" />;
    case "CANCELLED":
    default:
      return <XCircle size={18} className="text-rose-600 dark:text-rose-400" />;
  }
};

function LoadingSkeletonList() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 4 }).map((_, idx) => (
        <Card
          key={idx}
          className="border border-gray-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden"
        >
          <CardContent className="p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                <Skeleton className="h-6 w-6 rounded-md dark:bg-zinc-700" />
              </div>

              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-4/5 rounded-md dark:bg-zinc-700" />
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-3 w-24 rounded-md dark:bg-zinc-700" />
                  <Skeleton className="h-3 w-36 rounded-md dark:bg-zinc-700" />
                </div>
              </div>
            </div>

            <Skeleton className="h-6 w-24 rounded-full dark:bg-zinc-700" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function ServiceProviderJobHistory({ jobs }: ServiceProviderJobHistoryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [tab, setTab] = useState<Tab>("all");

  useEffect(() => {
    const handleOpen = () => setIsDialogOpen(true);
    window.addEventListener("openHistoryModal", handleOpen);
    return () => window.removeEventListener("openHistoryModal", handleOpen);
  }, []);

  useEffect(() => {
    if (!isDialogOpen) return;
    setIsFetching(true);

    // ✅ little delay so skeleton looks smooth
    const t = setTimeout(() => setIsFetching(false), 350);
    return () => clearTimeout(t);
  }, [isDialogOpen]);

  const normalizedJobs = useMemo(() => {
    // ✅ keep only Completed/Cancelled and dedupe
    const filtered = jobs.filter((j) => getHistoryStatus(j) !== null);
    return dedupeByJobIdKeepLatest(filtered);
  }, [jobs]);

  const counts = useMemo(() => {
    let completed = 0;
    let cancelled = 0;

    for (const j of normalizedJobs) {
      const s = getHistoryStatus(j);
      if (s === "COMPLETED") completed++;
      else if (s === "CANCELLED") cancelled++;
    }

    return { all: normalizedJobs.length, completed, cancelled };
  }, [normalizedJobs]);

  const filteredJobs = useMemo(() => {
    if (tab === "all") return normalizedJobs;
    if (tab === "completed") return normalizedJobs.filter((j) => getHistoryStatus(j) === "COMPLETED");
    return normalizedJobs.filter((j) => getHistoryStatus(j) === "CANCELLED");
  }, [normalizedJobs, tab]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="fixed top-4 left-[50%] translate-x-[-50%] translate-y-0 sm:top-10 sm:max-w-[700px] rounded-[24px] border-0 p-0 overflow-hidden bg-white dark:bg-zinc-800 shadow-2xl animate-in slide-in-from-top-10 duration-300 [&>button[data-dialog-close]]:hidden">
        <DialogHeader className="bg-gradient-to-r from-teal-900 to-teal-800 p-6 text-white relative">
          <History className="absolute right-6 top-6 opacity-10 rotate-12" size={80} />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <History size={24} className="text-teal-100" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">My Jobs</DialogTitle>
              <DialogDescription className="text-teal-100/80 text-sm mt-1">
                Completed and cancelled jobs you handled.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-5 max-h-[85vh] overflow-y-auto scrollbar-hide relative">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gray-50/60 dark:bg-zinc-900 p-2 border border-gray-100 dark:border-zinc-700">
            <button
              onClick={() => setTab("all")}
              className={`h-10 rounded-xl text-sm font-semibold transition-colors ${
                tab === "all"
                  ? "bg-teal-900 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              All ({counts.all})
            </button>

            <button
              onClick={() => setTab("completed")}
              className={`h-10 rounded-xl text-sm font-semibold transition-colors ${
                tab === "completed"
                  ? "bg-teal-900 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              Completed ({counts.completed})
            </button>

            <button
              onClick={() => setTab("cancelled")}
              className={`h-10 rounded-xl text-sm font-semibold transition-colors ${
                tab === "cancelled"
                  ? "bg-teal-900 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              Cancelled ({counts.cancelled})
            </button>
          </div>

          {isFetching ? (
            <LoadingSkeletonList />
          ) : filteredJobs.length === 0 ? (
            <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-10 border border-dashed border-slate-300 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-full mb-3">
                <History className="text-slate-300 dark:text-zinc-500 h-10 w-10" />
              </div>
              <h3 className="text-slate-600 dark:text-slate-300 font-medium text-lg">No history found</h3>
              <p className="text-slate-400 dark:text-zinc-500 mt-1">Completed/cancelled jobs will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredJobs.map((item) => {
                const s = getHistoryStatus(item)!;

                return (
                  <Card
                    key={item.job_id}
                    className="border border-gray-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden"
                  >
                    <CardContent className="p-4 flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                          {iconNode(s)}
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                            {item.problem_details}
                          </h4>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="inline-flex items-center gap-1">
                              <CalendarDays size={12} />
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>

                            <span className="text-gray-300 dark:text-zinc-600">|</span>

                            <span className="font-medium">
                              {item.district}, {item.area}
                              {item.sub_area ? `, ${item.sub_area}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Badge className={`${badgeClass(s)} border-0 shrink-0`}>{s}</Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 w-full">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="rounded-lg border-gray-200 dark:border-zinc-700"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
