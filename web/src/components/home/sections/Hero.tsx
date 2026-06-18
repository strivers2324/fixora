import { useState, useEffect } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function Hero() {
  const summerServices = [
    {
      id: 1,
      title: "Expert AC Servicing",
      image: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/AC.webp",
      color: "from-blue-600/30 to-cyan-400/20",
      border: "border-blue-500/30",
    },
    {
      id: 2,
      title: "Fridge & Freezer Repair",
      image: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/Refrigerator.webp",
      color: "from-teal-600/30 to-emerald-400/20",
      border: "border-teal-500/30",
    },
    {
      id: 3,
      title: "Ceiling Fan Fix",
      image: "https://fqrizkinvolsebociwtt.supabase.co/storage/v1/object/public/images/CeilingFanRepair.webp",
      color: "from-indigo-600/30 to-purple-400/20",
      border: "border-indigo-500/30",
    },
  ];

  const [currentSlides] = useState(summerServices);
  const [seasonInfo] = useState({ name: "Top Trending Services", icon: CheckCircle2, color: "text-teal-400" });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % currentSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [currentSlides.length]);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-zinc-950 overflow-hidden pt-28 pb-12 lg:py-0">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/80 via-zinc-900/60 to-zinc-950"></div>

        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px)`,
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, #000 30%, transparent 100%)",
          }}
        ></div>

        <div className="absolute top-0 left-[-10%] w-[800px] h-[800px] bg-pink-600/5 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 right-[-10%] w-[900px] h-[900px] bg-teal-500/10 blur-[180px] rounded-full"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
        <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-3 px-4 py-2 md:px-5 md:py-2.5 rounded-full bg-white/5 border border-white/10 text-xs md:text-sm font-medium backdrop-blur-md">
            <seasonInfo.icon className={`w-4 h-4 md:w-5 md:h-5 ${seasonInfo.color} animate-pulse`} />
            <span className="text-white tracking-wide uppercase">{seasonInfo.name}</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tighter leading-[1.1] text-white">
              Your Personal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-pink-600 drop-shadow-[0_2px_15px_rgba(219,39,119,0.3)]">
                Assistant
              </span>
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-gray-300 font-light max-w-md lg:max-w-lg leading-relaxed">
              Professional services delivered at your doorstep. Fast, reliable, and verified experts just for you.
            </p>
          </div>

          <div className="pt-2 md:pt-4">
            <Link to="/login">
              <button className="group relative px-6 py-3 md:px-8 md:py-4 font-semibold text-white transition-all duration-300 ease-out rounded-full bg-white/5 border border-white/10 hover:border-transparent hover:shadow-[0_10px_40px_rgba(219,39,119,0.3)] overflow-hidden hover:-translate-y-1">
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
                <span className="relative flex items-center justify-center gap-2 md:gap-3 z-10 text-base md:text-lg tracking-wide">
                  Explore Our Services
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
                </span>
              </button>
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7 relative h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] flex items-center justify-center lg:justify-end mt-4 lg:mt-0">
          <div className="relative w-full max-w-[300px] md:max-w-[400px] lg:max-w-[450px] xl:max-w-[480px] h-full">
            {currentSlides.map((slide, index) => {
              const offset = (index - currentSlideIndex + currentSlides.length) % currentSlides.length;
              const isActive = offset === 0;

              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] border ${isActive ? `${slide.border} z-30 opacity-100 scale-100 shadow-[0_30px_80px_rgba(0,0,0,0.6)]` : "border-white/5 z-10 opacity-0 scale-90 translate-x-10 sm:translate-x-14"}`}
                  style={{
                    transform: isActive
                      ? "none"
                      : `translateX(${offset * 30}px) scale(${1 - offset * 0.05}) rotate(${offset * 3}deg)`,
                    filter: isActive ? "none" : "blur(8px)",
                  }}
                >
                  <div className="relative h-[70%] sm:h-[75%] w-full bg-zinc-900 overflow-hidden">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className={`w-full h-full object-cover transition-transform duration-[15s] ${isActive ? "scale-110" : "scale-100"}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/10 to-transparent"></div>
                  </div>

                  <div
                    className={`h-[30%] sm:h-[25%] flex flex-col justify-center p-6 sm:p-8 bg-gradient-to-br ${isActive ? slide.color : "from-teal-950 to-teal-950"}`}
                  >
                    <h3
                      className={`text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white transition-all duration-700 ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                    >
                      {slide.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
