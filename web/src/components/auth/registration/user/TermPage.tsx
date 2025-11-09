export default function UserTermsPage() {
    return (
        <div className="pt-24 pb-12 bg-gray-100 min-h-screen flex items-center justify-center">
            <div className="container mx-auto px-10 py-10 max-w-4xl bg-teal-900 rounded-2xl shadow-2xl">
                <h1 className="text-4xl font-bold text-center mb-8 text-white">
                    Terms and Conditions (for Users)
                </h1>

                <div className="space-y-6 text-white">
                    <p>
                        Welcome to Fixora! These terms outline the rules for users
                        booking services through our platform.
                    </p>

                    <h2 className="text-2xl font-semibold mt-6">1. Booking Services</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            You must provide accurate and complete information (name,
                            address, phone number) when booking a service.
                        </li>
                        <li>
                            By booking, you agree to allow the service provider to
                            visit your specified location at the agreed time.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">2. Payment</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            You agree to pay the service fee as quoted on the platform or
                            as agreed upon with the service provider.
                        </li>
                        <li>
                            Payments must be made promptly upon completion of the service.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">3. User Conduct</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            Users must treat service providers with respect and provide a
                            safe working environment.
                        </li>
                        <li>
                            Any form of harassment or abuse towards service providers
                            will result in a permanent ban from the platform.
                        </li>
                    </ul>

                    <h2 className="text-2xl font-semibold mt-6">
                        4. Limitation of Liability
                    </h2>
                    <p>
                        Fixora is a platform connecting users with service providers. We
                        are not responsible for the quality of service, damages, or any
                        disputes between you and the service provider. We do not
                        guarantee the provider's quality of work.
                    </p>
                </div>
            </div>
        </div>
    );
}