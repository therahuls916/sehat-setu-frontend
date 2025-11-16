// Updated File: src/app/doctor/(protected)/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import apiClient from '@/utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// --- Data types ---
interface Pharmacy { _id: string; name: string; }
interface ProfileData { name: string; specialization: string; linkedPharmacies: string[]; }

// --- API functions ---
const fetchDoctorProfile = async (): Promise<ProfileData> => {
  const { data } = await apiClient.get('/api/doctor/profile');
  return data;
};

const fetchAllPharmacies = async (): Promise<Pharmacy[]> => {
  const { data } = await apiClient.get('/api/pharmacy/all');
  return data;
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<ProfileData>({
    name: '', specialization: '', linkedPharmacies: [],
  });

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchDoctorProfile,
  });

  const { data: allPharmacies, isLoading: isLoadingPharmacies } = useQuery({
    queryKey: ['allPharmacies'],
    queryFn: fetchAllPharmacies,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile: ProfileData) => apiClient.put('/api/doctor/profile', updatedProfile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update profile. Please try again.');
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        specialization: profile.specialization || '',
        linkedPharmacies: profile.linkedPharmacies || [],
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleAddPharmacy = (pharmacyId: string) => {
    if (pharmacyId && !formData.linkedPharmacies.includes(pharmacyId)) {
      setFormData((prev) => ({
        ...prev,
        linkedPharmacies: [...prev.linkedPharmacies, pharmacyId],
      }));
    }
  };

  const handleRemovePharmacy = (pharmacyIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      linkedPharmacies: prev.linkedPharmacies.filter((id) => id !== pharmacyIdToRemove),
    }));
  };
  
  const handleSaveChanges = () => {
    updateProfileMutation.mutate(formData);
  };

  if (isLoadingProfile || isLoadingPharmacies) {
    return <div className="text-gray-800 dark:text-dark-textPrimary">Loading profile...</div>;
  }
  
  if (!profile || !allPharmacies) {
    return <div className="text-red-600 dark:text-red-400">Could not load profile data.</div>;
  }
  
  const availablePharmacies = allPharmacies.filter(
    (p) => !formData.linkedPharmacies.includes(p._id)
  );

  const selectedPharmacies = formData.linkedPharmacies.map(id => 
    allPharmacies.find(p => p._id === id)
  ).filter(Boolean) as Pharmacy[];

  const inputStyles = "w-full p-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm dark:bg-dark-surface dark:text-dark-textPrimary focus:ring-primary/50 focus:border-primary";

  return (
    <div>
      <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary mb-6">Edit Your Profile</h1>
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Full Name</label>
          <input type="text" id="name" value={formData.name} onChange={handleInputChange} className={inputStyles} />
        </div>
        <div>
          <label htmlFor="specialization" className="block text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Specialization</label>
          <input type="text" id="specialization" value={formData.specialization} onChange={handleInputChange} className={inputStyles} />
        </div>
        <div>
          <label htmlFor="pharmacy" className="block text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Linked Pharmacies</label>
          <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-dark-border rounded-md mb-2 min-h-[42px]">
            {selectedPharmacies.map((pharmacy) => (
              <div key={pharmacy._id} className="flex items-center bg-primary/20 text-primary dark:text-cyan-300 font-medium px-3 py-1 rounded-full">
                <span>{pharmacy.name}</span>
                <button onClick={() => handleRemovePharmacy(pharmacy._id)} className="ml-2 hover:text-red-500"><X size={16} /></button>
              </div>
            ))}
             {selectedPharmacies.length === 0 && <span className="text-sm text-gray-400 dark:text-gray-500 p-1">No pharmacies linked yet.</span>}
          </div>
          <select id="pharmacy" value="" onChange={(e) => handleAddPharmacy(e.target.value)} className={inputStyles}>
            <option value="" disabled>-- Add a pharmacy --</option>
            {availablePharmacies.map((pharmacy) => (<option key={pharmacy._id} value={pharmacy._id}>{pharmacy.name}</option>))}
          </select>
        </div>
        <div className="flex justify-end">
          <button onClick={handleSaveChanges} disabled={updateProfileMutation.isPending} className="flex items-center gap-2 px-6 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary/90 disabled:bg-gray-400">
            <Save size={18} />
            {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}