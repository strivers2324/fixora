import { Role } from "@/enums/UserRole";
import api from "@/lib/axios";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  code?: string;
}

export type AdminLoginCredentials = {
  email: string;
  password: string;
};

export type AdminSessionData = {
  role: Role;
};

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverError = error.response?.data?.error;
  const serverMessage = error.response?.data?.message;

  const finalMessage = serverError || serverMessage || defaultMessage;

  throw new Error(finalMessage);
};

export async function AdminLogin(credentials: AdminLoginCredentials): Promise<void> {
  try {
    await api.post<ApiResponse<null>>("/admin/auth/login", credentials);
  } catch (error: any) {
    handleApiError(error, "Admin login failed");
    throw error;
  }
}

export async function AdminLogout(): Promise<void> {
  try {
    await api.post<ApiResponse<null>>("/admin/auth/logout");
  } catch (error: any) {
    handleApiError(error, "Failed to admin logout");
    throw error;
  }
}

export async function AdminRefreshToken(): Promise<void> {
  try {
    await api.post<ApiResponse<null>>("/admin/auth/refresh");
  } catch (error: any) {
    handleApiError(error, "Failed to refresh admin token");
    throw error;
  }
}

export async function AdminVerifySession(): Promise<AdminSessionData> {
  try {
    const res = await api.get<ApiResponse<AdminSessionData>>("/admin/auth/verify");
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Admin session verification failed");
    throw error;
  }
}
