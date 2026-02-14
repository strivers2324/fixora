import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import {
  Bell,
  MapPin,
  Wrench,
  Zap,
  Droplet,
  PaintBucket,
  Truck,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import FixoraLogo from "../../assets/images/Logo.png";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Mock Data ---
interface ServiceCategory {
  id: number;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const services: ServiceCategory[] = [
  { id: 1, name: "Electrical Help", icon: <Zap size={24} />, color: "bg-yellow-100 text-yellow-700" },
  { id: 2, name: "Plumbing", icon: <Droplet size={24} />, color: "bg-blue-100 text-blue-700" },
  { id: 3, name: "AC Repair", icon: <Wrench size={24} />, color: "bg-cyan-100 text-cyan-700" },
  { id: 4, name: "Home Painting", icon: <PaintBucket size={24} />, color: "bg-purple-100 text-purple-700" },
  { id: 5, name: "House Shifting", icon: <Truck size={24} />, color: "bg-green-100 text-green-700" },
  { id: 6, name: "Cleaning", icon: <User size={24} />, color: "bg-pink-100 text-pink-700" },
];

export default function UserDashboard() {
  const [activePage, setActivePage] = useState<string>("Dashboard");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { account, logout } = useAccountStore();
  const navigate = useNavigate();

  // --- Logic Fix ---
  // বর্তমানে আপনার store-এ 'name' নেই। আমরা ধরে নিচ্ছি ভবিষ্যতে আসবে।
  // তাই (account as any).name দিয়ে চেক করছি যাতে এরর না দেয়।
  // বর্তমানে isProfileComplete = false হবে কারণ name undefined.
  const isProfileComplete = !!(account as any)?.name;

  // ফলব্যাক ডিসপ্লে: নাম না থাকলে ফোন নম্বর দেখাবে
  const displayName = (account as any)?.name || "Valued User";
  const displayPhone = account?.phone || "";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUpdateProfile = () => {
    console.log("Navigating to profile update...");
    // এখানে আপনার প্রোফাইল আপডেট রাউটে নিয়ে যাবেন
    setActivePage("Settings");
  };

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <div className="px-4 bg-teal-700/95 backdrop-blur-md sticky top-0 z-50 shadow-md border-b border-teal-600">
        <div className="max-w-7xl mx-auto flex flex-row justify-between items-center h-16">
          <div
            className="flex items-center gap-x-2 font-bold text-3xl text-white cursor-pointer"
            onClick={() => setActivePage("Dashboard")}
          >
            <img src={FixoraLogo} alt="Fixora" className="h-10 w-auto" />
            <span className="italic">Fixora</span>
          </div>

          <div className="flex items-center space-x-5">
            <Button variant="ghost" size="icon" className="text-white hover:bg-teal-600 rounded-full">
              <Bell size={22} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-10 w-10 ring-2 ring-white/30">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-teal-800 text-white font-bold">
                      {isProfileComplete ? displayName.substring(0, 2).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-bold text-teal-900">
                      {isProfileComplete ? displayName : displayPhone}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{account?.role}</p>
                    {!isProfileComplete && (
                      <Badge variant="destructive" className="mt-1 w-fit text-[10px]">
                        Incomplete Profile
                      </Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActivePage("Dashboard")}>
                  <LayoutDashboard className="mr-3 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActivePage("Settings")}>
                  <Settings className="mr-3 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-3 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* --- ALERT BANNER --- */}
        {!isProfileComplete && activePage === "Dashboard" && (
          <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-full shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-amber-900 font-bold text-lg">Complete Your Profile</h3>
                <p className="text-amber-700/80 text-sm mt-1 max-w-xl">
                  Welcome to Fixora! Please update your profile (Name, Address) to start booking services.
                </p>
              </div>
            </div>
            <Button
              onClick={handleUpdateProfile}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 rounded-xl shadow-md w-full md:w-auto"
            >
              Update Profile <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>
        )}

        {/* Dynamic Content Rendering */}
        {activePage === "Dashboard" ? (
          <>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-teal-800 to-teal-900 rounded-3xl p-6 md:p-12 mb-10 text-white overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                  Hello! <span className="text-teal-200">{displayPhone}</span> 👋
                  <br />
                  <span className="font-medium text-xl md:text-3xl mt-2 block opacity-90">
                    What needs fixing today?
                  </span>
                </h1>

                <div className="mt-8 bg-white p-2 rounded-2xl shadow-xl flex items-center max-w-xl relative group focus-within:ring-2 ring-teal-500/50 transition-all">
                  <MapPin className="text-gray-400 ml-3 absolute left-3" size={22} />
                  <Input
                    type="text"
                    placeholder="Search for services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 border-none shadow-none focus-visible:ring-0 text-gray-700 placeholder-gray-400 h-12 text-base w-full"
                  />
                  <Button className="bg-teal-900 hover:bg-teal-800 text-white font-bold h-12 px-8 ml-2 rounded-xl">
                    Search
                  </Button>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-16 opacity-10 rotate-12 pointer-events-none">
                <Wrench size={300} />
              </div>
            </div>

            {/* Services Grid */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Popular Services</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    className="group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-gray-100 rounded-2xl"
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${service.color}`}>
                        {service.icon}
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm">{service.name}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-[50vh] flex flex-col items-center justify-center text-center">
            <h2 className="text-2xl font-bold text-gray-800">{activePage}</h2>
            <p className="text-gray-500 mb-4">You need to complete your profile first.</p>
            <Button onClick={() => setActivePage("Dashboard")}>Back to Dashboard</Button>
          </div>
        )}
      </div>
    </div>
  );
}
