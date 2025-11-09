import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import logo1 from "@/assets/images/LogoLogin.png";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const districts = {
  dhaka: [
    { value: "dhaka", label: "Dhaka" },
    { value: "gazipur", label: "Gazipur" },
  ],
  chittagong: [
    { value: "chittagong", label: "Chittagong" },
    { value: "coxsbazar", label: "Cox's Bazar" },
  ],
};
const policeStations: { [key: string]: { value: string; label: string }[] } = {
  dhaka: [
    { value: "motijheel", label: "Motijheel" },
    { value: "mirpur", label: "Mirpur" },
  ],
  gazipur: [{ value: "gazipur_sadar", label: "Gazipur Sadar" }],
  chittagong: [{ value: "pahartali", label: "Pahartali" }],
  coxsbazar: [{ value: "coxsbazar_sadar", label: "Cox's Bazar Sadar" }],
};
const subAreas: { [key: string]: { value: string; label: string }[] } = {
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

export default function UserInformation() {
  const [name, setName] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedPoliceStation, setSelectedPoliceStation] = useState("");
  const [selectedSubArea, setSelectedSubArea] = useState("");

  const [nameError, setNameError] = useState("");
  const [districtError, setDistrictError] = useState("");
  const [policeStationError, setPoliceStationError] = useState("");
  const [subAreaError, setSubAreaError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let valid = true;

    if (!name.trim()) {
      setNameError("Full name is required.");
      valid = false;
    } else {
      setNameError("");
    }

    if (!selectedDistrict) {
      setDistrictError("District is required.");
      valid = false;
    } else {
      setDistrictError("");
    }

    if (!selectedPoliceStation) {
      setPoliceStationError("Police Station is required.");
      valid = false;
    } else {
      setPoliceStationError("");
    }

    if (!selectedSubArea) {
      setSubAreaError("Sub Area is required.");
      valid = false;
    } else {
      setSubAreaError("");
    }
    if (valid) {
      navigate("/congratulations");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row items-center justify-center md:items-center px-4 bg-gray-200 gap-y-6 md:gap-x-8">
      <div className="w-full md:w-1/2 flex items-center justify-center py-8">
        <Card className="w-full max-w-xl mx-auto rounded-xl shadow-2xl bg-white">
          <CardContent className="w-full px-6 md:px-10 py-10 md:py-12 flex flex-col justify-center">
            <form
              className="w-full max-w-md mx-auto"
              onSubmit={handleSubmit}
              noValidate
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
                    Create Your Account
                  </h2>
                </div>

                <Field>
                  <FieldLabel htmlFor="Name">Full name</FieldLabel>
                  <Input
                    id="Name"
                    type="text"
                    placeholder="As per NID"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError("");
                    }}
                  />
                  {nameError && (
                    <span className="text-sm text-red-600">{nameError}</span>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="district">District</FieldLabel>
                  <Select
                    value={selectedDistrict}
                    onValueChange={(v) => {
                      setSelectedDistrict(v);
                      setDistrictError("");
                      setSelectedPoliceStation("");
                      setSelectedSubArea("");
                    }}
                  >
                    <SelectTrigger id="district">
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(districts)
                        .flat()
                        .map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {districtError && (
                    <span className="text-sm text-red-600">
                      {districtError}
                    </span>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="police-station">
                    Police Station
                  </FieldLabel>
                  <Select
                    value={selectedPoliceStation}
                    onValueChange={(v) => {
                      setSelectedPoliceStation(v);
                      setPoliceStationError("");
                      setSelectedSubArea("");
                    }}
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
                  {policeStationError && (
                    <span className="text-sm text-red-600">
                      {policeStationError}
                    </span>
                  )}
                </Field>
                <Field>
                  <FieldLabel htmlFor="sub-area">Sub Area</FieldLabel>
                  <Select
                    value={selectedSubArea}
                    onValueChange={(v) => {
                      setSelectedSubArea(v);
                      setSubAreaError("");
                    }}
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
                  {subAreaError && (
                    <span className="text-sm text-red-600">{subAreaError}</span>
                  )}
                </Field>
                <Field>
                  <Button
                    type="submit"
                    className="bg-teal-900 text-white hover:bg-teal-700 font-serif text-md"
                  >
                    Finish
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
