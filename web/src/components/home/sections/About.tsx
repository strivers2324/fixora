// ADDED: Prothomei Link import kore nite hobe
import { Link } from "react-router-dom";

export default function AboutSection() {
    return (
        <div id="about-section" className="py-12 pt-0 bg-[#1d4b4a] text-white">
            <div className="container mx-auto px-4">
                {/*  About Section  */}
                <div className="mt-12 md:mt-20 max-w-4xl mx-auto text-left">
                    <h2 className="text-4xl font-bold mb-4">About</h2>
                    <p className="text-lg text-gray-200 mb-4">
                        At Fixora, we believe great service starts with trust.
                    </p>
                    <p className="text-lg text-gray-200 mb-4">
                        Whether you need a quick fix or a skilled expert, our platform helps you connect with the right people near you.
                    </p>
                    <p className="text-lg text-gray-200 mb-6">
                        Together, we're building a community where work gets done faster, smarter, and safer.
                    </p>

                    {/*  Learn More Button  */}
                    <Link
                        to="/about"
                        className="inline-block bg-white text-gray-900 font-bold py-2 px-6 
                       rounded-lg shadow-md hover:bg-gray-200 transition-colors"
                    >
                        Learn More
                    </Link>
                </div>

            </div>
        </div>
    );
}