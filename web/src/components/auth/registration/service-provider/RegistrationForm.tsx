import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import logo from "@/assets/images/Logo.png";
import form1 from "@/assets/images/FormUpper.png";
import form2 from "@/assets/images/FormLower.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const divisions = [
  { value: "dhaka", label: "Dhaka" },
  { value: "chittagong", label: "Chittagong" },
];
const districts: Record<string, { value: string; label: string }[]> = {
  dhaka: [
    { value: "dhaka", label: "Dhaka" },
    { value: "gazipur", label: "Gazipur" },
  ],
  chittagong: [
    { value: "chittagong", label: "Chittagong" },
    { value: "coxsbazar", label: "Cox's Bazar" },
  ],
};
const policeStations: Record<string, { value: string; label: string }[]> = {
  dhaka: [
    { value: "motijheel", label: "Motijheel" },
    { value: "mirpur", label: "Mirpur" },
  ],
  gazipur: [{ value: "gazipur_sadar", label: "Gazipur Sadar" }],
  chittagong: [{ value: "pahartali", label: "Pahartali" }],
  coxsbazar: [{ value: "coxsbazar_sadar", label: "Cox's Bazar Sadar" }],
};
const subAreas: Record<string, { value: string; label: string }[]> = {
  motijheel: [
    { value: "motijheel_block_a", label: "Block A" },
    { value: "motijheel_block_b", label: "Block B" },
  ],
  mirpur: [
    { value: "mirpur_1", label: "Mirpur-1" },
    { value: "mirpur_2", label: "Mirpur-2" },
  ],
  gazipur_sadar: [{ value: "gazipur_main", label: "Gazipur Main" }],
  pahartali: [{ value: "pahartali_east", label: "Pahartali East" }],
  coxsbazar_sadar: [
    { value: "coxsbazar_central", label: "Cox's Bazar Central" },
  ],
};
const religions = [
  { value: "islam", label: "Islam" },
  { value: "hinduism", label: "Hinduism" },
  { value: "christianity", label: "Christianity" },
  { value: "buddhism", label: "Buddhism" },
  { value: "other", label: "Other" },
];
const professions = [
  { value: "doctor", label: "Doctor" },
  { value: "engineer", label: "Engineer" },
  { value: "teacher", label: "Teacher" },
  { value: "driver", label: "Driver" },
  { value: "other", label: "Other" },
];

