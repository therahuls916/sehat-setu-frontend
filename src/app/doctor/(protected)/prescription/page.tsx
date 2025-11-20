'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Pill, User, FileText, Search } from 'lucide-react';

// --- TYPES ---
interface Pharmacy { _id: string; name: string; }
interface DoctorProfile { linkedPharmacies: string[]; }
interface Medicine { name:string; dosage: string; frequency: string; duration: string; quantity: number; }
interface StockItem { _id: string; medicineName: string; quantity: number; }

// --- API FUNCTIONS ---
const fetchDoctorProfile = async (): Promise<DoctorProfile> => {
  const { data } = await apiClient.get<DoctorProfile>('/api/doctor/profile');
  return data;
};
const fetchAllPharmacies = async (): Promise<Pharmacy[]> => {
    const { data } = await apiClient.get<Pharmacy[]>('/api/pharmacy/all');
    return data;
};

// New: Fetch stock for specific pharmacy
const fetchPharmacyStock = async (pharmacyId: string): Promise<StockItem[]> => {
    if(!pharmacyId) return [];
    const { data } = await apiClient.get<StockItem[]>(`/api/doctor/pharmacy/${pharmacyId}/stock`);
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
  
  // Form Inputs
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [newMedDuration, setNewMedDuration] = useState('');
  const [newMedQuantity, setNewMedQuantity] = useState(1); // Default to 1

  // Queries
  const { data: profile, isLoading: isLoadingProfile } = useQuery({ queryKey: ['userProfile'], queryFn: fetchDoctorProfile });
  const { data: allPharmacies, isLoading: isLoadingPharmacies } = useQuery({ queryKey: ['allPharmacies'], queryFn: fetchAllPharmacies });
  
  // Fetch stock only when a pharmacy is selected
  const { data: pharmacyStock } = useQuery({
      queryKey: ['pharmacyStock', selectedPharmacyId],
      queryFn: () => fetchPharmacyStock(selectedPharmacyId),
      enabled: !!selectedPharmacyId
  });

  const createPrescriptionMutation = useMutation({
    mutationFn: (newPrescription: any) => apiClient.post('/api/doctor/prescriptions', newPrescription),
    onSuccess: () => {
      toast.success('Prescription sent successfully!');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      router.push('/doctor/appointments');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Could not send prescription.'),
  });

  useEffect(() => {
    if (!isLoadingProfile && (!appointmentId || !patientId || !patientName)) {
      toast.error('No patient selected. Please select an accepted appointment first.');
      router.push('/doctor/appointments');
    }
  }, [isLoadingProfile, appointmentId, patientId, patientName, router]);

  // --- UPDATED ADD MEDICINE LOGIC ---
  const handleAddMedicine = () => {
    // 1. Validate all required fields (Name, Dosage, AND Duration)
    if (!newMedName.trim() || !newMedDosage.trim() || !newMedDuration.trim()) {
      toast.error('Please enter Name, Dosage, and Duration.');
      return;
    }

    // 2. Create the medicine object
    // Note: The backend 'prescriptionModel.js' doesn't have a specific 'frequency' field.
    // We can combine frequency into dosage or instructions to ensure it's saved, 
    // OR just rely on the fact that duration is now mandatory.
    const newMedicine: Medicine = {
      name: newMedName,
      dosage: newMedDosage,
      frequency: newMedFrequency, // (Backend ignores this if not in schema, but frontend uses it for list)
      duration: newMedDuration,   // This MUST not be empty
      quantity: newMedQuantity
    };

    setMedicines([...medicines, newMedicine]);
    
    // 3. Clear inputs
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('');
    setNewMedDuration('');
    setNewMedQuantity(1);
  };

  const handleRemoveMedicine = (indexToRemove: number) => {
    setMedicines(medicines.filter((_, index) => index !== indexToRemove));
  };

  const handleFinalizePrescription = () => {
    if (!selectedPharmacyId) {
      toast.error('Please select a Linked Pharmacy.');
      return;
    }
    if (medicines.length === 0) {
      toast.error('Please add at least one medicine to the prescription.');
      return;
    }

    createPrescriptionMutation.mutate({
      appointmentId,
      patientId,
      pharmacyId: selectedPharmacyId,
      medicines,
      notes: diagnosisNotes,
    });
  };
  
  const linkedPharmacies = allPharmacies?.filter(p => profile?.linkedPharmacies?.includes(p._id)) || [];
  const isLoading = isLoadingProfile || isLoadingPharmacies;

  if (isLoading || !patientName) {
    return <div className="text-content-primary dark:text-content-primary_dark">Loading...</div>;
  }

  const inputStyles = "w-full p-2.5 bg-[#2d3748] dark:bg-[#374151] rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-brand text-white placeholder:text-gray-400";
  const cardStyles = "bg-card p-6 rounded-lg shadow-sm";
  const cardTitleStyles = "text-lg font-semibold text-content-primary mb-4";

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-content-primary dark:text-content-primary_dark">Create New Prescription</h2>
        <button onClick={handleFinalizePrescription} disabled={createPrescriptionMutation.isPending} className="px-4 py-2 bg-brand text-white font-semibold rounded-md hover:bg-brand-hover disabled:bg-gray-500">
          {createPrescriptionMutation.isPending ? 'Sending...' : 'Finalize & Send'}
        </button>
      </div>
      
      {/* Patient & Pharmacy */}
      <div className={cardStyles}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-content-primary">Patient</label>
            <p className="flex items-center gap-2 w-full p-2.5 mt-1 border rounded-md bg-gray-100 text-content-primary font-semibold">
                <User size={16} /> {patientName}
            </p>
          </div>
          <div>
              <label htmlFor="pharmacy" className="text-sm font-medium text-content-primary">Linked Pharmacy <span className="text-red-500">*</span></label>
              <select id="pharmacy" className={`${inputStyles} mt-1`} value={selectedPharmacyId} onChange={(e) => setSelectedPharmacyId(e.target.value)}>
                  <option value="" disabled>-- Select a Pharmacy to see Stock --</option>
                  {linkedPharmacies.map(p => (<option key={p._id} value={p._id}>{p.name}</option>))}
              </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="diagnosis" className="text-sm font-medium text-content-primary">Diagnosis & Notes</label>
            <textarea id="diagnosis" placeholder="Enter diagnosis..." className={`${inputStyles} mt-1`} rows={3} value={diagnosisNotes} onChange={e => setDiagnosisNotes(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Add Medicine */}
      <div className={cardStyles}>
        <h3 className={`${cardTitleStyles} flex items-center gap-2`}><Pill size={20} /> Add Medicine</h3>
        
        {/* INPUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
          
          {/* Medicine Name with Datalist for Autocomplete */}
          <div className="lg:col-span-2">
             <label className="text-xs font-medium text-content-secondary mb-1 block">Name</label>
             <input 
                type="text" 
                list="stock-suggestions" 
                value={newMedName} 
                onChange={(e) => setNewMedName(e.target.value)} 
                placeholder="Medicine Name" 
                className={inputStyles} 
                autoComplete="off"
             />
             {/* Datalist for Suggestions */}
             <datalist id="stock-suggestions">
                {pharmacyStock?.map((item) => (
                    <option key={item._id} value={item.medicineName}>
                        {item.medicineName} (Available: {item.quantity})
                    </option>
                ))}
             </datalist>
          </div>

          <div>
             <label className="text-xs font-medium text-content-secondary mb-1 block">Dosage</label>
             <input type="text" value={newMedDosage} onChange={(e) => setNewMedDosage(e.target.value)} placeholder="e.g. 500mg" className={inputStyles} />
          </div>

          <div>
             <label className="text-xs font-medium text-content-secondary mb-1 block">Qty</label>
             <input type="number" min="1" value={newMedQuantity} onChange={(e) => setNewMedQuantity(parseInt(e.target.value) || 1)} className={inputStyles} />
          </div>

          <div className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs font-medium text-content-secondary mb-1 block">Freq</label>
                    <input type="text" value={newMedFrequency} onChange={(e) => setNewMedFrequency(e.target.value)} placeholder="e.g. BID" className={inputStyles} />
                </div>
                 <div>
                    <label className="text-xs font-medium text-content-secondary mb-1 block">Duration</label>
                    <input type="text" value={newMedDuration} onChange={(e) => setNewMedDuration(e.target.value)} placeholder="e.g. 5 Days" className={inputStyles} />
                </div>
              </div>
          </div>
          
          <div className="flex justify-end">
            <button type="button" onClick={handleAddMedicine} className="w-full flex items-center justify-center px-4 py-2.5 bg-brand text-white font-semibold rounded-md hover:bg-brand-hover">
                <PlusCircle size={20} className="mr-2" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Current Prescription */}
      <div className={cardStyles}>
        <h3 className={`${cardTitleStyles} flex items-center gap-2`}><FileText size={20} /> Current Prescription</h3>
        <div className="space-y-2">
          {medicines.length > 0 && (
            <div className="grid grid-cols-12 gap-4 px-4 py-2 rounded-md bg-gray-100 font-semibold text-content-secondary text-sm">
                <div className="col-span-4">Medicine</div>
                <div className="col-span-2">Dosage</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-4">Instructions</div>
                <div className="col-span-1"></div>
            </div>
          )}
          {medicines.map((med, index) => (
            <div key={index} className="grid grid-cols-12 gap-4 items-center px-4 py-3 rounded-md hover:bg-gray-50 border-b border-border last:border-0">
                <div className="col-span-4 font-semibold text-content-primary">{med.name}</div>
                <div className="col-span-2 text-sm text-content-secondary">{med.dosage}</div>
                <div className="col-span-1 text-sm font-bold text-content-primary">{med.quantity}</div>
                <div className="col-span-4 text-sm text-content-secondary">{med.frequency}, {med.duration}</div>
                <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => handleRemoveMedicine(index)} className="text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
            </div>
          ))}
          {medicines.length === 0 && (
            <div className="text-center py-10 border-2 border-dashed rounded-lg border-border">
                <p className="text-content-secondary">No medicines added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}