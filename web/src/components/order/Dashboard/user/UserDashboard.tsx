import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import {
  MapPin,
  Wrench,
  Zap,
  Droplet,
  Truck,
  Clock,
  Calendar,
  RefreshCw,
  Snowflake,
  Wind,
  CheckCircle2,
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
  History,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const allServices = [
  { id: 1, name: "Electrician", icon: <Zap size={24} />, color: "text-amber-600", bgColor: "bg-amber-100" },
  { id: 2, name: "AC Technician", icon: <Wind size={24} />, color: "text-cyan-600", bgColor: "bg-cyan-100" },
  { id: 3, name: "Refrigerator", icon: <Snowflake size={24} />, color: "text-blue-600", bgColor: "bg-blue-100" },
  { id: 4, name: "Plumber", icon: <Droplet size={24} />, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  { id: 5, name: "Carpenter", icon: <Hammer size={24} />, color: "text-orange-600", bgColor: "bg-orange-100" },
  { id: 6, name: "CCTV Installer", icon: <Video size={24} />, color: "text-slate-600", bgColor: "bg-slate-100" },
  { id: 7, name: "Broadband", icon: <Wifi size={24} />, color: "text-sky-600", bgColor: "bg-sky-100" },
  {
    id: 8,
    name: "IPS/Inverter",
    icon: <BatteryCharging size={24} />,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  { id: 9, name: "Washing Machine", icon: <Disc size={24} />, color: "text-blue-500", bgColor: "bg-blue-50" },
  { id: 10, name: "Computer Tech", icon: <Monitor size={24} />, color: "text-purple-600", bgColor: "bg-purple-100" },
  { id: 11, name: "TV Technician", icon: <Tv size={24} />, color: "text-red-600", bgColor: "bg-red-100" },
  { id: 12, name: "Auto Mechanic", icon: <Car size={24} />, color: "text-rose-600", bgColor: "bg-rose-100" },
  { id: 13, name: "Lift Technician", icon: <ArrowUpDown size={24} />, color: "text-zinc-600", bgColor: "bg-zinc-100" },
  { id: 14, name: "Water Pump", icon: <Waves size={24} />, color: "text-teal-600", bgColor: "bg-teal-100" },
  { id: 15, name: "Home Appliance", icon: <Plug size={24} />, color: "text-emerald-600", bgColor: "bg-emerald-100" },
];

const heroSlides = [
  {
    id: 1,
    title: "AC Cooling Problem?",
    subtitle: "Expert servicing at your doorstep",
    icon: Snowflake,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 2,
    title: "Fan Making Noise?",
    subtitle: "Repair or install new fans easily",
    icon: Wind,
    color: "bg-teal-100 text-teal-600",
  },
];

export default function UserDashboard() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAllServices, setShowAllServices] = useState(false);

  // স্টোর থেকে ডাটা আনা
  const { profile, fetchProfile } = useAccountStore();
  const navigate = useNavigate();

  // ডাটা সোর্স (আপাতত খালি রাখা হলো)
  const activeBooking = null;
  const recentServices: any[] = [];

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const displayName = profile?.name || "User";
  const currentAddress = profile
    ? [profile.sub_area, profile.area, profile.district].filter(Boolean).join(", ")
    : "No address set yet";

  const isProfileComplete = !!profile?.name;
  const visibleServices = showAllServices ? allServices : allServices.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* 1. Profile Completion Warning */}
        {!isProfileComplete && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-pulse-slow">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="bg-amber-100 p-3 rounded-full text-amber-600 hidden sm:block">
                <AlertCircle size={28} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Complete Your Profile</h3>
                <p className="text-sm text-gray-600 max-w-md">
                  Please update your profile with your name and address to book services.
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

        {/* 2. Active Booking Section */}
        {activeBooking ? (
          <Card className="border-l-4 border-l-teal-500 shadow-sm bg-white overflow-hidden">
            <div className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="bg-teal-100 p-3 rounded-full">
                  <Clock className="text-teal-700 h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{(activeBooking as any).service}</h3>
                  <p className="text-sm text-gray-500">
                    Provider: <span className="font-medium text-gray-700">{(activeBooking as any).provider}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-1 opacity-40">
                  <CheckCircle2 className="h-4 w-4 text-gray-500" />
                  <span className="text-xs font-medium text-gray-500">Pending</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-200"></div>
                <div className="flex items-center gap-1 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
                  <Truck className="h-4 w-4 text-teal-600 animate-pulse" />
                  <span className="text-xs font-bold text-teal-700">On the way</span>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-6 text-center flex flex-col items-center justify-center space-y-2">
            <ClipboardList className="text-gray-300" size={32} />
            <p className="text-gray-500 text-sm font-medium">No active booking found yet</p>
          </div>
        )}

        {/* 3. Hero Section (Welcome + Slider) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-center min-h-[220px]">
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
            <Wrench className="absolute right-[-20px] bottom-[-40px] text-white opacity-5 h-64 w-64 rotate-12" />
          </div>

          <div className="lg:col-span-1 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center min-h-[220px]">
            <div
              className="flex flex-col items-center text-center space-y-4 animate-in fade-in duration-500"
              key={currentSlide}
            >
              <div className={`p-4 rounded-full ${heroSlides[currentSlide].color} mb-2`}>
                {React.createElement(heroSlides[currentSlide].icon, { size: 40 })}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{heroSlides[currentSlide].title}</h3>
                <p className="text-gray-500 mt-1 text-sm">{heroSlides[currentSlide].subtitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Service Categories */}
        <section id="popular-services" className="scroll-mt-30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Service Categories</h2>
            <Button
              variant="link"
              className="text-teal-700 font-medium"
              onClick={() => setShowAllServices(!showAllServices)}
            >
              {showAllServices ? "Show Less" : "View All"}
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {visibleServices.map((service) => (
              <Card
                key={service.id}
                className="border-none shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group rounded-2xl"
              >
                <CardContent className="p-4 flex flex-col items-center justify-center min-h-[140px] text-center gap-3">
                  <div
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center ${service.bgColor} ${service.color} group-hover:scale-110 duration-300`}
                  >
                    {service.icon}
                  </div>
                  <span className="font-medium text-slate-700 text-sm leading-tight">{service.name}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 5. Recent Services Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Services</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentServices.length > 0 ? (
              recentServices.map((item) => (
                <Card
                  key={item.id}
                  className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                        <RefreshCw size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <Calendar size={12} /> {item.date}
                          <span className="text-gray-300">|</span>
                          <span className="font-medium text-teal-700">{item.price}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-lg text-teal-700 border-teal-200">
                      Book Again
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-2">
                <History className="text-gray-300" size={32} />
                <p className="text-gray-500 text-sm font-medium">No service history found yet</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
