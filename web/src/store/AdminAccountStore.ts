import { create } from "zustand";
import { Role } from "@/enums/UserRole";
import { AdminVerifySession, AdminLogout } from "@/api/AdminAuthApi";

export type AdminAccount = {
  role: Role.ADMIN;
};

interface AdminAuthState {
  isAuthenticated: boolean;
  adminAccount: AdminAccount | null;
  isAuthChecking: boolean;

  setLoginSuccess: (account: AdminAccount) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAdminAccountStore = create<AdminAuthState>()((set) => ({
  isAuthenticated: false,
  adminAccount: null,
  isAuthChecking: true,

  setLoginSuccess: (account) => {
    set({
      isAuthenticated: true,
      adminAccount: account,
    });
  },

  checkSession: async () => {
    try {
      const adminData = await AdminVerifySession();
      set({
        isAuthenticated: true,
        adminAccount: {
          role: adminData.role as Role.ADMIN,
        },
        isAuthChecking: false,
      });
    } catch (error) {
      set({
        isAuthenticated: false,
        adminAccount: null,
        isAuthChecking: false,
      });
    }
  },

  logout: async () => {
    try {
      await AdminLogout();
    } catch (error) {
      console.error("Admin Logout API failed", error);
    } finally {
      set({
        isAuthenticated: false,
        adminAccount: null,
      });
    }
  },
}));
