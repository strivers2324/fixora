import { create } from "zustand";
import {
  GetUserDashboard,
  GetProviderDashboard,
  UserDashboardData,
  ProviderDashboardData,
  JobSearchPayload,
} from "@/api/JobApi";

interface JobState {
  jobData: JobSearchPayload | null;
  requestedProviders: string[];
  setJobData: (data: JobSearchPayload) => void;
  clearJobData: () => void;
  addRequestedProvider: (providerId: string) => void;

  userDashboard: UserDashboardData | null;
  providerDashboard: ProviderDashboardData | null;
  isLoadingDashboard: boolean;
  dashboardError: string | null;

  fetchUserDashboard: () => Promise<void>;
  fetchProviderDashboard: () => Promise<void>;
}

const JOBDATA_KEY = "fixora.jobData";
const REQUESTED_PROVIDERS_KEY = "fixora.requestedProviders";

const loadJobData = (): JobSearchPayload | null => {
  try {
    const raw = sessionStorage.getItem(JOBDATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as JobSearchPayload;
  } catch {
    return null;
  }
};

const loadRequestedProviders = (): string[] => {
  try {
    const raw = sessionStorage.getItem(REQUESTED_PROVIDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useJobStore = create<JobState>()((set) => ({
  jobData: loadJobData(),
  requestedProviders: loadRequestedProviders(),

  setJobData: (data) => {
    sessionStorage.setItem(JOBDATA_KEY, JSON.stringify(data));
    set({ jobData: data });
  },

  addRequestedProvider: (providerId: string) => {
    set((state) => {
      if (state.requestedProviders.includes(providerId)) return state;
      const updated = [...state.requestedProviders, providerId];
      sessionStorage.setItem(REQUESTED_PROVIDERS_KEY, JSON.stringify(updated));
      return { requestedProviders: updated };
    });
  },

  clearJobData: () => {
    sessionStorage.removeItem(JOBDATA_KEY);
    sessionStorage.removeItem(REQUESTED_PROVIDERS_KEY);
    set({ jobData: null, requestedProviders: [] });
  },

  userDashboard: null,
  providerDashboard: null,
  isLoadingDashboard: false,
  dashboardError: null,

  fetchUserDashboard: async () => {
    set({ isLoadingDashboard: true, dashboardError: null });
    try {
      const data = await GetUserDashboard();
      set({ userDashboard: data, isLoadingDashboard: false });
    } catch (error: any) {
      set({ dashboardError: error.message, isLoadingDashboard: false });
    }
  },

  fetchProviderDashboard: async () => {
    set({ isLoadingDashboard: true, dashboardError: null });
    try {
      const data = await GetProviderDashboard();
      set({ providerDashboard: data, isLoadingDashboard: false });
    } catch (error: any) {
      set({ dashboardError: error.message, isLoadingDashboard: false });
    }
  },
}));
