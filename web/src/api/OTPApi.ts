import api from "@/lib/axios";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  code?: string;
}

type OTPInfoResponseData = {
  otp_id: string;
  expires_at: string;
  phone?: string;
};

type OtpResponseData = {
  otp_id: string;
};

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverError = error.response?.data?.error;
  const serverMessage = error.response?.data?.message;

  const finalMessage = serverError || serverMessage || defaultMessage;

  throw new Error(finalMessage);
};

export async function GetOTPInfo(otpID: string): Promise<OTPInfoResponseData> {
  try {
    const res = await api.get<ApiResponse<OTPInfoResponseData>>(`otp/info/${otpID}`);
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch OTP info");
    throw error;
  }
}

export async function ResendOTP(otp_id: string): Promise<OtpResponseData> {
  try {
    const res = await api.post<ApiResponse<OtpResponseData>>("/resend-otp", { otp_id });
    return res.data.data;
  } catch (error: any) {
    handleApiError(error, "Failed to resend OTP");
    throw error;
  }
}
