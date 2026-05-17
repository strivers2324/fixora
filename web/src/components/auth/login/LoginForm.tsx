import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logo1 from "@/assets/images/LogoLogin.png";
import LoginImg from "@/assets/images/LoginForm.png";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Eye, User, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { SignUpRolePopup } from "../registration/selection/SignUpPopup";
import { login } from "@/api/AuthApi";
import { Role } from "@/enums/UserRole";
import { useAccountStore } from "@/store/AccountStore";

export default function LoginForm() {
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState<Role>(Role.USER);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState("");

  const setLoginSuccess = useAccountStore((state) => state.setLoginSuccess);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
    const formattedPhone = "+88" + phone;

    try {
      const res = await login({ phone: formattedPhone, password, role });

      if (res && res.accountinfo) {
        setLoginSuccess(res.accountinfo, res.otp_id);

        if (res.accountinfo.is_phone_verified) {
          navigate("/dashboard");
        } else {
          if (role === Role.SERVICE_PROVIDER) {
            navigate(`/service-provider/verify/otp/${res.otp_id}`, {
              state: {
                phone: formattedPhone,
                from: "login",
              },
            });
          } else {
            navigate(`/user/verify/otp/${res.otp_id}`, {
              state: {
                phone: formattedPhone,
                from: "login",
              },
            });
          }
        }
      } else {
        setError("Invalid response. Please try again.");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center px-4 bg-gray-200 dark:bg-zinc-800 gap-y-6 md:gap-x-8 transition-colors duration-300">
      <div className="flex-1 flex flex-col items-center justify-start">
        <img
          src={LoginImg}
          alt="Login Illustration"
          className="h-24 w-auto object-contain mb-2 md:max-h-80 md:h-auto"
          draggable={false}
        />
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 font-serif text-xl transition-colors">
            Fixora helps to simplify your repair and service experience. Sign in or create an account to get started!
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Card className="w-full max-w-xl mx-auto rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border-none transition-colors duration-300">
          <CardContent className="w-full px-6 md:px-10 py-10 md:py-12 flex flex-col justify-center">
            <form className="w-full max-w-md mx-auto" onSubmit={handleLogin}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center mt-2 mb-4">
                    <img
                      src={logo1}
                      alt="Fixora Logo"
                      className="h-20 w-auto transition-all duration-300 dark:bg-white dark:p-2 dark:rounded-xl dark:shadow-sm"
                    />
                  </div>
                  <p className="text-muted-foreground text-balance font-serif dark:text-slate-300">
                    Login to your Fixora account
                  </p>
                </div>

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
                      <User size={18} />
                      User
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
                      <Briefcase size={18} />
                      Service Provider
                    </button>
                  </div>
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
                      disabled={loading}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Link
                      to="/forgot-password"
                      className="text-teal-900 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 ml-auto text-sm underline-offset-2 hover:underline font-serif transition-colors"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
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
                    className="bg-teal-900 text-white hover:bg-teal-700 font-serif text-md w-full"
                    disabled={loading}
                  >
                    {loading ? "Logging In..." : "Log In"}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or</FieldSeparator>

                <div className="text-center font-serif text-md">
                  {"Don't have an account? "}
                  <SignUpRolePopup>
                    <span className="text-teal-900 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:underline text-md font-serif no-underline cursor-pointer transition-colors">
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
