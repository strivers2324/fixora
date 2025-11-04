import { Button } from '../../ui/button';
import HeroImage from "../../../assets/images/Hero.png";


export default function Hero() {
    return (
        <section
            className="relative w-full min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${HeroImage})` }}
        >
            <div className="absolute inset-0 bg-black/60 z-10" />
            <div className="relative z-20 container mx-auto text-center text-white px-4">

                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                    Welcome to Fixora
                </h1>

                <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10">
                    Your one-stop solution for all service and repair needs.
                </p>
                <Button
                    size="lg"
                    className="bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold text-lg py-6 px-8"
                >
                    Explore Our Services
                </Button>

            </div>
        </section>
    );
}
