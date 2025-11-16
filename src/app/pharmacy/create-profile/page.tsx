// src/app/pharmacy/create-profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation'; // <-- 1. Import useRouter
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { Building, MapPin, Phone, LocateFixed } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface IFormInput {
  name: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
}

const createPharmacyProfile = async (data: IFormInput) => {
  const response = await apiClient.post('/api/pharmacy/profile', data);
  return response.data;
};

export default function CreateProfilePage() {
  const queryClient = useQueryClient();
  const router = useRouter(); // <-- 2. Initialize the router
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<IFormInput>();
  const { userProfile } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const { mutate, isPending } = useMutation({
    mutationFn: createPharmacyProfile,
    onSuccess: () => {
      toast.success('Profile created successfully! Redirecting...');
      // Invalidate the query to ensure the layout has fresh data on the next load
      queryClient.invalidateQueries({ queryKey: ['pharmacyProfileStatus'] });
      
      // --- 3. THE FIX: Add an explicit redirect to the dashboard ---
      router.push('/pharmacy/dashboard'); 
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
      toast.error(`Creation Failed: ${errorMessage}`);
    }
  });

  // Effect to track mouse movement
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // useEffect to auto-fill the pharmacy name
  useEffect(() => {
    if (userProfile?.name) {
      setValue('name', userProfile.name);
    }
  }, [userProfile, setValue]);

  const onSubmit: SubmitHandler<IFormInput> = data => {
    mutate(data);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      const toastId = toast.loading('Fetching your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          toast.success('Location fetched!', { id: toastId });
        },
        (error) => {
          toast.error('Could not get location. Please enter it manually.', { id: toastId });
          console.error("Geolocation error:", error);
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 p-6">
        <div
            className="pointer-events-none fixed inset-0 z-0 transition-all duration-500"
            style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(34, 197, 94, 0.15), transparent 80%)`,
            }}
        />
        <div className="relative z-10 w-full max-w-2xl rounded-xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-lg">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                Welcome to SehatSetu!
                </h1>
                <p className="mt-2 text-gray-600">
                Let's set up your pharmacy profile. This will be visible to doctors.
                </p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Pharmacy Name */}
                <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Pharmacy Name</label>
                <div className="relative mt-1">
                    <Building className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                    id="name" 
                    type="text" 
                    {...register('name', { required: 'Pharmacy name is required' })} 
                    className="w-full rounded-lg border-gray-300 bg-gray-100 py-3 pl-10 shadow-sm cursor-not-allowed"
                    readOnly 
                    />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                {/* Full Address */}
                <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address</label>
                <div className="relative mt-1">
                    <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input id="address" type="text" {...register('address', { required: 'Address is required' })} className="w-full rounded-lg border-gray-300 py-3 pl-10 shadow-sm focus:border-green-500 focus:ring-green-200" placeholder="123 Main Street, Anytown" />
                </div>
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                </div>

                {/* Contact Phone */}
                <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Contact Phone Number</label>
                <div className="relative mt-1">
                    <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input id="phone" type="tel" {...register('phone', { required: 'Phone number is required' })} className="w-full rounded-lg border-gray-300 py-3 pl-10 shadow-sm focus:border-green-500 focus:ring-green-200" placeholder="e.g., +91 12345 67890" />
                </div>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                </div>
                
                {/* Location Coordinates */}
                <div className="rounded-lg border bg-gray-50/70 p-4">
                <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <h3 className="font-medium text-gray-800">Location Coordinates</h3>
                    <button type="button" onClick={handleGetLocation} className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-300">
                    <LocateFixed size={16} /> Get My Current Location
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label htmlFor="latitude" className="text-sm font-medium text-gray-600">Latitude</label>
                    <input id="latitude" type="number" step="any" {...register('latitude')} className="mt-1 w-full rounded-lg border-gray-300 py-2 shadow-sm focus:border-green-500 focus:ring-green-200" placeholder="e.g., 9.9676" />
                    </div>
                    <div>
                    <label htmlFor="longitude" className="text-sm font-medium text-gray-600">Longitude</label>
                    <input id="longitude" type="number" step="any" {...register('longitude')} className="mt-1 w-full rounded-lg border-gray-300 py-2 shadow-sm focus:border-green-500 focus:ring-green-200" placeholder="e.g., 76.299" />
                    </div>
                </div>
                </div>
                
                {/* Submit Button */}
                <div>
                <button type="submit" disabled={isPending} className="flex w-full justify-center rounded-lg border border-transparent bg-green-600 py-3 px-4 font-medium text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-green-700 disabled:bg-gray-400">
                    {isPending ? 'Saving Profile...' : 'Save and Continue'}
                </button>
                </div>
            </form>
        </div>
    </main>
  );
}