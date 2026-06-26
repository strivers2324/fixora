import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const serviceCategories = [
  {
    categoryName: "Appliance Repair",
    services: [
      {
        title: "AC Technician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/AC.webp",
      },
      {
        title: "Refrigerator Mechanic",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Refrigerator.webp",
      },
      {
        title: "Washing Machine Technician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Washing%20machine.webp",
      },
      {
        title: "TV Technician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/TV.webp",
      },
      {
        title: "IPS/Inverter Technician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/IPS.webp",
      },
      {
        title: "Home Appliance Technician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Home%20Appliance.webp",
      },
    ],
  },
  {
    categoryName: "Home Maintenance",
    services: [
      {
        title: "Electrician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Electrician.webp",
      },
      {
        title: "Plumber",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Plumber.webp",
      },
      {
        title: "Carpenter",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Carpenter.webp",
      },
      {
        title: "Water Pump Technician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/WaterPump.webp",
      },
      {
        title: "Lift Technician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Lift.webp",
      },
      {
        title: "Automobile Mechanic",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Auto%20Mobile.webp",
      },
    ],
  },
  {
    categoryName: "IT & Security",
    services: [
      {
        title: "CCTV Installer",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/CCTV.webp",
      },
      {
        title: "Broadband Internet Provider",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Broadband%20Internet.webp",
      },
      {
        title: "Computer Technician",
        img: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Computer%20Technician.webp",
      },
    ],
  },
];

function SampleNextArrow(props: any) {
  const { className, onClick, currentSlide, slideCount, sliderWidth } = props;

  if (className?.includes("slick-disabled")) return null;

  const remainingWidth = (slideCount - currentSlide) * 274;
  if (remainingWidth <= sliderWidth) return null;

  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 right-1 md:right-2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/20 md:bg-black/40 text-white/80 md:text-white backdrop-blur-sm border border-white/10 transition-all hover:bg-teal-600 hover:scale-110 shadow-lg"
      onClick={onClick}
    >
      <BsChevronRight size={16} className="md:hidden" />
      <BsChevronRight size={20} className="hidden md:block" />
    </button>
  );
}

function SamplePrevArrow(props: any) {
  const { className, onClick } = props;
  if (className?.includes("slick-disabled")) return null;

  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 left-1 md:left-2 z-20 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-black/20 md:bg-black/40 text-white/80 md:text-white backdrop-blur-sm border border-white/10 transition-all hover:bg-teal-600 hover:scale-110 shadow-lg"
      onClick={onClick}
    >
      <BsChevronLeft size={16} className="md:hidden" />
      <BsChevronLeft size={20} className="hidden md:block" />
    </button>
  );
}

export default function ServiceSection() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  let sliderWidth = windowWidth - 32;
  if (windowWidth >= 1536) sliderWidth = 1440;
  else if (windowWidth >= 1280) sliderWidth = 1184;
  else if (windowWidth >= 1024) sliderWidth = 928;
  else if (windowWidth >= 768) sliderWidth = 672;
  else if (windowWidth >= 640) sliderWidth = 592;

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    variableWidth: true,
    nextArrow: <SampleNextArrow sliderWidth={sliderWidth} />,
    prevArrow: <SamplePrevArrow />,
  };

  return (
    <div
      id="services"
      className="scroll-mt-24 py-16 bg-[#0E2629] text-white border-b border-white/10 w-full overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        {serviceCategories.map((cat, index) => {
          const totalItemsWidth = cat.services.length * 274;
          const shouldCenter = totalItemsWidth <= sliderWidth;

          return (
            <div key={index} className="mb-14 last:mb-0 relative">
              <div className="flex justify-between items-end mb-6">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white tracking-wide">
                  {cat.categoryName}
                </h2>
              </div>

              <div
                className={`relative -mx-2 ${
                  shouldCenter
                    ? "[&_.slick-track]:!flex [&_.slick-track]:!justify-center [&_.slick-track]:!w-full [&_.slick-track]:!transform-none [&_.slick-slide]:!float-none [&_.slick-slide]:!w-[274px]"
                    : ""
                }`}
              >
                <Slider {...settings}>
                  {cat.services.map((service, idx) => (
                    <div key={idx} className="px-2 pb-4 w-[274px]">
                      <Link
                        to="/login"
                        className="block w-[258px] h-[232px] bg-teal-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/5 group flex flex-col"
                      >
                        <div className="w-full h-[144px] overflow-hidden relative bg-white shrink-0">
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                          <img
                            src={service.img}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>

                        <div className="p-3 text-center bg-teal-950 flex-grow flex items-center justify-center h-[88px]">
                          <h3 className="text-xs sm:text-sm font-semibold text-gray-100 group-hover:text-white transition-colors line-clamp-2">
                            {service.title}
                          </h3>
                        </div>
                      </Link>
                    </div>
                  ))}
                </Slider>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
