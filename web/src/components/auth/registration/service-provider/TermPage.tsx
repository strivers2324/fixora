export default function TermsPage() {
    return (
        <div className="pt-24 pb-12 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-10 py-10 max-w-4xl bg-teal-900 rounded-2xl shadow-2xl">
                <h1 className="text-4xl font-bold text-center mb-8 text-white">
                    Terms and Conditions
                </h1>

                <div className="space-y-6 text-white">
                    <p>
                        Welcome to Fixora! These terms and conditions outline the rules and
                        regulations for the use of Fixora's Website.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">1. Introduction</h2>
                    <p>
                        By accessing this website we assume you accept these terms and
                        conditions. Do not continue to use Fixora if you do not agree to
                        take all of the terms and conditions stated on this page.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">
                        2. Service Provider Obligations
                    </h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            Service providers must provide accurate and complete information
                            during registration.
                        </li>
                        <li>
                            Service providers must maintain professionalism and provide
                            services to the best of their ability.
                        </li>
                        <li>
                            All service providers will be subject to a background check.
                        </li>
                    </ul>
                    <h2 className="text-2xl font-semibold mt-6">3. User Obligations</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            Users must provide accurate information when booking a service.
                        </li>
                        <li>
                            Users agree to treat service providers with respect.
                        </li>
                    </ul>
                    <h2 className="text-2xl font-semibold mt-6">
                        4. Limitation of Liability
                    </h2>
                    <p>
                        Fixora is a platform connecting users with service providers. We are
                        not responsible for the quality of service, damages, or any
                        disputes between the user and the service provider.
                    </p>
                </div>
            </div>
        </div>
    );
}