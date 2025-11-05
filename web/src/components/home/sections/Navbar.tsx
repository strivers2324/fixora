import { SignUpRolePopup } from "../../auth/registration/selection/SignUpPopup";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Fixoralogo from "@/assets/images/Logo.png";
import { Button } from "../../ui/button";

export default function Navbar() {
  return (
    <div className="px-4 h-14 bg-teal-700 sticky top-0 z-50">
      <div className="flex flex-row justify-between items-center h-full">
        <div className="flex items-center gap-x-2 font-bold text-3xl text-white mr-0 mt-4">
          <Link to="/" className="flex items-center gap-x-2">
            <img
              src={Fixoralogo}
              alt="Fixora logo"
              className="w-20 h-20 md:w-32 md:h-32 lg:w-30 lg:h-20 object-contain mr-2 mb-0"
            />
            <span className="mb-5 italic">Fixora</span>
          </Link>
        </div>

        <div className="flex flex-row items-center gap-x-5">
          <Link
            to="/"
            className="transition-colors hover:text-black/80 text-white font-semibold"
          >
            Home
          </Link>
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
          <Button className="ml-3 text-white font-bold rounded-md bg-transparent hover:bg-teal-400 transition-colors">
            Login
          </Button>
          <SignUpRolePopup />
        </div>
      </div>
    </div>
  );
}