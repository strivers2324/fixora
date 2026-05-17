import { create } from "zustand";
import { Role } from "@/enums/UserRole";
import {
  GetUserProfile,
  UserProfileData,
  GetServiceProviderProfile,
  ServiceProviderProfileData,
  GetUserAddresses,
  GetServiceProviderAddress,
  UserAddressResponse,
  SPAddressResponse,
  GetServiceCatalog,
} from "@/api/ProfileApi";
import { VerifySession, Logout } from "@/api/AuthApi";

export type Account = {
  phone: string;
  role: Role;
  is_phone_verified: boolean;
  profession?: string;
  otp_id?: string;
};

interface AuthState {
  isAuthenticated: boolean;
  account: Account | null;
  otpId: string | null;

  profile: UserProfileData | ServiceProviderProfileData | null;

  userAddresses: UserAddressResponse[];
  spAddress: SPAddressResponse | null;

  isAuthChecking: boolean;
  checkSession: () => Promise<void>;

  serviceCatalog: any | null;
  fetchServiceCatalog: () => Promise<void>;

  setLoginSuccess: (account: Account, otpId?: string) => void;
  setVerified: () => void;

  setProfile: (data: UserProfileData) => void;

  fetchProfile: () => Promise<void>;
  fetchAddresses: () => Promise<void>;

  logout: () => void;
}

export const useAccountStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  account: null,
  otpId: null,
  profile: null,
  serviceCatalog: null,

  userAddresses: [],
  spAddress: null,

  isAuthChecking: true,

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
      let res;
      if (account.role === Role.SERVICE_PROVIDER) {
        res = await GetServiceProviderProfile();
      } else {
        res = await GetUserProfile();
      }
      const cleanData = (res as any).data ? (res as any).data : res;
      set({ profile: cleanData });
    } catch (error) {
      console.error("Store: Failed to fetch profile", error);
    }
  },

  fetchServiceCatalog: async () => {
    try {
      const res = await GetServiceCatalog();
      const cleanData = (res as any).data ? (res as any).data : res;
      set({ serviceCatalog: cleanData });
    } catch (error) {
      console.error("Store: Catalog fetch failed", error);
    }
  },

  fetchAddresses: async () => {
    const { account } = get();
    if (!account?.phone) return;

    try {
      if (account.role === Role.SERVICE_PROVIDER) {
        const res = await GetServiceProviderAddress();
        const cleanData = (res as any).data ? (res as any).data : res;
        set({ spAddress: cleanData || null });
      } else {
        const res = await GetUserAddresses();
        const cleanData = (res as any).data ? (res as any).data : res;
        set({ userAddresses: Array.isArray(cleanData) ? cleanData : [] });
      }
    } catch (error) {
      console.error("Store: Failed to fetch addresses", error);
    }
  },

  checkSession: async () => {
    try {
      const accountData = await VerifySession();
      set({
        isAuthenticated: true,
        account: accountData,
        isAuthChecking: false,
        otpId: accountData?.otp_id ? accountData.otp_id : null,
      });

      await Promise.all([get().fetchProfile(), get().fetchAddresses(), get().fetchServiceCatalog()]);
    } catch (error) {
      set({
        isAuthenticated: false,
        account: null,
        otpId: null,
        profile: null,
        userAddresses: [],
        spAddress: null,
        isAuthChecking: false,
      });
    }
  },

  logout: async () => {
    try {
      await Logout();
    } catch (error) {
      console.error("Logout API failed", error);
    } finally {
      set({
        isAuthenticated: false,
        account: null,
        otpId: null,
        profile: null,
        userAddresses: [],
        spAddress: null,
      });
      localStorage.removeItem("auth-storage");
    }
  },
}));
