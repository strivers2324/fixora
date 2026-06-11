import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import { useJobStore } from "@/store/JobStore";
import { CancelJobByUser, UpdateUserOffer } from "@/api/JobApi";
import { JobStatus } from "@/enums/JobStatus";

import {
  MapPin,
  Zap,
  Droplet,
  Truck,
  Snowflake,
  Wind,
  Hammer,
  Video,
  Wifi,
  BatteryCharging,
  Disc,
  Monitor,
  Tv,
  Car,
  ArrowUpDown,
  Waves,
  Plug,
  AlertCircle,
  ClipboardList,
  Phone,
  Clock,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ServiceSearch from "./ServiceSearch";

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

const allServices = [
  {
    id: 1,
    name: "Electrician",
    icon: <Zap size={24} />,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
  },
  {
    id: 2,
    name: "AC Technician",
    icon: <Wind size={24} />,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
  },
  {
    id: 3,
    name: "Refrigerator Mechanic",
    icon: <Snowflake size={24} />,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: 4,
    name: "Plumber",
    icon: <Droplet size={24} />,
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
  },
  {
    id: 5,
    name: "Carpenter",
    icon: <Hammer size={24} />,
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-100 dark:bg-orange-900/30",
  },
  {
    id: 6,
    name: "CCTV Installer",
    icon: <Video size={24} />,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
  },
  {
    id: 7,
    name: "Broadband Internet Provider",
    icon: <Wifi size={24} />,
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-100 dark:bg-sky-900/30",
  },
  {
    id: 8,
    name: "IPS/Inverter Technician",
    icon: <BatteryCharging size={24} />,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-100 dark:bg-green-900/30",
  },
  {
    id: 9,
    name: "Washing Machine Technician",
    icon: <Disc size={24} />,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    id: 10,
    name: "Computer Technician",
    icon: <Monitor size={24} />,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: 11,
    name: "TV Technician",
    icon: <Tv size={24} />,
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-100 dark:bg-red-900/30",
  },
  {
    id: 12,
    name: "Automobile Mechanic",
    icon: <Car size={24} />,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
  },
  {
    id: 13,
    name: "Lift Technician",
    icon: <ArrowUpDown size={24} />,
    color: "text-zinc-600 dark:text-zinc-400",
    bgColor: "bg-zinc-100 dark:bg-zinc-800",
  },
  {
    id: 14,
    name: "Water Pump Technician",
    icon: <Waves size={24} />,
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-100 dark:bg-teal-900/30",
  },
  {
    id: 15,
    name: "Home Appliance Technician",
    icon: <Plug size={24} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
  },
];

const heroSlides = [
  {
    id: 1,
    title: "AC Cooling Problem?",
    subtitle: "Expert servicing at your doorstep",
    icon: Snowflake,
    color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-slate-300",
    titleColor: "dark:text-slate-300",
    subtitleColor: "dark:text-blue-300",
  },
  {
    id: 2,
    title: "Fan Making Noise?",
    subtitle: "Repair or install new fans easily",
    icon: Wind,
    color: "bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400",
    titleColor: "dark:text-slate-300",
    subtitleColor: "dark:text-blue-300",
  },
];

const ActiveJobCard = ({ item, index, variant, cancellingId, onCancelClick }: any) => {
  const isAccepted = item.status === JobStatus.ACCEPTED;
  const isPending = item.status === JobStatus.PENDING;

  const { fetchUserDashboard } = useJobStore();

  const [offerPrice, setOfferPrice] = useState("");
  const [isUpdatingOffer, setIsUpdatingOffer] = useState(false);

  const handleUpdateOffer = async () => {
    if (!offerPrice || Number(offerPrice) <= 0) return;

    if (!item.provider_id) {
      showErrorToast("Provider ID is missing! Cannot send offer.");
      return;
    }

    setIsUpdatingOffer(true);
    try {
      await UpdateUserOffer(item.job_id, {
        provider_id: item.provider_id,
        user_offer_price: Number(offerPrice),
      });
      showSuccessToast("Offer updated successfully!");
      await fetchUserDashboard();
    } catch (error: any) {
      showErrorToast(error.message || "Failed to update offer");
    } finally {
      setIsUpdatingOffer(false);
    }
  };

  return (
    <Card className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4 min-w-0 w-full lg:w-auto flex-1">
            <div
              className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isAccepted ? "bg-teal-100 dark:bg-teal-900/30" : "bg-amber-100 dark:bg-amber-900/30"
              }`}
            >
              {isAccepted ? (
                <Truck className="text-teal-700 dark:text-teal-300" size={18} />
              ) : (
                <Clock className="text-amber-700 dark:text-amber-300" size={18} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mb-1">
                {variant === "accepted" ? `Accepted Job #${index + 1}` : `Requested Job #${index + 1}`}
              </p>
              <h3 className="font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                {item.problem_details || "Service Request"}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin size={12} />
                  {item.district}, {item.thana}
                  {item.area ? `, ${item.area}` : ""}
                </span>
                <span className="text-slate-300 dark:text-zinc-700">|</span>
                <span
                  className={`font-bold uppercase tracking-wider text-[10px] ${
                    isAccepted ? "text-teal-700 dark:text-teal-400" : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
              {isAccepted && (item.provider_name || item.provider_phone) && (
                <div className="mt-3 text-xs flex flex-col sm:flex-row gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 w-max">
                  {item.provider_name && (
                    <div className="text-slate-700 dark:text-slate-300 font-semibold">
                      Provider: <span className="text-teal-700 dark:text-teal-400">{item.provider_name}</span>
                    </div>
                  )}
                  {item.provider_phone && (
                    <div className="text-slate-700 dark:text-slate-300 font-semibold">
                      Contact:{" "}
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{item.provider_phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
            {isAccepted && item.provider_phone && (
              <a href={`tel:${item.provider_phone}`} className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white rounded-xl px-5 h-10 shadow-sm"
                >
                  <Phone size={14} className="mr-2" /> Call Provider
                </Button>
              </a>
            )}
            {isPending && (
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto gap-1.5 mr-0 sm:mr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base text-slate-500 dark:text-slate-400 font-medium">Your Offer Price:</span>
                    <span className="text-base font-extrabold text-teal-700 dark:text-teal-400">
                      ৳{item.user_offer_price || 0}
                    </span>
                  </div>
                  {item.provider_offer_price > 0 && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-base text-slate-500 dark:text-slate-400 font-medium">
                        Provider Asks Price:
                      </span>
                      <span className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                        ৳{item.provider_offer_price}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl overflow-hidden px-3 h-10 shadow-sm transition-all focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 w-full sm:w-auto">
                  <span className="text-slate-400 font-semibold text-sm mr-1">৳</span>
                  <input
                    type="number"
                    placeholder="New offer"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full sm:w-24 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-bold text-slate-800 dark:text-slate-100 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <Button
                  size="sm"
                  onClick={handleUpdateOffer}
                  disabled={isUpdatingOffer || Number(offerPrice) === item.user_offer_price}
                  className="w-full sm:w-auto bg-teal-900 hover:bg-teal-800 text-white rounded-xl h-10 px-5 text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
                >
                  {isUpdatingOffer ? "..." : "Offer"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCancelClick(item.job_id)}
                  disabled={cancellingId === item.job_id}
                  className="w-full sm:w-auto rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 h-10 px-5 shadow-sm"
                >
                  {cancellingId === item.job_id ? "Cancelling..." : "Cancel"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function UserDashboard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllServices, setShowAllServices] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [jobToCancel, setJobToCancel] = useState<string | null>(null);

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [selectedProfessionId, setSelectedProfessionId] = useState<number>(0);

  const { profile, fetchProfile, userAddresses, fetchAddresses } = useAccountStore();
  const { setJobData, userDashboard, fetchUserDashboard } = useJobStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchAddresses();
    fetchUserDashboard();
  }, [fetchProfile, fetchUserDashboard]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const displayName = profile?.name || "User";

  const defaultAddress =
    userAddresses?.find((addr: any) => addr.is_default) || (userAddresses?.length > 0 ? userAddresses[0] : null);

  const currentAddress = defaultAddress
    ? [defaultAddress.area, defaultAddress.thana, defaultAddress.district].filter(Boolean).join(", ")
    : "No address set yet";

  const isProfileComplete = !!profile?.name && !!defaultAddress;

  const activeBookings = userDashboard?.active_jobs || [];

  const requestedJobs = useMemo(() => activeBookings.filter((j) => j.status === JobStatus.PENDING), [activeBookings]);
  const acceptedJobs = useMemo(() => activeBookings.filter((j) => j.status === JobStatus.ACCEPTED), [activeBookings]);

  const handleCategoryClick = (serviceId: number) => {
    if (!isProfileComplete) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const service = allServices.find((s) => s.id === serviceId);
    if (service) {
      setSelectedService(service.name);
      setSelectedProfessionId(service.id);
      setIsSearchModalOpen(true);
    }
  };

  const handleSearchContinue = (data: any) => {
    setJobData(data);
    setIsSearchModalOpen(false);
    navigate("/find-providers");
  };

  const handleCancelClick = (jobId: string) => {
    setJobToCancel(jobId);
  };

  const confirmCancelJob = async () => {
    if (!jobToCancel) return;
    try {
      setCancellingId(jobToCancel);
      await CancelJobByUser(jobToCancel, "Cancelled by user from dashboard");
      showSuccessToast("Job request cancelled successfully.");
      await fetchUserDashboard();
    } catch (error: any) {
      const backendErrorMessage = error?.response?.data?.message || error?.response?.data?.error;
      showErrorToast(
        backendErrorMessage || "This job is already complete or accepted by a provider. You cannot cancel this job.",
      );
      await fetchUserDashboard();
    } finally {
      setCancellingId(null);
      setJobToCancel(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans pb-20 transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {!isProfileComplete && (
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-pulse-slow transition-colors">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="bg-amber-100 p-3 rounded-full text-amber-600 hidden sm:block">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg dark:text-gray-300">Complete Your Profile</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md">
                  Please update your profile with your name and address to access and book services.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/profile")}
              className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto px-6 whitespace-nowrap"
            >
              Update Profile
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-teal-800 to-teal-900 dark:from-teal-900 dark:to-teal-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-center min-h-[220px] transition-colors">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-3 flex items-center gap-3">Hello, {displayName} 👋</h1>
              <h2 className="text-xl font-medium text-teal-50 mb-1">Find the right expert.</h2>
              <p className="text-teal-200 opacity-90 text-sm mb-6">
                Book trusted service providers for your home needs.
              </p>
              <div className="flex items-center gap-2 text-teal-100">
                <MapPin size={18} className="text-teal-300" />
                <span className="text-sm font-medium tracking-wide">{currentAddress}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-100 dark:border-zinc-800 shadow-sm flex flex-col justify-center min-h-[220px] transition-colors">
            <div
              className="flex flex-col items-center text-center space-y-4 animate-in fade-in duration-500"
              key={currentSlide}
            >
              <div className={`p-4 rounded-full ${heroSlides[currentSlide].color} mb-2 transition-colors`}>
                {React.createElement(heroSlides[currentSlide].icon, { size: 40 })}
              </div>
              <div>
                <h3
                  className={`text-xl font-bold text-gray-900 ${heroSlides[currentSlide].titleColor} transition-colors`}
                >
                  {heroSlides[currentSlide].title}
                </h3>
                <p className={`text-gray-500 mt-1 text-sm ${heroSlides[currentSlide].subtitleColor} transition-colors`}>
                  {heroSlides[currentSlide].subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        <section id="popular-services" className="scroll-mt-30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-300">Services</h2>
            <Button
              variant="link"
              className="text-teal-700 font-medium"
              onClick={() => setShowAllServices(!showAllServices)}
            >
              {showAllServices ? "Show Less" : "View All"}
            </Button>
          </div>

          <div
            className={`relative transition-all duration-500 ease-in-out ${showAllServices ? "" : "max-h-[230px] overflow-hidden"}`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {allServices.map((service) => (
                <Card
                  key={service.id}
                  onClick={() => handleCategoryClick(service.id)}
                  title={!isProfileComplete ? "Please complete your profile first" : ""}
                  className={`border-none shadow-sm transition-all rounded-2xl ${
                    isProfileComplete
                      ? "hover:shadow-md cursor-pointer group bg-white dark:bg-zinc-900"
                      : "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-zinc-900/50 grayscale-[20%]"
                  }`}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center min-h-[140px] text-center gap-3">
                    <div
                      className={`h-12 w-12 rounded-2xl flex items-center justify-center ${service.bgColor} ${service.color} ${
                        isProfileComplete ? "group-hover:scale-110 duration-300" : ""
                      }`}
                    >
                      {service.icon}
                    </div>
                    <span className="font-medium text-slate-700 text-sm leading-tight dark:text-slate-300">
                      {service.name}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>

            {!showAllServices && (
              <div className="absolute bottom-0 left-0 right-0 h-[80px] bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent dark:from-zinc-950 dark:via-zinc-950/80 pointer-events-none flex items-end justify-center pb-1 z-10">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-8 w-8 shadow-md pointer-events-auto bg-white/90 border-slate-200 text-teal-700 hover:text-teal-800 hover:bg-slate-50 dark:bg-zinc-800/90 dark:border-zinc-700 dark:text-teal-400 dark:hover:bg-zinc-800 animate-bounce cursor-pointer backdrop-blur-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAllServices(true);
                  }}
                >
                  <ChevronDown size={18} />
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">Active Bookings</h2>
          </div>

          {activeBookings.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900/50 border border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-2 transition-colors">
              <ClipboardList className="text-gray-300" size={32} />
              <p className="text-gray-500 text-sm font-medium">No active booking found yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {acceptedJobs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Accepted Jobs</h3>
                  </div>
                  {acceptedJobs.map((item, idx) => (
                    <ActiveJobCard
                      key={item.job_id}
                      item={item}
                      index={idx}
                      variant="accepted"
                      cancellingId={cancellingId}
                      onCancelClick={handleCancelClick}
                    />
                  ))}
                </div>
              )}

              {requestedJobs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Requested Jobs</h3>
                  </div>
                  {requestedJobs.map((item, idx) => (
                    <ActiveJobCard
                      key={item.job_id}
                      item={item}
                      index={idx}
                      variant="requested"
                      cancellingId={cancellingId}
                      onCancelClick={handleCancelClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <ServiceSearch
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        serviceName={selectedService}
        professionId={selectedProfessionId}
        profileData={profile}
        onContinueWithData={handleSearchContinue}
      />

      {jobToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Cancel Request</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to cancel this request?
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setJobToCancel(null)}
                disabled={cancellingId === jobToCancel}
                className="rounded-lg"
              >
                No
              </Button>
              <Button
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-lg"
                onClick={confirmCancelJob}
                disabled={cancellingId === jobToCancel}
              >
                {cancellingId === jobToCancel ? "Cancelling..." : "Yes, cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
