import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Role } from "@/enums/UserRole";

export type Account = {
  phone: string;
  role: Role;
  is_phone_verified: boolean;
};

interface AuthState {
  isAuthenticated: boolean;
  account: Account | null;
  otpId: string | null;

  setLoginSuccess: (account: Account, otpId?: string) => void;
  setVerified: () => void;
  logout: () => void;
}

export const useAccountStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      account: null,
      otpId: null,

      setLoginSuccess: (account, otpId = "") => {
        set({
          isAuthenticated: true,
          account: account,
          otpId: otpId && otpId !== "" ? otpId : null,
        });
      },

      setVerified: () => {
        set((state) => ({
          account: state.account ? { ...state.account, is_phone_verified: true } : null,
          otpId: null,
        }));
      },

      logout: () => {
        set({
          isAuthenticated: false,
          account: null,
          otpId: null,
        });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
