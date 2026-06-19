import React from "react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 transition-colors duration-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-5 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Terms and Conditions for Service Providers
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Last Updated: June 2026</p>
        </div>

        <div className="space-y-8 text-sm md:text-base leading-relaxed">
          <p className="text-justify">
            Welcome to Fixora. Please read these Terms and Conditions carefully before completing your registration as a
            Service Provider. By signing up and checking the agreement box, you confirm that you accept and agree to
            comply with all the policies stated below.
          </p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-500">
              1. Eligibility and Registration Requirements
            </h2>
            <p>
              To register and operate as a verified service provider on the Fixora platform, you must meet the following
              baseline criteria:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-justify">
              <li>
                <span className="text-slate-900 dark:text-slate-50 font-semibold">Age Limit:</span> You must be at least
                18 years of age or older to offer professional services.
              </li>
              <li>
                <span className="text-slate-900 dark:text-slate-50 font-semibold">Identity Verification:</span> You must
                provide a valid National Identification (NID) card during signup. Submitting fake, altered, or
                third-party identification will result in an immediate and permanent ban.
              </li>
              <li>
                <span className="text-slate-900 dark:text-slate-50 font-semibold">Professional Equipment:</span> You
                must own and maintain your own operational toolbox and essential technical equipment required to fulfill
                requests in your chosen field.
              </li>
              <li>
                <span className="text-slate-900 dark:text-slate-50 font-semibold">Smartphone Connectivity:</span> You
                must possess an active smartphone with stable internet connectivity to manage client updates, GPS
                tracking, and request completions.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-500">
              2. Service Quality and Professionalism
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-justify">
              <li>
                Providers must maintain polite, honest, and strictly professional behavior when dealing with customers.
                Any form of harassment or unprofessional misconduct will lead to immediate profile suspension.
              </li>
              <li>
                Ensuring physical safety protocols for yourself and the customer's property during the service process
                is solely the responsibility of the service provider.
              </li>
              <li>
                You must deliver authentic solutions and avoid installing sub-standard, counterfeit, or overcharged
                materials. Transparency in material pricing is mandatory.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-500">3. Platform Commission and Fees</h2>
            <p className="text-justify">
              Fixora operates on a percentage-based commission system. A standard platform fee (ranging from 10% to 15%)
              will be automatically deducted upon the successful completion and payment of every individual service
              order. Detailed withdrawal thresholds, settlement times, and ledger balances will be visible transparently
              inside your provider dashboard.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-500">
              4. Background Screening and Safety
            </h2>
            <p className="text-justify">
              To keep the platform secure, Fixora's internal safety team runs standard automated and physical
              verification checks on your NID, address details, and trade background. Your profile will remain in a
              pending state and will not receive real-time job requests until this screening process is fully verified
              and cleared.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-teal-600 dark:text-teal-500">
              5. Profile Suspension and Deactivation
            </h2>
            <p className="mb-2">
              Fixora reserves the absolute right to temporarily suspend or permanently terminate your access to the
              platform under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-justify">
              <li>
                Repeatedly ignoring or rejecting consumer booking requests after explicitly accepting them without a
                valid excuse.
              </li>
              <li>
                Attempting to bypass the Fixora payment gateway to deal with customers directly via personal contact
                details discovered on the platform.
              </li>
              <li>
                Violating local municipal laws, privacy guidelines, or engaging in any fraudulent activity during active
                service shifts.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white text-sm font-medium py-2 px-5 rounded-md transition-colors duration-150 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950"
          >
            I Understand, Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
