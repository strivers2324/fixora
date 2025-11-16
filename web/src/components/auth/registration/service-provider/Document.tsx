import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import logo1 from "@/assets/images/LogoLogin.png";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

export default function SpNIDSubmission() {
  const [nidNumber, setNidNumber] = useState("");
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);

  const [nidNumberError, setNidNumberError] = useState("");
  const [nidFrontError, setNidFrontError] = useState("");
  const [nidBackError, setNidBackError] = useState("");

  const navigate = useNavigate();

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNidFront(e.target.files[0]);
      setNidFrontError("");
    }
  };

  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNidBack(e.target.files[0]);
      setNidBackError("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;

    if (!nidNumber.trim()) {
      setNidNumberError("NID number is required.");
      valid = false;
    } else if (!/^\d{10,17}$/.test(nidNumber.trim())) {
      setNidNumberError("Enter a valid NID number.");
      valid = false;
    } else {
      setNidNumberError("");
    }

    if (!nidFront) {
      setNidFrontError("Front side image is required.");
      valid = false;
    } else {
      setNidFrontError("");
    }

    if (!nidBack) {
      setNidBackError("Back side image is required.");
      valid = false;
    } else {
      setNidBackError("");
    }

    if (valid) {
      navigate("/congratulations");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 bg-gray-200">
      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Card className="w-full max-w-xl mx-auto rounded-xl shadow-2xl bg-white">
          <CardContent className="w-full px-6 md:px-10 py-10 md:py-12 flex flex-col justify-center">
            <form
              className="w-full max-w-md mx-auto"
              onSubmit={handleSubmit}
              noValidate
              encType="multipart/form-data"
            >
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex items-center justify-center mt-2 mb-4">
                    <img
                      src={logo1}
                      alt="Fixora Logo"
                      className="h-20 w-auto"
                    />
                  </div>
                  <h2 className="text-2xl font-bold font-serif text-teal-700">
                    Submit Your NID to Complete Your Fixora Account
                  </h2>
                  <p className="text-base text-gray-600 font-serif mb-2">
                    Enter your NID number and upload front and back images.
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="nid-number">NID Number</FieldLabel>
                  <Input
                    id="nid-number"
                    type="text"
                    autoComplete="off"
                    placeholder="Enter your NID number"
                    required
                    value={nidNumber}
                    onChange={(e) => {
                      setNidNumber(e.target.value);
                      setNidNumberError("");
                    }}
                  />
                  {nidNumberError && (
                    <span className="text-sm text-red-600">
                      {nidNumberError}
                    </span>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="nid-front">NID Front Image</FieldLabel>
                  <Input
                    id="nid-front"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFrontChange}
                  />
                  <p className="text-xs text-gray-500">
                    Accepted: JPG, PNG (Max 5MB)
                  </p>
                  {nidFrontError && (
                    <span className="text-sm text-red-600">
                      {nidFrontError}
                    </span>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="nid-back">NID Back Image</FieldLabel>
                  <Input
                    id="nid-back"
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleBackChange}
                  />
                  <p className="text-xs text-gray-500">
                    Accepted: JPG, PNG (Max 5MB)
                  </p>
                  {nidBackError && (
                    <span className="text-sm text-red-600">{nidBackError}</span>
                  )}
                </Field>

                <Field>
                  <Button
                    type="submit"
                    className="bg-teal-900 text-white hover:bg-teal-700 font-serif text-md w-full"
                  >
                    Submit
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
