import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import { Field, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RegisterServiceProvider, GetProfessions } from "@/api/AuthApi";

interface ProfessionType {
  id: number;
  profession_name: string;
}

export function SpRegistrationForm() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [professionsList, setProfessionsList] = useState<ProfessionType[]>([]);
  const [profession, setProfession] = useState("");
  const [profError, setProfError] = useState("");

  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await GetProfessions();
        setProfessionsList(data ?? []);
      } catch (error) {
        console.error("Failed to load professions", error);
      }
    };
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    let isValid = true;

    if (!profession) {
      setProfError("Please select a profession.");
      isValid = false;
    } else {
      setProfError("");
    }

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

    if (!agree) {
      setAgreeError("You must agree to the terms.");
      isValid = false;
    } else {
      setAgreeError("");
    }

    if (isValid) {
      setIsLoading(true);
      try {
        const formattedPhone = "+88" + phone;

        const response = await RegisterServiceProvider({
          phone: formattedPhone,
          password,
          profession_id: parseInt(profession),
        });

        if (response && response.otp_id) {
          navigate(`/service-provider/verify/otp/${response.otp_id}`, {
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
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center md:items-center px-4 bg-gray-200 dark:bg-zinc-950 transition-colors duration-300 gap-y-6 md:gap-x-8">
      <div className="flex-1 w-full max-w-xs md:max-w-none flex flex-col items-center justify-start">
        <h2 className="text-lg md:text-2xl font-bold font-serif text-teal-700 dark:text-teal-400 mb-3 md:max-h-80 md:h-auto text-center md:text-left transition-colors">
          Want to join Fixora as a Service Provider?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 font-serif text-sm md:text-base mb-4 text-center md:text-left transition-colors">
          Here's what you'll need to get started:
        </p>
        <ul className="inline-flex flex-col items-center gap-y-2 md:gap-y-4 text-gray-700 font-serif text-base md:text-lg dark:text-white transition-colors">
          <li className="flex items-center gap-x-3">
            <img
              src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Tools.webp"
              alt="Toolbox"
              className="h-16 w-16 md:h-20 md:w-20 object-contain"
            />
            <span>Own toolbox</span>
          </li>
          <li className="flex items-center gap-x-3">
            <img
              src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Nid.webp"
              alt="NID Card"
              className="h-16 w-16 md:h-20 md:w-20 object-contain"
            />
            <span>National ID</span>
          </li>
          <li className="flex items-center gap-x-3">
            <img
              src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Smartphone.webp"
              alt="Smartphone"
              className="h-16 w-16 md:h-20 md:w-20 object-contain"
            />
            <span>Smartphone</span>
          </li>
        </ul>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Card className="w-full max-w-xl mx-auto rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border-none transition-colors duration-300">
          <CardContent className="w-full px-6 md:px-10 py-10 md:py-12 flex flex-col justify-center">
            <form className="w-full max-w-md mx-auto" onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center mt-2 mb-4">
                    <img
                      src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/LogoLogin.webp"
                      alt="Fixora Logo"
                      className="h-20 w-auto transition-all duration-300 dark:bg-white dark:p-2 dark:rounded-xl dark:shadow-sm"
                    />
                  </div>
                  <p className="text-balance font-serif text-lg text-teal-900 dark:text-teal-400 transition-colors">
                    Start earning today—join Fixora as a Service Provider and grow your income with your skills!
                  </p>
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

                  <p className="text-sm text-gray-600 font-serif mt-0">We'll send you an OTP to confirm your number.</p>
                  {phoneError && <span className="text-sm text-red-600">{phoneError}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="profession">Profession</FieldLabel>
                  <Select
                    value={profession}
                    onValueChange={(v) => {
                      setProfession(v);
                      setProfError("");
                    }}
                  >
                    <SelectTrigger id="profession">
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {professionsList.length > 0 ? (
                        professionsList.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.profession_name}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-gray-500">Loading professions...</div>
                      )}
                    </SelectContent>
                  </Select>
                  {profError && <span className="text-sm text-red-600 mt-2 block">{profError}</span>}
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Create Password</FieldLabel>
                  </div>
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
                  <div className="flex items-center">
                    <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
                  </div>
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
                  <div className="flex items-center gap-2">
                    <Input
                      id="terms"
                      type="checkbox"
                      required
                      className="w-4 h-4"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-serif text-gray-900 dark:text-gray-300 transition-colors"
                    >
                      I agree to all the{" "}
                      <Link
                        to="/terms"
                        className="text-teal-900 hover:text-teal-700 hover:underline font-serif dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer transition-colors"
                      >
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>
                  {agreeError && <span className="text-sm text-red-600">{agreeError}</span>}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="bg-teal-900 text-white hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 font-serif text-md w-full transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Continue"}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">Or</FieldSeparator>
                <div className="text-center font-serif text-md text-gray-700 dark:text-gray-300 transition-colors">
                  {"Already have an account? "}
                  <Link
                    to="/login"
                    className="text-teal-900 hover:text-teal-700 hover:underline text-md font-serif no-underline dark:text-teal-400 dark:hover:text-teal-300 cursor-pointer transition-colors"
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
export default SpRegistrationForm;
