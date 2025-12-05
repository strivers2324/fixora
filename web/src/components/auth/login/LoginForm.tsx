import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo1 from "@/assets/images/LogoLogin.png";
import Login from "@/assets/images/LoginForm.png";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Eye, User, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SignUpRolePopup } from "../registration/selection/SignUpPopup";
import { login } from "@/api/AuthApi";
import { Role } from "@/enums/UserRole";

export default function LoginForm() {
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState<Role>(Role.USER);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ErrorMessage = (rawError: string) => {
    const msg = rawError.toLowerCase();

    if (msg.includes("network") || msg.includes("fetch") || msg.includes("connection")) {
      return "Unable to connect. Please check your internet connection.";
    }
    return rawError;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const phone = (e.currentTarget.elements.namedItem("Phone") as HTMLInputElement).value;
    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;

    try {
      await login({ phone, password, role });
      if (role === Role.USER) {
        navigate("/user_dashboard");
      } else {
        navigate("/service-provider-dashboard");
      }
    } catch (err: any) {
      const rawMessage = err.message || "An unexpected error occurred";
      setError(ErrorMessage(rawMessage));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center px-4 bg-gray-200 gap-y-6 md:gap-x-8">
      {/* left side */}
      <div className="flex-1 flex flex-col items-center justify-start">
        <img
          src={Login}
          alt="Login Illustration"
          className="h-24 w-auto object-contain mb-2 md:max-h-80 md:h-auto"
          draggable={false}
        />
        <div className="text-center">
          <p className="text-gray-700 font-serif text-xl">
            Fixora helps to simplify your repair and service experience. Sign in or create an account to get started!
          </p>
        </div>
      </div>

      {/* right side */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Card className="w-full max-w-xl mx-auto rounded-xl shadow-2xl bg-white">
          <CardContent className="w-full px-6 md:px-10 py-10 md:py-12 flex flex-col justify-center">
            <form className="w-full max-w-md mx-auto" onSubmit={handleLogin}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center mt-2 mb-4">
                    <img src={logo1} alt="Fixora Logo" className="h-20 w-auto" />
                  </div>
                  <p className="text-muted-foreground text-balance font-serif">Login to your Fixora account</p>
                </div>

                {/*Role Selection Section*/}
                <div className="mb-4">
                  <FieldLabel className="mb-2 block text-center"></FieldLabel>
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
                      <User size={18} />
                      User
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
                      <Briefcase size={18} />
                      Service Provider
                    </button>
                  </div>
                </div>

                <Field>
                  <FieldLabel htmlFor="Phone">Phone Number</FieldLabel>
                  <Input
                    id="Phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    pattern="(\+8801[3-9]\d{8}|01[3-9]\d{8})"
                    required
                    disabled={loading}
                  />
                </Field>
                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      to="/forgot-password"
                      className="text-teal-900 hover:text-teal-700 ml-auto text-sm underline-offset-2 hover:underline font-serif"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={visible ? "text" : "password"}
                      required
                      className="pr-10"
                      disabled={loading}
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
                </Field>
                {error && <div className="text-red-600 text-sm py-1 text-center">{error}</div>}
                <Field>
                  <Button
                    type="submit"
                    className="bg-teal-900 text-white hover:bg-teal-700 font-serif text-md"
                    disabled={loading}
                  >
                    {loading ? "Logging In..." : "Log In"}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or</FieldSeparator>
                <div className="text-center font-serif text-md">
                  {"Don't have an account? "}
                  <SignUpRolePopup>
                    <span className="text-teal-900 hover:text-teal-700 hover:underline text-md font-serif no-underline cursor-pointer">
                      Sign up
                    </span>
                  </SignUpRolePopup>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
