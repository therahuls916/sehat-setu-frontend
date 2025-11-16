// src/app/doctor/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/utils/firebase';
import toast from 'react-hot-toast';
import { Stethoscope, ArrowLeft } from 'lucide-react';

export default function DoctorForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading('Sending reset link...');

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('If an account exists, a password reset link has been sent to your email.', { id: toastId, duration: 6000 });
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error('Failed to send reset email. Please try again.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md relative">
        <Link href="/doctor/login" className="absolute top-4 left-4 text-gray-500 hover:text-gray-800">
            <ArrowLeft size={24} />
        </Link>
        <div className="text-center pt-6">
          <Stethoscope size={36} className="text-teal-600 mx-auto" />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Reset Your Password</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your email address and we will send you a link to reset your password.</p>
        </div>
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-2 mt-1 border rounded-md" />
          </div>
          <div>
            <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-teal-600 rounded-md disabled:bg-gray-400" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}