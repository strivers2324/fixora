import React from 'react';
import LogoSrc from '../../assets/images/Logo.png';

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
            title: "Product",
            links: [
                { text: "Overview", url: "#" },
                { text: "Features", url: "#" },
                { text: "Pricing", url: "#" },
            ],
        },
        {
            title: "Company",
            links: [
                { text: "About", url: "#" },
                { text: "Contact", url: "#" },
                { text: "Careers", url: "#" },
            ],
        },
        {
            title: "Resources",
            links: [
                { text: "Help", url: "#" },
                { text: "Privacy", url: "#" },
            ],
        },
        {
            title: "Social",
            links: [
                { text: "Twitter", url: "#" },
                { text: "Instagram", url: "#" },
                { text: "LinkedIn", url: "#" },
            ],
        },
    ],
    copyright = "© 2024 FIXORA. All rights reserved.",
    bottomLinks = [
        { text: "Terms and Conditions", url: "#" },
        { text: "Privacy Policy", url: "#" },
    ],
}: FooterProps) {
    return (
        <footer className="py-24 bg-gray-900 text-gray-300">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 gap-8 lg:grid-cols-6">
                    <div className="col-span-2 mb-8 lg:mb-0">
                        <a href={logo.url} className="flex items-center gap-2 lg:justify-start">
                            <img
                                src={logo.src}
                                alt={logo.alt}
                                title={logo.title}
                                className="h-10"
                            />
                            <span className="text-xl font-bold text-white">{logo.title}</span>
                        </a>
                        <p className="mt-4 font-medium">{tagline}</p>
                    </div>

                    {menuItems.map((section, sectionIdx) => (
                        <div key={sectionIdx}>
                            <h3 className="mb-4 font-bold text-white">{section.title}</h3>
                            <ul className="text-gray-400 space-y-4">
                                {section.links.map((link, linkIdx) => (
                                    <li
                                        key={linkIdx}
                                        className="hover:text-white font-medium"
                                    >
                                        <a href={link.url}>{link.text}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="text-gray-400 mt-20 flex flex-col justify-between gap-4 border-t border-gray-700 pt-8 text-sm font-medium md:flex-row md:items-center">
                    <p>{copyright}</p>
                    <ul className="flex gap-4">
                        {bottomLinks.map((link, linkIdx) => (
                            <li key={linkIdx} className="hover:text-white underline">
                                <a href={link.url}>{link.text}</a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </footer>
    );
}