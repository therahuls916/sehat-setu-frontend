// Updated File: src/app/doctor/(protected)/prescription/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // <-- Import toast

// --- DATA STRUCTURES & TYPES ---
interface Pharmacy { _id: string; name: string; }
interface DoctorProfile { linkedPharmacies: string[]; }
interface Medicine { name: string; dosage: string; frequency: string; duration: string; }

// --- API FUNCTIONS ---
const fetchDoctorProfile = async (): Promise<DoctorProfile> => {
  const { data } = await apiClient.get('/api/doctor/profile');
  return data;
};

const fetchAllPharmacies = async (): Promise<Pharmacy[]> => {
    const { data } = await apiClient.get('/api/pharmacy/all');
    return data;
};

export default function PrescriptionPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const appointmentId = searchParams.get('appointmentId');
  const patientId = searchParams.get('patientId');
  const patientName = searchParams.get('patientName');

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('');

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: fetchDoctorProfile,
  });

  const { data: allPharmacies, isLoading: isLoadingPharmacies } = useQuery({
    queryKey: ['allPharmacies'],
    queryFn: fetchAllPharmacies,
  });
  
  const createPrescriptionMutation = useMutation({
    mutationFn: (newPrescription: any) => apiClient.post('/api/doctor/prescriptions', newPrescription),
    onSuccess: () => {
      toast.success('Prescription sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push('/doctor/appointments');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Could not send prescription.');
    }
  });

  // Redirect if no patient is selected from the appointments page
  useEffect(() => {
    if (!isLoadingProfile && (!appointmentId || !patientId || !patientName)) {
      toast.error('No patient selected. Please select an accepted appointment first.');
      router.push('/doctor/appointments');
    }
  }, [isLoadingProfile, appointmentId, patientId, patientName, router]);

  const handleAddMedicine = () => {
    if (!newMedName || !newMedDosage || !newMedFrequency || !newMedDuration) {
      return toast.error('Please fill all medicine fields.');
    }
    const newMedicine: Medicine = { name: newMedName, dosage: newMedDosage, frequency: newMedFrequency, duration: newMedDuration };
    setMedicines([...medicines, newMedicine]);
    setNewMedName(''); setNewMedDosage(''); setNewMedFrequency(''); setNewMedDuration('');
  };

  const handleRemoveMedicine = (indexToRemove: number) => {
    setMedicines(medicines.filter((_, index) => index !== indexToRemove));
  };

  const handleFinalizePrescription = () => {
    if (!appointmentId || !patientId || !selectedPharmacyId || medicines.length === 0) {
      return toast.error('Please select a pharmacy and add at least one medicine.');
    }
    const prescriptionPayload = {
      appointmentId, 
      patientId, 
      pharmacyId: selectedPharmacyId,
      medicines: medicines.map(med => ({
          name: med.name, 
          dosage: `${med.dosage} (${med.frequency})`, 
          duration: med.duration
      })),
      notes: diagnosisNotes,
    };
    createPrescriptionMutation.mutate(prescriptionPayload);
  };
  
  const linkedPharmacies = allPharmacies?.filter(p => profile?.linkedPharmacies?.includes(p._id)) || [];

  const isLoading = isLoadingProfile || isLoadingPharmacies;

  // Render a proper loading/message state
  if (isLoading || !patientName) {
    return (
      <div className="text-center py-10 text-textSecondary dark:text-dark-textSecondary">
        {isLoading ? "Loading prescription data..." : "No patient selected. Redirecting..."}
      </div>
    );
  }

  const inputStyles = "w-full p-2 border rounded-md dark:bg-dark-surface dark:border-dark-border dark:text-dark-textPrimary focus:ring-primary/50 focus:border-primary";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-textPrimary dark:text-dark-textPrimary mb-6">Create New Prescription</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Patient</label>
            <p className="w-full p-2 border rounded-md bg-surface dark:bg-dark-surface dark:border-dark-border text-textPrimary dark:text-dark-textPrimary font-semibold">{patientName}</p>
          </div>
          <div>
              <label htmlFor="pharmacy" className="block text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Linked Pharmacy <span className="text-red-500">*</span></label>
              <select id="pharmacy" className={inputStyles} value={selectedPharmacyId} onChange={(e) => setSelectedPharmacyId(e.target.value)}>
                  <option value="" disabled>-- Select a Pharmacy --</option>
                  {linkedPharmacies.map(p => (<option key={p._id} value={p._id}>{p.name}</option>))}
              </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="diagnosis" className="block text-sm font-medium text-textSecondary dark:text-dark-textSecondary mb-1">Diagnosis & Notes</label>
            <textarea id="diagnosis" placeholder="Enter diagnosis, symptoms..." className={inputStyles} rows={2} value={diagnosisNotes} onChange={e => setDiagnosisNotes(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="bg-surface dark:bg-dark-surface p-6 rounded-lg border dark:border-dark-border">
        <h2 className="text-xl font-semibold mb-4 text-textPrimary dark:text-dark-textPrimary">Add Medicine</h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          <div className="lg:col-span-2"><label className="block text-sm font-medium mb-1 dark:text-dark-textSecondary">Name <span className="text-red-500">*</span></label><input type="text" value={newMedName} onChange={(e) => setNewMedName(e.target.value)} placeholder="e.g., Paracetamol 500mg" className={inputStyles} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-dark-textSecondary">Dosage <span className="text-red-500">*</span></label><input type="text" value={newMedDosage} onChange={(e) => setNewMedDosage(e.target.value)} placeholder="e.g., 1 tablet" className={inputStyles} /></div>
          <div><label className="block text-sm font-medium mb-1 dark:text-dark-textSecondary">Frequency <span className="text-red-500">*</span></label><input type="text" value={newMedFrequency} onChange={(e) => setNewMedFrequency(e.target.value)} placeholder="e.g., Twice a day" className={inputStyles} /></div>
          <div className="lg:col-span-3"><label className="block text-sm font-medium mb-1 dark:text-dark-textSecondary">Duration / Instructions <span className="text-red-500">*</span></label><input type="text" value={newMedDuration} onChange={(e) => setNewMedDuration(e.target.value)} placeholder="e.g., For 7 days, after food" className={inputStyles} /></div>
          <div className="flex justify-end"><button onClick={handleAddMedicine} className="w-full flex items-center justify-center px-4 py-2 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-accent/90"><PlusCircle size={20} className="mr-2" /> Add</button></div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface p-6 rounded-lg shadow-md border dark:border-dark-border">
        <h2 className="text-xl font-semibold mb-4 text-textPrimary dark:text-dark-textPrimary">Current Prescription</h2>
        <div className="space-y-3">
          {medicines.length > 0 && (<div className="grid grid-cols-10 gap-4 px-4 py-2 rounded-lg bg-surface dark:bg-dark-surface font-semibold text-textSecondary dark:text-dark-textSecondary text-sm"><div className="col-span-4">Medicine</div><div className="col-span-2">Dosage</div><div className="col-span-3">Frequency & Duration</div><div className="col-span-1"></div></div>)}
          {medicines.map((med, index) => (<div key={index} className="grid grid-cols-10 gap-4 items-center px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5"><div className="col-span-4 font-semibold text-textPrimary dark:text-dark-textPrimary">{med.name}</div><div className="col-span-2 text-sm text-textSecondary dark:text-dark-textSecondary">{med.dosage}</div><div className="col-span-3 text-sm text-textSecondary dark:text-dark-textSecondary">{`${med.frequency}, ${med.duration}`}</div><div className="col-span-1 flex justify-end"><button onClick={() => handleRemoveMedicine(index)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"><Trash2 size={16} /></button></div></div>))}
          {medicines.length === 0 && (<div className="text-center py-10 border-2 border-dashed rounded-lg border-gray-300 dark:border-dark-border"><p className="text-textSecondary dark:text-dark-textSecondary">No medicines added yet.</p></div>)}
        </div>
      </div>
      
      <div className="flex justify-end mt-8">
        <button onClick={handleFinalizePrescription} disabled={createPrescriptionMutation.isPending} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400">
          {createPrescriptionMutation.isPending ? 'Sending...' : 'Finalize & Send Prescription'}
        </button>
      </div>
    </div>
  );
}