import Hero from "./sections/Hero";
import ServiceSection from "./sections/Services";
import AboutSection from "./sections/About";
import Footer from "../layout/Footer";

function HomePage() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <Hero />
      <ServiceSection />
      <AboutSection />
      <Footer />
    </div>
  );
}

export default HomePage;
