import api from "@/lib/axios";
import { JobStatus, BroadcastStatus } from "@/enums/JobStatus";

export type ProviderSearchParams = {
  profession_id: number;
  address_id: number;
};

export type JobSearchPayload = {
  serviceName: string;
  profession_id: number;
  problem_details: string;
  address_id: number;
  latitude: number | string;
  longitude: number | string;
  user_offer_price?: number;
  job_id?: string;
};

export type ProviderData = {
  provider_id: string;
  name: string;
  profile_picture_url: string | null;
  profession_id: number;
  latitude: number | string;
  longitude: number | string;
  min_charge: number;
  description: string;
};

export type JobRequestData = {
  profession_id: number;
  problem_details: string;
  address_id: number;
  user_offer_price?: number;
};

export type BookExpertPayload = {
  job_id?: string;
  provider_id: string;
  job_details: JobRequestData;
};

export type JobSummaryForUser = {
  job_id: string;
  problem_details: string;
  status: JobStatus;
  district: string;
  thana: string;
  area: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  provider_id?: string | null;
  provider_name?: string | null;
  provider_phone?: string | null;
  user_offer_price?: number | null;
  provider_offer_price?: number | null;
  accepted_at?: string | null;
  created_at: string;
};

export type JobSummaryForProvider = {
  job_id: string;
  problem_details: string;
  status: JobStatus;
  full_name: string;
  phone_number: string;
  district: string;
  thana: string;
  area: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  user_offer_price?: number | null;
  provider_offer_price?: number | null;
  broadcast_status?: BroadcastStatus | null;
  accepted_at?: string | null;
  created_at: string;
};

export type UserDashboardData = {
  active_jobs: JobSummaryForUser[];
  history: JobSummaryForUser[];
};

export type ProviderDashboardData = {
  active_job: JobSummaryForProvider | null;
  requests: JobSummaryForProvider[];
  history: JobSummaryForProvider[];
};

export type ProviderOfferPayload = {
  provider_offer_price: number;
};

export type UserOfferPayload = {
  provider_id: string;
  user_offer_price: number;
};

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverError = error.response?.data?.error;
  const serverMessage = error.response?.data?.message;

  const finalMessage = serverError || serverMessage || defaultMessage;

  throw new Error(finalMessage);
};

export async function SearchProviders(params: ProviderSearchParams): Promise<ProviderData[]> {
  try {
    const res = await api.get<{ data: ProviderData[] }>("/jobs/search-providers", { params });
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to search for nearby providers");
    throw error;
  }
}

export async function BookExpert(payload: BookExpertPayload): Promise<{ job_id: string }> {
  try {
    const res = await api.post<{ data: { job_id: string } }>("/jobs/book", payload);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to book expert");
    throw error;
  }
}

export async function SendProviderOffer(jobId: string, payload: ProviderOfferPayload): Promise<void> {
  try {
    await api.post(`/jobs/${jobId}/provider-offer`, payload);
  } catch (error: any) {
    handleApiError(error, "Failed to send offer price");
    throw error;
  }
}

export async function UpdateUserOffer(jobId: string, payload: UserOfferPayload): Promise<void> {
  try {
    await api.post(`/jobs/${jobId}/user-offer`, payload);
  } catch (error: any) {
    handleApiError(error, "Failed to update user offer price");
    throw error;
  }
}

export async function CancelJobByUser(jobId: string, reason: string): Promise<void> {
  try {
    await api.post(`/jobs/${jobId}/cancel`, { reason });
  } catch (error: any) {
    handleApiError(error, "Failed to cancel the job");
    throw error;
  }
}

export async function AcceptJobByProvider(jobId: string): Promise<void> {
  try {
    await api.post(`/jobs/${jobId}/accept`);
  } catch (error: any) {
    handleApiError(error, "Failed to accept the job");
  }
}

export async function CancelJobByProvider(jobId: string, reason: string): Promise<void> {
  try {
    await api.post(`/jobs/${jobId}/provider-cancel`, { reason });
  } catch (error: any) {
    handleApiError(error, "Failed to cancel the job by provider");
    throw error;
  }
}

export async function CompleteJobByProvider(jobId: string): Promise<void> {
  try {
    await api.post(`/jobs/${jobId}/complete`);
  } catch (error: any) {
    handleApiError(error, "Failed to complete the job");
    throw error;
  }
}

export async function GetUserDashboard(): Promise<UserDashboardData> {
  try {
    const res = await api.get<{ data: UserDashboardData }>("/jobs/user-dashboard");
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch user dashboard data");
    throw error;
  }
}

export async function GetProviderDashboard(): Promise<ProviderDashboardData> {
  try {
    const res = await api.get<{ data: ProviderDashboardData }>("/jobs/provider-dashboard");
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch provider dashboard data");
    throw error;
  }
}
