import { useMemo, useEffect, useState } from "react";
import { useJobStore } from "@/store/JobStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, CheckCircle2, XCircle, History, Wrench } from "lucide-react";
import { JobStatus } from "@/enums/JobStatus";

const getStatusBadgeStyles = (status: JobStatus) => {
  switch (status) {
    case JobStatus.COMPLETED:
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    case JobStatus.CANCELLED:
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300";
    case JobStatus.ACCEPTED:
      return "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
  }
};

export default function UserJobHistoryPage() {
  const { userDashboard, isLoadingDashboard, fetchUserDashboard } = useJobStore();
  const [currentTab, setCurrentTab] = useState<"all" | "completed" | "cancelled">("all");

  useEffect(() => {
    fetchUserDashboard();
  }, [fetchUserDashboard]);

  const jobs = userDashboard?.history || [];

  const counts = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        if (job.status === JobStatus.COMPLETED) acc.completed++;
        if (job.status === JobStatus.CANCELLED) acc.cancelled++;
        acc.all++;
        return acc;
      },
      { all: 0, completed: 0, cancelled: 0 },
    );
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    if (currentTab === "completed") return jobs.filter((j) => j.status === JobStatus.COMPLETED);
    if (currentTab === "cancelled") return jobs.filter((j) => j.status === JobStatus.CANCELLED);
    return jobs;
  }, [jobs, currentTab]);

  if (isLoadingDashboard) {
    return <div className="min-h-screen flex items-center justify-center text-sm font-medium">Loading history...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-10 font-sans">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-teal-700 p-3 rounded-xl text-white shadow-sm">
            <History size={26} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Booking History</h1>
            <p className="text-slate-500 text-sm mt-0.5">View all your completed and cancelled booking records.</p>
          </div>
        </div>

        <div className="mb-6 bg-white dark:bg-zinc-900/50 rounded-2xl p-5 border border-slate-100 dark:border-zinc-800/80 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 tracking-wide mb-4">Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-rose-50/50 dark:bg-rose-950/10 p-5 rounded-2xl border border-rose-100 dark:border-rose-950/30 flex flex-col items-center">
              <XCircle size={20} className="text-rose-500 mb-1" />
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{counts.cancelled}</span>
              <span className="text-xs text-slate-500 font-medium mt-0.5">Cancelled Bookings</span>
            </div>
            <div className="bg-teal-50/50 dark:bg-teal-950/10 p-5 rounded-2xl border border-teal-100 dark:border-teal-950/30 flex flex-col items-center">
              <CheckCircle2 size={20} className="text-teal-600 mb-1" />
              <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{counts.completed}</span>
              <span className="text-xs text-slate-500 font-medium mt-0.5">Completed Bookings</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-slate-200/60 dark:bg-zinc-900 p-1 rounded-full flex items-center border border-slate-200 dark:border-zinc-800 shadow-inner">
            {(["all", "completed", "cancelled"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCurrentTab(t)}
                className={`flex-1 text-center py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                  currentTab === t
                    ? "bg-teal-700 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                {t} ({counts[t]})
              </button>
            ))}
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800">
            <History className="mx-auto h-12 w-12 text-slate-300 dark:text-zinc-700 mb-3" />
            <h3 className="text-slate-600 dark:text-slate-300 font-semibold">No history found</h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredJobs.map((item) => (
              <Card
                key={item.job_id}
                className="group border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <CardContent className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1 bg-teal-50 dark:bg-teal-900/20 p-3 rounded-full text-teal-700 shrink-0">
                      <Wrench size={20} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-base mb-2 leading-snug">
                        {item.problem_details}
                      </h4>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <CalendarDays size={16} className="text-teal-600" />
                          {new Date(item.created_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">|</span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <MapPin size={16} className="text-teal-600" />
                          {item.district}, {item.thana}
                          {item.area ? `, ${item.area}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-none border-slate-100 pt-4 md:pt-0 pl-0 md:pl-6 md:border-l dark:border-zinc-800">
                    <div>
                      <span className="font-bold text-teal-800 dark:text-teal-400 text-xl">
                        ৳ {item.agreed_price ?? 0}
                      </span>
                    </div>
                    <Badge
                      className={`${getStatusBadgeStyles(item.status)} border-0 px-3 py-1 text-[11px] font-bold uppercase rounded-md tracking-wider`}
                    >
                      {item.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
