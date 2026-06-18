import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Briefcase } from "lucide-react";
import { Role } from "@/enums/UserRole";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ForgotPassword } from "@/api/AuthApi";

const PhoneSchema = z.object({
  phone: z.string().regex(/^01[3-9]\d{8}$/, "Please enter a valid 11-digit phone number (e.g., 017XXXXXXXX)"),
});

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>(Role.USER);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const phoneForm = useForm<z.infer<typeof PhoneSchema>>({
    resolver: zodResolver(PhoneSchema),
    defaultValues: { phone: "" },
  });

  const onPhoneSubmit = async (values: z.infer<typeof PhoneSchema>) => {
    setGeneralError(null);
    setLoading(true);

    try {
      const response = await ForgotPassword({
        phone: "+88" + values.phone,
        role,
      });

      navigate(`/verify/otp/${response.otp_id}`, {
        state: {
          phone: values.phone,
          from: "forgot-password",
        },
      });
    } catch (err: any) {
      setGeneralError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200 dark:bg-zinc-950 transition-colors duration-300">
      <Card className="w-full max-w-md mx-auto rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border-none animate-in zoom-in duration-300 transition-colors">
        <CardContent className="w-full px-6 md:px-10 py-10 flex flex-col justify-center">
          <div className="mb-4">
            {generalError && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 mb-4">
                <AlertDescription className="font-medium text-center">{generalError}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex flex-col items-center gap-2 text-center mb-6">
            <div className="flex items-center justify-center mt-2 mb-2">
              <img
                src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/LogoLogin.webp"
                alt="Fixora Logo"
                className="h-16 w-auto transition-all duration-300 dark:bg-white dark:p-2 dark:rounded-xl dark:shadow-sm"
              />
            </div>
            <h2 className="text-xl font-serif text-teal-900 dark:text-slate-300 transition-colors">Reset Password</h2>
            <p className="text-muted-foreground text-sm font-serif">Select account type and enter your phone number.</p>
          </div>

          <Form {...phoneForm}>
            <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="w-full">
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg transition-colors">
                  <button
                    type="button"
                    onClick={() => setRole(Role.USER)}
                    className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      role === Role.USER
                        ? "bg-white dark:bg-zinc-950 text-teal-900 dark:text-teal-400 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    <User size={18} /> User
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(Role.SERVICE_PROVIDER)}
                    className={`flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      role === Role.SERVICE_PROVIDER
                        ? "bg-white dark:bg-zinc-950 text-teal-900 dark:text-teal-400 shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
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
                      <div className="flex items-center justify-center px-3 border rounded-md bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-medium h-10 text-sm transition-colors">
                        +88
                      </div>
                      <FormControl>
                        <Input
                          placeholder="017XXXXXXXX"
                          type="tel"
                          maxLength={11}
                          disabled={loading}
                          autoFocus
                          className="dark:bg-zinc-950 dark:border-zinc-800 transition-colors"
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
                className="w-full bg-teal-900 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 font-serif text-md mt-6 transition-colors"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>

              <div className="text-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  className="text-teal-900 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-serif p-0 transition-colors"
                  onClick={() => navigate("/login")}
                >
                  Back to Login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
