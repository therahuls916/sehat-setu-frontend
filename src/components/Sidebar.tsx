// Updated File: src/components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <-- 1. Import usePathname
import { LayoutDashboard, Calendar, FileText, User, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

const navLinks = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
  { name: 'Prescription', href: '/doctor/prescription', icon: FileText },
  { name: 'Patient History', href: '/doctor/history', icon: FileText },
  { name: 'Profile', href: '/doctor/profile', icon: User },
];

export default function Sidebar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname(); // <-- 2. Get the current path

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // localStorage.removeItem('authToken'); // This is not needed with our current setup
      queryClient.clear(); 
      router.push('/doctor/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 bg-surface dark:bg-dark-surfaceMuted h-screen shadow-md flex flex-col">
      <div className="p-6 border-b dark:border-dark-border">
        <h1 className="text-2xl font-bold text-primary">🩺 SehatSetu</h1>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map((link) => {
            // 3. Check if the current path starts with the link's href
            const isActive = pathname.startsWith(link.href);

            return (
              <li key={link.name} className="mb-2">
                <Link
                  href={link.href}
                  // 4. Conditionally apply active styles
                  className={`
                    flex items-center p-3 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary/10 text-primary font-semibold' 
                      : 'text-textSecondary dark:text-dark-textSecondary hover:bg-primary/10 hover:text-primary'
                    }
                  `}
                >
                  <link.icon className="mr-3" size={20} />
                  <span>{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t dark:border-dark-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 text-textSecondary dark:text-dark-textSecondary hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 rounded-lg"
        >
          <LogOut className="mr-3" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}