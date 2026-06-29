import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Settings2 } from "lucide-react";
import { GetServiceCatalog, UpdateServiceCatalog } from "@/api/ProfileApi";

interface MyServicePanelProps {
  disabled?: boolean;
}

type Catalog = {
  min_charge?: number;
  description?: string | null;
  is_active?: boolean;
};

const normalizeCatalog = (res: any): Catalog | null => {
  const c = res?.data?.data ?? res?.data ?? res;
  if (!c || typeof c !== "object") return null;
  return c as Catalog;
};

export default function MyServicePanel({ disabled = false }: MyServicePanelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [minCharge, setMinCharge] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isOnline, setIsOnline] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isToggleLoading, setIsToggleLoading] = useState<boolean>(false);

  const [hasCatalog, setHasCatalog] = useState<boolean>(false);

  const minChargeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpen = () => {
      if (!disabled) setIsDialogOpen(true);
    };
    window.addEventListener("openMyServicePanel", handleOpen);
    return () => window.removeEventListener("openMyServicePanel", handleOpen);
  }, [disabled]);

  const showSuccessToast = (message: string) => {
    const alertDiv = document.createElement("div");
    alertDiv.className = "fixed top-4 right-4 z-[9999] animate-in slide-in-from-right";
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
    alertDiv.className = "fixed top-4 right-4 z-[9999] animate-in slide-in-from-right";
    alertDiv.innerHTML = `
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg flex items-center gap-2">
          <div class="h-2 w-2 rounded-full bg-red-500"></div>
          <p class="text-red-700 font-medium">${message}</p>
      </div>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
  };

  useEffect(() => {
    const fetchCatalogData = async () => {
      if (!isDialogOpen || disabled) return;

      setIsFetching(true);
      try {
        const res = await GetServiceCatalog();
        const catalogData = normalizeCatalog(res);

        const serverMinCharge = Number(catalogData?.min_charge || 0);
        const serverDesc = String(catalogData?.description || "").trim();
        const exists = serverMinCharge > 0 || serverDesc.length > 0;

        setHasCatalog(exists);

        setMinCharge(serverMinCharge > 0 ? String(serverMinCharge) : "");
        setDescription(serverDesc);
        setIsOnline(catalogData?.is_active ?? true);
      } catch {
        setHasCatalog(false);
        setMinCharge("");
        setDescription("");
        setIsOnline(true);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCatalogData();
  }, [isDialogOpen, disabled]);

  const handleToggleOnline = async (checked: boolean) => {
    if (!checked && !hasCatalog) {
      showErrorToast("Save service details first");
      setIsOnline(true);
      return;
    }

    if (checked) {
      if (!minChargeRef.current?.checkValidity()) {
        minChargeRef.current?.reportValidity();
        return;
      }
    }

    setIsToggleLoading(true);
    const previousState = isOnline;
    setIsOnline(checked);

    try {
      await UpdateServiceCatalog({
        min_charge: Number(minCharge) || 0,
        description: description,
        is_active: checked,
      });
      showSuccessToast(checked ? "Status: Online (Receiving Jobs)" : "Status: Offline");
      setHasCatalog(true);
      window.dispatchEvent(new Event("serviceCatalogUpdated"));
    } catch (error: any) {
      setIsOnline(previousState);
      showErrorToast(error.message || "Failed to update status");
    } finally {
      setIsToggleLoading(false);
    }
  };

  const handleSave = async () => {
    if (!minChargeRef.current?.checkValidity()) {
      minChargeRef.current?.reportValidity();
      return;
    }

    setIsLoading(true);
    try {
      await UpdateServiceCatalog({
        min_charge: Number(minCharge),
        description: description,
        is_active: isOnline,
      });

      setHasCatalog(true);
      window.dispatchEvent(new Event("serviceCatalogUpdated"));

      showSuccessToast("Service catalog updated successfully!");
      setIsDialogOpen(false);
    } catch (error: any) {
      showErrorToast(error.message || "Failed to update service catalog");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <span
        title={disabled ? "Please complete your profile first" : "Manage your service settings"}
        className={disabled ? "cursor-not-allowed" : ""}
      >
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            disabled={disabled}
            className={`font-medium transition-colors ${
              disabled ? "text-teal-50/50 opacity-70" : "text-teal-50 hover:text-white hover:bg-teal-600"
            }`}
          >
            <Settings2 className="mr-2 h-4 w-4" />
            My Service
          </Button>
        </DialogTrigger>
      </span>

      <DialogContent className="fixed top-4 left-[50%] translate-x-[-50%] translate-y-0 sm:top-10 w-[95vw] sm:w-full sm:max-w-[650px] rounded-[24px] border-0 p-0 overflow-hidden bg-white dark:bg-zinc-800 shadow-2xl animate-in slide-in-from-top-10 duration-300 max-h-[92vh] sm:max-h-[90vh] flex flex-col [&>button[data-dialog-close]]:hidden">
        <DialogHeader className="bg-gradient-to-r from-teal-900 to-teal-800 p-6 text-white relative">
          <Settings2 className="absolute right-6 top-6 opacity-10 rotate-12" size={80} />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <Settings2 size={24} className="text-teal-100" />
            </div>
            <div className="text-left">
              <DialogTitle className="text-2xl font-bold tracking-tight text-white">Service Settings</DialogTitle>
              <DialogDescription className="text-teal-100/80 text-sm mt-1">
                Manage your service preferences and availability.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-6 flex-1 overflow-y-auto scrollbar-hide relative pb-10">
          {isFetching ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Loading settings...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 bg-gray-50/50 dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-700">
                <div className="space-y-0.5">
                  <Label
                    htmlFor="online-status"
                    className="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2"
                  >
                    Current Status:{" "}
                    {isOnline ? (
                      <span className="text-teal-600">Online</span>
                    ) : (
                      <span className="text-red-500">Offline</span>
                    )}
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Toggle to start/stop receiving jobs instantly.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isToggleLoading && <Loader2 className="h-4 w-4 animate-spin text-teal-600" />}
                  <Switch
                    id="online-status"
                    checked={isOnline}
                    onCheckedChange={handleToggleOnline}
                    disabled={isToggleLoading}
                    className="data-[state=checked]:bg-teal-900"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="min-charge"
                  className="text-gray-700 dark:text-gray-200 font-bold flex items-center gap-2"
                >
                  Minimum Charge (BDT) <span className="text-red-500 text-lg leading-none">*</span>
                </Label>
                <Input
                  id="min-charge"
                  ref={minChargeRef}
                  type="number"
                  required
                  min="1"
                  value={minCharge}
                  onChange={(e) => setMinCharge(e.target.value)}
                  placeholder="e.g. 100"
                  className="h-11 rounded-xl bg-gray-50/50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 focus-visible:ring-teal-900 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="service-description"
                  className="text-gray-700 dark:text-gray-200 font-bold flex items-center gap-2"
                >
                  Service Description
                </Label>
                <Textarea
                  id="service-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Professional technician with 5+ years of experience. Expert in my field."
                  className="resize-none rounded-xl bg-gray-50/50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 focus-visible:ring-teal-900 placeholder:text-gray-400 dark:placeholder:text-zinc-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-6 w-full">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-lg border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:hover:bg-zinc-700 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="rounded-lg bg-teal-900 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white px-8 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
