// src/app/page.tsx
import Link from 'next/link';
import { Stethoscope, Pill } from 'lucide-react';

export default function LandingPage() {
  return (
    // Main Background: Gray-50 in Light, Dark-Surface-Muted (Deep Gray) in Dark
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-dark-surfaceMuted p-8 transition-colors duration-300">
      
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 dark:text-dark-textPrimary">
          Welcome to SehatSetu
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-dark-textSecondary">
          Connecting Patients, Doctors & Pharmacies Digitally.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        
        {/* Card 1: For Doctors */}
        <Link 
            href="/doctor/login" 
            className="group block rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-8 shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center space-x-4">
            {/* Icon container stays light for contrast, or you can darken it too. Keeping it light makes the icon pop. */}
            <div className="rounded-lg bg-teal-100 p-3">
              <Stethoscope className="h-8 w-8 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-textPrimary">
                For Doctors
              </h2>
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-dark-textSecondary">
            Access your dashboard to manage patient appointments and create digital prescriptions seamlessly.
          </p>
          <div className="mt-6 font-semibold text-teal-600 dark:text-teal-400 group-hover:underline">
            Doctor Portal &rarr;
          </div>
        </Link>

        {/* Card 2: For Pharmacies */}
        <Link 
            href="/pharmacy/login" 
            className="group block rounded-xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface p-8 shadow-md transition-all hover:shadow-xl hover:-translate-y-1"
        >
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-green-100 p-3">
              <Pill className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-textPrimary">
                For Pharmacies
              </h2>
            </div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-dark-textSecondary">
            Manage your inventory, view incoming prescriptions, and serve patients more efficiently.
          </p>
          <div className="mt-6 font-semibold text-green-600 dark:text-green-400 group-hover:underline">
            Pharmacy Portal &rarr;
          </div>
        </Link>
        
      </div>
    </main>
  );
}
