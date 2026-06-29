import { useState, useEffect } from "react";
import {
  Plus,
  MapPin,
  CheckCircle2,
  Edit2,
  Trash2,
  User,
  Phone,
  Map,
  Inbox,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { LOCATION_DATA } from "@/data/locationData";
import { useAccountStore } from "@/store/AccountStore";
import {
  SubmitUserAddress,
  UpdateUserAddress,
  DeleteUserAddress,
  UserAddressResponse,
  UserAddressRequest,
} from "@/api/ProfileApi";

export default function AddressBook() {
  const { userAddresses, fetchAddresses } = useAccountStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<UserAddressRequest | any>({
    full_name: "",
    phone_number: "",
    district: "",
    thana: "",
    area: "",
    address: "",
    is_default: false,
    latitude: 0,
    longitude: 0,
  });

  const [initialFormData, setInitialFormData] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchAddresses();
      setIsLoading(false);
    };
    load();
  }, []);

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

  const handleAddNew = () => {
    const newData = {
      full_name: "",
      phone_number: "",
      district: "",
      thana: "",
      area: "",
      address: "",
      is_default: userAddresses.length === 0,
      latitude: 0,
      longitude: 0,
    };
    setFormData(newData);
    setInitialFormData(newData);
    setEditingId(null);
    setIsOpen(true);
  };

  const handleEdit = (addr: any) => {
    const phone = addr.phone_number || "";
    const displayPhone = phone.startsWith("+88") ? phone.slice(3) : phone;
    const editData = {
      full_name: addr.full_name,
      phone_number: displayPhone,
      district: addr.district,
      thana: addr.thana,
      area: addr.area,
      address: addr.address,
      is_default: addr.is_default,
      latitude: addr.latitude || 0,
      longitude: addr.longitude || 0,
    };
    setFormData(editData);
    setInitialFormData(editData);
    setEditingId(addr.address_id);
    setIsOpen(true);
  };

  const isValidPhone = (phone: string) => {
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    return bdPhoneRegex.test(phone);
  };

  const isFormValid = () => {
    return (
      formData.full_name.trim() !== "" &&
      isValidPhone(formData.phone_number.trim()) &&
      formData.district.trim() !== "" &&
      formData.thana.trim() !== "" &&
      formData.area.trim() !== "" &&
      formData.address.trim() !== ""
    );
  };

  const hasChanges = () => {
    if (!initialFormData) return true;
    return (
      formData.full_name !== initialFormData.full_name ||
      formData.phone_number !== initialFormData.phone_number ||
      formData.district !== initialFormData.district ||
      formData.thana !== initialFormData.thana ||
      formData.area !== initialFormData.area ||
      formData.address !== initialFormData.address ||
      formData.is_default !== initialFormData.is_default
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        phone_number: `+88${formData.phone_number}`,
        latitude: finalLat,
        longitude: finalLng,
      };

      if (editingId) {
        await UpdateUserAddress(editingId, requestPayload);
        showSuccessToast("Address updated successfully!");
      } else {
        await SubmitUserAddress(requestPayload);
        showSuccessToast("Address added successfully!");
      }
      await fetchAddresses();
      setIsOpen(false);
    } catch (error: any) {
      showErrorToast(error.message || "Something went wrong!");
    } finally {
      setIsSaving(false);
    }
  };

  const setAsDefault = async (addr: UserAddressResponse) => {
    try {
      const formattedPhone = addr.phone_number.startsWith("+88") ? addr.phone_number : `+88${addr.phone_number}`;

      const updatedData: UserAddressRequest = {
        full_name: addr.full_name,
        phone_number: formattedPhone,
        district: addr.district,
        thana: addr.thana,
        area: addr.area,
        address: addr.address,
        is_default: true,
      };
      await UpdateUserAddress(addr.address_id, updatedData);
      await fetchAddresses();
      showSuccessToast("Default address updated!");
    } catch (error) {
      showErrorToast("Failed to set as default");
    }
  };

  const handleDeleteClick = (id: number) => {
    setAddressToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (addressToDelete === null) return;

    setIsDeleting(true);
    try {
      await DeleteUserAddress(addressToDelete);
      await fetchAddresses();
      showSuccessToast("Address deleted successfully!");
    } catch (error) {
      showErrorToast("Failed to delete address");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Address Book</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your addresses</p>
        </div>

        <Button
          onClick={handleAddNew}
          className="bg-teal-900 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white rounded-xl shadow-md transition-all"
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Address
        </Button>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="max-w-4xl dark:bg-zinc-900 dark:border-zinc-800 transition-colors p-0 overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
          >
            <DialogHeader className="px-6 py-4 border-b dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/30">
              <DialogTitle className="text-xl text-teal-900 dark:text-teal-400">
                {editingId ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="px-6 py-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Contact Information
                  </h3>

                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        required
                        placeholder="e.g. Rahim Ullah"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="pl-10 h-11 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex h-11 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 overflow-hidden focus-within:ring-2 focus-within:ring-teal-500 transition-all">
                      <div className="flex items-center justify-center px-4 bg-gray-50 dark:bg-zinc-800/80 border-r border-gray-200 dark:border-zinc-700">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">+88</span>
                      </div>
                      <Input
                        required
                        placeholder="017XXXXXXXX"
                        value={formData.phone_number}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ""); // Allow only numbers
                          if (val.length <= 11) {
                            setFormData({ ...formData, phone_number: val });
                          }
                        }}
                        className="flex-1 h-full border-0 bg-transparent rounded-none focus-visible:ring-0 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                    {formData.phone_number && !isValidPhone(formData.phone_number) && (
                      <p className="text-xs text-red-500">Please enter a valid 11-digit number starting with 01</p>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Location Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">
                        District <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        required
                        value={formData.district}
                        onValueChange={(value) => handleSelectChange("district", value)}
                      >
                        <SelectTrigger className="h-11 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 max-h-[200px]">
                          {LOCATION_DATA.districts.map((dist) => (
                            <SelectItem
                              key={dist}
                              value={dist}
                              className="dark:text-gray-300 dark:focus:bg-zinc-800 dark:focus:text-white"
                            >
                              {dist}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="dark:text-gray-300">
                        Thana <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        required
                        value={formData.thana}
                        onValueChange={(value) => handleSelectChange("thana", value)}
                        disabled={!formData.district}
                      >
                        <SelectTrigger className="h-11 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                          <SelectValue placeholder="Select Thana" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 max-h-[200px]">
                          {formData.district &&
                            LOCATION_DATA.areas[formData.district]?.map((thana) => (
                              <SelectItem
                                key={thana}
                                value={thana}
                                className="dark:text-gray-300 dark:focus:bg-zinc-800 dark:focus:text-white"
                              >
                                {thana}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                      Area <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      required
                      value={formData.area}
                      onValueChange={(value) => handleSelectChange("area", value)}
                      disabled={!formData.thana}
                    >
                      <SelectTrigger className="h-11 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white">
                        <SelectValue placeholder="Select Area" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 max-h-[200px]">
                        {formData.thana &&
                          LOCATION_DATA.subAreas[formData.thana]?.map((area) => (
                            <SelectItem
                              key={area}
                              value={area}
                              className="dark:text-gray-300 dark:focus:bg-zinc-800 dark:focus:text-white"
                            >
                              {area}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="dark:text-gray-300">
                      Exact Address <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Map className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        required
                        placeholder="House/Flat No, Street Name"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="pl-10 h-11 dark:bg-zinc-800 dark:border-zinc-700 dark:text-white dark:placeholder:text-gray-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {userAddresses.length > 0 && !(editingId && initialFormData?.is_default) && (
                <div className="mt-6 flex items-center gap-2 bg-teal-50 dark:bg-teal-900/10 p-3 rounded-lg border border-teal-100 dark:border-teal-900/30">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="h-4 w-4 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <Label htmlFor="isDefault" className="text-teal-800 dark:text-teal-300 cursor-pointer">
                    Make this my default address
                  </Label>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t dark:border-zinc-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-800 w-full sm:w-auto h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !isFormValid() || !hasChanges()}
                  className="bg-teal-900 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white w-full sm:w-auto h-11 px-8 transition-all disabled:opacity-50 disabled:pointer-events-auto disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Address"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md dark:bg-zinc-900 dark:border-zinc-800 p-0 overflow-hidden shadow-2xl">
            <div className="p-6 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
              </div>
              <div className="space-y-2 mt-2 sm:mt-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Address</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this address? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-800/50 px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                className="w-full sm:w-auto dark:text-gray-300 dark:border-zinc-700 dark:hover:bg-zinc-800 h-10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white h-10"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : userAddresses.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 dark:border-zinc-800 bg-transparent shadow-none rounded-2xl">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="h-20 w-20 bg-teal-50 dark:bg-teal-900/20 rounded-full flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-teal-600 dark:text-teal-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Address Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              You haven't added any addresses yet. Add a new address for better service and easy checkout.
            </p>
            <Button
              onClick={handleAddNew}
              className="bg-teal-900 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white shadow-md"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {userAddresses.map((addr, index) => (
            <Card
              key={addr.address_id}
              className={`border-2 transition-all ${addr.is_default ? "border-teal-600 bg-teal-50/10 dark:bg-teal-900/10" : "border-transparent hover:border-teal-200 dark:hover:border-teal-900/50 bg-white"} shadow-md hover:shadow-lg rounded-xl dark:bg-zinc-900 group`}
            >
              <CardContent className="p-5 sm:p-6 relative">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-md border border-teal-100 dark:border-teal-800/50">
                    Address {index + 1}
                  </span>

                  {addr.is_default && (
                    <span className="flex items-center text-xs font-bold text-teal-700 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/30 px-2.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Default
                    </span>
                  )}
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full shrink-0 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 transition-colors">
                    <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-teal-700 dark:group-hover:text-teal-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{addr.full_name}</h3>
                      <span className="hidden sm:inline text-gray-300 dark:text-zinc-600">|</span>
                      <p className="text-gray-600 dark:text-gray-400 font-medium text-sm flex items-center gap-1">
                        <Phone className="h-3 w-3 sm:hidden" />
                        {addr.phone_number}
                      </p>
                    </div>

                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{addr.address}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mt-1 flex items-center gap-1.5">
                      {addr.area}, {addr.thana}, {addr.district}
                    </p>
                  </div>
                </div>

                <Separator className="my-5 dark:bg-zinc-800" />

                <div className="flex justify-between items-center">
                  {!addr.is_default ? (
                    <button
                      onClick={() => setAsDefault(addr)}
                      className="text-sm text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                    >
                      Set as Default
                    </button>
                  ) : (
                    <div></div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(addr)}
                      className="text-gray-500 hover:text-teal-600 dark:hover:text-teal-400 bg-gray-50 hover:bg-teal-50 dark:bg-zinc-800 dark:hover:bg-teal-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit
                    </button>
                    {!addr.is_default && (
                      <button
                        onClick={() => handleDeleteClick(addr.address_id)}
                        className="text-gray-500 hover:text-red-600 dark:hover:text-red-400 bg-gray-50 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 text-sm font-medium"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
