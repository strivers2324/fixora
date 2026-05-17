import api from "@/lib/axios";

export type ChangePasswordRequest = {
  old_password: string;
  new_password: string;
};

export type RequestPhoneChangeParams = {
  new_phone: string;
};

export type VerifyOTPAndPhoneChangeParams = {
  otp_id: string;
  otp_code: string;
  new_phone: string;
};

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverError = error.response?.data?.error;
  const serverMessage = error.response?.data?.message;

  const finalMessage = serverError || serverMessage || defaultMessage;

  throw new Error(finalMessage);
};

export async function ChangePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post<{ success: boolean; message: string }>("/change-password", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to change password");
    throw error;
  }
}

export async function RequestPhoneChange(data: RequestPhoneChangeParams): Promise<any> {
  try {
    const res = await api.post("/change-phone", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to request phone change");
  }
}

export async function VerifyOTPAndUpdatePhone(data: VerifyOTPAndPhoneChangeParams): Promise<any> {
  try {
    const res = await api.post("/update/phone", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update phone number");
  }
}
