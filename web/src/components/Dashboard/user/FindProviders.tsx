import { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJobStore } from "@/store/JobStore";
import { SearchProviders, BookExpert } from "@/api/JobApi";
import type { ProviderData, BookExpertPayload } from "@/api/JobApi";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { MapPin, Star, ShieldCheck, User, Zap } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const providerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const TEMP_KEY = "fixora.requestedProviders:temp";
const requestedKey = (jobId?: string) => (jobId ? `fixora.requestedProviders:${jobId}` : TEMP_KEY);

const readList = (key: string): string[] => {
  try {
    const raw = sessionStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeList = (key: string, list: string[]) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(list));
  } catch {}
};

export default function FindProviders() {
  const navigate = useNavigate();
  const { jobData, setJobData } = useJobStore();

  const [isLoading, setIsLoading] = useState(true);
  const [providers, setProviders] = useState<ProviderData[]>([]);

  const [requestedProviders, setRequestedProviders] = useState<string[]>(() => {
    if (!jobData) return [];
    return readList(requestedKey(jobData.job_id));
  });

  const [isBooking, setIsBooking] = useState(false);
  const [bookingProviderId, setBookingProviderId] = useState<string | null>(null);

  // Custom Toast Functions (From your UpdateProfileForm)
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

  useEffect(() => {
    if (!jobData) navigate("/dashboard");
  }, [jobData, navigate]);

  useEffect(() => {
    if (!jobData) return;
    writeList(requestedKey(jobData.job_id), requestedProviders);
  }, [requestedProviders, jobData?.job_id, jobData]);

  useEffect(() => {
    if (!jobData) return;

    const fetchProviders = async () => {
      setIsLoading(true);

      try {
        const payload = {
          profession_id: jobData.profession_id,
          address_id: jobData.address_id,
        };

        const response = await SearchProviders(payload);
        setProviders(response || []);
      } catch (err: any) {
        showErrorToast(err.message || "Failed to load providers. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [jobData]);

  const userLocation: [number, number] = useMemo(() => {
    return [Number(jobData?.latitude) || 23.8103, Number(jobData?.longitude) || 90.4125];
  }, [jobData]);

  if (!jobData) return null;

  const handleBookExpert = async (providerId: string) => {
    const pid = (providerId || "").trim();
    if (!pid) {
      showErrorToast("Invalid provider id");
      return;
    }

    if (requestedProviders.includes(pid)) {
      showErrorToast("You already sent a request to this provider.");
      return;
    }

    if (requestedProviders.length >= 5) {
      showErrorToast("You cannot send requests to more than 5 providers.");
      return;
    }

    if (isBooking) return;

    setIsBooking(true);
    setBookingProviderId(pid);

    setRequestedProviders((prev) => (prev.includes(pid) ? prev : [...prev, pid]));

    try {
      const payload: BookExpertPayload = {
        ...(jobData.job_id ? { job_id: jobData.job_id } : {}),
        provider_id: pid,
        job_details: {
          profession_id: jobData.profession_id,
          problem_details: jobData.problem_details,
          address_id: jobData.address_id,
          user_offer_price: jobData.user_offer_price,
        },
      };

      const res = await BookExpert(payload);

      const returnedJobId =
        (res as any)?.job_id || (res as any)?.data?.job_id || (typeof res === "string" ? res : undefined);

      if (returnedJobId && returnedJobId !== jobData.job_id) {
        try {
          const tempList = readList(TEMP_KEY);
          writeList(requestedKey(returnedJobId), tempList);
          sessionStorage.removeItem(TEMP_KEY);
        } catch {}

        setJobData({ ...jobData, job_id: returnedJobId });
      }

      showSuccessToast("Request sent to expert successfully!");
    } catch (err: any) {
      setRequestedProviders((prev) => prev.filter((x) => x !== pid));
      showErrorToast(err.message || "Failed to book expert. Please try again.");
    } finally {
      setBookingProviderId(null);
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-black font-sans">
      <div className="h-[calc(100vh-5rem)] w-full flex flex-col lg:flex-row bg-slate-100 dark:bg-black p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden">
        <div className="h-[calc(50vh-2.5rem)] lg:h-full w-full lg:w-[45%] rounded-2xl sm:rounded-3xl overflow-hidden relative shadow-sm border border-slate-200 dark:border-zinc-800/80 z-0">
          <MapContainer center={userLocation} zoom={14} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <div className="font-semibold text-center">Your Service Location</div>
              </Popup>
            </Marker>

            {!isLoading &&
              providers.map((provider) => {
                if (!provider.latitude || !provider.longitude) return null;

                const pLat = Number(provider.latitude);
                const pLng = Number(provider.longitude);
                const isSameLocation = pLat === userLocation[0] && pLng === userLocation[1];

                const displayLat = isSameLocation ? pLat + 0.0001 : pLat;
                const displayLng = isSameLocation ? pLng + 0.0001 : pLng;

                return (
                  <Marker key={provider.provider_id} position={[displayLat, displayLng]} icon={providerIcon}>
                    <Popup>
                      <div className="font-bold text-sm">{provider.name}</div>
                      <div className="text-xs text-teal-600 font-bold mt-1">
                        Charge: ৳{provider.min_charge > 0 ? provider.min_charge : "Negotiable"}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
          </MapContainer>
        </div>

        <div className="h-[calc(50vh-2.5rem)] lg:h-full w-full lg:w-[55%] bg-white dark:bg-[#09090b] rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800/80 shadow-sm overflow-y-auto p-4 sm:p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Available {jobData.serviceName} near you
            </h2>
            {!isLoading && (
              <span className="shrink-0 bg-teal-50 text-teal-700 border border-teal-100 dark:border-teal-500/20 dark:bg-teal-500/10 dark:text-teal-400 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Zap size={12} className="fill-current" />
                {providers.length} Found
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Requests sent:{" "}
              <span className="font-extrabold text-slate-900 dark:text-white">{requestedProviders.length}</span>/5
            </span>
          </div>

          <div className="pb-2 space-y-3">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  className="rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-zinc-900/40 p-3 flex gap-3"
                >
                  <Skeleton className="h-24 w-24 rounded-lg shrink-0 dark:bg-zinc-800" />
                  <div className="flex-1 space-y-2 py-1">
                    <Skeleton className="h-4 w-2/3 dark:bg-zinc-800 rounded-md" />
                    <Skeleton className="h-3 w-1/3 dark:bg-zinc-800 rounded-md" />
                    <Skeleton className="h-8 w-full mt-2 rounded-lg dark:bg-zinc-800" />
                  </div>
                </Card>
              ))}

            {!isLoading && providers.length > 0 && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
                {providers.map((provider) => {
                  const pid = (provider.provider_id || "").trim();
                  const isRequested = requestedProviders.includes(pid);

                  const disabled =
                    isRequested || requestedProviders.length >= 5 || isBooking || bookingProviderId === pid;

                  return (
                    <Card
                      key={pid}
                      className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      <div className="p-3 sm:p-4 flex gap-3 sm:gap-4">
                        <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 bg-slate-100 dark:bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
                          {provider.profile_picture_url ? (
                            <img
                              src={provider.profile_picture_url}
                              alt={provider.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User size={28} className="text-slate-300 dark:text-zinc-700" />
                          )}
                          <div className="absolute top-1.5 right-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-full p-1 shadow-sm border border-slate-100 dark:border-zinc-700">
                            <ShieldCheck size={14} className="text-teal-500" />
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                                {provider.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-400/10 px-1.5 py-0.5 rounded uppercase">
                                  <Star size={9} className="fill-amber-500" /> New
                                </span>
                                <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-0.5 font-medium">
                                  <MapPin size={10} /> Nearby
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0 bg-teal-50 dark:bg-teal-500/10 px-3 py-1.5 rounded-xl border border-teal-100 dark:border-teal-500/20 text-right">
                              <span className="block text-[9px] sm:text-[10px] text-teal-600 dark:text-teal-400 font-bold uppercase tracking-wider mb-0.5">
                                Min. Charge
                              </span>
                              <span className="font-extrabold text-sm sm:text-base text-teal-800 dark:text-teal-300">
                                {provider.min_charge > 0 ? `৳${provider.min_charge}` : "Negotiable"}
                              </span>
                            </div>
                          </div>

                          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {provider.description ||
                              "Professional and verified expert ready to provide reliable service."}
                          </p>

                          <div className="mt-auto pt-2 flex justify-end">
                            <Button
                              size="sm"
                              className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm px-4 h-8 text-xs font-semibold disabled:opacity-60"
                              onClick={() => handleBookExpert(pid)}
                              disabled={disabled}
                            >
                              {isRequested ? "Requested" : bookingProviderId === pid ? "Booking..." : "Book Expert"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
