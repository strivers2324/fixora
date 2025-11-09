import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import logo1 from "@/assets/images/LogoLogin.png";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";

export function UserRegistrationForm() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let isValid = true;

    // Phone Validation
    if (!phone) {
      setPhoneError("Please enter your phone number.");
      isValid = false;
    } else if (!/^(\+8801[3-9]\d{8}|01[3-9]\d{8})$/.test(phone)) {
      setPhoneError("Please enter a valid Bangladeshi phone number.");
      isValid = false;
    } else {
      setPhoneError("");
    }

    // Password Validation
    if (!password) {
      setPasswordError("Please enter a password.");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      isValid = false;
    } else {
      setPasswordError("");
    }

    // Confirm Password Validation
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
      navigate("/UserNumberVerification", { state: { phone } });
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200">
      <div className="w-full max-w-xl py-8">
        <Card className="rounded-xl shadow-2xl bg-white">
          <CardContent className="px-6 py-10 flex flex-col justify-center">
            <form
              className="w-full max-w-md mx-auto"
              onSubmit={handleSubmit}
              noValidate
            >
              <FieldGroup>
                {/* Logo */}
                <div className="flex flex-col items-center mb-6">
                  <img src={logo1} alt="Fixora Logo" className="h-20 w-auto" />
                </div>

                {/* Phone Field */}
                <Field>
                  <FieldLabel htmlFor="Phone">Phone Number</FieldLabel>
                  <Input
                    id="Phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    pattern="(\+8801[3-9]\d{8}|01[3-9]\d{8})"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                  <p className="text-sm text-gray-600 font-serif mt-0">
                    We'll send you an OTP to confirm your number.
                  </p>
                  {phoneError && (
                    <span className="text-sm text-red-600">{phoneError}</span>
                  )}
                </Field>

                {/* Password Field */}
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
                          <line
                            x1="21"
                            y1="3"
                            x2="3"
                            y2="21"
                            stroke="currentColor"
                            strokeWidth="1.75"
                          />
                        </Eye>
                      )}
                    </button>
                  </div>
                  {passwordError && (
                    <span className="text-sm text-red-600">
                      {passwordError}
                    </span>
                  )}
                </Field>

                {/* Confirm Password Field */}
                <Field>
                  <FieldLabel htmlFor="confirm-password">
                    Confirm Password
                  </FieldLabel>
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
                          <line
                            x1="21"
                            y1="3"
                            x2="3"
                            y2="21"
                            stroke="currentColor"
                            strokeWidth="1.75"
                          />
                        </Eye>
                      )}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <span className="text-sm text-red-600">
                      {confirmPasswordError}
                    </span>
                  )}
                </Field>

                {/* Continue Button */}
                <Field>
                  <Button
                    type="submit"
                    className="bg-teal-900 text-white hover:bg-teal-700 font-serif text-md w-full"
                  >
                    Continue
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Or
                </FieldSeparator>
                <div className="text-center font-serif text-md">
                  {"Already have an account? "}
                  <Link
                    to="/LoginForm"
                    className="text-teal-900 hover:text-teal-700 hover:underline text-md font-serif no-underline"
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
