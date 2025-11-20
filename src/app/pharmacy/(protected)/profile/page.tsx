'use client';

import { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { Building, MapPin, Phone, LocateFixed, Save, UserCircle } from 'lucide-react';

// --- DATA STRUCTURE & TYPES ---
interface IFormInput {
  ownerName: string;
  name: string;
  address: string;
  phone: string;
  latitude?: number | string;
  longitude?: number | string;
}

// --- API FUNCTIONS ---
const fetchPharmacyProfile = async (): Promise<IFormInput> => {
  const { data } = await apiClient.get<any>('/api/pharmacy/profile');
  return {
    ...data,
    ownerName: data.ownerId?.name || '',
    latitude: data.location?.coordinates[1] || '',
    longitude: data.location?.coordinates[0] || '',
  };
};

const updatePharmacyProfile = async (formData: IFormInput) => {
  const { data } = await apiClient.put('/api/pharmacy/profile', formData);
  return data;
};

// --- MAIN COMPONENT ---
export default function PharmacyProfilePage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<IFormInput>();

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
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to update profile.'),
  });

  useEffect(() => {
    if (profileData) {
      reset(profileData);
    }
  }, [profileData, reset]);

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

  if (isLoading) return <div className="text-content-primary dark:text-content-primary_dark">Loading profile...</div>;
  if (isError) return <div className="text-red-500">Failed to load profile data.</div>;
  
  const cardStyles = "bg-card p-6 rounded-lg shadow-sm";
  const inputStyles = "w-full p-2.5 bg-[#2d3748] dark:bg-[#374151] rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-brand text-white placeholder:text-gray-400";
  const readOnlyStyles = `${inputStyles} cursor-not-allowed opacity-70`;
  const cardTitleStyles = "text-lg font-semibold text-content-primary mb-4";

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-content-primary dark:text-content-primary_dark">
            Pharmacy Profile
          </h2>
          <button type="submit" disabled={isPending} className="flex items-center gap-2 px-4 py-2 bg-brand text-white font-semibold rounded-md hover:bg-brand-hover disabled:bg-gray-500">
            <Save size={18} />
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className={cardStyles}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className={cardTitleStyles}>Profile Owner</h3>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                </div>
                <input {...register('ownerName')} className={`${readOnlyStyles} pl-10`} readOnly />
              </div>
            </div>
            <div>
              <h3 className={cardTitleStyles}>Business Name</h3>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Building className="h-5 w-5 text-gray-400" />
                </div>
                <input {...register('name')} className={`${readOnlyStyles} pl-10`} readOnly />
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className={cardTitleStyles}>Contact Information</h3>
              <div className="space-y-4">
                  <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MapPin className="h-5 w-5 text-gray-400" /></div>
                      <input {...register('address', { required: 'Address is required' })} placeholder="Full Address" className={`${inputStyles} pl-10`} />
                      {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
                  </div>
                  <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Phone className="h-5 w-5 text-gray-400" /></div>
                      <input type="tel" {...register('phone', { required: 'Phone number is required' })} placeholder="Contact Phone" className={`${inputStyles} pl-10`} />
                      {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
                  </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={cardStyles}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-content-primary">Location Coordinates</h3>
                <button type="button" onClick={handleGetLocation} className="flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover">
                    <LocateFixed size={16} /> Use My Location
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" step="any" {...register('latitude')} placeholder="Latitude" className={inputStyles} />
                <input type="number" step="any" {...register('longitude')} placeholder="Longitude" className={inputStyles} />
            </div>
        </div>
      </form>
    </div>
  );
}