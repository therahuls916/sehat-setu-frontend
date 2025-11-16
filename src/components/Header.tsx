// Updated File: src/components/Header.tsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { ThemeSwitcher } from './ThemeSwitcher'; // <-- 1. Import ThemeSwitcher

const capitalize = (s: string) => {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function Header({ title }: { title: string }) {
  const { userProfile } = useAuth();

  const userName = userProfile?.name || 'Loading...';
  const userRole = userProfile?.role ? capitalize(userProfile.role) : '';

  return (
    // 2. Add dark mode styles to the header text
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-textPrimary dark:text-dark-textPrimary">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeSwitcher /> {/* <-- 3. Add the switcher button here */}
        <div className="text-right">
          <p className="font-semibold text-textPrimary dark:text-dark-textPrimary">{userName}</p>
          <p className="text-sm text-textSecondary dark:text-dark-textSecondary">
            {userProfile?.role === 'doctor' ? userProfile.specialization : userRole}
          </p>
        </div>
        <div className="w-12 h-12 bg-white dark:bg-dark-surfaceMuted rounded-full flex items-center justify-center text-primary font-bold text-xl shadow">
          {userName && userName !== 'Loading...' ? userName.charAt(0).toUpperCase() : ''}
        </div>
      </div>
    </header>
  );
}