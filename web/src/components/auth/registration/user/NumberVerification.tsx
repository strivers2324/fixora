import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import logo1 from "@/assets/images/LogoLogin.png";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const FormSchema = z.object({
  pin: z
    .string()
    .min(4, { message: "OTP must be 4 digits." })
    .max(4, { message: "OTP must be 4 digits." }),
});

export default function UserMobileVerification() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (data.pin === "1234") {
      navigate("/UserInformation");
    } else {
      form.setError("pin", {
        type: "manual",
        message: "Wrong OTP. Please try again.",
      });
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200">
      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-md mx-auto space-y-6 bg-white rounded-xl shadow-2xl p-8"
          >
            <div className="text-center mb-4">
              <div className="flex items-center justify-center mt-2 mb-4">
                <img src={logo1} alt="Fixora Logo" className="h-20 w-auto" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-teal-700">
                Verify your phone number
              </h2>
              <p className="text-base text-gray-600 font-serif">
                Please enter the code sent to your phone.
              </p>
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
                    Didn&apos;t get your code?{" "}
                    <span className="text-teal-900 cursor-pointer hover:underline">
                      Resend
                    </span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-teal-900 text-white hover:bg-teal-700 font-serif text-md"
            >
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
