import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAccountStore } from "@/store/AccountStore";
import { UpdateUserProfile, UserProfileRequest } from "@/api/OrderApi";
import { Logout } from "@/api/AuthApi";
import {
  LayoutDashboard,
  User,
  LogOut,
  MapPin,
  ChevronRight,
  ShieldCheck,
  KeyRound,
  Wrench,
  Mail,
  Phone,
  Camera,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LOCATION_DATA } from "@/data/locationData";

const CLOUDINARY_UPLOAD_PRESET = "fixora_profile_upload";
const CLOUDINARY_CLOUD_NAME = "dkskg6fv9";
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

export default function UserUpdateProfile() {
  const navigate = useNavigate();
  const { account, profile, fetchProfile, logout } = useAccountStore();

  const [activeTab, setActiveTab] = useState("personal");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    district: "",
    area: "",
    subArea: "",
  });

  useEffect(() => {
    if (account?.phone) {
      fetchProfile();
    }
  }, [account]);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || (account as any)?.name || "",
        email: profile.email || (account as any)?.email || "",
        phone: account?.phone || "",
        district: profile.district || "",
        area: profile.area || "",
        subArea: profile.sub_area || "",
      });

      if (profile.profile_picture) {
        setProfileImage(profile.profile_picture);
      }
    } else if (account) {
      setFormData((prev) => ({ ...prev, phone: account.phone }));
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError("");
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "district") {
      setFormData({ ...formData, district: value, area: "", subArea: "" });
    } else if (name === "area") {
      setFormData({ ...formData, area: value, subArea: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const uploadImageToCloudinary = async (file: File): Promise<string | null> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(CLOUDINARY_API_URL, { method: "POST", body: data });
      const fileData = await res.json();
      return fileData.secure_url;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);

    try {
      let finalImageUrl = profileImage || "";

      if (selectedFile) {
        const uploadedUrl = await uploadImageToCloudinary(selectedFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          showErrorToast("Image upload failed");
          setIsProfileSaving(false);
          return;
        }
      }

      const requestData: UserProfileRequest = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        district: formData.district,
        area: formData.area,
        sub_area: formData.subArea,
        profile_picture: finalImageUrl,
      };

      await UpdateUserProfile(requestData);
      await fetchProfile();

      showSuccessToast("Profile updated successfully!");
    } catch (error: any) {
      showErrorToast(error.message || "Update failed");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordSaving(true);
    setTimeout(() => {
      setIsPasswordSaving(false);
      showSuccessToast("Password updated!");
      setShowPasswordFields(false);
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    }, 1000);
  };

  const handlePhoneChangeClick = () => {
    alert("Phone verification feature coming soon.");
  };

  const handleLogout = async () => {
    try {
      await Logout();
    } catch (error) {
      console.error("Logout failed on server:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const [activeMenu, setActiveMenu] = useState("profile");
  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", active: activeMenu === "dashboard" },
    { name: "Profile", icon: User, path: "/profile", active: activeMenu === "profile" },
  ];

  const handleMenuClick = (name: string, path: string) => {
    setActiveMenu(name.toLowerCase());
    navigate(path);
  };

  const handleImageClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/30 font-sans relative">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -right-20 -bottom-20 opacity-[0.08]">
          <Wrench className="h-[600px] w-[600px] text-teal-900 rotate-[-15deg]" strokeWidth={1} />
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.03)_0%,transparent_50%)]" />
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="lg:w-80 w-full shrink-0">
            <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm h-auto flex flex-col">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center mb-8">
                  <div className="relative mb-4 group">
                    <Avatar className="h-24 w-24 border-4 border-white shadow-xl cursor-pointer group-hover:opacity-90 transition-opacity">
                      <AvatarImage src={profileImage || ""} />
                      <AvatarFallback className="text-2xl bg-teal-900 text-white font-bold">
                        {formData.name ? formData.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleImageClick}
                      className="absolute bottom-0 right-0 bg-teal-900 hover:bg-teal-800 text-white p-2 rounded-full shadow-lg border-4 border-white transition-all hover:scale-110"
                    >
                      <Camera className="h-3 w-3" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mt-2">{formData.name || "User Name"}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <p className="text-sm text-gray-500">{formData.phone}</p>
                  </div>
                </div>

                <Separator className="my-6" />
                <nav className="space-y-2">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      onClick={() => handleMenuClick(item.name, item.path)}
                      className={`w-full justify-start h-11 px-4 rounded-xl transition-all ${
                        item.active
                          ? "bg-teal-900 text-white shadow-md hover:bg-teal-800"
                          : "text-gray-600 hover:bg-gray-100 hover:text-teal-700"
                      }`}
                    >
                      <item.icon className={`mr-3 h-4 w-4 ${item.active ? "text-white" : "text-gray-400"}`} />
                      {item.name}
                      {item.active && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Button>
                  ))}
                </nav>
                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full h-11 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-xl font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <main className="flex-1 w-full min-w-0">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile Settings</h1>
              <p className="text-gray-500 mt-2">Manage your personal information and account security</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-gray-100 p-1 rounded-xl w-full lg:w-auto">
                <TabsTrigger value="personal" className="rounded-lg data-[state=active]:bg-white">
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-white">
                  Security
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <form onSubmit={handleProfileSubmit}>
                  <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50/50 border-b">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <User className="h-5 w-5 text-teal-600" />
                        Personal Information
                      </CardTitle>
                      <CardDescription>Update your basic personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="name" className="text-sm font-medium">
                            Full Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleChange}
                              className="pl-10 h-11 rounded-lg bg-white/50"
                              placeholder="John Doe"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-sm font-medium">
                            Email Address <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              className="pl-10 h-11 rounded-lg bg-white/50"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="phone" className="text-sm font-medium">
                          Phone Number
                        </Label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              readOnly
                              className="pl-10 h-11 rounded-lg bg-gray-50 text-gray-600"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={handlePhoneChangeClick}
                            variant="outline"
                            className="h-11 px-4 rounded-lg border-teal-200 text-teal-700 hover:bg-teal-50"
                          >
                            Change
                          </Button>
                        </div>
                      </div>

                      <Separator className="my-4" />
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-teal-600" />
                          <h3 className="font-semibold text-gray-900">Address Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-3">
                            <Label className="text-sm font-medium">District</Label>
                            <Select
                              value={formData.district}
                              onValueChange={(value) => handleSelectChange("district", value)}
                            >
                              <SelectTrigger className="h-11 rounded-lg">
                                <SelectValue placeholder="Select District" />
                              </SelectTrigger>
                              <SelectContent>
                                {LOCATION_DATA.districts.map((dist) => (
                                  <SelectItem key={dist} value={dist}>
                                    {dist}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Area</Label>
                            <Select
                              value={formData.area}
                              onValueChange={(value) => handleSelectChange("area", value)}
                              disabled={!formData.district}
                            >
                              <SelectTrigger className="h-11 rounded-lg">
                                <SelectValue placeholder="Select Area" />
                              </SelectTrigger>
                              <SelectContent>
                                {formData.district &&
                                  LOCATION_DATA.areas[formData.district]?.map((area) => (
                                    <SelectItem key={area} value={area}>
                                      {area}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Sub-Area</Label>
                            <Select
                              value={formData.subArea}
                              onValueChange={(value) => handleSelectChange("subArea", value)}
                              disabled={!formData.area}
                            >
                              <SelectTrigger className="h-11 rounded-lg">
                                <SelectValue placeholder="Select Sub-Area" />
                              </SelectTrigger>
                              <SelectContent>
                                {formData.area &&
                                  LOCATION_DATA.subAreas[formData.area]?.map((sub) => (
                                    <SelectItem key={sub} value={sub}>
                                      {sub}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t">
                    <Button
                      type="submit"
                      disabled={isProfileSaving}
                      className="rounded-lg bg-teal-900 hover:bg-teal-800 text-white px-8"
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
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50/50 border-b">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-amber-600" /> Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security and password</CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-700">
                        We recommend using a strong, unique password for your account security.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-amber-100 rounded-full">
                            <KeyRound className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Change Password</h4>
                            <p className="text-sm text-gray-500">Update your password regularly</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={() => {
                            setShowPasswordFields(!showPasswordFields);
                            setPasswordError("");
                          }}
                          variant={showPasswordFields ? "ghost" : "outline"}
                          className={
                            showPasswordFields ? "text-gray-500" : "border-amber-200 text-amber-700 hover:bg-amber-50"
                          }
                        >
                          {showPasswordFields ? "Cancel" : "Change Password"}
                        </Button>
                      </div>

                      {showPasswordFields && (
                        <form
                          onSubmit={handlePasswordSubmit}
                          className="grid gap-4 mt-6 animate-in slide-in-from-top-2 fade-in duration-300"
                        >
                          <Separator className="mb-2" />
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Old Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <Input
                                type={showOldPass ? "text" : "password"}
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                className="bg-white pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowOldPass(!showOldPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                New Password <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  type={showNewPass ? "text" : "password"}
                                  name="newPassword"
                                  value={passwordData.newPassword}
                                  onChange={handlePasswordChange}
                                  placeholder="Enter new password"
                                  className={`bg-white pr-10 ${passwordError.includes("characters") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPass(!showNewPass)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Confirm Password <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Input
                                  type={showConfirmPass ? "text" : "password"}
                                  name="confirmPassword"
                                  value={passwordData.confirmPassword}
                                  onChange={handlePasswordChange}
                                  placeholder="Confirm new password"
                                  className={`bg-white pr-10 ${passwordError.includes("match") ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          {passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                          <div className="flex items-center justify-end mt-4">
                            <Button
                              type="submit"
                              disabled={isPasswordSaving}
                              className="bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              {isPasswordSaving ? "Updating..." : "Update Password"}
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  );
}
