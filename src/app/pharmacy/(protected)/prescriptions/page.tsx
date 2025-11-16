// Updated File: src/app/pharmacy/(protected)/prescriptions/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { User, Stethoscope, FileText, Pill, CheckCircle, Package } from 'lucide-react';

// --- Data Structures ---
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

// --- API Functions ---
const fetchPrescriptions = async (): Promise<Prescription[]> => {
  const { data } = await apiClient.get('/api/pharmacy/prescriptions');
  return data;
};

const updatePrescription = async ({ id, status, pharmacyNotes }: { id: string, status: PrescriptionStatus, pharmacyNotes?: string }) => {
  const { data } = await apiClient.put(`/api/pharmacy/prescriptions/${id}`, { status, pharmacyNotes });
  return data;
};

// --- Helper Components ---
const StatusBadge = ({ status }: { status: PrescriptionStatus }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    ready_for_pickup: 'bg-blue-100 text-blue-800 border-blue-200',
    dispensed: 'bg-green-100 text-green-800 border-green-200',
  };
  const text = {
    pending: 'Pending',
    ready_for_pickup: 'Ready for Pickup',
    dispensed: 'Dispensed',
  };
  return <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status]}`}>{text[status]}</span>;
};

// --- Main Component ---
export default function PrescriptionsPage() {
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});

  const { data: prescriptions, isLoading, isError } = useQuery({
    queryKey: ['incomingPrescriptions'],
    queryFn: fetchPrescriptions,
  });

  const updateMutation = useMutation({
    mutationFn: updatePrescription,
    onSuccess: () => {
      toast.success('Prescription status updated!');
      queryClient.invalidateQueries({ queryKey: ['incomingPrescriptions'] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed.'),
  });

  const handleStatusUpdate = (id: string, status: PrescriptionStatus) => {
    updateMutation.mutate({ id, status, pharmacyNotes: remarks[id] });
  };

  const handleRemarkChange = (id: string, value: string) => {
    setRemarks(prev => ({ ...prev, [id]: value }));
  };

  if (isLoading) return <div className="text-center p-10">Loading prescriptions...</div>;
  if (isError) return <div className="text-center p-10 text-red-600">Failed to load prescriptions.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Incoming Prescriptions</h1>

      {prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-6">
          {prescriptions.map((p) => (
            <div key={p._id} className="rounded-xl border bg-white/80 p-6 shadow-lg backdrop-blur-lg">
              {/* Card Header */}
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4 pb-4 border-b">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-800">{p.patientId.name}</h2>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Stethoscope className="w-4 h-4 text-gray-400" />
                    <span>Prescribed by Dr. {p.doctorId.name} ({p.doctorId.specialization})</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={p.status} />
                  <div className="text-sm text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><Pill size={18} /> Medicines</h3>
                  <ul className="space-y-2 text-sm">
                    {p.medicines.map((med, index) => (
                      <li key={index} className="p-2 bg-gray-50/70 rounded-md">
                        <p className="font-semibold text-gray-800">{med.name}</p>
                        <p className="text-gray-600">{med.dosage} - {med.duration}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  {p.notes && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FileText size={18} /> Doctor's Notes</h3>
                      <p className="text-sm text-gray-600 p-3 bg-blue-50/70 rounded-md border border-blue-200/50">{p.notes}</p>
                    </div>
                  )}
                  {p.pharmacyNotes && (
                     <div>
                      <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2"><FileText size={18} /> Your Remarks</h3>
                      <p className="text-sm text-gray-600 p-3 bg-green-50/70 rounded-md border border-green-200/50">{p.pharmacyNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions - only show if not dispensed */}
              {p.status !== 'dispensed' && (
                <div className="mt-6 pt-4 border-t">
                  <div className="grid md:grid-cols-2 gap-4 items-end">
                    <div>
                      <label htmlFor={`remark-${p._id}`} className="text-sm font-medium text-gray-700">Add Remark (Optional)</label>
                      <textarea
                        id={`remark-${p._id}`}
                        rows={2}
                        placeholder="e.g., One medicine is out of stock..."
                        className="mt-1 w-full rounded-lg border-gray-300 bg-gray-50 py-2 shadow-sm focus:border-green-500 focus:ring-green-200"
                        value={remarks[p._id] || ''}
                        onChange={(e) => handleRemarkChange(p._id, e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      {p.status === 'pending' && (
                        <button onClick={() => handleStatusUpdate(p._id, 'ready_for_pickup')} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 text-white font-semibold py-2.5 hover:bg-blue-700">
                          <Package size={16}/> Ready for Pickup
                        </button>
                      )}
                       {p.status === 'ready_for_pickup' && (
                        <button onClick={() => handleStatusUpdate(p._id, 'dispensed')} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 text-white font-semibold py-2.5 hover:bg-green-700">
                          <CheckCircle size={16}/> Mark as Dispensed
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
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <p className="text-lg text-gray-500">You have no incoming prescriptions at the moment.</p>
        </div>
      )}
    </div>
  );
}