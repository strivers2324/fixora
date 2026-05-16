import { ShieldCheck, Users, Briefcase, Star, CheckCircle2 } from "lucide-react";

export default function AboutSection() {
  return (
    <div
      id="about"
      className="scroll-mt-24 py-16 bg-[#0E2629] text-white border-b border-white/10 w-full overflow-hidden"
    >
      <div id="about" className="scroll-mt-24 w-full bg-[#0E2629] text-white pt-8 pb-20 relative overflow-hidden">
        <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-20 right-[-10%] w-[600px] h-[600px] bg-pink-600/5 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 mb-20 relative z-10">
          <div className="bg-black/20 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.3)] border border-white/10 relative overflow-hidden group">
            <div className="md:w-2/3 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center gap-3 text-white">
                Because we care about your safety..
                <ShieldCheck className="w-8 h-8 text-teal-400" />
              </h2>
              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-400" />
                  <p className="text-gray-300 text-lg">Verified & background-checked professionals.</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-400" />
                  <p className="text-gray-300 text-lg">Safe & secure online payments.</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-teal-400" />
                  <p className="text-gray-300 text-lg">100% satisfaction guarantee.</p>
                </div>
              </div>
            </div>

            <div className="md:w-1/3 mt-8 md:mt-0 flex justify-center relative z-10">
              <div className="w-48 h-48 bg-black/40 rounded-full flex items-center justify-center border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.15)] backdrop-blur-md">
                <ShieldCheck className="w-24 h-24 text-teal-400 opacity-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 border-t border-white/5 pt-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center group">
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-teal-500/20">
                <Users className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-4xl font-bold mb-2 text-white">15,000+</h3>
              <p className="text-gray-400 font-medium">Service Providers</p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-teal-500/20">
                <Briefcase className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-4xl font-bold mb-2 text-white">2,00,000+</h3>
              <p className="text-gray-400 font-medium">Order Served</p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-teal-500/20">
                <Star className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-4xl font-bold mb-2 text-white">1,00,000+</h3>
              <p className="text-gray-400 font-medium">5 Star Reviews</p>
            </div>

            <div className="flex flex-col items-center group">
              <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-teal-500/20">
                <ShieldCheck className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-4xl font-bold mb-2 text-white">100%</h3>
              <p className="text-gray-400 font-medium">Safe & Secure</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 mt-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 bg-[#0a1d1f]/80 backdrop-blur-md p-8 md:p-16 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="md:w-1/2">
              <div className="inline-block bg-teal-500/10 text-teal-400 border border-teal-500/20 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider uppercase mb-6">
                Upcoming App
              </div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-white">
                Easiest way to get a service
              </h2>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                Download the Fixora app and book your required service in just a few clicks. Fast, reliable, and always
                at your fingertips.
              </p>

              <div className="flex flex-wrap gap-4">
                <button className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                    alt="Google Play"
                    className="h-8"
                  />
                </button>
                <button className="flex items-center gap-3 bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(255,255,255,0.1)]">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                    alt="App Store"
                    className="h-8"
                  />
                </button>
              </div>
            </div>

            <div className="md:w-1/2 flex justify-center">
              <div className="w-64 h-[500px] bg-black rounded-[3rem] border-[8px] border-zinc-800 shadow-[0_0_40px_rgba(20,184,166,0.15)] overflow-hidden relative">
                <div className="absolute top-0 w-full h-6 bg-zinc-800 rounded-b-3xl z-20"></div>
                <div className="w-full h-full bg-[#0E2629] p-4 pt-12 flex flex-col items-center relative z-10">
                  <h3 className="text-2xl font-bold mb-6 text-white text-center flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-teal-400" />
                    Fixora
                  </h3>
                  <div className="w-full bg-white/5 border border-white/10 h-24 rounded-2xl mb-4 backdrop-blur-sm animate-pulse"></div>
                  <div
                    className="w-full bg-white/5 border border-white/10 h-24 rounded-2xl mb-4 backdrop-blur-sm animate-pulse"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-full bg-white/5 border border-white/10 h-24 rounded-2xl mb-4 backdrop-blur-sm animate-pulse"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
