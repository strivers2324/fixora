import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Clock, X, ChevronLeft, CheckCircle2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Role } from "@/enums/UserRole";
import { toast } from "sonner";

import { VerifyServiceProviderPhone, VerifyUserPhone, UpdatePhoneAndResend, VerifyOTP } from "@/api/AuthApi";
import { GetOTPInfo, ResendOTP } from "@/api/OTPApi";
import { useAccountStore } from "@/store/AccountStore";

const OtpSchema = z.object({
  pin: z.string().min(4, "OTP must be 4 digits").max(4, "OTP must be 4 digits"),
});

const PhoneSchema = z.object({
  phone: z.string().min(11, "Phone number must be at least 11 digits"),
});

interface MobileVerificationProps {
  type?: Role;
  isForgotPassword?: boolean;
}

export default function MobileVerification({ type, isForgotPassword = false }: MobileVerificationProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { otpId } = useParams();
  const { setVerified, logout, isAuthenticated, account } = useAccountStore();

  const flowType = location.state?.from || "unknown";
  const [currentOtpId, setCurrentOtpId] = useState<string | null>(otpId || null);
  const [displayPhone, setDisplayPhone] = useState<string>(location.state?.phone || "");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerLoading, setIsTimerLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [limitError, setLimitError] = useState<string | null>(null);

  const otpForm = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
    defaultValues: { pin: "" },
  });

  const phoneForm = useForm<z.infer<typeof PhoneSchema>>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: { phone: displayPhone },
  });

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  useEffect(() => {
    if (currentOtpId) {
      const storedError = localStorage.getItem(`otp_limit_${currentOtpId}`);
      if (storedError) {
        setLimitError(storedError);
        setTimeLeft(0);
      }
    }
  }, [currentOtpId]);

  const fetchOTPStatus = useCallback(
    async (id: string) => {
      setIsTimerLoading(true);
      try {
        const data = await GetOTPInfo(id);
        if (data) {
          if (data.phone) {
            setDisplayPhone(data.phone);
            phoneForm.setValue("phone", data.phone);
          }
          if (data.expires_at) {
            const expiresAt = new Date(data.expires_at).getTime();
            const now = Date.now();
            const diff = Math.floor((expiresAt - now) / 1000);
            setTimeLeft(diff > 0 ? diff : 0);
          }
        }
      } catch (error: any) {
        if (error.response?.status === 429) {
          const msg = error.message || "Limit reached.";
          setLimitError(msg);
          localStorage.setItem(`otp_limit_${id}`, msg);
          setTimeLeft(0);
        }
      } finally {
        setIsTimerLoading(false);
      }
    },
    [phoneForm],
  );

  useEffect(() => {
    if (currentOtpId) fetchOTPStatus(currentOtpId);
    else {
      const fallback = type === Role.SERVICE_PROVIDER ? "/service-provider/registration" : "/user/registration";
      setTimeout(() => navigate(fallback), 2000);
    }
  }, [currentOtpId, fetchOTPStatus, navigate, type]);

  useEffect(() => {
    if (timeLeft <= 0 || limitError) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, limitError]);

  const handleVerify = async (values: z.infer<typeof OtpSchema>) => {
    if (!currentOtpId || limitError) return;
    setSubmitting(true);
    setSuccessMessage(null);

    const isRegistrationFlow = flowType === "registration" || !isAuthenticated || !account;

    try {
      if (isForgotPassword) {
        const response = await VerifyOTP({ otp_id: currentOtpId, otp_code: values.pin });

        if (response.reset_token) {
          setSuccessMessage("OTP Verified! Redirecting...");
          toast.success("OTP Verified!");

          setTimeout(() => {
            navigate("/reset-password", {
              state: { reset_token: response.reset_token },
            });
          }, 1000);
        } else {
          throw new Error("Verification successful but token missing.");
        }
        return;
      }

      if (isRegistrationFlow) {
        logout();
        localStorage.removeItem("auth-storage");
      }

      if (type === Role.SERVICE_PROVIDER) {
        await VerifyServiceProviderPhone({ otp_id: currentOtpId, otp_code: values.pin });
      } else {
        await VerifyUserPhone({ otp_id: currentOtpId, otp_code: values.pin });
      }

      if (isRegistrationFlow) {
        logout();
        localStorage.removeItem("auth-storage");
      }

      localStorage.removeItem(`otp_limit_${currentOtpId}`);
      const msg = "Verification successful!";
      toast.success(msg);
      setSuccessMessage(msg);
      setVerified();

      setTimeout(() => {
        if (isRegistrationFlow) {
          logout();
          localStorage.removeItem("auth-storage");
          navigate("/login", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 1000);
    } catch (err: any) {
      otpForm.setError("pin", { message: err.message || "Invalid Code" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!currentOtpId || limitError) return;
    setSuccessMessage(null);
    try {
      const res = await ResendOTP(currentOtpId);
      const newId = res.otp_id;
      setCurrentOtpId(newId);
      navigate(location.pathname.replace(currentOtpId, newId), { replace: true, state: location.state });
      setSuccessMessage("Code sent successfully!");
      fetchOTPStatus(newId);
    } catch (err: any) {
      if (err.response?.status === 429 || err.message?.toLowerCase().includes("limit")) {
        const msg = err.message || "Maximum resend limit reached.";
        setLimitError(msg);
        localStorage.setItem(`otp_limit_${currentOtpId}`, msg);
        setTimeLeft(0);
      } else {
        toast.error(err.message || "Failed to resend code");
      }
    }
  };

  const handleUpdatePhone = async (values: z.infer<typeof PhoneSchema>) => {
    if (!currentOtpId || limitError) return;
    setIsTimerLoading(true);
    try {
      const res = await UpdatePhoneAndResend(currentOtpId, values.phone);
      const newId = res.otp_id;
      setCurrentOtpId(newId);
      setDisplayPhone(values.phone);
      setIsEditing(false);
      setSuccessMessage("Code sent successfully!");
      navigate(location.pathname.replace(currentOtpId, newId), {
        replace: true,
        state: { ...location.state, phone: values.phone },
      });
      fetchOTPStatus(newId);
    } catch (err: any) {
      if (err.response?.status === 429 || err.message?.toLowerCase().includes("limit")) {
        const msg = err.message || "Maximum resend limit reached.";
        setLimitError(msg);
        localStorage.setItem(`otp_limit_${currentOtpId}`, msg);
        setTimeLeft(0);
        setIsEditing(false);
      } else {
        toast.error(err.message || "Failed to update phone");
      }
    } finally {
      setIsTimerLoading(false);
    }
  };

  if (!currentOtpId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-950 transition-colors">
        <div className="text-center p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-md border dark:border-zinc-800">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-400 mb-2" />
          <p className="text-gray-700 dark:text-gray-300">Invalid Session. Redirecting...</p>
        </div>
      </div>
    );
  }

  if (limitError && isEditing) setIsEditing(false);

  if (isEditing) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200 dark:bg-zinc-950 transition-colors duration-300">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 animate-in slide-in-from-right duration-300 transition-colors">
          <div className="flex items-center mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(false)}
              className="mr-2 -ml-3 text-gray-500 hover:text-teal-700 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
            >
              <ChevronLeft size={24} />
            </Button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors">Edit phone number</h2>
          </div>
          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(handleUpdatePhone)} className="space-y-6">
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center px-4 border rounded-md bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-medium select-none transition-colors">
                        +880
                      </div>
                      <FormControl>
                        <Input
                          placeholder="1700000000"
                          className="flex-1 h-11 text-base focus-visible:ring-teal-600 dark:bg-zinc-950 dark:border-zinc-800 transition-colors"
                          disabled={isTimerLoading}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="dark:text-red-400" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-teal-900 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 h-11 text-md font-medium transition-colors"
                disabled={isTimerLoading}
              >
                {isTimerLoading ? "Sending..." : "Receive code"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Form {...otpForm}>
          <form
            onSubmit={otpForm.handleSubmit(handleVerify)}
            className="w-full max-w-md mx-auto space-y-6 bg-white dark:bg-zinc-900 rounded-xl shadow-2xl p-8 animate-in zoom-in duration-300 transition-colors"
          >
            {successMessage && !limitError && (
              <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 flex items-center animate-in fade-in slide-in-from-top-2 transition-colors">
                <CheckCircle2 className="h-5 w-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <AlertTitle className="font-semibold text-emerald-900 dark:text-emerald-300">Success</AlertTitle>
                  <AlertDescription className="text-emerald-800 dark:text-emerald-400">
                    {successMessage}
                  </AlertDescription>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="ml-auto text-emerald-500 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                >
                  <X size={16} />
                </button>
              </Alert>
            )}

            {limitError && (
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 flex items-center animate-in fade-in slide-in-from-top-2 transition-colors">
                <Ban className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
                <div>
                  <AlertTitle className="font-semibold text-red-900 dark:text-red-300">Limit Reached</AlertTitle>
                  <AlertDescription className="text-red-800 dark:text-red-400 text-sm">{limitError}</AlertDescription>
                </div>
              </Alert>
            )}

            <div className="text-center mb-6">
              <div className="flex items-center justify-center mt-2 mb-4">
                <img
                  src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/LogoLogin.webp"
                  alt="Fixora Logo"
                  className="h-20 w-auto transition-all duration-300 dark:bg-white dark:p-2 dark:rounded-xl dark:shadow-sm"
                />
              </div>
              <h2 className="text-2xl font-bold font-serif text-teal-700 dark:text-slate-300 transition-colors">
                Verify your phone number
              </h2>
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-zinc-800 px-4 py-2 rounded-full border border-gray-100 dark:border-zinc-700 transition-colors">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Code sent to{" "}
                    <span className="font-semibold text-teal-900 dark:text-teal-400">{displayPhone || "..."}</span>
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={otpForm.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel className="sr-only">One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={4} {...field} disabled={!!limitError}>
                      <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3].map((index) => (
                          <InputOTPSlot
                            key={index}
                            index={index}
                            className="h-12 w-12 border-gray-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white focus:border-teal-600 dark:focus:border-teal-500 focus:ring-teal-600 text-lg transition-colors"
                          />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>

                  <div className="flex flex-col items-center mt-6 space-y-3 w-full">
                    {!limitError &&
                      (!isTimerLoading && timeLeft > 0 ? (
                        <div className="flex items-center text-sm text-teal-700 dark:text-teal-400 font-medium bg-teal-50 dark:bg-teal-900/30 px-4 py-1.5 rounded-full transition-colors">
                          <Clock size={14} className="mr-2" />
                          Expires in: <span className="ml-1 font-bold">{formatTime(timeLeft)}</span>
                        </div>
                      ) : (
                        <div className="text-sm text-red-500 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/20 px-4 py-1.5 rounded-full border border-red-100 dark:border-red-900 transition-colors">
                          Code Expired
                        </div>
                      ))}
                    <FormDescription className="text-center w-full pt-2 dark:text-gray-400">
                      Didn't get your code?{" "}
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={timeLeft > 0 || !!limitError}
                        className={`font-semibold ml-1 transition-colors ${
                          timeLeft > 0 || !!limitError
                            ? "text-gray-400 dark:text-zinc-600 cursor-not-allowed"
                            : "text-teal-700 hover:text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer"
                        }`}
                      >
                        Resend
                      </button>
                    </FormDescription>
                  </div>
                  <FormMessage className="dark:text-red-400" />
                </FormItem>
              )}
            />

            {!isForgotPassword && (
              <div className="text-center w-full">
                <button
                  type="button"
                  onClick={() => {
                    if (limitError) return;
                    setSuccessMessage(null);
                    phoneForm.setValue("phone", displayPhone);
                    setIsEditing(true);
                  }}
                  disabled={!!limitError}
                  className={`text-sm transition-all ${
                    limitError
                      ? "text-gray-400 dark:text-zinc-600 cursor-not-allowed"
                      : "text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
                  }`}
                >
                  Wrong number? Change phone number
                </button>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-teal-900 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 font-serif text-lg h-12 mt-2 transition-colors"
              disabled={submitting || timeLeft === 0 || !!limitError}
            >
              {submitting ? "Verifying..." : "Verify & Proceed"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
