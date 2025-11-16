// Updated File: src/app/doctor/(protected)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import Sidebar from "@/components/Sidebar"; // The original Doctor sidebar
import Header from "@/components/Header";

const getTitleFromPathname = (pathname: string): string => {
  const segment = pathname.split('/').pop() || 'dashboard';
  if (segment === 'prescription' && !pathname.includes('?')) {
      return 'Create Prescription';
  }
  return segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);
  const { firebaseUser, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !firebaseUser) {
      router.push('/doctor/login');
    }
  }, [firebaseUser, isLoading, router]);

  if (isLoading || !firebaseUser) {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-surface">
            <div className="text-gray-800 dark:text-dark-textPrimary">Loading session...</div>
        </div>
    );
  }

  return (
    // Main container now has a dark mode background color
    <div className="flex h-screen bg-surface dark:bg-dark-surface overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header now has a dark mode background and border */}
        <header className="sticky top-0 z-10 bg-surface/80 dark:bg-dark-surface/80 p-8 pb-4 backdrop-blur-sm border-b border-gray-200/50 dark:border-dark-border">
            <Header title={title} />
        </header>

        <main className="flex-1 p-8 pt-4">
          {/* The content card now has a dark mode background and border */}
          <div className="bg-white dark:bg-dark-surfaceMuted p-6 rounded-lg shadow-xl border border-gray-200/50 dark:border-dark-border">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}