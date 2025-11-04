import * as React from "react";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import popupupper from "@/assets/images/Popup.png";
import { useNavigate } from "react-router-dom";

export const SignUpRolePopup: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleUserSignup = () => {
    setOpen(false);
    navigate("/UserRegistrationForm");
  };

  const handleServiceProviderSignup = () => {
    setOpen(false);
    navigate("/SpRegistrationForm");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="text-white font-bold rounded-md bg-transparent hover:bg-teal-400 transition-colors"
          onClick={() => setOpen(true)}
        >
          SignUp
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 rounded-2xl overflow-hidden shadow-2xl bg-gray-300">
        <div className="relative h-32 w-70 bg-teal-900 flex items-center justify-center">
          <img
            src={popupupper}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <button
            className="absolute top-3 right-3 z-10 bg-teal-900 rounded-md w-7 h-7 flex items-center justify-center hover:bg-teal-700 transition"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <span className="text-white text-xl font-bold h-8 w-8">
              &times;
            </span>
          </button>
        </div>
        <div className="bg-teal-900 px-6 py-8 flex flex-col items-center gap-0">
          <h2 className="text-2xl font-bold mb-7 text-center text-white">
            Who are you?
          </h2>
          <div className="flex flex-row gap-6 justify-center mb-4">
            <Button
              className="flex-1 flex flex-col items-center bg-teal-600 text-white py-4 px-6 rounded-xl hover:bg-teal-700 transition min-w-[140px]"
              onClick={handleUserSignup}
            >
              User?
            </Button>
            <Button
              className="flex-1 flex flex-col items-center bg-emerald-600 text-white py-4 px-6 rounded-xl hover:bg-emerald-700 transition min-w-[140px]"
              onClick={handleServiceProviderSignup}
            >
              Service Provider?
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
