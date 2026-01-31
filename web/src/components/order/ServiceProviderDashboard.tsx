import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import { Bell, Settings, Briefcase, Star, Map, AlertOctagon, ArrowRight } from "lucide-react";
import FixoraLogo from "../../assets/images/Logo.png";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ServiceProviderDashboard() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [isOnline, setIsOnline] = useState(false);

  const { account, logout } = useAccountStore();
  const navigate = useNavigate();

  // --- Logic Fix ---
  // (account as any).name ব্যবহার করা হয়েছে TypeScript এরর এড়াতে।
  // বর্তমানে শুধুমাত্র ফোন এবং রোল আছে, তাই isProfileComplete 'false' হবে।
  const isProfileComplete = !!(account as any)?.name;
  const displayPhone = account?.phone || "Provider";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUpdateProfile = () => {
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

          <div className="flex items-center space-x-4 md:space-x-6">
            {/* Online/Offline Switch */}
            <div className="hidden md:flex items-center gap-3 bg-teal-800/50 py-1.5 px-3 rounded-full border border-teal-600/30">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${isOnline ? "text-green-300" : "text-gray-300"}`}
              >
                {isOnline ? "Online" : "Offline"}
              </span>
              <Switch
                checked={isOnline}
                // প্রোফাইল কমপ্লিট না হলে অনলাইনে যাওয়া যাবে না
                onCheckedChange={(val) => isProfileComplete && setIsOnline(val)}
                disabled={!isProfileComplete}
                className="data-[state=checked]:bg-green-400"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full p-0 h-10 w-10 ring-2 ring-white/30">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-teal-800 text-white font-bold">SP</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-base font-bold text-teal-900">{displayPhone}</p>
                    <Badge variant="secondary" className="w-fit capitalize">
                      {account?.role}
                    </Badge>
                    {!isProfileComplete && <span className="text-red-500 text-xs font-bold mt-1">Action Required</span>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setActivePage("Dashboard")}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={handleUpdateProfile}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {activePage === "Dashboard" ? (
          <>
            {/* --- ALERT BANNER --- */}
            {!isProfileComplete && (
              <div className="mb-8 bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="bg-white p-3 rounded-full shadow-sm text-red-500">
                      <AlertOctagon size={32} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-red-900">Profile Incomplete</h2>
                      <p className="text-red-700/80 mt-1 max-w-2xl">
                        You cannot accept jobs or go online until you update your Name, Expertise, and Location.
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleUpdateProfile}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 h-12 rounded-xl shadow-lg w-full md:w-auto"
                  >
                    Update Now <ArrowRight size={18} className="ml-2" />
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Welcome Card */}
              <Card
                className={`col-span-1 md:col-span-3 border-none text-white overflow-hidden relative shadow-2xl rounded-3xl ${!isProfileComplete ? "bg-gray-700" : "bg-gradient-to-r from-teal-800 to-teal-900"}`}
              >
                <CardContent className="p-8 relative z-10 flex flex-col justify-center h-full">
                  <h1 className="text-3xl font-bold mb-2">
                    Welcome, <span className="font-mono">{displayPhone}</span>
                  </h1>
                  <p className={`text-base mb-6 max-w-lg ${!isProfileComplete ? "text-gray-300" : "text-teal-100"}`}>
                    {isProfileComplete
                      ? "You have jobs waiting for you."
                      : "Please complete your profile to start your journey with Fixora."}
                  </p>

                  {isProfileComplete && (
                    <div className="flex flex-wrap gap-4">
                      <Badge
                        variant="secondary"
                        className="bg-white/10 text-white backdrop-blur-md px-4 py-2 rounded-lg"
                      >
                        <Star className="text-yellow-400 mr-2" size={18} /> 0.0 Rating
                      </Badge>
                    </div>
                  )}
                </CardContent>
                <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-8 translate-y-8">
                  <Briefcase size={220} />
                </div>
              </Card>

              {/* Map Action Card */}
              <Card className="col-span-1 flex flex-col items-center justify-center text-center shadow-md border-gray-100 rounded-3xl bg-white">
                <CardContent className="p-6 flex flex-col items-center opacity-70">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 mb-4">
                    <Map size={32} />
                  </div>
                  <h3 className="font-bold text-gray-800 text-lg">Map View</h3>
                  <p className="text-sm text-gray-500 mt-1">Available after verification</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <Tabs defaultValue="new" className="w-full">
                  <TabsList className="bg-white border border-gray-100 p-1 rounded-xl shadow-sm h-12 w-full justify-start">
                    <TabsTrigger value="new" disabled={!isProfileComplete} className="px-6">
                      New Requests
                    </TabsTrigger>
                    <TabsTrigger value="active" disabled={!isProfileComplete} className="px-6">
                      Active
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="new" className="mt-6">
                    {!isProfileComplete ? (
                      <Card className="border-dashed border-2 border-gray-300 p-12 text-center rounded-2xl bg-gray-50">
                        <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No Data Available</p>
                        <p className="text-sm text-gray-400 mt-1">Complete your profile to see incoming jobs.</p>
                      </Card>
                    ) : (
                      <div className="text-center text-gray-500 py-10">No new jobs (Demo)</div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="lg:col-span-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Earnings</CardTitle>
                  </CardHeader>
                  <CardContent className="h-40 bg-gray-50 rounded flex items-center justify-center text-gray-400">
                    {isProfileComplete ? "No data" : "Locked"}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold">{activePage}</h2>
            <p className="text-gray-500 mb-4">Update your profile information here.</p>
            <Button onClick={() => setActivePage("Dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
