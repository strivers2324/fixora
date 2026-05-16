import { useState } from "react";
import { ChangePassword } from "@/api/AccountApi";
import { ShieldCheck, Eye, EyeOff, AlertCircle, Loader2, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SecuritySettings() {
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (passwordError) setPasswordError("");
  };

  const isFormValid = () => {
    return (
      passwordData.oldPassword.trim() !== "" &&
      passwordData.newPassword.trim() !== "" &&
      passwordData.confirmPassword.trim() !== ""
    );
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsPasswordSaving(true);
    setPasswordError("");
    try {
      await ChangePassword({
        old_password: passwordData.oldPassword,
        new_password: passwordData.newPassword,
      });
      showSuccessToast("Password updated successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });

      setIsSuccess(true);
    } catch (error: any) {
      setPasswordError(error.message || "Failed to update password. Please check your old password.");
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const handleResetForm = () => {
    setIsSuccess(false);
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
          Security Settings
        </h1>
      </div>

      {isSuccess ? (
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 transition-colors duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Password Updated!</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-8">
                Your account password has been successfully changed. Please remember to use your new password next time
                you log in.
              </p>
              <Button
                onClick={handleResetForm}
                variant="outline"
                className="border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors h-11 px-8 rounded-lg"
              >
                Change Password Again
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handlePasswordSubmit}>
          <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 transition-colors duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-zinc-800/80 dark:to-zinc-800/50 border-b dark:border-zinc-800 transition-colors">
              <CardTitle className="text-xl flex items-center gap-2 dark:text-gray-100">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                Change Your Password
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                Manage your account security and password
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 transition-colors">
                  <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    We recommend using a strong, unique password for your account security.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 md:col-span-2">
                    <Label className="text-sm font-medium dark:text-gray-300">
                      Old Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showOldPass ? "text" : "password"}
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter current password"
                        className={`h-11 rounded-lg bg-white/50 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white pr-10 transition-colors ${
                          passwordError && !passwordError.includes("characters") && !passwordError.includes("match")
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-500"
                      >
                        {showOldPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && !passwordError.includes("characters") && !passwordError.includes("match") && (
                      <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium dark:text-gray-300">
                      New Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showNewPass ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter new password"
                        className={`h-11 rounded-lg bg-white/50 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white pr-10 transition-colors ${
                          passwordError.includes("characters") ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-500"
                      >
                        {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError.includes("characters") && (
                      <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium dark:text-gray-300">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPass ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="Confirm new password"
                        className={`h-11 rounded-lg bg-white/50 dark:bg-zinc-800/50 dark:border-zinc-700 dark:text-white pr-10 transition-colors ${
                          passwordError.includes("match") ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-600 dark:hover:text-amber-500"
                      >
                        {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError.includes("match") && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end mt-6">
            <Button
              type="submit"
              disabled={isPasswordSaving || !isFormValid()}
              className="rounded-lg px-8 h-11 transition-all bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white disabled:opacity-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
            >
              {isPasswordSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
