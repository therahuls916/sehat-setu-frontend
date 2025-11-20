'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

const getTitleFromPathname = (pathname: string): string => {
  const segment = pathname.split('/').pop() || 'dashboard';
  // A small enhancement to make multi-word paths look better, e.g., "Manage Stock"
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
    // A simple loading state that fits the new structure.
    return (
        <div className="flex h-screen items-center justify-center bg-panel dark:bg-panel-dark">
            <div className="text-content-primary dark:text-content-primary_dark">Loading session...</div>
        </div>
    );
  }

  return (
    // The main container is a simple flex row.
    <div className="flex h-screen">
      {/* The Sidebar is a direct child */}
      <Sidebar />
      
      {/* The main content panel takes up the remaining space */}
      <div className="flex-1 flex flex-col overflow-y-auto bg-panel dark:bg-panel-dark">
        
        {/* The Header now lives inside the scrolling panel */}
        <header className="p-8 pb-4">
            <Header title={title} />
        </header>

        {/* The main content area where pages are rendered */}
        <main className="flex-1 p-8 pt-4">
          {children}
        </main>
      </div>
    </div>
  );
}