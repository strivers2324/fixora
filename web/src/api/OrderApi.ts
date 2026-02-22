import api from "@/lib/axios";

export type UserProfileData = {
  name: string;
  email: string;
  district: string;
  area: string;
  sub_area: string;
  profile_picture: string;
};

export type UserProfileRequest = {
  name: string;
  email: string;
  district: string;
  area: string;
  sub_area: string;
  profile_picture: string;
};

export type ServiceProviderProfileData = {
  name: string;
  email: string;
  district: string;
  area: string;
  sub_area: string;
  profile_picture: string;
};

export type ServiceProviderProfileRequest = {
  name: string;
  email: string;
  district: string;
  area: string;
  sub_area: string;
  profile_picture: string;
};

export type NIDSubmissionRequest = {
  nid_number: string;
  storage_folder_id: string;
};

export type NIDStatusResponse = {
  status: "pending" | "accepted" | "rejected";
};

export type ChangePasswordRequest = {
  old_password: string;
  new_password: string;
};

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverError = error.response?.data?.error;
  const serverMessage = error.response?.data?.message;

  const finalMessage = serverError || serverMessage || defaultMessage;

  throw new Error(finalMessage);
};

export async function UpdateUserProfile(data: UserProfileRequest): Promise<UserProfileData> {
  try {
    const res = await api.post<UserProfileData>("/order/user/update-profile", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update profile");
    throw error;
  }
}

export async function GetUserProfile(): Promise<UserProfileData> {
  try {
    const res = await api.get<UserProfileData>("/order/user/profile");
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch profile");
    throw error;
  }
}

export async function UpdateServiceProviderProfile(data: UserProfileRequest): Promise<ServiceProviderProfileData> {
  try {
    const res = await api.post<ServiceProviderProfileData>("/order/service-provider/update-profile", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update profile");
    throw error;
  }
}

export async function GetServiceProviderProfile(): Promise<ServiceProviderProfileData> {
  try {
    const res = await api.get<ServiceProviderProfileData>("/order/service-provider/profile");
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch profile");
    throw error;
  }
}

export async function SubmitNIDVerification(
  data: NIDSubmissionRequest,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post<{ success: boolean; message: string }>("/order/service-provider/submit-nid", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to submit NID");
    throw error;
  }
}

export async function GetNIDStatus(): Promise<NIDStatusResponse> {
  try {
    const res = await api.get<NIDStatusResponse>("/order/service-provider/nid-status");
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch NID status");
    throw error;
  }
}

export async function ChangePassword(data: ChangePasswordRequest): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post<{ success: boolean; message: string }>("/order/change-password", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to change password");
    throw error;
  }
}
