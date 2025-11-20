'use client';

import { useEffect, useState } from 'react';
import { useForm, SubmitHandler, useFieldArray, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';

import {
  Save,
  PlusCircle,
  Trash2,
  X,
  LocateFixed,
  UploadCloud,
  User,
  Stethoscope,
  Phone
} from 'lucide-react';

// ----------------- TYPES -----------------

interface Pharmacy {
  _id: string;
  name: string;
}

interface Timing {
  day: string;
  time: string;
}

interface DoctorProfileFormData {
  name: string;
  specialization: string;
  profilePictureUrl: string;
  phone: string;
  about: string;
  services: string[];
  timings: Timing[];
  consultationFee: {
    firstVisit: number | string;
    followUp: number | string;
  };
  latitude: number | string;
  longitude: number | string;
  linkedPharmacies: string[];
}

// ----------------- API -----------------

const fetchDoctorProfile = async (): Promise<DoctorProfileFormData> => {
  const { data } = await apiClient.get<any>('/api/doctor/profile');
  return {
    name: data.name || '',
    specialization: data.specialization || '',
    profilePictureUrl: data.profilePictureUrl || '',
    phone: data.phone || '',
    about: data.about || '',
    services: data.services || [],
    timings: data.timings || [],
    consultationFee: {
      firstVisit: data.consultationFee?.firstVisit || '',
      followUp: data.consultationFee?.followUp || ''
    },
    latitude: data.location?.coordinates?.[1] || '',
    longitude: data.location?.coordinates?.[0] || '',
    linkedPharmacies: data.linkedPharmacies || []
  };
};

const fetchAllPharmacies = async (): Promise<Pharmacy[]> => {
  const { data } = await apiClient.get<Pharmacy[]>('/api/pharmacy/all');
  return data;
};

// ----------------- COMPONENT -----------------

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [newService, setNewService] = useState('');

  const { register, handleSubmit, control, setValue, reset, watch } =
    useForm<DoctorProfileFormData>({
      defaultValues: {
        name: '',
        specialization: '',
        profilePictureUrl: '',
        phone: '',
        about: '',
        services: [],
        timings: [],
        consultationFee: { firstVisit: '', followUp: '' },
        latitude: '',
        longitude: '',
        linkedPharmacies: []
      }
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'timings'
  });

  const linkedPharmacies = watch('linkedPharmacies');

  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchDoctorProfile
  });

  const { data: allPharmacies, isLoading: isLoadingPharmacies } = useQuery({
    queryKey: ['allPharmacies'],
    queryFn: fetchAllPharmacies
  });

  const updateProfileMutation = useMutation({
    mutationFn: (updatedProfile: any) =>
      apiClient.put('/api/doctor/profile', updatedProfile),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Profile updated successfully!');
    },

    onError: (error: any) =>
      toast.error(error.response?.data?.message || 'Failed to update profile.')
  });

  useEffect(() => {
    if (profileData) reset(profileData);
  }, [profileData, reset]);

  const onSubmit: SubmitHandler<DoctorProfileFormData> = (data) => {
    const payload = {
      ...data,
      consultationFee: {
        firstVisit: Number(data.consultationFee.firstVisit) || 0,
        followUp: Number(data.consultationFee.followUp) || 0
      },
      latitude: Number(data.latitude) || null,
      longitude: Number(data.longitude) || null
    };

    updateProfileMutation.mutate(payload);
  };

  const handleAddService = () => {
    if (newService.trim() !== '') {
      setValue('services', [...watch('services'), newService.trim()]);
      setNewService('');
    }
  };

  const handleRemoveService = (index: number) => {
    setValue(
      'services',
      watch('services').filter((_, i) => i !== index)
    );
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported.');
      return;
    }

    const toastId = toast.loading('Fetching location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue('latitude', pos.coords.latitude);
        setValue('longitude', pos.coords.longitude);
        toast.success('Location fetched!', { id: toastId });
      },
      () => {
        toast.error('Could not get location.', { id: toastId });
      }
    );
  };

  if (isLoadingProfile || isLoadingPharmacies)
    return <div className="text-white">Loading...</div>;

  const availablePharmacies =
    allPharmacies?.filter((p) => !linkedPharmacies.includes(p._id)) || [];

  const selectedPharmacies =
    linkedPharmacies
      .map((id) => allPharmacies?.find((p) => p._id === id))
      .filter(Boolean) || [];

  const inputStyles =
    'w-full p-2.5 bg-[#2d3748] dark:bg-[#374151] rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-brand text-white placeholder:text-gray-400';
  const cardStyles = 'bg-card p-6 rounded-lg shadow-sm';
  const cardTitleStyles = 'text-lg font-semibold text-content-primary mb-4';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-content-secondary dark:text-content-secondary_dark">
          Edit Your Profile
        </h2>

        <button
          type="submit"
          disabled={updateProfileMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-white font-semibold rounded-md hover:bg-brand-hover disabled:bg-gray-500"
        >
          <Save size={18} />
          {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-8">
          {/* PROFILE PICTURE */}
          <div className={cardStyles}>
            <h3 className={cardTitleStyles}>Profile Picture</h3>

            <Controller
              control={control}
              name="profilePictureUrl"
              render={({ field }) => (
                <div>
                  {field.value && (
                    <img
                      src={field.value}
                      alt="Profile"
                      className="mb-4 w-full h-48 rounded-md object-cover"
                    />
                  )}

                  <div
                    className="flex justify-center items-center flex-col p-6 border-2 border-dashed rounded-lg border-border hover:border-brand cursor-pointer"
                    onClick={() =>
                      document.getElementById('pictureUpload')?.click()
                    }
                  >
                    <UploadCloud className="w-10 h-10 text-content-secondary" />
                    <p className="mt-2 text-xs text-content-secondary">
                      PNG, JPG, GIF up to 10MB
                    </p>

                    <input
                      type="file"
                      id="pictureUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const toastId = toast.loading('Uploading image...');

                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('upload_preset', 'ml_default');

                        try {
                          const res = await fetch(
                            `https://api.cloudinary.com/v1_1/dz6jq4gew/image/upload`,
                            { method: 'POST', body: formData }
                          );
                          const data = await res.json();

                          if (data.secure_url) {
                            field.onChange(data.secure_url);
                            toast.success('Image uploaded!', { id: toastId });
                          } else throw new Error('Upload failed');
                        } catch {
                          toast.error('Could not upload image.', {
                            id: toastId
                          });
                        }
                      }}
                    />
                  </div>

                  <input
                    type="text"
                    {...register('profilePictureUrl')}
                    placeholder="Or paste image URL"
                    className={`${inputStyles} mt-4 text-sm`}
                  />
                </div>
              )}
            />
          </div>

          {/* BASIC INFORMATION */}
          <div className={`${cardStyles} space-y-4`}>
            <h3 className={cardTitleStyles}>Basic Information</h3>

            {/* Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register('name')}
                placeholder="Full Name"
                className={`${inputStyles} pl-10`}
              />
            </div>

            {/* Specialization */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Stethoscope className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                {...register('specialization')}
                placeholder="Specialization"
                className={`${inputStyles} pl-10`}
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                {...register('phone')}
                placeholder="Phone Number"
                className={`${inputStyles} pl-10`}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* ABOUT */}
          <div className={cardStyles}>
            <h3 className={cardTitleStyles}>About Me</h3>
            <textarea
              {...register('about')}
              rows={5}
              className={inputStyles}
              placeholder="Write about your experience..."
            ></textarea>
          </div>

          {/* SERVICES */}
          <div className={cardStyles}>
            <h3 className={cardTitleStyles}>Services Offered</h3>

            <div className="flex flex-wrap gap-2 mb-2">
              {watch('services').map((service, index) => (
                <div
                  key={index}
                  className="flex items-center bg-brand-light text-brand font-medium pl-3 pr-2 py-1 rounded-full text-sm"
                >
                  {service}
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="ml-2 hover:text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <input
              type="text"
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddService();
                }
              }}
              placeholder="Type and press Enter"
              className={inputStyles}
            />
          </div>

          {/* TIMINGS */}
          <div className={`${cardStyles} space-y-4`}>
            <h3 className={cardTitleStyles}>Clinic Timings</h3>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-center">
                <input
                  {...register(`timings.${index}.day`)}
                  placeholder="Mon - Fri"
                  className={`${inputStyles} w-1/3`}
                />
                <input
                  {...register(`timings.${index}.time`)}
                  placeholder="9:00 AM - 5:00 PM"
                  className={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-2 text-gray-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ day: '', time: '' })}
              className="flex items-center gap-2 text-brand font-semibold"
            >
              <PlusCircle size={16} /> Add Timing
            </button>
          </div>

          {/* FEES */}
          <div className={`${cardStyles} grid grid-cols-1 md:grid-cols-2 gap-4`}>
            <div>
              <h3 className={cardTitleStyles}>First Visit Fee (₹)</h3>
              <input
                type="number"
                {...register('consultationFee.firstVisit')}
                className={inputStyles}
              />
            </div>
            <div>
              <h3 className={cardTitleStyles}>Follow-up Fee (₹)</h3>
              <input
                type="number"
                {...register('consultationFee.followUp')}
                className={inputStyles}
              />
            </div>
          </div>

          {/* LOCATION */}
          <div className={cardStyles}>
            <div className="flex justify-between items-center">
              <h3 className={cardTitleStyles}>Clinic Location</h3>
              <button
                type="button"
                onClick={handleGetLocation}
                className="flex items-center gap-2 text-brand font-semibold"
              >
                <LocateFixed size={16} /> Use My Location
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                {...register('latitude')}
                placeholder="Latitude"
                className={inputStyles}
              />
              <input
                type="number"
                step="any"
                {...register('longitude')}
                placeholder="Longitude"
                className={inputStyles}
              />
            </div>
          </div>

          {/* PHARMACIES */}
          <div className={cardStyles}>
            <h3 className={cardTitleStyles}>Linked Pharmacies</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {selectedPharmacies.map((pharmacy: any) => (
                <div
                  key={pharmacy._id}
                  className="flex items-center bg-brand-light text-brand px-3 py-1 rounded-full text-sm"
                >
                  {pharmacy.name}

                  <button
                    type="button"
                    className="ml-2 hover:text-red-500"
                    onClick={() =>
                      setValue(
                        'linkedPharmacies',
                        linkedPharmacies.filter((id) => id !== pharmacy._id)
                      )
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <Controller
              name="linkedPharmacies"
              control={control}
              render={({ field }) => (
                <select
                  value=""
                  onChange={(e) =>
                    field.onChange([...linkedPharmacies, e.target.value])
                  }
                  className={inputStyles}
                >
                  <option value="" disabled>
                    -- Add a pharmacy --
                  </option>

                  {availablePharmacies.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
