import LogoSrc from "../../assets/images/Logo.png";
import {
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaCcVisa,
  FaCcMastercard,
  FaFacebook,
} from "react-icons/fa";
import BkashLogo from "../../assets/images/bkash.png";
import NagadLogo from "../../assets/images/nagad.png";

interface MenuItem {
  title: string;
  links: {
    text: string;
    url: string;
  }[];
}

interface FooterProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  tagline?: string;
  menuItems?: MenuItem[];
  copyright?: string;
  bottomLinks?: {
    text: string;
    url: string;
  }[];
}

export default function Footer({
  logo = {
    src: LogoSrc,
    alt: "Fixora Logo",
    title: "FIXORA",
    url: "/",
  },
  tagline = "We fix your problems.",
  menuItems = [
    {
      title: "Our Services",
      links: [
        { text: "Electrician", url: "/services/electrician" },
        { text: "Plumber", url: "/services/plumber" },
        { text: "AC Technician", url: "/services/ac-technician" },
        {
          text: "Refrigerator Mechanic",
          url: "/services/refrigerator-mechanic",
        },
        { text: "Carpenter", url: "/services/carpenter" },
        { text: "All Services", url: "/services" },
      ],
    },
    {
      title: "Company",
      links: [
        { text: "About", url: "/about" },
        { text: "Contact", url: "/contact" },
        { text: "Careers", url: "/careers" },
      ],
    },
    {
      title: "Resources",
      links: [
        { text: "Help & FAQ", url: "/help" },
        { text: "Privacy Policy", url: "/privacy" },
      ],
    },
    {
      title: "Join Fixora",
      links: [
        { text: "Become a Provider", url: "/join-provider" },
        { text: "Download App", url: "/app" },
      ],
    },
  ],
  copyright = "© 2024 FIXORA. All rights reserved.",
  bottomLinks = [
    { text: "Terms and Conditions", url: "/terms" },
    { text: "Privacy Policy", url: "/privacy" },
  ],
}: FooterProps) {
  return (
    <footer className="pt-12 pb-8 bg-gray-950 text-gray-400">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-4">
            <a
              href={logo.url}
              className="flex items-center gap-2 lg:justify-start"
            >
              <img
                src={logo.src}
                alt={logo.alt}
                title={logo.title}
                className="h-9"
              />
              <span className="text-xl font-bold text-white">{logo.title}</span>
            </a>
            <p className="mt-3 font-medium max-w-xs">{tagline}</p>

            <div className="flex mt-5 space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <FaFacebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <FaTwitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <FaInstagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-300"
              >
                <FaLinkedin size={20} />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          {menuItems.map((section, sectionIdx) => (
            <div key={sectionIdx} className="col-span-1 lg:col-span-2">
              <h3 className="mb-3 font-bold text-white">{section.title}</h3>
              <ul className="space-y-2 text-sm">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx} className="font-normal">
                    <a
                      href={link.url}
                      className="hover:text-white hover:underline transition-colors duration-300"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col-reverse justify-between gap-6 border-t border-gray-700 pt-6 text-sm font-medium md:flex-row md:items-center">
          <div className="text-center md:text-left">
            <p>{copyright}</p>
            <ul className="flex gap-4 justify-center md:justify-start mt-2">
              {bottomLinks.map((link, linkIdx) => (
                <li key={linkIdx} className="hover:text-white underline">
                  <a href={link.url}>{link.text}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center items-center gap-2 text-gray-500">
            <span className="hidden text-sm md:block">We accept:</span>
            <FaCcVisa size={24} />
            <FaCcMastercard size={24} />
            <img src={BkashLogo} alt="bKash" className="h-6" />
            <img src={NagadLogo} alt="Nagad" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}
