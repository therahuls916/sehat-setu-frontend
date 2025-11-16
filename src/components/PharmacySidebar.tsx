// Updated File: src/components/PharmacySidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // <-- 1. Import usePathname
import { LayoutDashboard, Package, FileText, User, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

const navLinks = [
  { name: 'Dashboard', href: '/pharmacy/dashboard', icon: LayoutDashboard },
  { name: 'Manage Stock', href: '/pharmacy/manage-stock', icon: Package },
  { name: 'Prescriptions', href: '/pharmacy/prescriptions', icon: FileText },
  { name: 'Profile', href: '/pharmacy/profile', icon: User },
];

export default function PharmacySidebar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname(); // <-- 2. Get the current path

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // localStorage.removeItem('authToken');
      queryClient.clear();
      router.push('/pharmacy/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-dark-surfaceMuted h-screen shadow-md flex flex-col">
      <div className="p-6 border-b dark:border-dark-border flex items-center">
        <h1 className="text-2xl font-bold text-green-600">SehatSetu</h1>
        <span className="ml-2 text-sm font-semibold text-gray-500 dark:text-gray-400">Pharmacy</span>
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
                    ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 font-semibold' 
                    : 'text-gray-600 dark:text-dark-textSecondary hover:bg-green-50 dark:hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400'
                  }
                `}
              >
                <link.icon className="mr-3" size={20} />
                <span>{link.name}</span>
              </Link>
            </li>
          )})}
        </ul>
      </nav>
      <div className="p-4 border-t dark:border-dark-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center p-3 text-gray-600 dark:text-dark-textSecondary hover:bg-red-100 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 rounded-lg"
        >
          <LogOut className="mr-3" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}