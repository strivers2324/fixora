import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import logo1 from "@/assets/images/LogoLogin.png";
import Login from "@/assets/images/LoginForm.png";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { useState } from "react"
import { Eye } from "lucide-react"
import { Link } from "react-router-dom"

export default function LoginForm() {
    const [visible, setVisible] = useState(false);

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
                        <form className="w-full max-w-md mx-auto">
                            <FieldGroup>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <div className="flex items-center justify-center mt-2 mb-4">
                                        <img src={logo1} alt="Fixora Logo" className="h-20 w-auto" />
                                    </div>
                                    <p className="text-muted-foreground text-balance font-serif">
                                        Login to your Fixora account
                                    </p>
                                </div>
                                <Field>
                                    <FieldLabel htmlFor="email">Email</FieldLabel>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
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
                                </Field>
                                <Field>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="terms"
                                            type="checkbox"
                                            required
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="terms" className="text-sm font-serif">
                                            I agree to all the{" "}
                                            <Link to="/terms" className="text-teal-900 hover:text-teal-700 hover:underline font-serif">
                                                Terms & Conditions
                                            </Link>
                                        </label>
                                    </div>
                                </Field>
                                <Field>
                                    <Button
                                        type="submit"
                                        className="bg-teal-900 text-white hover:bg-teal-700 font-serif text-md"
                                    >
                                        Log In
                                    </Button>
                                </Field>
                                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                    Or
                                </FieldSeparator>
                                <div className="text-center font-serif text-md">
                                    {"Don't have an account? "}
                                    <Link
                                        to="/signup"
                                        className="text-teal-900 hover:text-teal-700 hover:underline text-md font-serif no-underline"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            </FieldGroup>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div >
    )
}