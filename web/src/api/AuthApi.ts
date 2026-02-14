import { Role } from "@/enums/UserRole";
import api from "@/lib/axios";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  code?: string;
}

type LoginCredentials = {
  phone: string;
  password: string;
  role: Role;
};

type LoginResponseData = {
  accountinfo: {
    phone: string;
    role: Role;
    is_phone_verified: boolean;
  };
  otp_id: string;
};

type UserRegistrationData = {
  phone: string;
  password: string;
};

type ServiceProviderRegistrationData = {
  phone: string;
  password: string;
  profession_id: number;
};

type OtpResponseData = {
  otp_id: string;
};

type VerifyOtpData = {
  otp_id: string;
  otp_code: string;
};

type VerifyOtpResponseData = {
  reset_token?: string;
};

type OTPInfoResponseData = {
  otp_id: string;
  expires_at: string;
  phone?: string;
};

type ForgotPasswordData = {
  phone: string;
  role: Role;
};

type ResetPasswordData = {
  reset_token: string;
  new_password: string;
};

type Profession = {
  id: number;
  profession_name: string;
};

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverError = error.response?.data?.error;
  const serverMessage = error.response?.data?.message;

  const finalMessage = serverError || serverMessage || defaultMessage;

  throw new Error(finalMessage);
};

export async function GetProfessions() {
  try {
    const res = await api.get<ApiResponse<Profession[]>>("/auth/professions");
    return res.data.data; // Return only the list
  } catch (error: any) {
    handleApiError(error, "Failed to fetch professions");
    throw error;
  }
}

export async function login(credentials: LoginCredentials): Promise<LoginResponseData> {
  try {
    const res = await api.post<ApiResponse<LoginResponseData>>("/auth/login", credentials);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Login failed");
    throw error;
  }
}

export async function RegisterUser(data: UserRegistrationData): Promise<OtpResponseData> {
  try {
    const res = await api.post<ApiResponse<OtpResponseData>>("/auth/user/registration", data);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Registration failed");
    throw error;
  }
}

export async function RegisterServiceProvider(data: ServiceProviderRegistrationData): Promise<OtpResponseData> {
  try {
    const res = await api.post<ApiResponse<OtpResponseData>>("/auth/service-provider/registration", data);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Registration failed");
    throw error;
  }
}

export async function ResendOTP(otp_id: string): Promise<OtpResponseData> {
  try {
    const res = await api.post<ApiResponse<OtpResponseData>>("/auth/resend-otp", { otp_id });
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to resend OTP");
    throw error;
  }
}

export async function UpdatePhoneAndResend(otp_id: string, new_phone: string): Promise<OtpResponseData> {
  try {
    const res = await api.put<ApiResponse<OtpResponseData>>("/auth/update-phone", { otp_id, new_phone });
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update phone");
    throw error;
  }
}

export async function VerifyUserPhone(data: VerifyOtpData) {
  try {
    const res = await api.post<ApiResponse<null>>("/auth/user/verify", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Verification failed");
    throw error;
  }
}

export async function VerifyServiceProviderPhone(data: VerifyOtpData) {
  try {
    const res = await api.post<ApiResponse<null>>("/auth/service-provider/verify", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Verification failed");
    throw error;
  }
}

export async function GetOTPInfo(otpID: string): Promise<OTPInfoResponseData> {
  try {
    const res = await api.get<ApiResponse<OTPInfoResponseData>>(`/auth/otp/info/${otpID}`);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch OTP info");
    throw error;
  }
}

export async function VerifyOTP(data: VerifyOtpData): Promise<VerifyOtpResponseData> {
  try {
    const res = await api.post<ApiResponse<VerifyOtpResponseData>>("/auth/verify/otp", data);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Invalid OTP");
    throw error;
  }
}

export async function ForgotPassword(data: ForgotPasswordData): Promise<OtpResponseData> {
  try {
    const res = await api.post<ApiResponse<OtpResponseData>>("/auth/forgot-password", data);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to process request");
    throw error;
  }
}

export async function ResetPassword(data: ResetPasswordData): Promise<void> {
  try {
    await api.post<ApiResponse<null>>("/auth/reset-password", data);
  } catch (error: any) {
    handleApiError(error, "Failed to reset password");
    throw error;
  }
}
