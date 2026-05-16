import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import { useJobStore } from "@/store/JobStore";
import { AcceptJobByProvider, CancelJobByProvider, CompleteJobByProvider, SendProviderOffer } from "@/api/JobApi";
import { GetNIDStatus } from "@/api/ProfileApi";
import { NIDStatus } from "@/enums/NIDStatus";
import {
  MapPin,
  Wrench,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Zap,
  Map,
  Phone,
  XCircle,
  Info,
  Lock,
  Settings,
  ShieldAlert,
} from "lucide-react";
import { JobStatus } from "@/enums/JobStatus";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import JobLocationMap from "@/components/common/Map";
import ServiceProviderJobHistory from "@/components/Dashboard/service-provider/ServiceProviderJobHistory";

const showSuccessToast = (message: string) => {
  const alertDiv = document.createElement("div");
  alertDiv.className = "fixed top-4 right-4 z-50 animate-in slide-in-from-right";
  alertDiv.innerHTML = `
    <div class="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-green-500"></div>
        <p class="text-green-700 font-medium">${message}</p>
    </div>`;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
};

const showErrorToast = (message: string) => {
  const alertDiv = document.createElement("div");
  alertDiv.className = "fixed top-4 right-4 z-50 animate-in slide-in-from-right";
  alertDiv.innerHTML = `
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-center gap-2">
        <div class="h-2 w-2 rounded-full bg-red-500"></div>
        <p class="text-red-700 font-medium">${message}</p>
    </div>`;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
};

