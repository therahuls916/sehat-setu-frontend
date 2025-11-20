'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      queryClient.clear();
      router.push('/pharmacy/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    // --- STYLES UPDATED ---
    <aside className="w-64 bg-sidebar h-screen flex flex-col border-r border-border">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-brand flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-.597 15.25 15.25 0 01-1.358-.896 15.254 15.254 0 01-1.28-1.182 15.255 15.255 0 01-1.168-1.423 15.252 15.252 0 01-.99-1.618 15.32 15.32 0 01-.764-1.758 15.257 15.257 0 01-.5-1.846A15.258 15.258 0 015 9.75c0-4.42 3.58-8 8-8s8 3.58 8 8c0 4.42-3.58 8-8 8a15.32 15.32 0 01-1.58-.162z" />
                <path d="M12 12.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" />
            </svg>
            SehatSetu
        </h1>
        <span className="text-xs font-semibold text-content-secondary ml-1 mt-1">Pharmacy Portal</span>
      </div>
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  // --- ACTIVE/INACTIVE STYLES UPDATED ---
                  className={`
                    flex items-center px-3 py-2.5 rounded-md transition-colors text-sm font-medium
                    ${isActive 
                      ? 'bg-brand-light text-brand' 
                      : 'text-content-secondary hover:bg-brand-light hover:text-brand'
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
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          // --- LOGOUT BUTTON STYLES UPDATED ---
          className="w-full flex items-center px-3 py-2.5 text-content-secondary text-sm font-medium hover:bg-red-50 hover:text-red-600 rounded-md"
        >
          <LogOut className="mr-3" size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}