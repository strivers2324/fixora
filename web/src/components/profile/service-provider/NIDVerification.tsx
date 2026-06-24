import { useState, useRef, useEffect } from "react";
import { SubmitNIDVerification, GetNIDStatus } from "@/api/ProfileApi";
import { CreditCard, Clock, CheckCircle, ShieldCheck, XCircle, Camera, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NIDStatus } from "@/enums/NIDStatus";

export default function NidVerification() {
  const [isNidSubmitting, setIsNidSubmitting] = useState(false);
  const [nidStatus, setNidStatus] = useState<NIDStatus | null>(null);
  const [formError, setFormError] = useState("");

  const nidFrontRef = useRef<HTMLInputElement>(null);
  const nidBackRef = useRef<HTMLInputElement>(null);

  const [nidData, setNidData] = useState<{
    frontFile: File | null;
    backFile: File | null;
    frontPreview: string | null;
    backPreview: string | null;
  }>({
    frontFile: null,
    backFile: null,
    frontPreview: null,
    backPreview: null,
  });

  useEffect(() => {
    GetNIDStatus()
      .then((res: any) => {
        if (res) {
          const currentStatus = res?.data?.status || res?.status;
          if (currentStatus) {
            setNidStatus(currentStatus as NIDStatus);
          }
        }
      })
      .catch((err) => console.error("Error fetching NID status", err));
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

  const handleNidFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith(".jpg") && !fileName.endsWith(".png")) {
        setFormError("Only JPG and PNG files are allowed");
        return;
      }

      if (file.size > 500 * 1024) {
        setFormError("File size must be less than 500KB");
        return;
      }

      setFormError("");

      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result;
        if (typeof result === "string") {
          setNidData((prev) => ({
            ...prev,
            [side === "front" ? "frontFile" : "backFile"]: file,
            [side === "front" ? "frontPreview" : "backPreview"]: result,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!nidData.frontFile || !nidData.backFile) {
      setFormError("Please upload both sides of your NID.");
      return;
    }

    setIsNidSubmitting(true);

    try {
      const nidFormData = new FormData();
      nidFormData.append("nid_front", nidData.frontFile);
      nidFormData.append("nid_back", nidData.backFile);

      await SubmitNIDVerification(nidFormData as any);

      setNidStatus(NIDStatus.PENDING);
      showSuccessToast("NID submitted for verification!");
      setNidData({ frontFile: null, backFile: null, frontPreview: null, backPreview: null });
    } catch (error: any) {
      setFormError(error.message || "Failed to submit NID. Please try again.");
    } finally {
      setIsNidSubmitting(false);
    }
  };

  const clearNidForm = () => {
    setNidData({ frontFile: null, backFile: null, frontPreview: null, backPreview: null });
    setFormError("");
    if (nidFrontRef.current) nidFrontRef.current.value = "";
    if (nidBackRef.current) nidBackRef.current.value = "";
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
          NID Verification
        </h1>
      </div>

      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden dark:bg-zinc-900 transition-colors duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-zinc-800/80 dark:to-zinc-800/50 border-b dark:border-zinc-800 transition-colors">
          <CardTitle className="text-xl flex items-center gap-2 dark:text-gray-100">
            <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            Submit Your NID for Verification
          </CardTitle>
          <CardDescription className="dark:text-gray-400">Verify your identity to unlock all features</CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {nidStatus === NIDStatus.PENDING ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full transition-colors">
                <Clock className="h-12 w-12 text-amber-600 dark:text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Verification Pending</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2 mx-auto">
                  Thank you. We have received your NID information and it is under review by our team.
                </p>
              </div>
            </div>
          ) : nidStatus === NIDStatus.ACCEPTED ? (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full transition-colors">
                <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">NID Verified</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2 mx-auto">
                  Congratulations! Your identity has been successfully verified.
                </p>
              </div>
            </div>
          ) : (
            <>
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50 mb-4 transition-colors">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
                  Your NID information is encrypted and only used for identity verification.
                </AlertDescription>
              </Alert>

              {nidStatus === NIDStatus.REJECTED && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-400 mb-6 animate-in fade-in transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Verification Rejected</AlertTitle>
                  <AlertDescription>
                    Your previous NID submission was rejected. Please upload clear and valid documents again.
                  </AlertDescription>
                </Alert>
              )}

              {formError && (
                <Alert
                  variant="destructive"
                  className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-400 animate-in fade-in slide-in-from-top-2 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleNidSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium dark:text-gray-300">
                      NID Front <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-48 relative overflow-hidden group ${nidData.frontPreview ? "border-teal-500 dark:border-teal-600 bg-teal-50/30 dark:bg-teal-900/20" : "border-gray-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50"}`}
                      onClick={() => nidFrontRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={nidFrontRef}
                        className="hidden"
                        accept=".jpg,.png"
                        onChange={(e) => handleNidFileChange(e, "front")}
                      />
                      {nidData.frontPreview ? (
                        <>
                          <img
                            src={nidData.frontPreview}
                            alt="NID Front"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-500 rounded-full mb-3 transition-colors">
                            <Camera className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Click to upload front side
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 500KB</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium dark:text-gray-300">
                      NID Back <span className="text-red-500">*</span>
                    </Label>
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors h-48 relative overflow-hidden group ${nidData.backPreview ? "border-teal-500 dark:border-teal-600 bg-teal-50/30 dark:bg-teal-900/20" : "border-gray-200 dark:border-zinc-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50"}`}
                      onClick={() => nidBackRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={nidBackRef}
                        className="hidden"
                        accept=".jpg,.png"
                        onChange={(e) => handleNidFileChange(e, "back")}
                      />
                      {nidData.backPreview ? (
                        <>
                          <img
                            src={nidData.backPreview}
                            alt="NID Back"
                            className="absolute inset-0 w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                          <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3 bg-blue-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-500 rounded-full mb-3 transition-colors">
                            <Camera className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Click to upload back side
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG up to 500KB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t dark:border-zinc-800 transition-colors">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearNidForm}
                    className="rounded-lg border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white dark:hover:bg-zinc-800 transition-colors"
                  >
                    Clear All
                  </Button>
                  <Button
                    type="submit"
                    disabled={isNidSubmitting}
                    className="rounded-lg bg-teal-900 hover:bg-teal-800 dark:bg-teal-700 dark:hover:bg-teal-600 text-white px-8 transition-colors"
                  >
                    {isNidSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Verification"
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
