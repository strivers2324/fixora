import { useState, useEffect } from "react";
import { SignUpRolePopup } from "../../auth/registration/selection/SignUpPopup";
import { Link, useLocation } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Button } from "../../ui/button";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "@/components/theme/ModeToggle";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="px-4 bg-teal-900 sticky top-0 z-50">
      <div className="flex flex-row justify-between items-center h-16">
        <div className="flex items-center gap-x-2 font-bold text-3xl text-white">
          <HashLink smooth to="/#" className="flex items-center gap-x-2">
            <img
              src="https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Logo.webp"
              alt="Fixora logo"
              className="h-12 w-auto object-contain"
            />
            <span className="italic">Fixora</span>
          </HashLink>
        </div>

        <div className="hidden md:flex flex-row items-center gap-x-5">
          <HashLink smooth to="/#" className="transition-colors hover:text-black/80 text-white font-semibold">
            Home
          </HashLink>
          <HashLink smooth to="/#services" className="transition-colors hover:text-black/80 text-white">
            Services
          </HashLink>

          <HashLink smooth to="/#about" className="transition-colors hover:text-black/80 text-white">
            About
          </HashLink>
          <Link to="/login">
            <Button className="text-white font-bold rounded-full bg-transparent hover:bg-teal-600 transition-colors">
              Login
            </Button>
          </Link>

          <SignUpRolePopup>
            <Button className="text-white font-bold rounded-full bg-transparent hover:bg-teal-600 transition-colors">
              SignUp
            </Button>
          </SignUpRolePopup>
          <ModeToggle />
        </div>

        <div className="md:hidden flex items-center gap-2">
          <ModeToggle />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white p-2">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden pb-4">
          <nav className="flex flex-col items-center gap-y-4 pt-2">
            <HashLink smooth to="/#" className="transition-colors hover:text-black/80 text-white font-semibold">
              Home
            </HashLink>

            <HashLink smooth to="/#services" className="transition-colors hover:text-black/80 text-white">
              Services
            </HashLink>

            <HashLink smooth to="/#about-section" className="transition-colors hover:text-black/80 text-white">
              About
            </HashLink>

            <div className="w-3/4 h-px bg-teal-500 my-2"></div>

            <Link to="/login">
              <Button className="text-white font-bold rounded-full bg-transparent hover:bg-teal-400 transition-colors">
                Login
              </Button>
            </Link>

            <SignUpRolePopup>
              <Button className="text-white font-bold rounded-full bg-transparent hover:bg-teal-800 transition-colors">
                SignUp
              </Button>
            </SignUpRolePopup>
          </nav>
        </div>
      )}
    </div>
  );
}
