import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import { Logout } from "@/api/AuthApi";
import { GetNIDStatus } from "@/api/ProfileApi";
import { Role } from "@/enums/UserRole";
import { NIDStatus } from "@/enums/NIDStatus";
import { LayoutDashboard, LogOut, User as UserIcon, CalendarDays, Grid, Briefcase, Search } from "lucide-react";
//import FixoraLogo from "@/assets/images/Logo.webp";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { Button } from "@/components/ui/button";
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
import ServicePanel from "@/components/Dashboard/service-provider/ServicePanel";

export default function UserNavbar() {
  const { account, profile, spAddress, logout } = useAccountStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [nidStatus, setNidStatus] = useState<NIDStatus | string | null>(null);

  const displayName = profile?.name || (account as any)?.name || "User";
  const displayPhone = (account as any)?.phone || "";
  const displayImage = profile?.profile_picture || (account as any)?.avatar || "";
  const userRole = (account as any)?.role;

  const isProfileComplete = !!displayName && displayName !== "User";
  const isAddressComplete = !!spAddress && !!(spAddress as any)?.district;
  const isNidVerified = nidStatus === NIDStatus.ACCEPTED || nidStatus === "ACCEPTED";

  const canAccessServicePanel = isProfileComplete && isAddressComplete && isNidVerified;

  useEffect(() => {
    if (userRole === Role.SERVICE_PROVIDER && (account as any)?.phone) {
      GetNIDStatus()
        .then((res: any) => {
          if (res) {
            const currentStatus = res?.data?.status || res?.status;
            if (currentStatus) {
              setNidStatus(currentStatus);
            }
          }
        })
        .catch((err) => console.error("Error fetching NID status for navbar", err));
    }
  }, [userRole, account]);

  const handleNavigation = (path: string) => {
    sessionStorage.removeItem("updatePhoneToken");
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("updatePhoneToken");
      logout();
      navigate("/login");
    }
  };

  const handleScrollToSection = (sectionId: string) => {
    sessionStorage.removeItem("updatePhoneToken");
    if (location.pathname !== "/dashboard") {
      navigate("/dashboard");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const runFromDropdown = (action: () => void) => {
    setTimeout(() => {
      action();
    }, 250);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-teal-700 shadow-md border-b border-teal-600">
      <div className="w-full px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-x-2 cursor-pointer" onClick={() => handleNavigation("/dashboard")}>
            <img
              src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Logo.webp"
              alt="Fixora"
              className="h-10 w-auto object-contain"
            />
            <span className="text-3xl font-bold italic tracking-tight text-white">Fixora</span>
          </div>
          <div className="flex items-center gap-x-2 md:gap-x-4">
            <div className="hidden md:flex items-center gap-1 mr-2">
              {userRole === Role.SERVICE_PROVIDER ? (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleScrollToSection("provider-new-jobs")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <Search className="mr-2 h-4 w-4" /> New Jobs
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation("/history")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <Briefcase className="mr-2 h-4 w-4" /> My Jobs
                  </Button>

                  <ServicePanel disabled={!canAccessServicePanel} />
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleScrollToSection("popular-services")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <Grid className="mr-2 h-4 w-4" /> Services
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavigation("/history")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" /> My Bookings
                  </Button>
                </>
              )}
            </div>
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-white/50 transition-all ml-1"
                >
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={displayImage} className="object-cover" />
                    <AvatarFallback className="bg-teal-800 text-white font-bold border border-teal-600">
                      {isProfileComplete ? displayName.charAt(0).toUpperCase() : <UserIcon size={18} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mt-2 dark:bg-zinc-900 rounded-xl overflow-hidden dark:border-zinc-800"
                align="end"
              >
                <DropdownMenuLabel className="font-normal p-3 bg-gray-50 dark:bg-zinc-950/50 transition-colors rounded-xl ">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">{displayPhone}</p>

                    <div className="flex items-center gap-2 mt-1">
                      {userRole === Role.SERVICE_PROVIDER && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 h-5 bg-teal-100 text-teal-800 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400 dark:hover:bg-teal-900/30 transition-colors"
                        >
                          Service-Provider
                        </Badge>
                      )}
                      {!isProfileComplete && (
                        <Badge variant="destructive" className="w-fit text-[10px] px-1.5 h-5">
                          Incomplete
                        </Badge>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="dark:bg-zinc-800" />

                <div className="md:hidden">
                  {userRole === Role.SERVICE_PROVIDER ? (
                    <>
                      <DropdownMenuItem
                        onSelect={() => runFromDropdown(() => handleScrollToSection("provider-new-jobs"))}
                        className="cursor-pointer py-2 dark:focus:bg-zinc-800 dark:text-gray-200 transition-colors"
                      >
                        <Search className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>New Jobs</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onSelect={() => runFromDropdown(() => handleNavigation("/history"))}
                        className="cursor-pointer py-2 dark:focus:bg-zinc-800 dark:text-gray-200 transition-colors"
                      >
                        <Briefcase className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>My Jobs</span>
                      </DropdownMenuItem>

                      <div className="px-2 py-1.5 flex items-center w-full" onClick={(e) => e.stopPropagation()}>
                        <ServicePanel disabled={!canAccessServicePanel} />
                      </div>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onSelect={() => runFromDropdown(() => handleScrollToSection("popular-services"))}
                        className="cursor-pointer py-2 dark:focus:bg-zinc-800 dark:text-gray-200 transition-colors"
                      >
                        <Grid className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>Services</span>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onSelect={() => runFromDropdown(() => handleNavigation("/history"))}
                        className="cursor-pointer py-2 dark:focus:bg-zinc-800 dark:text-gray-200 transition-colors"
                      >
                        <CalendarDays className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                        <span>My Bookings</span>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="dark:bg-zinc-800" />
                </div>

                <DropdownMenuItem
                  onSelect={() => runFromDropdown(() => handleNavigation("/dashboard"))}
                  className="cursor-pointer py-2 dark:focus:bg-zinc-800 dark:text-gray-200 transition-colors"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={() => runFromDropdown(() => handleNavigation("/profile"))}
                  className="cursor-pointer py-2 dark:focus:bg-zinc-800 dark:text-gray-200 transition-colors"
                >
                  <UserIcon className="mr-2 h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="dark:bg-zinc-800" />

                <DropdownMenuItem
                  onSelect={() => runFromDropdown(() => handleLogout())}
                  className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-300 dark:focus:bg-red-950/30 py-2 transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
