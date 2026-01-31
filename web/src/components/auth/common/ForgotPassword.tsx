import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import logo1 from "@/assets/images/LogoLogin.png";
import { User, Briefcase, Clock } from "lucide-react";
import { Role } from "@/enums/UserRole";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ForgotPassword, ResendOTP, ResetPassword, GetOTPInfo, VerifyOTP } from "@/api/AuthApi";

const PhoneSchema = z.object({
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Please enter a valid 11-digit phone number (e.g., 017XXXXXXXX)"),
});

const OtpSchema = z.object({
  pin: z.string().min(4, "OTP must be 4 digits").max(4, "OTP must be 4 digits"),
});

const PasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type Step = "phone" | "otp" | "password";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>(() => (sessionStorage.getItem("fp_step") as Step) || "phone");
  const [role, setRole] = useState<Role>(Role.USER);
  const [phone, setPhone] = useState(() => sessionStorage.getItem("fp_phone") || "");
  const [otpId, setOtpId] = useState<string | null>(() => sessionStorage.getItem("fp_otp_id") || null);
  const [resetToken, setResetToken] = useState<string | null>(() => sessionStorage.getItem("fp_reset_token") || null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerLoading, setIsTimerLoading] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const phoneForm = useForm<z.infer<typeof PhoneSchema>>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: { phone: phone },
  });

  const otpForm = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { pin: "" },
  });

  const passwordForm = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  useEffect(() => {
    sessionStorage.setItem("fp_step", step);
    sessionStorage.setItem("fp_phone", phone);
    if (otpId) sessionStorage.setItem("fp_otp_id", otpId);
    if (resetToken) sessionStorage.setItem("fp_reset_token", resetToken);
  }, [step, phone, otpId, resetToken]);

  const clearSession = () => {
    sessionStorage.removeItem("fp_step");
    sessionStorage.removeItem("fp_phone");
    sessionStorage.removeItem("fp_otp_id");
    sessionStorage.removeItem("fp_reset_token");
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const fetchOTPStatus = useCallback(async (id: string) => {
    setIsTimerLoading(true);
    try {
      const data = await GetOTPInfo(id);
      if (data && data.expires_at) {
        const expiresAt = new Date(data.expires_at).getTime();
        const now = Date.now();
        const diff = Math.floor((expiresAt - now) / 1000);
        setTimeLeft(diff > 0 ? diff : 0);
      }
    } catch (err: any) {
      if (err.response?.status === 429) {
        setLimitError(err.message || "Limit reached.");
        setTimeLeft(0);
      }
    } finally {
      setIsTimerLoading(false);
    }
  }, []);

  useEffect(() => {
    if (otpId) fetchOTPStatus(otpId);
  }, [otpId, fetchOTPStatus]);

  useEffect(() => {
    if (timeLeft <= 0 || limitError) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, limitError]);

  const onPhoneSubmit = async (values: z.infer<typeof PhoneSchema>) => {
    setGeneralError(null);
    setSuccess(null);
    setLimitError(null);
    setLoading(true);

    try {
      const response = await ForgotPassword({
        phone: "+88" + values.phone,
        role,
      });
      setPhone(values.phone);
      setOtpId(response.otp_id);
      setStep("otp");
      setSuccess("OTP sent successfully!");
    } catch (err: any) {
      setGeneralError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpId || limitError) return;
    setGeneralError(null);
    setSuccess(null);
    otpForm.reset();

    try {
      const res = await ResendOTP(otpId);
      setOtpId(res.otp_id);
      setSuccess("Code sent successfully!");
    } catch (err: any) {
      if (err.response?.status === 429) {
        setLimitError(err.message || "Maximum resend limit reached.");
        setTimeLeft(0);
      } else {
        setGeneralError(err.message || "Failed to resend OTP");
      }
    }
  };

  const onOtpSubmit = async (values: z.infer<typeof OtpSchema>) => {
    setGeneralError(null);
    setSuccess(null);

    if (!otpId) {
      setGeneralError("Session expired. Please restart.");
      return;
    }

    setLoading(true);
    try {
      const response = await VerifyOTP({ otp_id: otpId, otp_code: values.pin });

      if (response.reset_token) {
        setResetToken(response.reset_token);
        setSuccess("OTP Verified!");
        setTimeout(() => {
          setSuccess(null);
          setStep("password");
        }, 1000);
      } else {
        throw new Error("Verification successful but token missing.");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Invalid OTP Code.";
      otpForm.setError("pin", {
        type: "manual",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof PasswordSchema>) => {
    setGeneralError(null);
    setSuccess(null);

    if (!resetToken) {
      setGeneralError("Session expired. Please verify OTP again.");
      return;
    }

    setLoading(true);
    try {
      await ResetPassword({
        reset_token: resetToken,
        new_password: values.password,
      });

      setSuccess("Password reset successfully!");
      clearSession();
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setGeneralError(err.message || "Failed to reset password.");
      if (err.message?.includes("token")) {
        setTimeout(() => setStep("otp"), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200">
      <Card className="w-full max-w-md mx-auto rounded-xl shadow-2xl bg-white animate-in zoom-in duration-300">
        <CardContent className="w-full px-6 md:px-10 py-10 flex flex-col justify-center">
          <div className="mb-4">
            {success && (
              <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 mb-4">
                <AlertDescription className="font-medium text-center">{success}</AlertDescription>
              </Alert>
            )}

            {(generalError || limitError) && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 mb-4">
                <AlertDescription className="font-medium text-center">{limitError || generalError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center mb-6">
            <div className="flex items-center justify-center mt-2 mb-2">
              <img src={logo1} alt="Fixora Logo" className="h-16 w-auto" />
            </div>
            {step === "phone" && (
              <>
                <h2 className="text-xl font-serif text-teal-900">Reset Password</h2>
                <p className="text-muted-foreground text-sm font-serif">
                  Select account type and enter your phone number.
                </p>
              </>
            )}
            {step === "otp" && <h2 className="text-xl font-serif text-teal-900">Verify Phone</h2>}
            {step === "password" && <h2 className="text-xl font-serif text-teal-900">Set New Password</h2>}
          </div>

          {step === "phone" && (
            <Form {...phoneForm}>
              <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="w-full">
                <div className="mb-4">
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setRole(Role.USER)}
                      className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        role === Role.USER
                          ? "bg-white text-teal-900 shadow-sm ring-1 ring-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <User size={18} /> User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole(Role.SERVICE_PROVIDER)}
                      className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                        role === Role.SERVICE_PROVIDER
                          ? "bg-white text-teal-900 shadow-sm ring-1 ring-gray-200"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      <Briefcase size={18} /> Service Provider
                    </button>
                  </div>
                </div>

                <FormField
                  control={phoneForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center px-3 border rounded-md bg-gray-50 text-gray-600 font-medium h-10 text-sm">
                          +88
                        </div>
                        <FormControl>
                          <Input
                            placeholder="017XXXXXXXX"
                            type="tel"
                            maxLength={11}
                            disabled={loading}
                            autoFocus
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-teal-900 text-white hover:bg-teal-700 font-serif text-md mt-4"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </Button>

                <div className="text-center mt-4">
                  <Button
                    type="button"
                    variant="link"
                    className="text-gray-500 hover:text-gray-700 text-sm font-serif p-0"
                    onClick={handleBackToLogin}
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          )}

          {step === "otp" && (
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="w-full">
                <div className="text-center mb-6">
                  <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center justify-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                      <p className="text-sm text-gray-600">
                        Code sent to <span className="font-semibold text-teal-900">+88 {phone}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={otpForm.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <InputOTP maxLength={4} {...field} disabled={!!limitError}>
                          <InputOTPGroup className="gap-2">
                            {[0, 1, 2, 3].map((index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className="h-12 w-12 border-gray-300 focus:border-teal-600 focus:ring-teal-600 text-lg"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>

                      <div className="flex flex-col items-center mt-6 space-y-3 w-full">
                        {!limitError &&
                          (!isTimerLoading && timeLeft > 0 ? (
                            <div className="flex items-center text-sm text-teal-700 font-medium bg-teal-50 px-4 py-1.5 rounded-full">
                              <Clock size={14} className="mr-2" /> Expires in:{" "}
                              <span className="ml-1 font-bold">{formatTime(timeLeft)}</span>
                            </div>
                          ) : (
                            <div className="text-sm text-red-500 font-medium bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                              Code Expired
                            </div>
                          ))}

                        <FormDescription className="text-center w-full pt-2">
                          Didn't get your code?{" "}
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={timeLeft > 0 || !!limitError}
                            className={`font-semibold ml-1 transition-colors ${
                              timeLeft > 0 || !!limitError
                                ? "text-gray-400 cursor-not-allowed"
                                : "text-teal-700 hover:text-teal-900 hover:underline cursor-pointer"
                            }`}
                          >
                            Resend
                          </button>
                        </FormDescription>
                      </div>

                      <FormMessage className="mt-2 text-center" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-teal-900 text-white hover:bg-teal-700 font-serif text-lg h-12 mt-4 transition-all"
                  disabled={loading || timeLeft === 0 || !!limitError}
                >
                  {loading ? "Verifying..." : "Verify & Proceed"}
                </Button>
              </form>
            </Form>
          )}

          {step === "password" && (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="w-full">
                <div className="space-y-4">
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Min. 6 characters"
                            disabled={loading}
                            autoFocus
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Re-enter password" disabled={loading} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-teal-900 text-white hover:bg-teal-700 font-serif text-md mt-6"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
