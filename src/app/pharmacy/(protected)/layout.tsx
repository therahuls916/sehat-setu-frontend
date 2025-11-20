'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/api';

import PharmacySidebar from "@/components/PharmacySidebar"; 
import Header from "@/components/Header";

const checkProfileStatus = async (): Promise<{ hasProfile: boolean }> => {
  const { data } = await apiClient.get('/api/pharmacy/profile/status');
  return data;
};

const getTitleFromPathname = (pathname: string): string => {
  if (pathname.includes('create-profile')) return 'Create Your Profile';
  const segment = pathname.split('/').pop() || 'dashboard';
  return segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export default function PharmacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = getTitleFromPathname(pathname);
  const { firebaseUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const { data: profileStatus, isLoading: isProfileLoading, isError } = useQuery({
    queryKey: ['pharmacyProfileStatus'],
    queryFn: checkProfileStatus,
    enabled: !!firebaseUser,
    retry: 1,
  });

  // This crucial logic for profile checking remains unchanged.
  useEffect(() => {
    if (!isAuthLoading && !firebaseUser) {
      router.push('/pharmacy/login');
      return;
    }
    if (firebaseUser && profileStatus?.hasProfile === false) {
      if (pathname !== '/pharmacy/create-profile') {
        router.push('/pharmacy/create-profile');
      }
    }
  }, [firebaseUser, isAuthLoading, profileStatus, pathname, router]);

  const isLoading = isAuthLoading || (firebaseUser && isProfileLoading);
  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center bg-panel dark:bg-panel-dark">
            <div className="text-content-primary dark:text-content-primary_dark">
                {isAuthLoading ? 'Loading session...' : 'Verifying profile...'}
            </div>
        </div>
    );
  }

  // This handles the forced create-profile page
  if (profileStatus?.hasProfile === false) {
    return <>{children}</>;
  }
  
  if(isError) return (
    <div className="flex h-screen items-center justify-center bg-panel dark:bg-panel-dark">
        <div className="text-red-500">Error verifying profile. Please try again.</div>
    </div>
  );

  // This is the main layout for authenticated users with a profile.
  if (firebaseUser && profileStatus?.hasProfile === true) {
    return (
      // The main container is a simple flex row.
      <div className="flex h-screen">
        {/* The Sidebar is the first child, with its own white background */}
        <PharmacySidebar />
        
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

  return null; 
}