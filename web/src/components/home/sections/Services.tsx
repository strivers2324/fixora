import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";

const servicesData = [
  {
    to: "/services/electrician",
    title: "Electrician",
    desc: "Electrical solutions",
  },
  {
    to: "/services/ac-technician",
    title: "AC Technician",
    desc: "AC repair & service",
  },
  {
    to: "/services/refrigerator-mechanic",
    title: "Refrigerator Mechanic",
    desc: "Fridge repair",
  },
  {
    to: "/services/plumber",
    title: "Plumber",
    desc: "Plumbing solutions",
  },
  {
    to: "/services/carpenter",
    title: "Carpenter",
    desc: "Wooden furniture & repair",
  },
  {
    to: "/services/cctv-installer",
    title: "CCTV Installer",
    desc: "Security camera installation",
  },
  {
    to: "/services/broadband-provider",
    title: "Broadband Provider",
    desc: "High-speed internet",
  },
  {
    to: "/services/ips-inverter-technician",
    title: "IPS/Inverter Technician",
    desc: "Power backup solutions",
  },
  {
    to: "/services/washing-machine-technician",
    title: "Washing Machine Technician",
    desc: "Washing machine repair",
  },
  {
    to: "/services/computer-technician",
    title: "Computer Technician",
    desc: "PC & laptop repair",
  },
  {
    to: "/services/tv-technician",
    title: "TV Technician",
    desc: "Television repair",
  },
  {
    to: "/services/automobile-mechanic",
    title: "Automobile Mechanic",
    desc: "Car & bike service",
  },
  {
    to: "/services/lift-technician",
    title: "Lift Technician",
    desc: "Elevator repair & service",
  },
  {
    to: "/services/water-pump-technician",
    title: "Water Pump Technician",
    desc: "Water pump repair",
  },
];

function SampleNextArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 -right-5 z-10
                bg-white text-[#1d4b4a] hover:bg-gray-200
                rounded-full p-3 shadow-lg cursor-pointer transition-all
                hidden lg:flex items-center justify-center border border-gray-300
                hover:scale-110 active:scale-95"
      onClick={onClick}
      aria-label="Next services"
    >
      <BsChevronRight size={20} />
    </button>
  );
}

function SamplePrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 -left-5 z-10
                bg-white text-[#1d4b4a] hover:bg-gray-200
                rounded-full p-3 shadow-lg cursor-pointer transition-all
                hidden lg:flex items-center justify-center border border-gray-300
                hover:scale-110 active:scale-95"
      onClick={onClick}
      aria-label="Previous services"
    >
      <BsChevronLeft size={20} />
    </button>
  );
}

export default function ServiceSection() {
  const settings = {
    dots: true,
    infinite: false,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 4,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 4,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
          centerMode: true,
          centerPadding: "20px",
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
          centerMode: true,
          centerPadding: "15px",
        },
      },
    ],
  };

  return (
    <div
      id="services"
      style={{ scrollMarginTop: "70px" }}
      className="py-8 sm:py-12 bg-[#1d4b4a] text-white border-b border-white/30 overflow-hidden"
    >
      <style>
        {`
          .slick-dots {
            bottom: -35px !important;
          }
          .slick-dots li {
            margin: 0 3px !important;
          }
          .slick-dots li button:before {
            font-size: 10px !important;
            color: white !important;
            opacity: 0.5 !important;
          }
          .slick-dots li.slick-active button:before {
            opacity: 1 !important;
            color: white !important;
          }
          
          .slick-slider {
            width: 100% !important;
          }
          
          .slick-list {
            margin: 0 -10px;
            padding: 10px 0 !important;
            overflow: visible !important;
          }
          
          .slick-slide {
            padding: 0 10px;
            height: inherit !important;
          }
          
          .slick-track {
            display: flex !important;
            align-items: stretch !important;
          }
          
          .slick-slide > div {
            height: 100%;
          }
          
          @media (max-width: 640px) {
            .slick-list {
              margin: 0 -5px;
              padding: 5px 0 !important;
            }
            .slick-slide {
              padding: 0 5px;
            }
            .slick-slide.slick-center {
              transform: scale(1) !important;
            }
          }
          
          .slick-prev, .slick-next {
            display: none !important;
          }
        `}
      </style>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Our Services
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base px-4">
            Professional services for all your home and business needs
          </p>
        </div>

        <div className="relative max-w-full mx-auto">
          <div className="w-full">
            <Slider {...settings}>
              {servicesData.map((service, index) => (
                <div key={index} className="h-full focus:outline-none">
                  <Link
                    to={service.to}
                    className="block w-full p-4 bg-[#2a9d8f] rounded-lg shadow-lg text-center
                                 transition-all duration-200 hover:shadow-xl hover:bg-[#24867a] 
                                 h-full flex flex-col justify-center min-h-[100px] sm:min-h-[120px]
                                 border border-white/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <h3 className="text-sm sm:text-base font-bold mb-1 sm:mb-2 text-white leading-tight">
                      {service.title}
                    </h3>
                    <p className="text-xs text-gray-200 leading-tight">
                      {service.desc}
                    </p>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-300 text-xs sm:text-sm lg:hidden animate-pulse">
            ← Swipe to explore more services →
          </p>
        </div>
      </div>
    </div>
  );
}
