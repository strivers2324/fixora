import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, History, CalendarDays, CheckCircle2, XCircle, Clock } from "lucide-react";
import type { JobSummaryForUser } from "@/api/JobApi";
import { JobStatus } from "@/enums/JobStatus";

interface UserBookingHistoryProps {
  jobs: JobSummaryForUser[];
}

const statusBadgeClass = (status: JobStatus) => {
  switch (status) {
    case JobStatus.COMPLETED:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    case JobStatus.CANCELLED:
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300";
    case JobStatus.ACCEPTED:
      return "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300";
    case JobStatus.PENDING:
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
  }
};

const statusIcon = (status: JobStatus) => {
  switch (status) {
    case JobStatus.COMPLETED:
      return <CheckCircle2 size={18} className="text-teal-600 dark:text-teal-400" />;
    case JobStatus.CANCELLED:
      return <XCircle size={18} className="text-rose-600 dark:text-rose-400" />;
    case JobStatus.ACCEPTED:
      return <Clock size={18} className="text-sky-600 dark:text-sky-400" />;
    case JobStatus.PENDING:
    default:
      return <Clock size={18} className="text-amber-600 dark:text-amber-400" />;
  }
};

export default function UserBookingHistory({ jobs }: UserBookingHistoryProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [tab, setTab] = useState<"all" | "completed" | "cancelled">("all");

  useEffect(() => {
    const handleOpen = () => setIsDialogOpen(true);
    window.addEventListener("openUserHistoryModal", handleOpen);
    return () => window.removeEventListener("openUserHistoryModal", handleOpen);
  }, []);

  useEffect(() => {
    if (!isDialogOpen) return;
    setIsFetching(true);
    const t = setTimeout(() => setIsFetching(false), 250);
    return () => clearTimeout(t);
  }, [isDialogOpen]);

  const filteredJobs = useMemo(() => {
    if (tab === "all") return jobs;
    if (tab === "completed") return jobs.filter((j) => j.status === JobStatus.COMPLETED);
    return jobs.filter((j) => j.status === JobStatus.CANCELLED);
  }, [jobs, tab]);

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
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">My Booking History</DialogTitle>
              <DialogDescription className="text-teal-100/80 text-sm mt-1"></DialogDescription>
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
              All ({jobs.length})
            </button>
            <button
              onClick={() => setTab("completed")}
              className={`h-10 rounded-xl text-sm font-semibold transition-colors ${
                tab === "completed"
                  ? "bg-teal-900 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              Completed ({jobs.filter((j) => j.status === JobStatus.COMPLETED).length})
            </button>
            <button
              onClick={() => setTab("cancelled")}
              className={`h-10 rounded-xl text-sm font-semibold transition-colors ${
                tab === "cancelled"
                  ? "bg-teal-900 text-white"
                  : "text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-zinc-800"
              }`}
            >
              Cancelled ({jobs.filter((j) => j.status === JobStatus.CANCELLED).length})
            </button>
          </div>

          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Loading bookings...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-slate-50 dark:bg-zinc-900 rounded-2xl p-10 border border-dashed border-slate-300 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
              <div className="bg-white dark:bg-zinc-800 p-4 rounded-full mb-3">
                <History className="text-slate-300 dark:text-zinc-500 h-10 w-10" />
              </div>
              <h3 className="text-slate-600 dark:text-slate-300 font-medium text-lg">No history found</h3>
              <p className="text-slate-400 dark:text-zinc-500 mt-1">Bookings will appear here after completion.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredJobs.map((item) => (
                <Card
                  key={item.job_id}
                  className="border border-gray-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 shadow-sm rounded-xl overflow-hidden"
                >
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 bg-white dark:bg-zinc-800 rounded-xl flex items-center justify-center shadow-sm">
                        {statusIcon(item.status)}
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
                            {item.district}, {item.thana}
                            {item.area ? `, ${item.area}` : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge className={`${statusBadgeClass(item.status)} border-0 shrink-0`}>{item.status}</Badge>
                  </CardContent>
                </Card>
              ))}
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
