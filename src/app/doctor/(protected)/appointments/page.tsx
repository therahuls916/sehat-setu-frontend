'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import { CheckCircle2, XCircle, FilePlus2, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// --- DATA STRUCTURE & API FUNCTION (No changes needed) ---
interface Appointment {
  _id: string;
  patientId: { _id: string; name: string; };
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'canceled';
}

const fetchAppointments = async (): Promise<Appointment[]> => {
  const { data } = await apiClient.get<Appointment[]>('/api/doctor/appointments');
  return data.sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime();
  });
};

// --- REDESIGNED STATUS BADGE for High Contrast ---
const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
  const styles = {
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    accepted: 'bg-brand-light text-brand border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    completed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    canceled: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  const displayText = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>{displayText}</span>;
};

// --- MAIN PAGE COMPONENT ---
export default function AppointmentsPage() {
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, isError } = useQuery({
    queryKey: ['appointments'],
    queryFn: fetchAppointments,
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'rejected' }) => {
      return apiClient.put(`/api/doctor/appointments/${id}`, { status });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success(`Appointment ${variables.status}.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update appointment.');
    }
  });

  if (isLoading) return <div className="text-content-primary dark:text-content-primary_dark">Loading appointments...</div>;
  if (isError) return <div className="text-red-500">Failed to load appointments. Please try again later.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-content-primary dark:text-content-primary_dark">
        Manage Appointments
      </h2>
      
      {appointments && appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map((appt) => {
            const appointmentContent = (
              // --- CARD STYLING UPDATED ---
              // The card background is now ALWAYS `bg-card` (white)
              <div className="bg-card p-5 rounded-lg shadow-sm border border-border hover:shadow-md transition-shadow">
                {/* Card Header */}
                <div className="flex justify-between items-start">
                  <div>
                    {/* Text colors now use `content-primary` and `content-secondary` */}
                    <p className="font-bold text-lg text-content-primary">{appt.patientId?.name || 'Unnamed Patient'}</p>
                    <p className="text-sm text-content-secondary">{appt.reason}</p>
                  </div>
                  <StatusBadge status={appt.status} />
                </div>
                
                <hr className="my-4 border-border" />
                
                {/* Card Body */}
                <div className="flex items-center justify-between text-sm text-content-secondary">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span>{new Date(appt.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })}</span>
                    </div>
                     <div className="flex items-center gap-2 font-medium text-content-primary">
                        <Clock size={16} />
                        <span>{appt.appointmentTime}</span>
                    </div>
                </div>

                {/* Card Footer: Actions */}
                {appt.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-border flex gap-2">
                    <button onClick={() => updateAppointmentMutation.mutate({ id: appt._id, status: 'accepted' })} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600">
                      <CheckCircle2 size={16} /> Accept
                    </button>
                    <button onClick={() => updateAppointmentMutation.mutate({ id: appt._id, status: 'rejected' })} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600">
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
                
                {appt.status === 'accepted' && (
                    <div className="mt-4 pt-4 border-t border-border flex">
                        <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-light text-brand font-semibold rounded-md">
                           <FilePlus2 size={16} /> Click to Create Prescription
                        </div>
                    </div>
                )}
              </div>
            );

            return appt.status === 'accepted' ? (
              <Link
                key={appt._id}
                href={`/doctor/prescription?appointmentId=${appt._id}&patientId=${appt.patientId._id}&patientName=${encodeURIComponent(appt.patientId.name)}`}
                className="block"
              >
                {appointmentContent}
              </Link>
            ) : (
              <div key={appt._id}>{appointmentContent}</div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-lg">
          <p className="text-content-secondary">You have no pending or active appointments.</p>
        </div>
      )}
    </div>
  );
}