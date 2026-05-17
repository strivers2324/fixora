import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import logo1 from "@/assets/images/LogoLogin.png";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResetPassword } from "@/api/AuthApi";
import { Eye, EyeOff } from "lucide-react";

const PasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken = location.state?.reset_token || null;

  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      navigate("/forgot-password");
    }
  }, [resetToken, navigate]);

  const passwordForm = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

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
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setGeneralError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!resetToken) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200 dark:bg-zinc-950 transition-colors duration-300">
      <Card className="w-full max-w-md mx-auto rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border-none animate-in zoom-in duration-300 transition-colors">
        <CardContent className="w-full px-6 md:px-10 py-10 flex flex-col justify-center">
          <div className="mb-4">
            {success && (
              <Alert className="bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-400 mb-4 transition-colors">
                <AlertDescription className="font-medium text-center">{success}</AlertDescription>
              </Alert>
            )}
            {generalError && (
              <Alert
                variant="destructive"
                className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900 text-red-800 dark:text-red-400 mb-4 transition-colors"
              >
                <AlertDescription className="font-medium text-center">{generalError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center mb-6">
            <div className="flex items-center justify-center mt-2 mb-2">
              <img
                src={logo1}
                alt="Fixora Logo"
                className="h-16 w-auto transition-all duration-300 dark:bg-white dark:p-2 dark:rounded-xl dark:shadow-sm"
              />
            </div>
            <h2 className="text-xl font-serif text-teal-900 dark:text-slate-300 transition-colors">Set New Password</h2>
          </div>

          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="w-full">
              <div className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300 transition-colors">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 6 characters"
                            disabled={loading}
                            autoFocus
                            className="dark:bg-zinc-950 dark:border-zinc-800 transition-colors pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="dark:text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300 transition-colors">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter password"
                            disabled={loading}
                            className="dark:bg-zinc-950 dark:border-zinc-800 transition-colors pr-10"
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="dark:text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-teal-900 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 font-serif text-md mt-6 transition-colors"
                disabled={loading}
              >
                {loading ? "Updating..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
