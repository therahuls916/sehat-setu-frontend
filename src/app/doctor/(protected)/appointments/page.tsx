// Updated File: src/app/doctor/(protected)/appointments/page.tsx
'use client';

import Link from 'next/link';
import { CheckCircle2, XCircle, FilePlus2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string;
  };
  appointmentDate: string;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
}

const fetchAppointments = async (): Promise<Appointment[]> => {
  const { data } = await apiClient.get('/api/doctor/appointments');
  return data;
};

const StatusBadge = ({ status }: { status: Appointment['status'] }) => {
  // Updated styles with dark mode variants
  const styles = {
    pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400',
    accepted: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 font-semibold cursor-pointer hover:bg-cyan-200 dark:hover:bg-cyan-500/20',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-500/10 dark:text-blue-400',
  };
  const displayText = status.charAt(0).toUpperCase() + status.slice(1);
  return <span className={`px-4 py-1.5 text-sm rounded-full transition-colors ${styles[status]}`}>{displayText}</span>;
};

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  if (isLoading) return <div className="text-gray-800 dark:text-dark-textPrimary">Loading appointments...</div>;
  if (isError) return <div className="text-red-600 dark:text-red-400">Failed to load appointments. Please try again later.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-textPrimary dark:text-dark-textPrimary mb-6">Manage Appointments</h1>
      <div className="bg-white dark:bg-dark-surfaceMuted rounded-lg shadow-xl border border-gray-200/50 dark:border-dark-border overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-surface dark:bg-dark-surface border-b-2 border-gray-200 dark:border-dark-border">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-dark-textSecondary uppercase">Patient Details</th>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-dark-textSecondary uppercase">Appointment Date</th>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-dark-textSecondary uppercase">Status</th>
              <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 dark:text-dark-textSecondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
            {appointments && appointments.length > 0 ? (
              appointments.map((appt) => (
                <tr key={appt._id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="px-8 py-5">
                    <div className="text-base font-bold text-textPrimary dark:text-dark-textPrimary">{appt.patientId?.name || 'Unnamed Patient'}</div>
                    <div className="text-sm text-textSecondary dark:text-dark-textSecondary">{appt.reason}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-base font-semibold text-textPrimary dark:text-dark-textPrimary">{new Date(appt.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
                    <div className="text-sm text-textSecondary dark:text-dark-textSecondary">{new Date(appt.appointmentDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="px-8 py-5">
                    {appt.status === 'accepted' ? (
                      <Link
                        href={`/doctor/prescription?appointmentId=${appt._id}&patientId=${appt.patientId._id}&patientName=${encodeURIComponent(appt.patientId.name)}`}
                        className="flex items-center group"
                      >
                        <StatusBadge status={appt.status} />
                        <span title="Create Prescription">
                          <FilePlus2 size={20} className="ml-3 text-cyan-700 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                        </span>
                      </Link>
                    ) : (
                      <StatusBadge status={appt.status} />
                    )}
                  </td>
                  <td className="px-8 py-5">
                    {appt.status === 'pending' && (
                      <div className="flex items-center space-x-6">
                        <button onClick={() => updateAppointmentMutation.mutate({ id: appt._id, status: 'accepted' })} className="flex items-center text-lg font-semibold text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                          <CheckCircle2 size={22} className="mr-2" /> Accept
                        </button>
                        <button onClick={() => updateAppointmentMutation.mutate({ id: appt._id, status: 'rejected' })} className="flex items-center text-lg font-semibold text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                          <XCircle size={22} className="mr-2" /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-20 text-gray-500 dark:text-dark-textSecondary">
                  You have no pending or active appointments.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}