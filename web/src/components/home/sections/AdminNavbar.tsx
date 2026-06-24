import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAdminAccountStore } from "@/store/AdminAccountStore";
import { AdminLogout } from "@/api/AdminAuthApi";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminNavbar() {
  const { logout } = useAdminAccountStore();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await AdminLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      logout();
      navigate("/admin/login");
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
          <div
            className="flex items-center gap-x-2 cursor-pointer"
            onClick={() => handleNavigation("/admin/dashboard")}
          >
            <img
              src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Logo.webp"
              alt="Fixora"
              className="h-10 w-auto object-contain"
            />
            <span className="text-3xl font-bold italic tracking-tight text-white">Fixora Admin</span>
          </div>

          <div className="flex items-center gap-x-2 md:gap-x-4">
            <ModeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full ring-2 ring-white/20 hover:ring-white/50 transition-all ml-1"
                >
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarFallback className="bg-teal-800 text-white font-bold border border-teal-600 text-lg">
                      A
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 mt-2 dark:bg-zinc-900 rounded-xl overflow-hidden dark:border-zinc-800"
                align="end"
              >
                <DropdownMenuLabel className="font-normal p-3 bg-gray-50 dark:bg-zinc-950/50 transition-colors rounded-xl">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">Administrator</p>
                  </div>
                </DropdownMenuLabel>

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
