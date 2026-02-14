import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Role } from "@/enums/UserRole";
import { GetUserProfile, UserProfileData, GetServiceProviderProfile, ServiceProviderProfileData } from "@/api/OrderApi";

export type Account = {
  phone: string;
  role: Role;
  is_phone_verified: boolean;
  profession?: string;
};

interface AuthState {
  isAuthenticated: boolean;
  account: Account | null;
  otpId: string | null;

  profile: UserProfileData | ServiceProviderProfileData | null;

  setLoginSuccess: (account: Account, otpId?: string) => void;
  setVerified: () => void;

  setProfile: (data: UserProfileData) => void;

  fetchProfile: () => Promise<void>;

  logout: () => void;
}

export const useAccountStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      account: null,
      otpId: null,
      profile: null,

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

      setProfile: (data) => {
        console.log("Store: Manually setting profile:", data);
        set({ profile: data });
      },

      fetchProfile: async () => {
        const { account } = get();

        if (!account?.phone) return;

        try {
          console.log("Store: Fetching profile for...", account.phone);
          let res;
          if (account.role === Role.SERVICE_PROVIDER) {
            res = await GetServiceProviderProfile(account.phone);
          } else {
            res = await GetUserProfile(account.phone);
          }
          console.log("Store: Raw API Response:", res);

          const cleanData = (res as any).data ? (res as any).data : res;

          console.log("Store: Saving Clean Data:", cleanData);
          set({ profile: cleanData });
        } catch (error) {
          console.error("Store: Failed to fetch profile", error);
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          account: null,
          otpId: null,
          profile: null,
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
