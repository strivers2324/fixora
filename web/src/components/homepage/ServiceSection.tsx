import { Link } from "react-router-dom";

export default function ServiceSection() {
    return (
        <div className="py-12 bg-[#1d4b4a] text-white">
            <div className="container mx-auto px-4">

                {/*  Service Card Grid  */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* Card 1: Electrician */}
                    <Link
                        to="/services/electrician"
                        className="block p-6 bg-[#2a9d8f] rounded-lg shadow-lg text-center 
                       transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <h3 className="text-xl font-bold mb-2">Electrician</h3>
                        <p className="text-base text-gray-200">Fix electrical issues</p>
                    </Link>

                    {/* Card 2: Plumber */}
                    <Link
                        to="/services/plumber"
                        className="block p-6 bg-[#2a9d8f] rounded-lg shadow-lg text-center 
                       transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <h3 className="text-xl font-semibold mb-2">Plumber</h3>
                        <p className="text-base text-gray-200">Solve plumbing problems</p>
                    </Link>

                    {/* Card 3: AC Mechanic */}
                    <Link
                        to="/services/ac-mechanic"
                        className="block p-6 bg-[#2a9d8f] rounded-lg shadow-lg text-center 
                       transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <h3 className="text-xl font-semibold mb-2">AC Mechanic</h3>
                        <p className="text-base text-gray-200">Air conditioning service</p>
                    </Link>

                    {/* Card 4: Painter */}
                    <Link
                        to="/services/painter"
                        className="block p-6 bg-[#2a9d8f] rounded-lg shadow-lg text-center 
                       transition-all duration-300 hover:scale-105 hover:shadow-xl"
                    >
                        <h3 className="text-xl font-semibold mb-2">Painter</h3>
                        <p className="text-base text-gray-200">Paint houses</p>
                    </Link>

                </div>
            </div>
        </div>
    );
}