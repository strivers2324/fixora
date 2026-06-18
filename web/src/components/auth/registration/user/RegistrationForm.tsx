import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { RegisterUser } from "@/api/AuthApi";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";

export function UserRegistrationForm() {
  const navigate = useNavigate();

  const [visible, setVisible] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let isValid = true;

    if (!phone) {
      setPhoneError("Please enter your phone number.");
      isValid = false;
    } else if (!/^01[3-9]\d{8}$/.test(phone)) {
      setPhoneError("Please enter a valid 11-digit phone number (e.g., 017XXXXXXXX).");
      isValid = false;
    } else {
      setPhoneError("");
    }

    if (!password) {
      setPasswordError("Please enter a password.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password.");
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Passwords do not match.");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (isValid) {
      setIsLoading(true);
      try {
        const formattedPhone = "+88" + phone;

        const response = await RegisterUser({
          phone: formattedPhone,
          password,
        });
        if (response && response.otp_id) {
          navigate(`/user/verify/otp/${response.otp_id}`, {
            state: {
              phone: formattedPhone,
              from: "registration",
            },
          });
        }
      } catch (error: any) {
        setPhoneError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full max-w-xl py-8">
        <Card className="rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border-none transition-colors duration-300">
          <CardContent className="px-6 py-10 flex flex-col justify-center">
            <form className="w-full max-w-md mx-auto" onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                <div className="flex flex-col items-center mb-6">
                  <img
                    src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/LogoLogin.webp"
                    alt="Fixora Logo"
                    className="h-20 w-auto transition-all duration-300 dark:bg-white dark:p-2 dark:rounded-xl dark:shadow-sm"
                  />
                </div>

                <Field>
                  <FieldLabel htmlFor="Phone">Phone Number</FieldLabel>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center px-3 border rounded-md bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 text-gray-600 dark:text-gray-300 font-medium h-10 text-sm transition-colors">
                      +88
                    </div>
                    <Input
                      id="Phone"
                      type="tel"
                      placeholder="017XXXXXXXX"
                      maxLength={11}
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-serif mt-0 transition-colors">
                    We'll send you an OTP to confirm your number.
                  </p>
                  {phoneError && <span className="text-sm text-red-600">{phoneError}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Create Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={visible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={visible ? "Hide password" : "Show password"}
                      onClick={() => setVisible((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {!visible ? (
                        <Eye size={20} strokeWidth={2} />
                      ) : (
                        <Eye size={20} strokeWidth={2}>
                          <line x1="21" y1="3" x2="3" y2="21" stroke="currentColor" strokeWidth="1.75" />
                        </Eye>
                      )}
                    </button>
                  </div>
                  {passwordError && <span className="text-sm text-red-600">{passwordError}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={visible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      aria-label={visible ? "Hide password" : "Show password"}
                      onClick={() => setVisible((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                    >
                      {!visible ? (
                        <Eye size={20} strokeWidth={2} />
                      ) : (
                        <Eye size={20} strokeWidth={2}>
                          <line x1="21" y1="3" x2="3" y2="21" stroke="currentColor" strokeWidth="1.75" />
                        </Eye>
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && <span className="text-sm text-red-600">{confirmPasswordError}</span>}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="bg-teal-900 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 font-serif text-md w-full transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Continue"}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or</FieldSeparator>
                <div className="text-center font-serif text-md text-gray-700 dark:text-gray-300 transition-colors">
                  {"Already have an account? "}
                  <Link
                    to="/login"
                    className="text-teal-900 dark:text-teal-400 dark:hover:text-teal-300 hover:text-teal-700 hover:underline text-md font-serif no-underline cursor-pointer transition-colors"
                  >
                    Log In
                  </Link>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default UserRegistrationForm;
