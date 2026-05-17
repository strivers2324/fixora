import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import { UpdateServiceProviderProfile } from "@/api/ProfileApi";
import { RequestPhoneChange, VerifyOTPAndUpdatePhone } from "@/api/AccountApi";
import { Logout } from "@/api/AuthApi";
import { ResendOTP, GetOTPInfo } from "@/api/OTPApi";
import {
  User,
  LogOut,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Mail,
  Camera,
  Loader2,
  Smartphone,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Import other components
import ServiceProviderAddressBook from "./AddressBook";
import SecuritySettings from "./SecuritySettings";
import NidVerification from "./NIDVerification";

export default function ServiceProviderProfile() {
  const navigate = useNavigate();
  const { account, profile, fetchProfile, logout } = useAccountStore();
  const [activeMenu, setActiveMenu] = useState("profile");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProfileSaving, setIsProfileSaving] = useState(false);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [phoneModalStep, setPhoneModalStep] = useState<1 | 2>(1);
  const [phoneChangeLoading, setPhoneChangeLoading] = useState(false);
  const [phoneChangeError, setPhoneChangeError] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [otpId, setOtpId] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    profession: "",
    email: "",
    phone: "",
  });

  const sidebarItems = [
    { name: "Profile Settings", id: "profile", icon: User },
    { name: "Address Book", id: "address", icon: MapPin },
    { name: "Security Settings", id: "security", icon: ShieldCheck },
    { name: "NID Verification", id: "nid", icon: CreditCard },
  ];

  useEffect(() => {
    if (account?.phone) {
      fetchProfile();
    }
  }, [account]);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        name: profile.name || (account as any)?.name || "",
        profession: (profile as any)?.profession || (account as any)?.profession || "Service Provider",
        email: profile.email || (account as any)?.email || "",
        phone: prev.phone && prev.phone !== (account?.phone || "") ? prev.phone : account?.phone || "",
      }));

      if (profile.profile_picture) {
        setProfileImage(profile.profile_picture);
      }
    } else if (account) {
      setFormData((prev) => ({
        ...prev,
        phone: prev.phone && prev.phone !== (account?.phone || "") ? prev.phone : account?.phone || "",
        profession: (account as any)?.profession || "Service Provider",
      }));
    }
  }, [profile, account]);

  const showSuccessToast = (message: string) => {
    const alertDiv = document.createElement("div");
    alertDiv.className = "fixed top-4 right-4 z-50 animate-in slide-in-from-right";
    alertDiv.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-green-500"></div>
          <p class="text-green-700 font-medium">${message}</p>
      </div>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const showErrorToast = (message: string) => {
    const alertDiv = document.createElement("div");
    alertDiv.className = "fixed top-4 right-4 z-50 animate-in slide-in-from-right";
    alertDiv.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-red-500"></div>
          <p class="text-red-700 font-medium">${message}</p>
      </div>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const handleMenuClick = (item: any) => {
    if (item.path) {
      navigate(item.path);
    } else {
      setActiveMenu(item.id);
    }
  };

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (error) {
    } finally {
      logout();
      navigate("/login");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setProfileImage(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);

      if (selectedFile) {
        formDataToSend.append("profile_picture", selectedFile);
      }

      await UpdateServiceProviderProfile(formDataToSend as any);
      await fetchProfile();
      showSuccessToast("Profile updated successfully!");
    } catch (error: any) {
      showErrorToast(error.message || "Update failed");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const fetchAndSetTimer = async (id: string) => {
    try {
      const info = await GetOTPInfo(id);
      if (info && info.expires_at) {
        const expiresAt = new Date(info.expires_at).getTime();
        const now = new Date().getTime();
        const diffSeconds = Math.floor((expiresAt - now) / 1000);
        setOtpTimer(diffSeconds > 0 ? diffSeconds : 0);
      }
    } catch (error) {
      setOtpTimer(0);
    }
  };

  useEffect(() => {
    let timerInterval: ReturnType<typeof setInterval>;
    if (phoneModalStep === 2 && otpTimer > 0) {
      timerInterval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [phoneModalStep, otpTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const formatPhoneForApi = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("88")) clean = clean.substring(2);
    return `+88${clean}`;
  };

  const getDisplayPhone = (phone: string) => {
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("88")) return clean.substring(2);
    return clean;
  };

  const resetPhoneModal = () => {
    setPhoneModalStep(1);
    setNewPhoneNumber("");
    setOtpValues(["", "", "", ""]);
    setPhoneChangeError("");
    setOtpId("");
    setOtpTimer(0);
  };

  const handleSendOtpForPhoneChange = async () => {
    if (!newPhoneNumber || newPhoneNumber.length < 10) {
      setPhoneChangeError("Please enter a valid new phone number.");
      return;
    }
    setPhoneChangeError("");
    setPhoneChangeLoading(true);
    try {
      const formattedNewPhone = formatPhoneForApi(newPhoneNumber);
      const res = await RequestPhoneChange({ new_phone: formattedNewPhone });
      const newOtpId = res.otp_id || res.data?.otp_id;
      setOtpId(newOtpId);
      setPhoneModalStep(2);
      fetchAndSetTimer(newOtpId);
      showSuccessToast("OTP sent to your new number.");
    } catch (err: any) {
      setPhoneChangeError(err.message || "Failed to request OTP.");
    } finally {
      setPhoneChangeLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!otpId) return;
    setIsResending(true);
    setPhoneChangeError("");
    try {
      const res = await ResendOTP(otpId);
      const newOtpId = res.otp_id;
      setOtpId(newOtpId);
      await fetchAndSetTimer(newOtpId);
      showSuccessToast("OTP resent successfully.");
    } catch (err: any) {
      setPhoneChangeError(err.message || "Failed to resend OTP.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyAndChangePhone = async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length < 4) {
      setPhoneChangeError("Please enter the complete 4-digit OTP.");
      return;
    }

    setPhoneChangeError("");
    setPhoneChangeLoading(true);
    try {
      const formattedNewPhone = formatPhoneForApi(newPhoneNumber);
      await VerifyOTPAndUpdatePhone({ otp_id: otpId, otp_code: otpCode, new_phone: formattedNewPhone });

      setFormData((prev) => ({ ...prev, phone: formattedNewPhone }));
      showSuccessToast("Phone number updated successfully!");
      setIsPhoneModalOpen(false);
      resetPhoneModal();
      await fetchProfile();
    } catch (err: any) {
      setPhoneChangeError(err.message || "Invalid OTP or failed to update phone.");
    } finally {
      setPhoneChangeLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const renderContent = () => {
    if (activeMenu === "address") return <ServiceProviderAddressBook />;
    if (activeMenu === "security") return <SecuritySettings />;
    if (activeMenu === "nid") return <NidVerification />;

    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
            Profile Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">Manage your personal information</p>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 transition-colors duration-300">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50/50 dark:from-teal-950/30 dark:to-emerald-950/30 border-b dark:border-zinc-800 transition-colors">
              <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                <User className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                Personal Information
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Update your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-medium dark:text-gray-300 transition-colors">
                    Full Name <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10 h-11 rounded-lg bg-white/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-500 transition-colors"
                      placeholder="e.g. Rahim Ullah"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium dark:text-gray-300 transition-colors">
                    Email Address{" "}
                    <span className="text-gray-400 dark:text-gray-500 font-normal text-xs ml-1">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10 h-11 rounded-lg bg-white/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-500 transition-colors"
                      placeholder="e.g. rahim@service.com"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="phone" className="text-sm font-medium dark:text-gray-300 transition-colors">
                    Phone Number <span className="text-red-500 dark:text-red-400">*</span>
                  </Label>
                  <div className="flex h-11 rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 overflow-hidden transition-colors">
                    <div className="flex items-center justify-center bg-gray-100 dark:bg-zinc-800 px-4 border-r border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-medium transition-colors">
                      +88
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={getDisplayPhone(formData.phone)}
                      className="flex-1 px-3 outline-none bg-transparent text-gray-600 dark:text-gray-300 cursor-not-allowed transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    onClick={() => setIsPhoneModalOpen(true)}
                    variant="outline"
                    className="h-11 px-4 rounded-lg w-full sm:w-auto shrink-0 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors"
                  >
                    Change Phone Number
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4 mt-3 pt-3 transition-colors">
            <Button
              type="submit"
              disabled={isProfileSaving}
              className="rounded-lg bg-teal-900 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white px-8 transition-colors"
            >
              {isProfileSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile Info"
              )}
            </Button>
          </div>
        </form>

        <Dialog
          open={isPhoneModalOpen}
          onOpenChange={(open) => {
            setIsPhoneModalOpen(open);
            if (!open) resetPhoneModal();
          }}
        >
          <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800 transition-colors">
            <DialogHeader>
              <DialogTitle className="text-teal-900 dark:text-teal-400 flex items-center gap-2 transition-colors">
                <Smartphone className="h-5 w-5" />
                {phoneModalStep === 1 ? "Enter New Phone Number" : "Enter OTP and Change Phone"}
              </DialogTitle>
              <DialogDescription className="dark:text-gray-400 transition-colors">
                {phoneModalStep === 1
                  ? "We will send an OTP code to your new number."
                  : "Enter the 4-digit code that was sent to your new phone number."}
              </DialogDescription>
            </DialogHeader>

            {phoneChangeError && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-3 py-2 rounded-md text-sm transition-colors">
                {phoneChangeError}
              </div>
            )}

            {phoneModalStep === 1 ? (
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="newPhoneNumber" className="dark:text-gray-300 transition-colors">
                    New Phone Number
                  </Label>
                  <div className="flex h-11 rounded-lg border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 transition-colors">
                    <div className="flex items-center justify-center bg-gray-50 dark:bg-zinc-800 px-4 border-r border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-medium transition-colors">
                      +88
                    </div>
                    <input
                      type="text"
                      id="newPhoneNumber"
                      value={newPhoneNumber}
                      onChange={(e) => {
                        setNewPhoneNumber(e.target.value);
                        setPhoneChangeError("");
                      }}
                      placeholder="017XXXXXXXX"
                      maxLength={11}
                      className="flex-1 px-3 outline-none dark:bg-zinc-800 dark:text-white dark:placeholder:text-gray-500 transition-colors"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleSendOtpForPhoneChange}
                  disabled={phoneChangeLoading || !newPhoneNumber}
                  className="w-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white transition-colors"
                >
                  {phoneChangeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4 py-2">
                <div className="flex justify-center gap-3 my-4">
                  {otpValues.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 dark:border-zinc-600 dark:bg-zinc-800 dark:text-white rounded-lg focus:border-teal-500 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-200 dark:focus:ring-teal-900 outline-none transition-all"
                    />
                  ))}
                </div>
                <div className="flex items-center justify-center mb-4">
                  {otpTimer > 0 ? (
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors">
                      Resend in <span className="text-teal-600 dark:text-teal-400">{formatTime(otpTimer)}</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 disabled:opacity-50 transition-colors"
                    >
                      {isResending ? "Sending..." : "Resend OTP"}
                    </button>
                  )}
                </div>
                <Button
                  onClick={handleVerifyAndChangePhone}
                  disabled={phoneChangeLoading || otpValues.join("").length < 4}
                  className="w-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white transition-colors"
                >
                  {phoneChangeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    "Verify and Change Phone"
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 dark:from-zinc-950 dark:to-zinc-950 font-sans relative transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -right-20 -bottom-20 opacity-[0.08] dark:opacity-5">
          <Wrench className="h-[600px] w-[600px] text-teal-900 dark:text-teal-500 rotate-[-15deg]" strokeWidth={1} />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.03)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.02)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-80 w-full shrink-0">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/80 dark:bg-zinc-900 backdrop-blur-sm h-auto flex flex-col transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex flex-col items-center mb-6 pt-2">
                  <div className="relative group">
                    <Avatar className="h-28 w-28 border-4 border-white dark:border-zinc-800 shadow-xl cursor-pointer group-hover:opacity-90 transition-all">
                      <AvatarImage src={profileImage || ""} />
                      <AvatarFallback className="text-3xl bg-teal-900 dark:bg-teal-700 text-white font-bold transition-colors">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : "SP"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      className="absolute bottom-1 right-1 bg-teal-900 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white p-2.5 rounded-full shadow-lg border-4 border-white dark:border-zinc-800 transition-all hover:scale-110"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white transition-colors text-center break-words w-full px-2">
                    {formData.name || "Service Provider"}
                  </h2>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400 mt-1 capitalize transition-colors text-center">
                    {formData.profession}
                  </p>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 transition-colors text-center">
                    {account?.phone}
                  </p>
                </div>

                <nav className="space-y-2 mt-2">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      onClick={() => handleMenuClick(item)}
                      className={`w-full justify-start h-11 px-4 rounded-xl transition-all ${
                        activeMenu === item.id
                          ? "bg-teal-900 text-white shadow-md hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-teal-700 dark:hover:text-teal-400"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-4 w-4 ${activeMenu === item.id ? "text-white" : "text-gray-400 dark:text-gray-500"}`}
                      />
                      {item.name}
                      {activeMenu === item.id && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </nav>
                <div className="mt-6 pt-6 border-t dark:border-zinc-800 transition-colors">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full h-11 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50 rounded-xl font-medium transition-colors"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <main className="flex-1 w-full min-w-0">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
