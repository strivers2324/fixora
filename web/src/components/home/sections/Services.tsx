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
    title: "Broadband Internet Provider",
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
      className="absolute top-1/2 -translate-y-1/2 right-0 z-10
                 bg-white text-[#1d4b4a] hover:bg-gray-200
                 rounded-full p-3 shadow-lg cursor-pointer transition-all"
      onClick={onClick}
    >
      <BsChevronRight size={20} />
    </button>
  );
}

function SamplePrevArrow(props: any) {
  const { onClick } = props;
  return (
    <button
      className="absolute top-1/2 -translate-y-1/2 left-0 z-10
                 bg-white text-[#1d4b4a] hover:bg-gray-200
                 rounded-full p-3 shadow-lg cursor-pointer transition-all"
      onClick={onClick}
    >
      <BsChevronLeft size={20} />
    </button>
  );
}

export default function ServiceSection() {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 4,
    nextArrow: <SampleNextArrow />,
    prevArrow: <SamplePrevArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
    ],
  };

  return (
    <div className="py-12 bg-[#1d4b4a] text-white border-b border-white/30">
      <style>
        {`
          .slick-dots {
            bottom: -25px !important;
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
        `}
      </style>

      <div className="container mx-auto px-10 md:px-12 relative">
        <Slider {...settings}>
          {servicesData.map((service, index) => (
            <div key={index} className="px-3">
              <Link
                to={service.to}
                className="block p-6 bg-[#2a9d8f] rounded-lg shadow-lg text-center
                           transition-all duration-300 hover:shadow-xl 
                           h-52 flex flex-col justify-center"
              >
                <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                <p className="text-base text-gray-200">{service.desc}</p>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
}
