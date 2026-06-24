import api from "@/lib/axios";
import { NIDStatus } from "@/enums/NIDStatus";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  code?: string;
}

export interface IdentityVerification {
  provider_id: string;
  name: string;
  front_image: string;
  back_image: string;
  status: NIDStatus;
}

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverError = error.response?.data?.error;
  const serverMessage = error.response?.data?.message;

  const finalMessage = serverError || serverMessage || defaultMessage;

  throw new Error(finalMessage);
};

export async function GetVerificationsByStatus(status: NIDStatus = NIDStatus.PENDING): Promise<IdentityVerification[]> {
  try {
    const res = await api.get<ApiResponse<IdentityVerification[]>>(`/admin/verifications?status=${status}`);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch identity verifications");
    throw error;
  }
}

export async function UpdateVerificationStatus(providerId: string, status: NIDStatus): Promise<void> {
  try {
    await api.patch<ApiResponse<null>>(`/admin/verifications/${providerId}/status`, { status });
  } catch (error: any) {
    handleApiError(error, "Failed to update verification status");
    throw error;
  }
}
