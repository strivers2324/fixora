import Hero from "./sections/Hero";
import ServiceSection from "./sections/Services";
import AboutSection from "./sections/About";

function HomePage() {
  return (
    <div className="w-full flex flex-col min-h-screen">
      <Hero />
      <ServiceSection />
      <AboutSection />
    </div>
  );
}

export default HomePage;
