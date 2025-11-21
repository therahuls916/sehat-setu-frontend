'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { User, Stethoscope, FileText, Pill, CheckCircle, Package } from 'lucide-react';

// --- DATA STRUCTURES ---
interface Medicine { name: string; dosage: string; duration: string; }
type PrescriptionStatus = 'pending' | 'ready_for_pickup' | 'dispensed';

interface Prescription {
  _id: string;
  patientId: { name: string };
  doctorId: { name: string, specialization: string };
  medicines: Medicine[];
  notes: string;
  status: PrescriptionStatus;
  pharmacyNotes?: string;
  createdAt: string;
}

// --- API FUNCTIONS ---
const fetchPrescriptions = async (): Promise<Prescription[]> => {
  const { data } = await apiClient.get<Prescription[]>('/api/pharmacy/prescriptions');
  return data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

const updatePrescription = async ({ id, status, pharmacyNotes }: { id: string, status: PrescriptionStatus, pharmacyNotes?: string }) => {
  const { data } = await apiClient.put(`/api/pharmacy/prescriptions/${id}`, { status, pharmacyNotes });
  return data;
};

// --- STATUS BADGE COMPONENT ---
const StatusBadge = ({ status }: { status: PrescriptionStatus }) => {
    const styles = {
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        ready_for_pickup: 'bg-sky-100 text-sky-800 border-sky-200',
        dispensed: 'bg-green-100 text-green-800 border-green-200',
    };
  const text = { pending: 'Pending', ready_for_pickup: 'Ready for Pickup', dispensed: 'Dispensed' };
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{text[status]}</span>;
};

// --- MAIN COMPONENT ---
export default function PrescriptionsPage() {
  const queryClient = useQueryClient();
  // State to hold remarks for each prescription ID
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  
  const { data: prescriptions, isLoading, isError } = useQuery({ 
      queryKey: ['incomingPrescriptions'], 
      queryFn: fetchPrescriptions ,
       refetchInterval: 5000,
  });

  // --- 1. FIX: Implement the Mutation Logic ---
  const updateMutation = useMutation({
    mutationFn: updatePrescription,
    onSuccess: () => {
      toast.success('Prescription status updated successfully!');
      // Refresh the list
      queryClient.invalidateQueries({ queryKey: ['incomingPrescriptions'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacyDashboardStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    },
  });

  // --- 2. FIX: Implement Status Update Handler ---
  const handleStatusUpdate = (id: string, status: PrescriptionStatus) => {
    // Get the remark specifically for this prescription ID
    const pharmacyNotes = remarks[id];
    updateMutation.mutate({ id, status, pharmacyNotes });
  };

  // --- 3. FIX: Implement Remark Change Handler ---
  const handleRemarkChange = (id: string, value: string) => {
    setRemarks(prev => ({
        ...prev,
        [id]: value
    }));
  };

  if (isLoading) return <div className="text-content-primary dark:text-content-primary_dark">Loading prescriptions...</div>;
  if (isError) return <div className="text-red-500">Failed to load prescriptions.</div>;
  
  const inputStyles = "w-full p-2.5 bg-[#2d3748] dark:bg-[#374151] rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-brand text-white placeholder:text-gray-400";
  const labelStyles = "block text-sm font-medium text-content-primary mb-1.5";
  const cardTitleStyles = "text-md font-semibold text-content-primary mb-3 flex items-center gap-2";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-content-primary dark:text-content-primary_dark">Incoming Prescriptions</h2>

      {prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-6">
          {prescriptions.map((p) => (
            <div key={p._id} className="bg-card p-6 rounded-lg shadow-sm border border-border">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b border-border">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-content-secondary" />
                    <h3 className="text-xl font-bold text-content-primary">{p.patientId.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-content-secondary">
                    <Stethoscope className="w-4 h-4" />
                    <span>Prescribed by Dr. {p.doctorId.name} ({p.doctorId.specialization})</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={p.status} />
                  <div className="text-sm text-content-secondary">
                    {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h4 className={cardTitleStyles}><Pill size={18} /> Medicines</h4>
                  <ul className="space-y-2 text-sm">
                    {p.medicines.map((med, index) => (
                      <li key={index} className="p-2.5 bg-gray-50 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-content-primary">{med.name}</p>
                            <p className="text-content-secondary">{med.dosage} - {med.duration}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  {p.notes && (
                    <div>
                      <h4 className={cardTitleStyles}><FileText size={18} /> Doctor's Notes</h4>
                      <p className="text-sm text-content-secondary p-3 bg-blue-50 rounded-lg border border-blue-100">{p.notes}</p>
                    </div>
                  )}
                  {p.pharmacyNotes && (
                     <div>
                      <h4 className={cardTitleStyles}><FileText size={18} /> Your Remarks</h4>
                      <p className="text-sm text-content-secondary p-3 bg-green-50 rounded-lg border border-green-100">{p.pharmacyNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Area */}
              {p.status !== 'dispensed' && (
                <div className="mt-6 pt-4 border-t border-border">
                  <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label htmlFor={`remark-${p._id}`} className={labelStyles}>Add Remark (Optional)</label>
                      <textarea 
                        id={`remark-${p._id}`} 
                        rows={2} 
                        placeholder="e.g., One medicine is out of stock..." 
                        className={inputStyles} 
                        value={remarks[p._id] || ''} 
                        onChange={(e) => handleRemarkChange(p._id, e.target.value)} 
                      />
                    </div>
                    <div className="flex gap-2">
                      {p.status === 'pending' && (
                        <button 
                            onClick={() => handleStatusUpdate(p._id, 'ready_for_pickup')} 
                            disabled={updateMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-sky-500 text-white font-semibold py-2.5 hover:bg-sky-600 disabled:bg-gray-400"
                        >
                          <Package size={16}/> {updateMutation.isPending ? 'Updating...' : 'Ready for Pickup'}
                        </button>
                      )}
                       {p.status === 'ready_for_pickup' && (
                        <button 
                            onClick={() => handleStatusUpdate(p._id, 'dispensed')} 
                            disabled={updateMutation.isPending}
                            className="flex-1 flex items-center justify-center gap-2 rounded-md bg-green-500 text-white font-semibold py-2.5 hover:bg-green-600 disabled:bg-gray-400"
                        >
                          <CheckCircle size={16}/> {updateMutation.isPending ? 'Updating...' : 'Mark as Dispensed'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-lg">
          <p className="text-lg text-content-secondary">You have no incoming prescriptions at the moment.</p>
        </div>
      )}
    </div>
  );
}