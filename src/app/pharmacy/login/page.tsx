// Updated File: src/app/pharmacy/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import { Pill, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

export default function PharmacyLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { userProfile, isLoading: isAuthLoading } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (!isAuthLoading && userProfile) {
      if (userProfile.role === 'pharmacy') {
        router.push('/pharmacy/dashboard');
      } else if (userProfile.role === 'doctor') {
        router.push('/access-denied');
      }
    }
  }, [userProfile, isAuthLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code?.startsWith('auth/')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || userProfile) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-dark-surface">
        <div className="text-gray-800 dark:text-dark-textPrimary">Loading session...</div>
      </div>
    );
  }

  const backgroundOpacity = theme === 'dark' ? '0.1' : '0.15';

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 dark:bg-dark-surface p-6">
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, ${backgroundOpacity}), transparent 80%)`,
        }}
      />

      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-dark-textSecondary dark:hover:text-dark-textPrimary">
        <ArrowLeft size={20} />
        Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center gap-4 text-center">
          <Pill className="h-12 w-12 text-green-600" />
          <h1 className="text-4xl font-bold text-gray-800 dark:text-dark-textPrimary">SehatSetu</h1>
        </div>

        <div className="rounded-xl border border-gray-200/50 dark:border-dark-border bg-white/80 dark:bg-dark-surfaceMuted/80 p-8 shadow-2xl backdrop-blur-lg">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-dark-textPrimary">Pharmacy Portal Login</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-textSecondary">
              Don't have an account?{' '}
              <Link href="/pharmacy/register" className="font-medium text-green-600 hover:underline dark:text-green-400">
                Register Here
              </Link>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-textSecondary">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface px-4 py-3 shadow-sm text-gray-900 dark:text-white focus:border-green-500 focus:ring focus:ring-green-200 dark:focus:ring-green-500/50 focus:ring-opacity-50" 
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-textSecondary">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface px-4 py-3 shadow-sm text-gray-900 dark:text-white focus:border-green-500 focus:ring focus:ring-green-200 dark:focus:ring-green-500/50 focus:ring-opacity-50"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-end">
              <Link href="/pharmacy/forgot-password" className="text-sm font-medium text-green-600 hover:underline dark:text-green-400">
                Forgot your password?
              </Link>
            </div>

            {error && <p className="pt-2 text-sm text-center text-red-600 dark:text-red-400">{error}</p>}

            <div>
              <button
                type="submit"
                className="w-full transform rounded-lg bg-green-600 px-6 py-3 text-base font-medium text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}