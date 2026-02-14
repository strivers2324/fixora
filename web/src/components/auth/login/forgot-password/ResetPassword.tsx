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
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200">
      <Card className="w-full max-w-md mx-auto rounded-xl shadow-2xl bg-white animate-in zoom-in duration-300">
        <CardContent className="w-full px-6 md:px-10 py-10 flex flex-col justify-center">
          <div className="mb-4">
            {success && (
              <Alert className="bg-emerald-50 border-emerald-200 text-emerald-800 mb-4">
                <AlertDescription className="font-medium text-center">{success}</AlertDescription>
              </Alert>
            )}
            {generalError && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 mb-4">
                <AlertDescription className="font-medium text-center">{generalError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center mb-6">
            <div className="flex items-center justify-center mt-2 mb-2">
              <img src={logo1} alt="Fixora Logo" className="h-16 w-auto" />
            </div>
            <h2 className="text-xl font-serif text-teal-900">Set New Password</h2>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
