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
  const { className, onClick } = props;
  

  if (className?.includes("slick-disabled")) {
    return null;
  }

  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 right-4 z-20
                w-12 h-12 flex items-center justify-center
                rounded-full bg-black/30 text-white backdrop-blur-md border border-white/20
                transition-all duration-300 ease-in-out
                hover:bg-white hover:text-[#1d4b4a] hover:scale-110 
                hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]
                hidden lg:flex group cursor-pointer"
      onClick={onClick}
      aria-label="Next services"
    >
      <BsChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform duration-300" />
    </button>
  );
}

function SamplePrevArrow(props: any) {
  const { className, onClick } = props;

  if (className?.includes("slick-disabled")) {
    return null;
  }

  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 left-4 z-20
                w-12 h-12 flex items-center justify-center
                rounded-full bg-black/30 text-white backdrop-blur-md border border-white/20
                transition-all duration-300 ease-in-out
                hover:bg-white hover:text-[#1d4b4a] hover:scale-110 
                hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]
                hidden lg:flex group cursor-pointer"
      onClick={onClick}
      aria-label="Previous services"
    >
      <BsChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
    </button>
  );
}

export default function ServiceSection() {
  const settings = {
    dots: true,
    infinite: false,
    speed: 600,
    slidesToShow: 5,
    slidesToScroll: 5,
    initialSlide: 0,
    arrows: true,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1536,
        settings: {
          slidesToShow: 5,
          slidesToScroll: 5,
        },
      },
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
          centerPadding: "40px",
        },
      },
    ],
  };

  return (
    <div
      id="services"
      className="py-12 bg-[#1d4b4a] text-white border-b border-white/30 overflow-hidden relative"
    >
      <style>
        {`
          .slick-dots {
            bottom: -40px !important;
          }
          .slick-dots li {
            margin: 0 2px !important;
          }
          .slick-dots li button:before {
            font-size: 8px !important;
            color: white !important;
            opacity: 0.4 !important;
          }
          .slick-dots li.slick-active button:before {
            opacity: 1 !important;
            color: white !important;
            font-size: 10px !important;
          }
          
          .slick-track {
            display: flex !important;
            gap: 0;
          }
          
          .slick-slide {
            height: auto;
            display: flex;
            flex-direction: column; 
          }

          .slick-slide > div {
            height: 100%;
            display: flex;
            flex-direction: column;
          }

          .slick-list {
            overflow: visible;
            margin: 0 -10px;
            padding: 10px 0;
          }
          
          @media (min-width: 768px) {
             .slick-list {
                overflow: hidden;
             }
          }
        `}
      </style>

      <div className="container mx-auto px-4 sm:px-6 text-center mb-10 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
          Our Services
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
          Professional services for all your home and business needs
        </p>
      </div>

      <div className="relative w-full">
        <Slider {...settings}>
          {servicesData.map((service, index) => (
            <div key={index} className="h-full px-2 md:px-3 xl:px-4 pb-4 pt-2">
              <Link
                to={service.to}
                className="flex flex-col justify-center items-center h-full min-h-[150px] sm:min-h-[160px]
                             bg-[#2a9d8f] rounded-xl shadow-md text-center p-6
                             transition-all duration-300 
                             hover:shadow-2xl hover:bg-[#24867a] hover:-translate-y-2
                             border border-white/10 group outline-none"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-2 text-white leading-tight group-hover:text-white">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-100 leading-tight opacity-90">
                  {service.desc}
                </p>
              </Link>
            </div>
          ))}
        </Slider>
      </div>

      <div className="mt-12 text-center lg:hidden container mx-auto">
        <p className="text-gray-400 text-xs animate-pulse flex justify-center items-center gap-2">
          <span>Swipe for more</span>
          <BsChevronRight size={12} />
        </p>
      </div>
    </div>
  );
}