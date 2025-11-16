// Updated File: src/app/pharmacy/(protected)/layout.tsx
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
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-surface">
            <div className="text-gray-800 dark:text-dark-textPrimary">
                {isAuthLoading ? 'Loading session...' : 'Verifying profile...'}
            </div>
        </div>
    );
  }

  if (profileStatus?.hasProfile === false) {
    // The create-profile page already has its own full-page styling
    return <>{children}</>;
  }
  
  if(isError) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-surface">
        <div className="text-red-600 dark:text-red-400">Error verifying profile. Please try again.</div>
    </div>
  );

  if (firebaseUser && profileStatus?.hasProfile === true) {
    return (
      // Main container now has dark mode background
      <div className="flex h-screen bg-gray-50 dark:bg-dark-surface overflow-hidden">
        <PharmacySidebar />

        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header now has dark mode background and border */}
          <header className="sticky top-0 z-10 bg-gray-50/80 dark:bg-dark-surface/80 p-8 pb-4 backdrop-blur-sm border-b border-gray-200/50 dark:border-dark-border">
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