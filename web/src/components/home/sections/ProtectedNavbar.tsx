import { useNavigate, useLocation } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import { Logout } from "@/api/AuthApi";
import { Role } from "@/enums/UserRole";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  User as UserIcon,
  Heart,
  CalendarDays,
  Grid,
  Briefcase,
  Wallet,
  Search,
} from "lucide-react";
import FixoraLogo from "@/assets/images/Logo.png";

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

export default function UserNavbar() {
  const { account, profile, logout } = useAccountStore();
  const navigate = useNavigate();
  const location = useLocation();

  const displayName = profile?.name || (account as any)?.name || "User";
  const displayPhone = (account as any)?.phone || "";
  const displayImage = profile?.profile_picture || (account as any)?.avatar || "";

  const isProfileComplete = !!displayName && displayName !== "User";
  const userRole = (account as any)?.role;

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const handleScrollToSection = (sectionId: string) => {
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

  return (
    <nav className="sticky top-0 z-50 w-full bg-teal-700 shadow-md border-b border-teal-600">
      <div className="w-full px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-x-2 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img src={FixoraLogo} alt="Fixora" className="h-10 w-auto object-contain" />
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
                    onClick={() => handleScrollToSection("provider-my-jobs")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <Briefcase className="mr-2 h-4 w-4" /> My Jobs
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => handleScrollToSection("provider-wallet")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <Wallet className="mr-2 h-4 w-4" /> Wallet
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleScrollToSection("popular-services")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <Grid className="mr-2 h-4 w-4" /> Service Categories
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate("/bookings")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" /> My Bookings
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => navigate("/favorites")}
                    className="text-teal-50 hover:text-white hover:bg-teal-600 font-medium"
                  >
                    <Heart className="mr-2 h-4 w-4" /> Favorites
                  </Button>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-teal-100 hover:bg-teal-600 hover:text-white rounded-full relative"
            >
              <Bell size={22} />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-teal-700" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-white/50 transition-all ml-1"
                >
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={displayImage} className="object-cover" />
                    <AvatarFallback className="bg-teal-800 text-white font-bold border border-teal-600">
                      {displayName !== "User" ? displayName.charAt(0).toUpperCase() : <UserIcon size={18} />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56 mt-2" align="end">
                <DropdownMenuLabel className="font-normal p-3 bg-gray-50">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate font-mono">{displayPhone}</p>

                    <div className="flex items-center gap-2 mt-1">
                      {userRole === Role.SERVICE_PROVIDER && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 h-5 bg-teal-100 text-teal-800 hover:bg-teal-100"
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

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => navigate("/dashboard")} className="cursor-pointer py-2">
                  <LayoutDashboard className="mr-2 h-4 w-4 text-teal-600" />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => navigate("/profile")} className="cursor-pointer py-2">
                  <UserIcon className="mr-2 h-4 w-4 text-teal-600" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 py-2"
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
