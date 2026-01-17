import { Role } from "@/enums/UserRole";
import api from "@/lib/axios";

type LoginCredentials = {
  phone: string;
  password: string;
  role: Role;
};

type ServiceProviderRegistrationData = {
  phone: string;
  password: string;
  profession: string;
};

type UserRegistrationData = {
  phone: string;
  password: string;
};

const handleApiError = (error: any, defaultMessage: string): never => {
  const serverMessage = error.response?.data?.message;
  const finalMessage = serverMessage || error.response?.data || defaultMessage;

  throw new Error(finalMessage);
};

export async function login(credentials: LoginCredentials) {
  const res = await api.post("/auth/login", credentials);
  return res.data;
}

export async function RegisterUser(data: UserRegistrationData) {
  try {
    const res = await api.post("/auth/user/registration", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Registration failed");
  }
}

export async function VerifyUserPhone(data: { phone: string }) {
  const res = await api.post("/auth/user/verify", data);
  return res.data;
}

export async function RegisterServiceProvider(data: ServiceProviderRegistrationData) {
  try {
    const res = await api.post("/auth/service_provider/registration", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Registration failed");
  }
}

export async function VerifyServiceProvider(data: { phone: string }) {
  try {
    const res = await api.post("/auth/service_provider/verify", data);
    return res.data;
  } catch (error: any) {
    handleApiError(error, "Verification failed");
  }
}
