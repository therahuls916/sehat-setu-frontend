// src/app/access-denied/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle } from 'lucide-react';

export default function AccessDeniedPage() {
    const router = useRouter();
    const { userProfile } = useAuth();

    // Get the user's actual role, capitalized. Provide a fallback.
    const userRole = userProfile?.role 
        ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) 
        : 'User';
    
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>

                <h1 className="text-3xl font-bold text-gray-900">
                    Access Denied
                </h1>

                <p className="text-gray-600 text-lg">
                    You are already logged in as a <strong className="font-semibold">{userRole}</strong>.
                </p>

                <div>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full px-4 py-2 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors"
                    >
                        Return to Home Page
                    </button>
                </div>
            </div>
        </div>
    );
}