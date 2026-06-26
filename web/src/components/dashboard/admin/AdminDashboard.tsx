import { useState, useEffect } from "react";
import {
  Search,
  ShieldCheck,
  Users,
  Wrench,
  TrendingUp,
  UserCheck,
  Clock,
  ChevronRight,
  Activity,
  CheckCircle2,
  XCircle,
  Clock3,
  FileText,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  GetVerificationsByStatus,
  UpdateVerificationStatus,
  IdentityVerification,
} from "@/api/IdentityVerificationApi";
import { NIDStatus } from "@/enums/NIDStatus";

export default function AdminDashboard() {
  const [isNidPanelOpen, setIsNidPanelOpen] = useState(false);
  const [nidStatus, setNidStatus] = useState<"pending" | "accepted" | "rejected">("pending");
  const [providers, setProviders] = useState<IdentityVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [counts, setCounts] = useState({ pending: 0, accepted: 0, rejected: 0 });
  const [selectedNid, setSelectedNid] = useState<{ front: string; back: string; name: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pendingData, acceptedData, rejectedData] = await Promise.all([
        GetVerificationsByStatus(NIDStatus.PENDING),
        GetVerificationsByStatus(NIDStatus.ACCEPTED),
        GetVerificationsByStatus(NIDStatus.REJECTED),
      ]);

      setCounts({
        pending: pendingData.length || 0,
        accepted: acceptedData.length || 0,
        rejected: rejectedData.length || 0,
      });

      if (nidStatus === "pending") setProviders(pendingData);
      else if (nidStatus === "accepted") setProviders(acceptedData);
      else if (nidStatus === "rejected") setProviders(rejectedData);
    } catch (error) {
      console.error("Failed to fetch verifications:", error);
      toast.error("Failed to load verification data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [nidStatus]);

  const handleUpdateStatus = async (providerId: string, newStatus: NIDStatus) => {
    setIsUpdating(true);
    try {
      await UpdateVerificationStatus(providerId, newStatus);
      toast.success(`Verification status updated to ${newStatus.toLowerCase()} successfully`);
      await fetchData();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update verification status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] flex flex-col font-sans transition-colors duration-300">
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 scroll-smooth">
        <div className="max-w-7xl mx-auto space-y-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Admin Portal</h1>
            <p className="text-slate-500 dark:text-zinc-400 text-sm md:text-base">
              Here is what's happening across the Fixora platform today.
            </p>
          </div>

          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <button
                onClick={() => setIsNidPanelOpen(!isNidPanelOpen)}
                className={`text-left w-full group relative bg-white dark:bg-zinc-950 p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-44 overflow-hidden
                  ${
                    isNidPanelOpen
                      ? "border-amber-500/50 shadow-lg shadow-amber-500/10 -translate-y-1"
                      : "border-slate-200/60 dark:border-zinc-800/80 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1"
                  }`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors"></div>
                <div className="flex justify-between items-start z-10 w-full">
                  <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center border border-amber-200/60 dark:border-amber-900/30">
                    <ShieldCheck size={26} />
                  </div>
                  <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse border border-amber-200/40 dark:border-amber-900/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                    {counts.pending} Pending
                  </span>
                </div>
                <div className="z-10 w-full flex items-end justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">
                      NID Verifications
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Review Providers</p>
                  </div>
                  <ChevronRight
                    size={20}
                    className={`text-slate-400 transition-transform duration-300 ${isNidPanelOpen ? "rotate-90 text-amber-500" : "group-hover:translate-x-1 group-hover:text-amber-500"}`}
                  />
                </div>
              </button>
            </div>
          </section>

          {isNidPanelOpen && (
            <section className="bg-white dark:bg-zinc-950 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-6 shadow-sm animate-fade-in origin-top">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <FileText className="text-amber-500" size={22} />
                Verification Requests Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => setNidStatus("pending")}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-200 ${nidStatus === "pending" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 dark:border-amber-500 shadow-md shadow-amber-500/10" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700/50"}`}
                >
                  <div
                    className={`flex items-center gap-2 mb-2 ${nidStatus === "pending" ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-zinc-400"}`}
                  >
                    <Clock3 size={20} />
                    <span className="font-semibold text-sm">Pending</span>
                  </div>
                  <h3
                    className={`text-4xl font-bold ${nidStatus === "pending" ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-white"}`}
                  >
                    {counts.pending}
                  </h3>
                </button>

                <button
                  onClick={() => setNidStatus("accepted")}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-200 ${nidStatus === "accepted" ? "bg-teal-50 dark:bg-teal-900/20 border-teal-400 dark:border-teal-500 shadow-md shadow-teal-500/10" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-teal-300 dark:hover:border-teal-700/50"}`}
                >
                  <div
                    className={`flex items-center gap-2 mb-2 ${nidStatus === "accepted" ? "text-teal-600 dark:text-teal-400" : "text-slate-500 dark:text-zinc-400"}`}
                  >
                    <CheckCircle2 size={20} />
                    <span className="font-semibold text-sm">Accepted</span>
                  </div>
                  <h3
                    className={`text-4xl font-bold ${nidStatus === "accepted" ? "text-teal-600 dark:text-teal-400" : "text-slate-800 dark:text-white"}`}
                  >
                    {counts.accepted}
                  </h3>
                </button>

                <button
                  onClick={() => setNidStatus("rejected")}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border transition-all duration-200 ${nidStatus === "rejected" ? "bg-rose-50 dark:bg-rose-900/20 border-rose-400 dark:border-rose-500 shadow-md shadow-rose-500/10" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-rose-300 dark:hover:border-rose-700/50"}`}
                >
                  <div
                    className={`flex items-center gap-2 mb-2 ${nidStatus === "rejected" ? "text-rose-600 dark:text-rose-400" : "text-slate-500 dark:text-zinc-400"}`}
                  >
                    <XCircle size={20} />
                    <span className="font-semibold text-sm">Rejected</span>
                  </div>
                  <h3
                    className={`text-4xl font-bold ${nidStatus === "rejected" ? "text-rose-600 dark:text-rose-400" : "text-slate-800 dark:text-white"}`}
                  >
                    {counts.rejected}
                  </h3>
                </button>
              </div>

              <div className="space-y-3">
                {isLoading ? (
                  <div className="py-10 text-center text-slate-500 animate-pulse">Loading data...</div>
                ) : providers.length > 0 ? (
                  providers.map((provider) => (
                    <div
                      key={provider.provider_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30 hover:bg-slate-50 dark:hover:bg-zinc-900/80 transition-colors gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-slate-600 dark:text-zinc-300 shrink-0">
                          {(provider.name || "Name not set yet").charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                            {provider.name || "Name not set yet"}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-zinc-400 select-all">
                            ID: {provider.provider_id}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setSelectedNid({
                                front: provider.front_image,
                                back: provider.back_image,
                                name: provider.name || "Name not set yet",
                              })
                            }
                            className="px-3 py-1.5 text-xs font-medium bg-slate-200/50 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-md transition-colors"
                          >
                            View NIDs
                          </button>

                          {nidStatus === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(provider.provider_id, NIDStatus.ACCEPTED)}
                                disabled={isUpdating}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-900/60 rounded-md transition-colors border border-transparent dark:border-teal-900/30 disabled:opacity-50"
                              >
                                <CheckCircle2 size={14} /> Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(provider.provider_id, NIDStatus.REJECTED)}
                                disabled={isUpdating}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-900/60 rounded-md transition-colors border border-transparent dark:border-rose-900/30 disabled:opacity-50"
                              >
                                <XCircle size={14} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center flex flex-col items-center justify-center bg-slate-50/50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400 dark:text-zinc-600 mb-3">
                      <Search size={24} />
                    </div>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">No {nidStatus} requests found.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <section className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                <TrendingUp size={20} className="text-teal-600 dark:text-teal-400" />
                System Overview
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-200/30 dark:border-teal-900/20">
                    <Users size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Total Users</p>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">1,248</h4>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200/30 dark:border-blue-900/20">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Verified Providers</p>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">342</h4>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-200/30 dark:border-purple-900/20">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Total Bookings</p>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">5,892</h4>
                  </div>
                </div>
                <div className="bg-white dark:bg-zinc-950 p-5 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200/30 dark:border-rose-900/20">
                    <Activity size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Active Jobs Today</p>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white">28</h4>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                <Clock size={20} className="text-teal-600 dark:text-teal-400" />
                Recent Activities
              </h2>
              <div className="bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200/60 dark:border-zinc-800/80 shadow-sm h-[265px] overflow-y-auto">
                <div className="relative pl-6 border-l border-slate-200 dark:border-zinc-800 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[35px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 ring-4 ring-white dark:ring-zinc-950 z-10 border border-amber-200/30 dark:border-amber-900/20">
                      <ShieldCheck size={15} />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">NID Submitted</h4>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                        10m ago
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      Rahim Uddin submitted NID for verification.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[35px] top-0 flex items-center justify-center w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 ring-4 ring-white dark:ring-zinc-950 z-10 border border-teal-200/30 dark:border-teal-900/20">
                      <Wrench size={15} />
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Job Completed</h4>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded">
                        1h ago
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-zinc-400">
                      AC Servicing at Dhanmondi completed by Kamrul.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {selectedNid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-[#0a0a0a]/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                NID Verification:{" "}
                <span className="text-amber-600 dark:text-amber-500 font-medium">{selectedNid.name}</span>
              </h3>
              <button
                onClick={() => setSelectedNid(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 rounded-full transition-colors outline-none"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 bg-slate-50/50 dark:bg-[#0a0a0a] flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-teal-500" /> NID Front Side
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-slate-200 dark:bg-zinc-900 flex items-center justify-center p-2">
                    <img
                      src={selectedNid.front}
                      alt="NID Front"
                      className="w-full h-44 sm:h-52 object-cover rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-teal-500" /> NID Back Side
                  </h4>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm bg-slate-200 dark:bg-zinc-900 flex items-center justify-center p-2">
                    <img
                      src={selectedNid.back}
                      alt="NID Back"
                      className="w-full h-44 sm:h-52 object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 flex justify-end">
              <button
                onClick={() => setSelectedNid(null)}
                className="px-5 py-2 text-sm font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-lg transition-colors"
              >
                Close NID View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
