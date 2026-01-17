import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo1 from "@/assets/images/LogoLogin.png";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { VerifyServiceProvider } from "@/api/AuthApi";

const FormSchema = z.object({
  pin: z.string().min(4, { message: "OTP must be 4 digits." }).max(4, { message: "OTP must be 4 digits." }),
});

export default function SpMobileVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { phone } = location.state || {};

  const isMissingData = !phone;

  useEffect(() => {
    if (isMissingData) {
      const timer = setTimeout(() => {
        navigate("/service_provider/registration", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isMissingData, navigate]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    setSubmitError(null);
    let valid = true;

    const pin = (values.pin ?? "").toString();

    if (pin !== "1234") {
      form.setError("pin", {
        type: "manual",
        message: "Wrong OTP. Please try again.",
      });
      return;
    }

    if (valid) {
      setSubmitting(true);
      try {
        await VerifyServiceProvider({ phone });
        navigate("/service-provider-dashboard", { replace: true });
      } catch (err: any) {
        setSubmitError(err.message || "Verification failed");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (isMissingData) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md w-full">
          <div className="flex justify-center mb-4 text-amber-500">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Missing Information</h2>
          <p className="text-gray-600">Please fill in the registration details first.</p>
          <p className="text-sm text-gray-500 mt-4">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200">
      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="w-full max-w-md mx-auto space-y-6 bg-white rounded-xl shadow-2xl p-8"
          >
            <div className="text-center mb-4">
              <div className="flex items-center justify-center mt-2 mb-4">
                <img src={logo1} alt="Fixora Logo" className="h-20 w-auto" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-teal-700">Verify your phone number</h2>
              <p className="text-base text-gray-600 font-serif">Please enter the code sent to your phone.</p>
              {phone && <p className="text-sm text-gray-600 mt-1">Verifying: {phone}</p>}
            </div>

            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormLabel>One-Time Password</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={4} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormDescription className="text-center">
                    Didn't get your code?{" "}
                    <span
                      className="text-teal-900 cursor-pointer hover:underline"
                      onClick={() => {
                        console.info("Resend OTP clicked");
                      }}
                    >
                      Resend
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && <div className="text-sm text-red-600 text-center">{submitError}</div>}

            <Button
              type="submit"
              className="w-full bg-teal-900 text-white hover:bg-teal-700 font-serif text-md"
              disabled={submitting}
            >
              {submitting ? "Verifying..." : "Submit"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
