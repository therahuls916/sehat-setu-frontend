// Updated File: src/app/doctor/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { Stethoscope, ArrowLeft } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function DoctorRegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const toastId = toast.loading('Creating your account...');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      await updateProfile(firebaseUser, { displayName: name });
      const idToken = await firebaseUser.getIdToken();

      await apiClient.post('/api/auth/sync', {
        name: name,
        role: 'doctor',
        specialization: specialization,
      }, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });

      toast.success('Account created successfully! Please log in.', { id: toastId });
      router.push('/doctor/login');

    } catch (err: any) {
      let errorMessage = 'An unexpected error occurred.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (err.response?.data?.message) {
        errorMessage = `Backend Error: ${err.response.data.message}`;
      }
      setError(errorMessage);
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const backgroundOpacity = theme === 'dark' ? '0.1' : '0.15';
  const inputStyles = "mt-1 block w-full rounded-lg border-gray-300 dark:border-dark-border bg-gray-50 dark:bg-dark-surface px-4 py-3 shadow-sm focus:border-teal-500 focus:ring focus:ring-teal-200 dark:focus:ring-teal-500/50 focus:ring-opacity-50";


  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 dark:bg-dark-surface p-6">
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 184, 166, ${backgroundOpacity}), transparent 80%)`,
        }}
      />
      
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:text-dark-textSecondary dark:hover:text-dark-textPrimary">
          <ArrowLeft size={20} />
          Back to Home
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center gap-4 text-center">
            <Stethoscope className="h-12 w-12 text-teal-600" />
            <h1 className="text-4xl font-bold text-gray-800 dark:text-dark-textPrimary">SehatSetu</h1>
        </div>

        <div className="rounded-xl border border-gray-200/50 dark:border-dark-border bg-white/80 dark:bg-dark-surfaceMuted/80 p-8 shadow-2xl backdrop-blur-lg">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-dark-textPrimary">Doctor Registration</h2>
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-textSecondary">
                Already have an account?{' '}
                <Link href="/doctor/login" className="font-medium text-teal-600 hover:underline dark:text-teal-400">
                    Log In
                </Link>
            </p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-dark-textSecondary">Full Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputStyles} />
            </div>
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 dark:text-dark-textSecondary">Specialization</label>
              <input id="specialization" type="text" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required placeholder="e.g., General Physician" className={inputStyles} />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-dark-textSecondary">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputStyles} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-dark-textSecondary">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Minimum 6 characters" className={inputStyles} />
            </div>

            {error && <p className="pt-2 text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
            
            <div>
              <button 
                type="submit" 
                className="w-full transform rounded-lg bg-teal-600 px-6 py-3 text-base font-medium text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}