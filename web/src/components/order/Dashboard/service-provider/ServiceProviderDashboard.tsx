import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import {
  MapPin,
  Wrench,
  Clock,
  Calendar,
  CheckCircle2,
  Star,
  Truck,
  AlertCircle,
  ClipboardList,
  History,
  Zap,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProviderDashboard() {
  const { account, profile, fetchProfile } = useAccountStore();
  const navigate = useNavigate();

  const [activeJob, setActiveJob] = useState<any>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [recentJobs] = useState<any[]>([]);

  useEffect(() => {
    if (account?.phone) {
      fetchProfile();
    }
  }, [account?.phone, fetchProfile]);

  const displayName = profile?.name || (account as any)?.name || "Service Provider";
  const rating = (profile as any)?.rating || "0.0";
  const numericRating = parseFloat(rating);
  const currentAddress = profile ? `${profile.area}, ${profile.district}` : "Location not set";
  const isProfileComplete = !!profile?.name;

  const handleAcceptJob = (job: any) => {
    setActiveJob(job);
    setRequests(requests.filter((r) => r.id !== job.id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {!isProfileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-pulse-slow">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="bg-amber-100 p-3 rounded-full text-amber-600 hidden sm:block">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Verify Service Provider Profile</h3>
                <p className="text-sm text-gray-600 max-w-md">Please update your expertise.</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/provider-profile")}
              className="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto px-6 whitespace-nowrap"
            >
              Update Profile
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-center min-h-[220px]">
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

          <div
            id="provider-wallet"
            className="scroll-mt-24 lg:col-span-1 bg-white rounded-3xl p-5 border border-slate-100 shadow-lg shadow-slate-200/50 flex flex-col min-h-[220px]"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-700">Overview</h3>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                Last 30 Days
              </span>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3">
              <div className="bg-orange-50/80 p-3 rounded-2xl border border-orange-100 flex flex-col justify-center items-center">
                <div className="bg-white p-2 rounded-full shadow-sm text-orange-500 mb-1">
                  <Clock size={18} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{requests.length}</span>
                <span className="text-xs text-slate-500 font-medium">Pending</span>
              </div>
              <div className="bg-teal-50/80 p-3 rounded-2xl border border-teal-100 flex flex-col justify-center items-center">
                <div className="bg-white p-2 rounded-full shadow-sm text-teal-600 mb-1">
                  <CheckCircle2 size={18} />
                </div>
                <span className="text-2xl font-bold text-slate-800">{recentJobs.length}</span>
                <span className="text-xs text-slate-500 font-medium">Done</span>
              </div>
              <div className="col-span-2 bg-[#13514d] rounded-2xl p-3 flex items-center justify-between relative overflow-hidden text-white shadow-md">
                <div className="z-10 flex flex-col">
                  <span className="text-xs text-slate-200 font-medium mb-1">Customer Rating</span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{rating}</span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          size={12}
                          className={
                            i <= Math.round(numericRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-400 text-gray-400 opacity-30"
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">Current Job</h2>
          {!activeJob ? (
            <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center animate-in fade-in duration-500">
              <div className="bg-slate-50 p-4 rounded-full mb-3">
                <Truck className="text-slate-300 h-8 w-8" />
              </div>
              <h3 className="text-slate-500 font-medium">No active jobs right now</h3>
              <p className="text-slate-400 text-sm mt-1">Accept a request from below to start working.</p>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-500">
              <Card className="border-l-4 border-l-teal-500 shadow-md bg-white overflow-hidden">
                <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="bg-teal-100 p-3 rounded-full">
                      <Clock className="text-teal-700 h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{activeJob.service}</h3>
                      <p className="text-sm text-gray-500">
                        Customer: <span className="font-medium text-gray-700">{activeJob.customer}</span>
                      </p>
                      <p className="text-xs text-teal-600 font-medium mt-1">Location: {activeJob.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                    <Truck className="h-4 w-4 text-teal-600 animate-pulse" />
                    <span className="text-xs font-bold text-teal-700">On the way</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <section className="scroll-mt-24" id="provider-new-jobs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-800">New Job Requests</h2>
              {requests.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                  {requests.length} New
                </span>
              )}
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-3">
                <ClipboardList className="text-slate-300 h-10 w-10" />
              </div>
              <h3 className="text-slate-600 font-medium text-lg">No new job requests</h3>
              <p className="text-slate-400 mt-1 max-w-xs">You will be notified when customers nearby book a service.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-teal-50 p-3 rounded-full text-teal-700">
                        <Zap size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{request.service}</h3>
                        <p className="text-sm text-slate-500">{request.details}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block text-xl font-bold text-[#13514d]">{request.price}</span>
                    </div>
                  </div>
                  <div className="space-y-2 mb-5">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400" />
                      <span>{request.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={16} className="text-slate-400" />
                      <span>{request.time}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-red-100 text-red-600 hover:bg-red-50">
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleAcceptJob(request)}
                      className="bg-[#13514d] hover:bg-[#0f423e] text-white"
                    >
                      Accept Job
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="provider-my-jobs" className="scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">My Jobs</h2>
          </div>

          {recentJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 border border-dashed border-slate-300 flex flex-col items-center justify-center text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-3">
                <History className="text-slate-300 h-10 w-10" />
              </div>
              <h3 className="text-slate-600 font-medium text-lg">No service history found yet</h3>
              <p className="text-slate-400 mt-1">Completed jobs will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentJobs.map((item) => (
                <Card
                  key={item.id}
                  className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center">
                        <CheckCircle2 size={20} className="text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Calendar size={12} /> {item.date} <span className="text-gray-300">|</span>{" "}
                          <span className="font-medium text-teal-700">Earned: {item.earning}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
