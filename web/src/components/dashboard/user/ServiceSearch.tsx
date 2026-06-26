import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Wrench, Navigation, CheckCircle2, AlertCircle, PlusCircle, Banknote, Info } from "lucide-react";

import { useAccountStore } from "@/store/AccountStore";
import { JobSearchPayload } from "@/api/JobApi";

interface ServiceSearchProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  professionId: number;
  profileData?: any;
  onContinueWithData: (data: JobSearchPayload | any) => void;
}

export default function ServiceSearch({
  isOpen,
  onClose,
  serviceName,
  professionId,
  onContinueWithData,
}: ServiceSearchProps) {
  const navigate = useNavigate();
  const { userAddresses, fetchAddresses } = useAccountStore();

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAddresses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (userAddresses.length > 0 && !selectedAddressId) {
      const defaultAddr = userAddresses.find((a) => a.is_default) || userAddresses[0];
      setSelectedAddressId(defaultAddr.address_id);
    }
  }, [userAddresses]);

  const handleSubmit = async () => {
    setLocationError("");
    if (!selectedAddressId) {
      setLocationError("Please select an address.");
      return;
    }

    setIsLoading(true);
    try {
      const selectedAddr = userAddresses.find((a) => a.address_id === selectedAddressId);

      if (!selectedAddr) throw new Error("Selected address not found.");

      const payload = {
        serviceName,
        profession_id: professionId,
        problem_details: description,
        user_offer_price: Number(offerPrice),
        address_id: selectedAddr.address_id,
        latitude: Number(selectedAddr.latitude),
        longitude: Number(selectedAddr.longitude),
      };

      onContinueWithData(payload);
      onClose();
    } catch (error: any) {
      setLocationError(error.message || "Failed to process location.");
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    description.trim() !== "" && selectedAddressId !== null && offerPrice.trim() !== "" && Number(offerPrice) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="fixed top-4 left-[50%] translate-x-[-50%] translate-y-0 sm:top-10 w-[95vw] sm:w-full sm:max-w-[800px] rounded-[24px] border-0 p-0 overflow-hidden bg-white dark:bg-zinc-900 shadow-2xl animate-in slide-in-from-top-10 duration-300">
        <DialogHeader className="bg-gradient-to-r from-teal-900 to-teal-800 dark:from-teal-950 dark:to-teal-900 p-6 text-white relative">
          <Wrench className="absolute right-6 top-6 opacity-10 rotate-12" size={80} />
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Navigation size={24} className="text-teal-100 dark:text-teal-200" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Book {serviceName}
              </DialogTitle>
              <p className="text-teal-100/80 dark:text-teal-200/80 text-xs sm:text-sm">
                Fill in the details to find nearby providers
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-hide pb-8 sm:pb-10">
          {/* 🚀 Side-by-Side Layout for Desktop */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side: Problem Description */}
            <div className="space-y-3 md:w-2/3 flex flex-col">
              <Label className="text-gray-700 dark:text-gray-200 font-bold flex items-center gap-1">
                Problem Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="Briefly describe what's wrong..."
                className="rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-teal-900 dark:focus-visible:ring-teal-700 min-h-[120px] flex-1 bg-gray-50/50 dark:bg-zinc-950/50 dark:text-gray-100 dark:placeholder:text-zinc-500 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Right Side: Offer Price */}
            <div className="space-y-3 md:w-1/3">
              <Label className="text-gray-700 dark:text-gray-200 font-bold flex items-center gap-1">
                Your Offer Price (BDT) <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Banknote
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                  size={18}
                />
                <Input
                  type="number"
                  placeholder="e.g. 500"
                  className="pl-10 rounded-xl border-gray-200 dark:border-zinc-800 focus-visible:ring-teal-900 dark:focus-visible:ring-teal-700 h-12 bg-gray-50/50 dark:bg-zinc-950/50 dark:text-gray-100 dark:placeholder:text-zinc-500 font-medium text-lg"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  min="1"
                />
              </div>
              {/* Helper text to balance the height */}
              <div className="flex gap-2 items-start mt-2 p-3 bg-teal-50 dark:bg-teal-950/30 rounded-xl border border-teal-100 dark:border-teal-900/50">
                <Info size={14} className="text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                <p className="text-[11px] leading-tight text-teal-700 dark:text-teal-400 font-medium">
                  A fair price attracts better and faster service providers.
                </p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <Label className="text-gray-700 dark:text-gray-200 font-bold flex items-center gap-2">
              <MapPin size={18} className="text-teal-700 dark:text-teal-500" /> Select Service Address{" "}
              <span className="text-red-500">*</span>
            </Label>

            {userAddresses.length === 0 ? (
              <div className="p-6 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-2xl text-center space-y-3">
                <AlertCircle className="mx-auto text-amber-500" size={32} />
                <p className="text-sm text-gray-500">No addresses found in your address book.</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                  onClick={() => navigate("/profile?tab=addresses")}
                >
                  <PlusCircle size={16} /> Add Address
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {userAddresses.map((addr, index) => (
                  <div
                    key={addr.address_id}
                    onClick={() => setSelectedAddressId(addr.address_id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all cursor-pointer group ${
                      selectedAddressId === addr.address_id
                        ? "border-teal-900 dark:border-teal-700 bg-teal-50/30 dark:bg-teal-950/20 shadow-md"
                        : "border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 pr-6">
                        <p className="text-[10px] font-bold text-teal-600/70 dark:text-teal-400/70 uppercase tracking-widest mb-1">
                          Address {index + 1}
                        </p>
                        <p className="font-bold text-gray-900 dark:text-gray-100 text-sm flex flex-wrap items-center gap-2">
                          {addr.full_name}
                          {addr.is_default && (
                            <span className="text-[10px] bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                              Default
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{addr.phone_number}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                          {addr.address}, {addr.area}, {addr.thana}, {addr.district}
                        </p>
                      </div>
                      {selectedAddressId === addr.address_id && (
                        <CheckCircle2
                          size={20}
                          className="text-teal-700 dark:text-teal-500 animate-in zoom-in duration-300 absolute right-4 top-4"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 mt-4 space-y-3">
            {locationError && (
              <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-500/10 p-2 rounded-lg">
                {locationError}
              </p>
            )}
            <Button
              onClick={handleSubmit}
              className="w-full bg-teal-900 dark:bg-teal-800 hover:bg-teal-800 dark:hover:bg-teal-700 text-white h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg font-bold shadow-lg shadow-teal-900/10 dark:shadow-teal-900/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:dark:bg-zinc-800 disabled:dark:text-zinc-500 disabled:opacity-70 disabled:cursor-not-allowed"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Searching..." : "Continue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
