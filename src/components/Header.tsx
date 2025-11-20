'use client';

import { useAuth } from '@/context/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher';

const capitalize = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Header({ title }: { title: string }) {
  const { userProfile } = useAuth();

  const userName = userProfile?.name || 'Loading...';
  const userRole = userProfile?.role ? capitalize(userProfile.role) : '';
  
  // Cast to `any` to safely access properties that may or may not exist on the userProfile type
  const userSpecialization = (userProfile as any)?.specialization;
  
  // --- THIS IS THE FIX ---
  // We must define profilePictureUrl by extracting it from the userProfile object.
  const profilePictureUrl = (userProfile as any)?.profilePictureUrl;

  return (
    <header className="flex items-center justify-between">
      
      <div>
        <h1 className="text-3xl font-bold text-content-primary dark:text-content-primary_dark">
          {title}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <ThemeSwitcher />
        <div className="text-right">
          <p className="font-semibold text-content-primary dark:text-content-primary_dark">
            {userName}
          </p>
          <p className="text-sm text-content-secondary dark:text-content-secondary_dark">
            {userProfile?.role === 'doctor' ? userSpecialization : userRole}
          </p>
        </div>
        
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-sm overflow-hidden">
          {profilePictureUrl ? (
            // Now this variable exists and this logic will work correctly.
            <img src={profilePictureUrl} alt={userName} className="w-full h-full object-cover" />
          ) : (
            // Fallback to the initial if no picture is available.
            <div className="w-full h-full bg-brand text-white flex items-center justify-center">
              {userName && userName !== 'Loading...' ? userName.charAt(0).toUpperCase() : ''}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}