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
  const { className, onClick } = props;
  if (className?.includes("slick-disabled")) return null;

  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 right-0 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-teal-600 hover:scale-110 hidden lg:flex shadow-lg"
      onClick={onClick}
    >
      <BsChevronRight size={20} />
    </button>
  );
}

function SamplePrevArrow(props: any) {
  const { className, onClick } = props;

  if (className?.includes("slick-disabled")) return null;

  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 left-0 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20 transition-all hover:bg-teal-600 hover:scale-110 hidden lg:flex shadow-lg"
      onClick={onClick}
    >
      <BsChevronLeft size={20} />
    </button>
  );
}

export default function ServiceSection() {
  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1.2, arrows: false } },
    ],
  };

  return (
    <div
      id="services"
      className="scroll-mt-24 py-16 bg-[#0E2629] text-white border-b border-white/10 w-full overflow-hidden"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        {serviceCategories.map((cat, index) => (
          <div key={index} className="mb-14 last:mb-0 relative">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wide">{cat.categoryName}</h2>
            </div>

            <div className="relative -mx-2">
              <Slider {...settings}>
                {cat.services.map((service, idx) => (
                  <div key={idx} className="px-2 pb-4">
                    <Link
                      to="/login"
                      className="block bg-teal-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-white/5 group"
                    >
                      <div className="w-full h-40 overflow-hidden relative bg-white">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                        <img
                          src={service.img}
                          alt={service.title}
                          className="w-50px h-80px object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      <div className="p-4 text-center bg-teal-950">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
                          {service.title}
                        </h3>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
