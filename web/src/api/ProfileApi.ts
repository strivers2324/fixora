import api from "@/lib/axios";
import { NIDStatus } from "@/enums/NIDStatus";

export type UserProfileData = {
  name: string;
  email: string;
  profile_picture: string;
};

export type UserProfileRequest = {
  name: string;
  email: string;
  profile_picture: File | string | null;
};

export type ServiceProviderProfileData = {
  name: string;
  email: string;
  profile_picture: string;
};

export type ServiceProviderProfileRequest = {
  name: string;
  email: string;
  profile_picture: File | string | null;
};

export type UserAddressRequest = {
  full_name: string;
  phone_number: string;
  district: string;
  thana: string;
  area: string;
  address: string;
  is_default: boolean;
  latitude?: string | number;
  longitude?: string | number;
};

export type UserAddressResponse = {
  address_id: number;
  full_name: string;
  phone_number: string;
  district: string;
  thana: string;
  area: string;
  address: string;
  is_default: boolean;
  latitude: string | number;
  longitude: string | number;
};

export type SPAddressRequest = {
  district: string;
  thana: string;
  area: string;
  address: string;
  latitude?: string | number;
  longitude?: string | number;
};

export type SPAddressResponse = {
  district: string;
  thana: string;
  area: string;
  address: string;
  latitude: string | number;
  longitude: string | number;
};

export type NIDStatusResponse = {
  status: NIDStatus;
};

export type ServiceCatalog = {
  min_charge: number;
  description: string;
  is_active: boolean;
};

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverError = error.response?.data?.error;
  const serverMessage = error.response?.data?.message;

  const finalMessage = serverError || serverMessage || defaultMessage;

  throw new Error(finalMessage);
};

export async function UpdateUserProfile(data: FormData): Promise<UserProfileData> {
  try {
    const res = await api.post<UserProfileData>("/user/update-profile", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update profile");
    throw error;
  }
}

export async function GetUserProfile(): Promise<UserProfileData> {
  try {
    const res = await api.get<UserProfileData>("/user/profile");
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch profile");
    throw error;
  }
}

export async function UpdateServiceProviderProfile(data: FormData): Promise<ServiceProviderProfileData> {
  try {
    const res = await api.post<ServiceProviderProfileData>("/service-provider/update-profile", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update profile");
    throw error;
  }
}

export async function GetServiceProviderProfile(): Promise<ServiceProviderProfileData> {
  try {
    const res = await api.get<ServiceProviderProfileData>("/service-provider/profile");
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch profile");
    throw error;
  }
}

export async function GetUserAddresses(): Promise<UserAddressResponse[]> {
  try {
    const res = await api.get<UserAddressResponse[]>("/user/addresses");
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch addresses");
    throw error;
  }
}

export async function SubmitUserAddress(data: UserAddressRequest): Promise<UserAddressResponse> {
  try {
    const res = await api.post<UserAddressResponse>("/user/addresses", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to add address");
    throw error;
  }
}

export async function UpdateUserAddress(id: number, data: UserAddressRequest): Promise<UserAddressResponse> {
  try {
    const res = await api.put<UserAddressResponse>(`/user/addresses/${id}`, data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update address");
    throw error;
  }
}

export async function DeleteUserAddress(id: number): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.delete<{ success: boolean; message: string }>(`/user/addresses/${id}`);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to delete address");
    throw error;
  }
}

export async function GetServiceProviderAddress(): Promise<SPAddressResponse | null> {
  try {
    const res = await api.get<SPAddressResponse>("/service-provider/address");
    return res.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) return null;
    handleApiError(error, "Failed to fetch provider address");
    throw error;
  }
}

export async function SaveServiceProviderAddress(data: SPAddressRequest): Promise<SPAddressResponse> {
  try {
    const res = await api.post<SPAddressResponse>("/service-provider/address", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to save provider address");
    throw error;
  }
}

export async function SubmitNIDVerification(data: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const res = await api.post<{ success: boolean; message: string }>("/service-provider/submit-nid", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to submit NID");
    throw error;
  }
}

export async function GetNIDStatus(): Promise<NIDStatusResponse> {
  try {
    const res = await api.get<NIDStatusResponse>("/service-provider/nid-status");
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch NID status");
    throw error;
  }
}

export async function UpdateServiceCatalog(data: ServiceCatalog): Promise<ServiceCatalog> {
  try {
    const res = await api.post<ServiceCatalog>("/service-provider/service/catalog", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to update service catalog");
    throw error;
  }
}

export async function GetServiceCatalog(): Promise<ServiceCatalog> {
  try {
    const res = await api.get<ServiceCatalog>("/service-provider/service/catalog");
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Failed to fetch service catalog");
    throw error;
  }
}
