// Updated File: src/app/pharmacy/(protected)/profile/page.tsx
'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { Building, MapPin, Phone, LocateFixed, Save, UserCircle } from 'lucide-react';

// Form data structure now includes the owner's name
interface IFormInput {
  ownerName: string; // Pharmacist's personal name
  name: string;      // Pharmacy's business name
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
}

// --- API Functions ---
const fetchPharmacyProfile = async (): Promise<IFormInput> => {
  const { data } = await apiClient.get('/api/pharmacy/profile');
  return {
    ...data,
    ownerName: data.ownerId?.name || '', // Extract the populated owner name
    latitude: data.location?.coordinates[1] || '',
    longitude: data.location?.coordinates[0] || '',
  };
};

const updatePharmacyProfile = async (formData: IFormInput) => {
  const { data } = await apiClient.put('/api/pharmacy/profile', formData);
  return data;
};


export default function PharmacyProfilePage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<IFormInput>();

  const { data: profileData, isLoading, isError } = useQuery({
    queryKey: ['pharmacyProfile'],
    queryFn: fetchPharmacyProfile,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updatePharmacyProfile,
    onSuccess: () => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['pharmacyProfile'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    },
  });

  useEffect(() => {
    if (profileData) {
      setValue('ownerName', profileData.ownerName);
      setValue('name', profileData.name);
      setValue('address', profileData.address);
      setValue('phone', profileData.phone);
      setValue('latitude', profileData.latitude);
      setValue('longitude', profileData.longitude);
    }
  }, [profileData, setValue]);

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
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
        (error) => toast.error('Could not get location.', { id: toastId })
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  };

  if (isLoading) return <div className="text-center p-10">Loading profile...</div>;
  if (isError) return <div className="text-center p-10 text-red-600">Failed to load profile data.</div>;

  const inputStyles = "w-full rounded-lg border-gray-300 bg-gray-50 py-2.5 shadow-sm transition-shadow duration-200 focus:border-l-4 focus:border-green-500 focus:ring-0 focus:shadow-md focus:shadow-green-500/20";
  const readOnlyStyles = "w-full rounded-lg border-gray-300 bg-gray-100 py-3 pl-10 shadow-sm cursor-not-allowed text-gray-600";


  return (
    <div className="mx-auto max-w-2xl rounded-xl border bg-white/80 p-8 shadow-lg backdrop-blur-lg">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Pharmacy Profile</h1>
            <p className="mt-2 text-gray-600">Keep your pharmacy details up to date for doctors.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* --- Personal Details Section --- */}
            <fieldset>
                <legend className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Profile Owner</legend>
                 <div>
                    <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700">Pharmacist Name</label>
                    <div className="relative mt-1">
                        <UserCircle className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="ownerName" {...register('ownerName')} className={readOnlyStyles} readOnly />
                    </div>
                </div>
            </fieldset>

            {/* --- Business Details Section --- */}
            <fieldset className="space-y-6">
                <legend className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Business Details</legend>
                 <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Pharmacy Name</label>
                    <div className="relative mt-1">
                        <Building className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="name" {...register('name')} className={readOnlyStyles} readOnly />
                    </div>
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Full Address</label>
                    <div className="relative mt-1">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="address" {...register('address', { required: 'Address is required' })} className={`${inputStyles} pl-10`} />
                        {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                    </div>
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Contact Phone Number</label>
                    <div className="relative mt-1">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input id="phone" type="tel" {...register('phone', { required: 'Phone number is required' })} className={`${inputStyles} pl-10`} />
                        {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                    </div>
                </div>
            </fieldset>

            {/* --- Location Section --- */}
            <fieldset>
                 <legend className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Location Coordinates</legend>
                 <div className="flex flex-wrap justify-end items-center gap-2 mb-4">
                    <button type="button" onClick={handleGetLocation} className="flex items-center gap-2 rounded-md bg-gray-200 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-300">
                      <LocateFixed size={16} /> Get My Current Location
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="latitude" className="text-sm font-medium text-gray-600">Latitude</label>
                      <input id="latitude" type="number" step="any" {...register('latitude')} className={`mt-1 ${inputStyles}`} placeholder="e.g., 9.9676" />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="text-sm font-medium text-gray-600">Longitude</label>
                      <input id="longitude" type="number" step="any" {...register('longitude')} className={`mt-1 ${inputStyles}`} placeholder="e.g., 76.299" />
                    </div>
                </div>
            </fieldset>

            <div className="pt-4">
                <button type="submit" disabled={isPending} className="flex w-full justify-center items-center gap-2 rounded-lg border border-transparent bg-green-600 py-3 px-4 font-medium text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-green-700 disabled:bg-gray-400">
                    <Save size={18} />
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    </div>
  );
}