// --- Job Request Card Component ---
const JobRequestCard = ({ request, onAcceptJob }: any) => {
  const { fetchProviderDashboard } = useJobStore();
  const [offerPrice, setOfferPrice] = useState(request.provider_offer_price || "");
  const [isUpdatingOffer, setIsUpdatingOffer] = useState(false);

  const handleSendOffer = async () => {
    if (!offerPrice || Number(offerPrice) <= 0) return;
    setIsUpdatingOffer(true);
    try {
      await SendProviderOffer(request.job_id, {
        provider_offer_price: Number(offerPrice),
      });
      showSuccessToast("Offer sent successfully!");
      await fetchProviderDashboard();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to send offer");
    } finally {
      setIsUpdatingOffer(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0 w-full lg:w-auto flex-1">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400">
              <Zap size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">
                New Request
              </p>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg line-clamp-2 leading-tight">
                {request.problem_details || "Service Request"}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-slate-400" />
                  {request.district}, {request.area} {request.sub_area ? `, ${request.sub_area}` : ""}
                </span>
                <span className="text-slate-300 dark:text-zinc-700">|</span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(request.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
            {/* Price Info */}
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-1.5 mr-0 sm:mr-1">
              {request.user_offer_price > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">User Offers Price:</span>
                  <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400">
                    ৳{request.user_offer_price}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Your Ask Price:</span>
                <span className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                  ৳{request.provider_offer_price || 0}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-slate-100/80 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl overflow-hidden px-3 h-10 shadow-inner transition-all focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 w-full sm:w-28">
                <span className="text-slate-400 font-semibold text-sm mr-1">৳</span>
                <input
                  type="number"
                  placeholder="New ask"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-slate-100 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>

              <div className="flex w-full sm:w-auto gap-2">
                <Button
                  size="sm"
                  onClick={handleSendOffer}
                  disabled={isUpdatingOffer || Number(offerPrice) === request.provider_offer_price}
                  className="w-full sm:w-auto bg-teal-900 hover:bg-teal-800 text-white rounded-xl h-10 px-4 text-xs font-bold transition-all disabled:opacity-50 shadow-sm shrink-0"
                >
                  {isUpdatingOffer ? "..." : "Send Offer"}
                </Button>

                <Button
                  size="sm"
                  onClick={() => onAcceptJob(request)}
                  className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white rounded-xl h-10 px-6 text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  Accept Job
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ProviderDashboard() {
  const { account, profile, fetchProfile, spAddress, fetchAddresses, serviceCatalog, fetchServiceCatalog } =
    useAccountStore();

  const navigate = useNavigate();
  const { providerDashboard, fetchProviderDashboard } = useJobStore();

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [jobToCancel, setJobToCancel] = useState<string | null>(null);

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [jobToComplete, setJobToComplete] = useState<string | null>(null);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isServiceLoading, setIsServiceLoading] = useState(true);
  const [nidStatus, setNidStatus] = useState<NIDStatus | string | null>(null);

  const displayName = profile?.name || (account as any)?.name || "Service Provider";

  const currentAddress = spAddress
    ? [spAddress.area, spAddress.thana, spAddress.district].filter(Boolean).join(", ")
    : "Location not set";

  const isProfileComplete = !!profile?.name;
  const isAddressComplete = !!spAddress && !!spAddress.district;
  const isNidVerified = nidStatus === NIDStatus.ACCEPTED || nidStatus === "ACCEPTED";

  const hasServiceSetup = useMemo(() => {
    if (!serviceCatalog) return false;
    const catalogData = serviceCatalog.data ?? serviceCatalog;
    const minCharge = Number(catalogData?.min_charge || 0);
    const desc = String(catalogData?.description || "").trim();
    return minCharge > 0 || desc.length > 0;
  }, [serviceCatalog]);

  const activeJob = providerDashboard?.active_job || null;
  const requests = providerDashboard?.requests || [];
  const recentJobs = providerDashboard?.history || [];

  const doneCount = useMemo(
    () => (recentJobs || []).filter((j: any) => j.status === JobStatus.COMPLETED).length,
    [recentJobs],
  );

  const mapDisplayAddress = useMemo(() => {
    if (!activeJob) return "";
    return [activeJob.district, activeJob.thana, activeJob.area].filter(Boolean).join(", ");
  }, [activeJob]);

  const isUnder30Mins = useMemo(() => {
    const acceptedAt = activeJob?.accepted_at;
    if (!acceptedAt) return false;
    const acceptedTime = new Date(acceptedAt).getTime();
    const currentTime = Date.now();
    const diffInMinutes = (currentTime - acceptedTime) / (1000 * 60);
    return diffInMinutes <= 30;
  }, [activeJob?.accepted_at]);

  useEffect(() => {
    if (!account?.phone) return;

    fetchProfile();
    fetchAddresses();
    fetchProviderDashboard();

    GetNIDStatus()
      .then((res: any) => {
        if (res) {
          const currentStatus = res?.data?.status || res?.status;
          if (currentStatus) {
            setNidStatus(currentStatus);
          }
        }
      })
      .catch((err) => console.error("Error fetching NID status", err));

    const interval = setInterval(() => {
      fetchProviderDashboard();
    }, 10000);

    return () => clearInterval(interval);
  }, [account?.phone, fetchProfile, fetchAddresses, fetchProviderDashboard]);

  useEffect(() => {
    let mounted = true;
    const checkServiceStatus = async () => {
      if (!account?.phone) return;
      setIsServiceLoading(true);
      try {
        await fetchServiceCatalog();
      } catch (err) {
        console.error("Failed to fetch catalog", err);
      } finally {
        if (mounted) setIsServiceLoading(false);
      }
    };
    checkServiceStatus();
    const onUpdated = () => checkServiceStatus();
    window.addEventListener("serviceCatalogUpdated", onUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("serviceCatalogUpdated", onUpdated);
    };
  }, [account?.phone, fetchServiceCatalog]);

  const handleAcceptJob = async (job: any) => {
    try {
      await AcceptJobByProvider(job.job_id);
      showSuccessToast("Job accepted successfully!");
      fetchProviderDashboard();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      showErrorToast(err.message || "Failed to accept job. It might have been taken.");
    }
  };

  const openCompleteModal = (jobId: string) => {
    setJobToComplete(jobId);
    setIsCompleteModalOpen(true);
  };

  const handleConfirmCompleteJob = async () => {
    if (!jobToComplete) return;
    try {
      await CompleteJobByProvider(jobToComplete);
      showSuccessToast("Job marked as completed!");
      setIsCompleteModalOpen(false);
      setJobToComplete(null);
      fetchProviderDashboard();
    } catch (err: any) {
      showErrorToast(err.message || "Failed to complete job");
    }
  };

  const openCancelModal = (jobId: string) => {
    setJobToCancel(jobId);
    setCancelReason("");
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancelJob = async () => {
    if (!cancelReason.trim()) {
      showErrorToast("Please provide a valid reason for cancellation.");
      return;
    }
    if (!jobToCancel) return;
    try {
      await CancelJobByProvider(jobToCancel, cancelReason);
      showSuccessToast("Job cancelled successfully.");
      setIsCancelModalOpen(false);
      setJobToCancel(null);
      setCancelReason("");
      fetchProviderDashboard();
    } catch (err: any) {
      showErrorToast(err.message || "Failed to cancel job");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans pb-20 transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Warning Banners */}
        <div className="flex flex-col gap-4">
          {!isProfileComplete && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full text-amber-600 dark:text-amber-400 hidden sm:block">
                  <AlertCircle size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg dark:text-gray-300">Complete Your Profile</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    Please update your profile to get more job opportunities.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/profile")}
                className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white w-full sm:w-auto px-6 whitespace-nowrap"
              >
                Update Profile
              </Button>
            </div>
          )}

          {isProfileComplete && !isAddressComplete && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-full text-amber-600 dark:text-amber-400 hidden sm:block">
                  <MapPin size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg dark:text-gray-300">Set Your Location</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    We need your service address to match you with nearby customers.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/profile")}
                className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 text-white w-full sm:w-auto px-6 whitespace-nowrap"
              >
                Set Address
              </Button>
            </div>
          )}

          {isProfileComplete && isAddressComplete && !isNidVerified && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="bg-red-100 dark:bg-red-900/50 p-3 rounded-full text-red-600 dark:text-red-400 hidden sm:block">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg dark:text-gray-300">Verify Your Identity</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                    For security reasons, you must verify your NID before receiving job requests. Your current status is
                    Pending/Unverified.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/profile")}
                className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 text-white w-full sm:w-auto px-6 whitespace-nowrap"
              >
                Verify NID
              </Button>
            </div>
          )}

          {!isServiceLoading && isProfileComplete && isAddressComplete && isNidVerified && !hasServiceSetup && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm transition-colors">
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full text-blue-600 dark:text-blue-400 hidden sm:block">
                  <Settings size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg dark:text-gray-300">Setup Service Portal</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                    You won't receive job requests until you add your service details. Please update your My Service
                    section.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => window.dispatchEvent(new Event("openMyServicePanel"))}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white w-full sm:w-auto px-6 whitespace-nowrap"
              >
                Add Service Details
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-teal-800 to-teal-900 dark:from-teal-900 dark:to-teal-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-center min-h-[220px] transition-colors">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">Hello, {displayName} 👋</h1>
              <h2 className="text-xl font-medium text-teal-50 mb-1">Ready to work?</h2>
              <p className="text-teal-200 opacity-90 text-sm mb-6">Manage your daily tasks and grow your business.</p>
              <div className="flex items-center gap-2 text-teal-100">
                <MapPin size={18} className="text-teal-300" />
                <span className="text-sm font-medium tracking-wide">{currentAddress}</span>
              </div>
            </div>
            <Wrench className="absolute right-[-20px] bottom-[-40px] text-white opacity-5 h-64 w-64 rotate-12" />
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-slate-100 dark:border-zinc-800 shadow-lg flex flex-col min-h-[220px] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700 dark:text-slate-200">Overview</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded-full border border-slate-100 dark:border-zinc-700">
                Last 30 Days
              </span>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="bg-orange-50/80 dark:bg-orange-900/20 p-3 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex flex-col justify-center items-center">
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-sm text-orange-500 dark:text-orange-400 mb-1">
                  <Clock size={18} />
                </div>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{requests.length}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending</span>
              </div>
              <div className="bg-teal-50/80 dark:bg-teal-900/20 p-3 rounded-2xl border border-teal-100 dark:border-teal-900/30 flex flex-col justify-center items-center">
                <div className="bg-white dark:bg-zinc-800 p-2 rounded-full shadow-sm text-teal-600 dark:text-teal-400 mb-1">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-200">{doneCount}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Done</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            Current Active Job
          </h2>
          {!activeJob ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center transition-colors">
              <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-full mb-3">
                <Wrench className="text-slate-300 dark:text-zinc-500 h-8 w-8" />
              </div>
              <h3 className="text-slate-500 dark:text-slate-300 font-medium">No active jobs right now</h3>
              <p className="text-slate-400 dark:text-zinc-500 text-sm mt-1">
                Accept a request from below to start working.
              </p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <Card className="border-l-4 border-l-teal-500 dark:border-l-teal-400 shadow-md bg-white dark:bg-zinc-900 overflow-hidden w-full rounded-2xl">
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-4 gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-teal-100 dark:bg-teal-900/30 p-2.5 rounded-lg shrink-0">
                        <Zap className="text-teal-700 dark:text-teal-400 h-5 w-5" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-slate-200 leading-tight">
                          {activeJob.problem_details}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-block bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 text-[10px] px-2 py-0.5 rounded font-bold tracking-wide uppercase">
                            Status: In Progress
                          </span>
                          {isUnder30Mins && (
                            <span className="bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300 text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
                              <Info size={13} className="shrink-0" />
                              You can cancel this job within 30 mins.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 dark:bg-zinc-800/40 p-3.5 rounded-lg mb-4 border border-slate-100 dark:border-zinc-800/60">
                    <div className="flex items-start gap-2.5">
                      <MapPin size={18} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                          Customer Location
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                          {activeJob.district}, {activeJob.thana} {activeJob.area ? `, ${activeJob.area}` : ""}
                        </p>
                        {isUnder30Mins ? (
                          <div className="flex items-center gap-1.5 mt-1 text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-zinc-800 rounded px-2 py-0.5 w-fit">
                            <Lock size={12} />
                            <span className="text-xs font-medium">Address hidden for 30 mins</span>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{activeJob.address}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Phone size={18} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                          Customer Contact
                        </p>
                        {isUnder30Mins ? (
                          <div className="flex items-center gap-1.5 mt-1 text-slate-400 dark:text-slate-500 bg-slate-200/50 dark:bg-zinc-800 rounded px-2 py-0.5 w-fit">
                            <Lock size={12} />
                            <span className="text-xs font-medium">Hidden for 30 mins</span>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {activeJob.phone_number}
                            </p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                              {activeJob.full_name}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                    {activeJob.latitude && activeJob.longitude && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsMapModalOpen(true)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 w-full sm:w-auto flex items-center gap-1.5"
                      >
                        <Map size={16} /> View on Map
                      </Button>
                    )}
                    {isUnder30Mins && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openCancelModal(activeJob.job_id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 w-full sm:w-auto flex items-center gap-1.5"
                      >
                        <XCircle size={16} /> Cancel Job
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => openCompleteModal(activeJob.job_id)}
                      className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 size={16} /> Mark as Completed
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <section id="provider-new-jobs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">New Job Requests</h2>
              {requests.length > 0 && (
                <span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse border border-red-200 dark:border-red-800">
                  {requests.length} New
                </span>
              )}
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-10 border border-dashed border-slate-300 dark:border-zinc-800 flex flex-col items-center justify-center text-center transition-colors">
              <div className="bg-slate-50 dark:bg-zinc-800 p-4 rounded-full mb-3">
                <ClipboardList className="text-slate-300 dark:text-zinc-500 h-10 w-10" />
              </div>
              <h3 className="text-slate-600 dark:text-slate-300 font-medium text-lg">No new job requests</h3>
              <p className="text-slate-400 dark:text-zinc-500 mt-1 max-w-xs">
                You will be notified when customers nearby book a service.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              {requests.map((request: any) => (
                <JobRequestCard key={request.job_id} request={request} onAcceptJob={handleAcceptJob} />
              ))}
            </div>
          )}
        </section>
      </main>

      <ServiceProviderJobHistory jobs={recentJobs} />

      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle>Cancel Job</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-2 dark:text-slate-200">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 p-3 text-sm min-h-[100px] bg-slate-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              placeholder="Why are you cancelling..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelModalOpen(false)} className="rounded-lg">
              Back
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancelJob} className="rounded-lg">
              Submit Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950">
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="dark:text-slate-300">Are you sure you want to mark this job as completed?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteModalOpen(false)} className="rounded-lg">
              No
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
              onClick={handleConfirmCompleteJob}
            >
              Yes, Complete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMapModalOpen} onOpenChange={setIsMapModalOpen}>
        <DialogContent className="sm:max-w-[800px] md:max-w-4xl p-0 overflow-hidden rounded-[2.5rem] bg-white dark:bg-zinc-950 flex flex-col h-[85vh]">
          <div className="relative flex-1 w-full bg-slate-100 z-0">
            {activeJob && activeJob.latitude && activeJob.longitude ? (
              <JobLocationMap
                latitude={activeJob.latitude}
                longitude={activeJob.longitude}
                address={mapDisplayAddress}
                spLatitude={spAddress?.latitude ? Number(spAddress.latitude) : undefined}
                spLongitude={spAddress?.longitude ? Number(spAddress.longitude) : undefined}
                isInfoHidden={isUnder30Mins}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
                <MapPin size={48} />
                <p className="font-medium text-lg">Location data is missing</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-white dark:bg-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-zinc-800 shrink-0 z-10">
            <div className="flex items-center gap-4">
              <div className="bg-teal-50 dark:bg-teal-900/30 p-3 rounded-full text-teal-600 dark:text-teal-400">
                <MapPin size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">Customer Location</p>
                <div className="text-sm font-medium dark:text-slate-200">
                  <span className="line-clamp-2">{mapDisplayAddress}</span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsMapModalOpen(false)}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white px-8 rounded-xl"
            >
              Close Map
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
