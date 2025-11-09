import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import Toolbox from "@/assets/images/Tools.png";
import NID from "@/assets/images/Nid.png";
import Phone from "@/assets/images/Smartphone.png";
import logo1 from "@/assets/images/LogoLogin.png";

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const professions = [
  { value: "electrician", label: "Electrician" },
  { value: "ac_technician", label: "AC Technician" },
  { value: "refrigerator_mechanic", label: "Refrigerator Mechanic" },
  { value: "plumber", label: "Plumber" },
  { value: "carpenter", label: "Carpenter" },
  { value: "cctv_installer", label: "CCTV Installer" },
  { value: "broadband_provider", label: "Broadband Internet Provider" },
  { value: "inverter_technician", label: "IPS/Inverter Technician" },
  { value: "washing_machine_technician", label: "Washing Machine Technician" },
  { value: "computer_technician", label: "Computer Technician" },
  { value: "tv_technician", label: "TV Technician" },
  { value: "automobile_mechanic", label: "Automobile Mechanic" },
  { value: "lift_technician", label: "Lift Technician" },
  { value: "water_pump_technician", label: "Water Pump Technician" },
  { value: "home_appliance_technician", label: "Home Appliance Technician" },
];

export function SpRegistrationForm() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
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

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    } else if (
      !/^(\+8801[3-9]\d{8}|01[3-9]\d{8})$/.test(phone)
    ) {
      setPhoneError("Please enter a valid Bangladeshi phone number.");
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
      navigate("/SpNumberVerification", { state: { phone } });
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center md:items-center px-4 bg-gray-200 gap-y-6 md:gap-x-8">
      {/* left side */}
      <div className="flex-1 w-full max-w-xs md:max-w-none flex flex-col items-center justify-start">
        <h2 className="text-lg md:text-2xl font-bold font-serif text-teal-700 mb-3 md:max-h-80 md:h-auto text-center md:text-left">
          Want to join Fixora as a Service Provider?
        </h2>
        <p className="text-gray-700 font-serif text-sm md:text-base mb-4 text-center md:text-left">
          Here's what you'll need to get started:
        </p>
        <ul className="inline-flex flex-col items-cennter gap-y-2 md:gap-y-4 text-gray-700 font-serif text-base md:text-lg">
          <li className="flex items-center gap-x-3">
            <img src={Toolbox} alt="Toolbox" className="h-16 w-16 md:h-20 md:w-20 object-contain" />
            <span>Own toolbox</span>
          </li>
          <li className="flex items-center gap-x-3">
            <img src={NID} alt="NID Card" className="h-16 w-16 md:h-20 md:w-20 object-contain" />
            <span>National ID</span>
          </li>
          <li className="flex items-center gap-x-3">
            <img src={Phone} alt="Smartphone" className="h-16 w-16 md:h-20 md:w-20 object-contain" />
            <span>Smartphone</span>
          </li>
        </ul>
      </div>
      {/* right side */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Card className="w-full max-w-xl mx-auto rounded-xl shadow-2xl bg-white">
          <CardContent className="w-full px-6 md:px-10 py-10 md:py-12 flex flex-col justify-center">
            <form className="w-full max-w-md mx-auto" onSubmit={handleSubmit} noValidate>
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center mt-2 mb-4">
                    <img src={logo1} alt="Fixora Logo" className="h-20 w-auto" />
                  </div>
                  <p className="text-balance font-serif text-lg color-teal-900">
                    Start earning today—join Fixora as a Service Provider and grow your income with your skills!
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="Phone">Phone Number</FieldLabel>
                  <Input
                    id="Phone"
                    type="tel"
                    placeholder="01XXXXXXXXX"
                    pattern="(\+8801[3-9]\d{8}|01[3-9]\d{8})"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <p className="text-sm text-gray-600 font-serif mt-0">
                    We'll send you an OTP to confirm your number.
                  </p>
                  {phoneError && <span className="text-sm text-red-600">{phoneError}</span>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="profession">Profession</FieldLabel>
                  <Select value={profession} onValueChange={v => {
                    setProfession(v);
                    setProfError("");
                  }}>
                    <SelectTrigger id="profession">
                      <SelectValue placeholder="Select profession" />
                    </SelectTrigger>
                    <SelectContent>
                      {professions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {profError && (
                    <span className="text-sm text-red-600 mt-2 block">{profError}</span>
                  )}
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
                      onChange={e => setPassword(e.target.value)}
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
                      onChange={e => setConfirmPassword(e.target.value)}
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
                  {confirmPasswordError && (<span className="text-sm text-red-600">{confirmPasswordError}</span>)}
                </Field>

                <Field>
                  <div className="flex items-center gap-2">
                    <Input
                      id="terms"
                      type="checkbox"
                      required
                      className="w-4 h-4"
                      checked={agree}
                      onChange={e => setAgree(e.target.checked)}
                    />
                    <label htmlFor="terms" className="text-sm font-serif">
                      I agree to all the{" "}
                      <Link to="/terms" className="text-teal-900 hover:text-teal-700 hover:underline font-serif">
                        Terms & Conditions
                      </Link>
                    </label>
                  </div>
                  {agreeError && (<span className="text-sm text-red-600">{agreeError}</span>)}
                </Field>

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

export default SpRegistrationForm;