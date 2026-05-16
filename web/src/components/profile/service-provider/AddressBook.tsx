import { useState, useEffect } from "react";
import { MapPin, Map, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LOCATION_DATA } from "@/data/locationData";
import { useAccountStore } from "@/store/AccountStore";
import { SaveServiceProviderAddress, SPAddressRequest } from "@/api/ProfileApi";

export default function ServiceProviderAddressBook() {
  const { spAddress, fetchAddresses } = useAccountStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<SPAddressRequest | any>({
    district: "",
    thana: "",
    area: "",
    address: "",
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchAddresses();
      setIsLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (spAddress) {
      setFormData({
        district: spAddress.district || "",
        thana: spAddress.thana || "",
        area: spAddress.area || "",
        address: spAddress.address || "",
        latitude: (spAddress as any).latitude || 0,
        longitude: (spAddress as any).longitude || 0,
      });
    }
  }, [spAddress]);

  const showSuccessToast = (message: string) => {
    const alertDiv = document.createElement("div");
    alertDiv.className = "fixed top-4 right-4 z-50 animate-in slide-in-from-right";
    alertDiv.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-green-500"></div>
          <p class="text-green-700 font-medium">${message}</p>
      </div>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const showErrorToast = (message: string) => {
    const alertDiv = document.createElement("div");
    alertDiv.className = "fixed top-4 right-4 z-50 animate-in slide-in-from-right";
    alertDiv.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-red-500"></div>
          <p class="text-red-700 font-medium">${message}</p>
      </div>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "district") {
      setFormData({ ...formData, district: value, thana: "", area: "" });
    } else if (name === "thana") {
      setFormData({ ...formData, thana: value, area: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const isFormValid = () => {
    return (
      formData.district.trim() !== "" &&
      formData.thana.trim() !== "" &&
      formData.area.trim() !== "" &&
      formData.address.trim() !== ""
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid()) {
      showErrorToast("Please fill in all required fields.");
      return;
    }

    setIsSaving(true);
    try {
      let finalLat = formData.latitude || 0;
      let finalLng = formData.longitude || 0;

      if (formData.district && formData.thana) {
        const fullQuery = `${formData.area ? formData.area + ", " : ""}${formData.thana}, ${formData.district}, Bangladesh`;
        let res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}`,
        );
        let data = await res.json();

        if (data && data.length > 0) {
          finalLat = Number(data[0].lat);
          finalLng = Number(data[0].lon);
        } else if (formData.area) {
          const subQuery = `${formData.area}, ${formData.district}, Bangladesh`;
          res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(subQuery)}`);
          data = await res.json();

          if (data && data.length > 0) {
            finalLat = Number(data[0].lat);
            finalLng = Number(data[0].lon);
          }
        }

        if (!finalLat || !finalLng) {
          const areaQuery = `${formData.thana}, ${formData.district}, Bangladesh`;
          res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(areaQuery)}`,
          );
          data = await res.json();

          if (data && data.length > 0) {
            finalLat = Number(data[0].lat);
            finalLng = Number(data[0].lon);
          }
        }
      }

      if (finalLat === 0 || finalLng === 0) {
        showErrorToast("Update failed");
        setIsSaving(false);
        return;
      }

      const requestPayload = {
        ...formData,
        latitude: finalLat,
        longitude: finalLng,
      };

      await SaveServiceProviderAddress(requestPayload);
      showSuccessToast("Service address saved successfully!");
      await fetchAddresses();
    } catch (error: any) {
      showErrorToast(error.message || "Something went wrong!");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !spAddress) {
    return (
      <div className="flex justify-center items-center py-20 animate-in fade-in duration-300">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
          Service Location
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors">
          Manage your primary service coverage area
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 transition-colors duration-300">
          <CardHeader className="bg-gradient-to-r from-teal-50 to-emerald-50/50 dark:from-teal-950/30 dark:to-emerald-950/30 border-b dark:border-zinc-800 transition-colors">
            <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
              <MapPin className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              Location Details
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              Update the exact address where you provide your services
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium dark:text-gray-300 transition-colors">
                  District <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Select value={formData.district} onValueChange={(value) => handleSelectChange("district", value)}>
                  <SelectTrigger className="h-11 rounded-lg bg-white/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-500 transition-colors">
                    <SelectValue placeholder="Select District" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700 max-h-[200px]">
                    {LOCATION_DATA.districts.map((dist) => (
                      <SelectItem key={dist} value={dist} className="dark:text-gray-200 dark:focus:bg-zinc-700">
                        {dist}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium dark:text-gray-300 transition-colors">
                  Thana <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Select
                  value={formData.thana}
                  onValueChange={(value) => handleSelectChange("thana", value)}
                  disabled={!formData.district}
                >
                  <SelectTrigger className="h-11 rounded-lg bg-white/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-500 transition-colors">
                    <SelectValue placeholder="Select Thana" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700 max-h-[200px]">
                    {formData.district &&
                      LOCATION_DATA.areas[formData.district]?.map((thana) => (
                        <SelectItem key={thana} value={thana} className="dark:text-gray-200 dark:focus:bg-zinc-700">
                          {thana}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium dark:text-gray-300 transition-colors">
                  Area <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <Select
                  value={formData.area}
                  onValueChange={(value) => handleSelectChange("area", value)}
                  disabled={!formData.thana}
                >
                  <SelectTrigger className="h-11 rounded-lg bg-white/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-500 transition-colors">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700 max-h-[200px]">
                    {formData.thana &&
                      LOCATION_DATA.subAreas[formData.thana]?.map((area) => (
                        <SelectItem key={area} value={area} className="dark:text-gray-200 dark:focus:bg-zinc-700">
                          {area}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium dark:text-gray-300 transition-colors">
                  Address <span className="text-red-500 dark:text-red-400">*</span>
                </Label>
                <div className="relative">
                  <Map className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <Input
                    placeholder="House/Flat No, Street Name"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10 h-11 rounded-lg bg-white/50 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 mt-3 pt-3 transition-colors">
          <Button
            type="submit"
            disabled={isSaving || !isFormValid()}
            className="rounded-lg px-8 h-11 transition-all bg-teal-900 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white disabled:opacity-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Address
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