export function SpRegistrationForm() {
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 overflow-x-hidden">
      <div className="w-full max-w-5xl mx-auto flex rounded-2xl shadow-2xl overflow-hidden bg-white">
        {/* Left Side: Form */}
        <div className="flex-1 px-10 py-12 bg-white flex flex-col justify-center">
          <div className="flex items-center mb-8">
            <img
              src={logo}
              alt="Logo"
              className="h-24 w-24 md:h-32 md:w-32 lg:h-40 lg:w-40 object-contain mr-2"
            />
            <span className="font-bold text-lg text-cyan-800 italic">
              Fixora
            </span>
          </div>
          <h2 className="text-2xl font-semibold mb-2 text-cyan-800 text-center">
            Create an account
          </h2>
          <form>
            <div className="space-y-5">
              <div>
                <FieldLabel htmlFor="fullname">Full Name</FieldLabel>
                <Input id="fullname" placeholder="Enter full name" required />
              </div>
              <div>
                <FieldLabel htmlFor="username">User Name</FieldLabel>
                <Input id="username" placeholder="Enter user name" required />
              </div>
              <div>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  placeholder="01XXXXXXXXX"
                  required
                  type="tel"
                />
              </div>
              <div>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  placeholder="Enter email address"
                  required
                  type="email"
                />
              </div>
              <div>
                <FieldLabel htmlFor="dob">Date of Birth</FieldLabel>
                <Input id="dob" type="date" required />
              </div>
              <div>
                <FieldLabel htmlFor="profile-image">Profile Image</FieldLabel>
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  required
                />
              </div>
              <div>
                <FieldLabel htmlFor="nid-front">NID Front Side</FieldLabel>
                <Input id="nid-front" type="file" accept="image/*" required />
              </div>
              <div>
                <FieldLabel htmlFor="nid-back">NID Back Side</FieldLabel>
                <Input id="nid-back" type="file" accept="image/*" required />
              </div>
              <div>
                <FieldLabel htmlFor="religion">Religion</FieldLabel>
                <Select defaultValue="" required>
                  <SelectTrigger id="religion">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {religions.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="profession">Profession</FieldLabel>
                <Select defaultValue="" required>
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
              </div>
              <div>
                <FieldLabel htmlFor="division">Division</FieldLabel>
                <Select
                  defaultValue=""
                  onValueChange={(v) => {
                    setSelectedDivision(v);
                    setSelectedDistrict("");
                    setSelectedPoliceStation("");
                  }}
                  required
                >
                  <SelectTrigger id="division">
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisions.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="district">District</FieldLabel>
                <Select
                  value={selectedDistrict}
                  onValueChange={(v) => {
                    setSelectedDistrict(v);
                    setSelectedPoliceStation("");
                  }}
                  required
                  disabled={!selectedDivision}
                >
                  <SelectTrigger id="district">
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {(districts[selectedDivision] || []).map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="police-station">Police Station</FieldLabel>
                <Select
                  value={selectedPoliceStation}
                  onValueChange={(v) => setSelectedPoliceStation(v)}
                  required
                  disabled={!selectedDistrict}
                >
                  <SelectTrigger id="police-station">
                    <SelectValue placeholder="Select police station" />
                  </SelectTrigger>
                  <SelectContent>
                    {(policeStations[selectedDistrict] || []).map((ps) => (
                      <SelectItem key={ps.value} value={ps.value}>
                        {ps.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="sub-area">Sub Area</FieldLabel>
                <Select
                  defaultValue=""
                  required
                  disabled={!selectedPoliceStation}
                >
                  <SelectTrigger id="sub-area">
                    <SelectValue placeholder="Select sub area" />
                  </SelectTrigger>
                  <SelectContent>
                    {(subAreas[selectedPoliceStation] || []).map((sa) => (
                      <SelectItem key={sa.value} value={sa.value}>
                        {sa.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <FieldLabel htmlFor="password">Create Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create password"
                  required
                />
              </div>
              <div>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm password"
                  required
                />
              </div>
              {/* Terms */}
              <div className="flex items-center gap-2">
                <Input
                  id="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4"
                />
                <label htmlFor="terms" className="text-sm">
                  I agree to all the{" "}
                  <a href="#" className="text-blue-600 underline">
                    Terms & Conditions
                  </a>
                </label>
              </div>
              <Button
                type="submit"
                className="w-full py-2 mt-2 bg-teal-800 text-white rounded-md hover:bg-teal-900"
              >
                SignUp
              </Button>
            </div>
          </form>
        </div>
        {/* Right Side */}
        <div className="flex-1 bg-teal-900 px-10 py-12 flex flex-col items-center justify-start relative">
          <div className="mt-9 flex flex-col items-center justify-center w-full">
            <div className="mt-0">
              <img
                src={form1}
                alt="Analytics"
                className="w-82 mx-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="mt-6">
              <h1 className="text-white text-3xl font-semibold text-center mb-2">
                Join Fixora as a Service Provider!
              </h1>
              <p className="text-teal-100 text-center text-xl text-sm mb-4">
                Fixora connects you with customers searching for trusted experts
                in your field. Create your profile, showcase your skills,
                receive bookings, and get paid securely—all in one platform.
                Grow your business with Fixora today!
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-teal-700 my-8"></div>

          <div className="flex flex-col items-center justify-center w-full">
            <img
              src={form2}
              alt="Why Choose Us"
              className="w-82 mx-auto rounded-lg shadow-md mb-4"
            />
            <h1 className="text-white text-3xl font-semibold text-center mb-2">
              Why Choose Us
            </h1>
            <ul className="text-teal-100 text-xl list-disc pl-6">
              <li>Trusted by users for reliable service</li>
              <li>Fast, secure, and user-friendly experience</li>
              <li>Secure and reliable system</li>
              <li>Customizable to fit your needs</li>
              <li>Expert support whenever you need help</li>
              <li>Affordable pricing with no hidden fees</li>
              <li>24/7 customer support</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpRegistrationForm;
