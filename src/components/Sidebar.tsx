'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Calendar, 
    FileText, 
    User, 
    LogOut, 
    Bot, 
    ChevronLeft, 
    ChevronRight 
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const navLinks = [
  { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { name: 'Appointments', href: '/doctor/appointments', icon: Calendar },
  { name: 'Prescription', href: '/doctor/prescription', icon: FileText },
  { name: 'Patient History', href: '/doctor/history', icon: FileText },
  { name: 'AI Assistant', href: '/doctor/ai-assistant', icon: Bot }, 
  { name: 'Profile', href: '/doctor/profile', icon: User },
];

export default function Sidebar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const pathname = usePathname();
  
  // Initialize state false, but we will update it in useEffect to match localStorage
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load persisted state on mount
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar_collapsed');
    if (savedState === 'true') {
      setIsCollapsed(true);
    }
  }, []);

  // Toggle Handler with Persistence
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      queryClient.clear(); 
      router.replace('/doctor/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside 
        className={`
            h-screen flex flex-col border-r border-border dark:border-dark-border 
            bg-sidebar dark:bg-dark-surface transition-all duration-300 ease-in-out relative
            ${isCollapsed ? 'w-20' : 'w-64'}
        `}
    >
      
      {/* --- TOGGLE BUTTON --- */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-9 bg-white dark:bg-dark-surface border border-border dark:border-dark-border rounded-full p-1 shadow-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-50"
      >
        {isCollapsed ? <ChevronRight size={16} className="text-brand"/> : <ChevronLeft size={16} className="text-brand"/>}
      </button>

      {/* --- LOGO SECTION --- */}
      <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-start'} transition-all duration-300`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`text-brand transition-all duration-300 ${isCollapsed ? 'w-8 h-8' : 'w-7 h-7'}`}>
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.383-.597 15.25 15.25 0 01-1.358-.896 15.254 15.254 0 01-1.28-1.182 15.255 15.255 0 01-1.168-1.423 15.252 15.252 0 01-.99-1.618 15.32 15.32 0 01-.764-1.758 15.257 15.257 0 01-.5-1.846A15.258 15.258 0 015 9.75c0-4.42 3.58-8 8-8s8 3.58 8 8c0 4.42-3.58 8-8 8a15.32 15.32 0 01-1.58-.162z" />
            <path d="M12 12.25a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75h-.008a.75.75 0 01-.75-.75v-.008z" />
        </svg>
        
        <h1 className={`text-2xl font-bold text-brand ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            SehatSetu
        </h1>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <nav className="flex-grow px-3 py-4 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`
                    flex items-center py-3 rounded-md transition-all duration-200 group relative
                    ${isCollapsed ? 'justify-center px-0' : 'px-3'}
                    ${isActive 
                      ? 'bg-brand-light text-brand dark:bg-blue-900/30 dark:text-blue-300' 
                      : 'text-content-secondary dark:text-dark-textSecondary hover:bg-brand-light hover:text-brand dark:hover:bg-dark-surfaceMuted dark:hover:text-white'
                    }
                  `}
                >
                  <link.icon size={22} className="min-w-[22px]" />
                  
                  <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
                    {link.name}
                  </span>

                  {/* Tooltip */}
                  {isCollapsed && (
                    <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                        {link.name}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* --- LOGOUT BUTTON --- */}
      <div className="p-4 border-t border-border dark:border-dark-border">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center py-2.5 text-content-secondary dark:text-dark-textSecondary text-sm font-medium 
            hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 
            rounded-md transition-colors group relative
            ${isCollapsed ? 'justify-center px-0' : 'px-3'}
          `}
        >
          <LogOut size={22} className="min-w-[22px]" />
          <span className={`ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            Logout
          </span>

           {/* Tooltip for Logout */}
           {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    Logout
                </div>
            )}
        </button>
      </div>
    </aside>
  );
}