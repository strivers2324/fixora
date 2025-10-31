import Hero from "./hero.tsx";
import ServiceSection from "./ServiceSection.tsx";
import AboutSection from "./AboutSection.tsx";

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