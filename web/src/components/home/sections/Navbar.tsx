import { useState } from "react";
import { SignUpRolePopup } from "../../auth/registration/selection/SignUpPopup";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Fixoralogo from "@/assets/images/Logo.png";
import { Button } from "../../ui/button";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="px-4 bg-teal-700 sticky top-0 z-50">
      <div className="flex flex-row justify-between items-center h-14">
        <div className="flex items-center gap-x-2 font-bold text-3xl text-white">
          <HashLink smooth to="/#" className="flex items-center gap-x-2">
            <img
              src={Fixoralogo}
              alt="Fixora logo"
              className="h-12 w-auto object-contain"
            />
            <span className="italic">Fixora</span>
          </HashLink>
        </div>

        <div className="hidden md:flex flex-row items-center gap-x-5">
          <HashLink
            smooth
            to="/#"
            className="transition-colors hover:text-black/80 text-white font-semibold"
          >
            Home
          </HashLink>

          <Link
            to="/services"
            className="transition-colors hover:text-black/80 text-white"
          >
            Services
          </Link>
          <HashLink
            smooth
            to="/#about-section"
            className="transition-colors hover:text-black/80 text-white"
          >
            About
          </HashLink>
          <Link to="/LoginForm">
            <Button className="ml-3 text-white font-bold rounded-md bg-transparent hover:bg-teal-400 transition-colors">
              Login
            </Button>
          </Link>
          <SignUpRolePopup />
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden pb-4">
          <nav className="flex flex-col items-center gap-y-4 pt-2">
            <HashLink
              smooth
              to="/#"
              className="transition-colors hover:text-black/80 text-white font-semibold"
              onClick={closeMenu}
            >
              Home
            </HashLink>

            <Link
              to="/services"
              className="transition-colors hover:text-black/80 text-white"
              onClick={closeMenu}
            >
              Services
            </Link>
            <HashLink
              smooth
              to="/#about-section"
              className="transition-colors hover:text-black/80 text-white"
              onClick={closeMenu}
            >
              About
            </HashLink>

            <div className="w-3/4 h-px bg-teal-500 my-2"></div>

            <Link to="/LoginForm">
              <Button className="ml-3 text-white font-bold rounded-md bg-transparent hover:bg-teal-400 transition-colors">
                Login
              </Button>
            </Link>
            <SignUpRolePopup />
          </nav>
        </div>
      )}
    </div>
  );
}
