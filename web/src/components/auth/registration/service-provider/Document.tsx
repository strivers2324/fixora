import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import logo1 from "@/assets/images/LogoLogin.png";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

//Cloudinary Upload function
async function uploadToCloudinary(
  file: File,
  deew0njkx: string,
  fixora_unsigned: string
): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${deew0njkx}/image/upload`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", fixora_unsigned);
  const resp = await fetch(url, { method: "POST", body: formData });
  if (!resp.ok) throw new Error("Cloudinary upload failed");
  const data = await resp.json();
  return data.secure_url as string;
}

export default function SpNIDSubmission() {
  const location = useLocation();
  const navigate = useNavigate();
  const { phone, password, profession, full_name, district, area, sub_area } =
    location.state || {};

  const [nidNumber, setNidNumber] = useState("");
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);

  const [nidNumberError, setNidNumberError] = useState("");
  const [nidFrontError, setNidFrontError] = useState("");
  const [nidBackError, setNidBackError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setNidFrontError("Only JPG or PNG images allowed.");
        setNidFront(null);
      } else if (file.size > 5 * 1024 * 1024) {
        setNidFrontError("Image must be less than 5MB.");
        setNidFront(null);
      } else {
        setNidFront(file);
        setNidFrontError("");
      }
    }
  };
  const handleBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        setNidBackError("Only JPG or PNG images allowed.");
        setNidBack(null);
      } else if (file.size > 5 * 1024 * 1024) {
        setNidBackError("Image must be less than 5MB.");
        setNidBack(null);
      } else {
        setNidBack(file);
        setNidBackError("");
      }
    }
  };

  const CLOUD_NAME = "deew0njkx";
  const UPLOAD_PRESET = "fixora_unsigned";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setNidFrontError("NID front image is required.");
      valid = false;
    } else {
      setNidFrontError("");
    }
    if (!nidBack) {
      setNidBackError("NID back image is required.");
      valid = false;
    } else {
      setNidBackError("");
    }
    if (
      !phone ||
      !password ||
      !profession ||
      !full_name ||
      !district ||
      !area ||
      !sub_area
    ) {
      setSubmitError(
        "Required registration data missing. Please restart registration."
      );
      valid = false;
    } else {
      setSubmitError("");
    }

    if (valid) {
      setSubmitting(true);
      try {
        // Get URL from Cloudinary
        let nidFrontUrl = "";
        let nidBackUrl = "";
        if (nidFront)
          nidFrontUrl = await uploadToCloudinary(
            nidFront,
            CLOUD_NAME,
            UPLOAD_PRESET
          );
        if (nidBack)
          nidBackUrl = await uploadToCloudinary(
            nidBack,
            CLOUD_NAME,
            UPLOAD_PRESET
          );

        // All data post to backend
        const body = {
          phone,
          password,
          profession,
          full_name,
          district,
          area,
          sub_area,
          nid_number: nidNumber,
          nid_front_url: nidFrontUrl,
          nid_back_url: nidBackUrl,
        };
        const response = await fetch(
          "http://localhost:8080/api/register-service-provider",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (response.ok) {
          navigate("/congratulations");
        } else {
          const data = await response.json().catch(() => ({}));
          setSubmitError(data.message || "Registration failed!");
        }
      } catch (err: any) {
        setSubmitError("Image upload or registration failed! " + err.message);
      } finally {
        setSubmitting(false);
      }
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
                    Accepted: JPG, PNG (Max 5MB).
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
                    Accepted: JPG, PNG (Max 5MB).
                  </p>
                  {nidBackError && (
                    <span className="text-sm text-red-600">{nidBackError}</span>
                  )}
                </Field>

                {submitError && (
                  <div className="text-sm text-red-600 text-center mt-2">
                    {submitError}
                  </div>
                )}

                <Field>
                  <Button
                    type="submit"
                    className="bg-teal-900 text-white hover:bg-teal-700 font-serif text-md w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit"}
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
