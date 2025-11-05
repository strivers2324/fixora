import Hero from "./sections/Hero";
import ServiceSection from "./sections/Services";
import AboutSection from "./sections/About";

function HomePage() {
    return (
        <div className="w-full flex flex-col min-h-screen bg-gray-100">
            <Hero />
            <ServiceSection />
            <div className="h-px w-full bg-gray-300"></div>
            <AboutSection />
        </div>
    );
}

export default HomePage;