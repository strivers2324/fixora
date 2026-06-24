import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

import { AdminLogin } from "@/api/AdminAuthApi";
import { useAdminAccountStore } from "@/store/AdminAccountStore";
import { Role } from "@/enums/UserRole";

export function AdminLoginForm() {
  const navigate = useNavigate();
  const setLoginSuccess = useAdminAccountStore((state) => state.setLoginSuccess);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await AdminLogin({ email, password });
      setLoginSuccess({ role: Role.ADMIN });
      navigate("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid login credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 bg-gray-200 dark:bg-zinc-950 transition-colors duration-300">
      <div className="w-full max-w-xl py-8">
        <Card className="rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border-none transition-colors duration-300">
          <CardContent className="px-6 py-10 flex flex-col justify-center">
            <form className="w-full max-w-md mx-auto" onSubmit={handleLogin} noValidate>
              <FieldGroup>
                <div className="flex flex-col items-center mb-6">
                  <img
                    src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/LogoLogin.webp"
                    alt="Fixora Logo"
                    className="h-20 w-auto transition-all duration-300 dark:bg-white dark:p-2 dark:rounded-xl dark:shadow-sm"
                  />
                  <h2 className="mt-4 text-2xl font-semibold text-gray-800 dark:text-gray-100 font-serif">
                    Admin Portal
                  </h2>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@fixora.com"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={visible ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Enter your password"
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
                </Field>

                {/* ব্যাকএন্ড থেকে আসা এরর দেখানোর জায়গা */}
                {error && <div className="text-red-600 text-sm py-1 text-center font-medium">{error}</div>}

                <Field className="mt-4">
                  <Button
                    type="submit"
                    className="bg-teal-900 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 font-serif text-md w-full transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Logging in..." : "Log In"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AdminLoginForm;
