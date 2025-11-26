'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import { FileText, Calendar, User } from 'lucide-react';
import Link from 'next/link';

// --- DATA STRUCTURE ---
interface HistoryItem {
  _id: string; // Appointment ID
  appointmentDate: string;
  patientId: {
    name: string;
  };
  prescriptionId: string; // The ID of the prescription
}

// --- API FUNCTION ---
const fetchPatientHistory = async (): Promise<HistoryItem[]> => {
  const { data } = await apiClient.get<HistoryItem[]>('/api/doctor/history');
  return data;
};

// --- MAIN COMPONENT ---
export default function HistoryPage() {
  const { data: history, isLoading, isError } = useQuery({
    queryKey: ['patientHistory'],
    queryFn: fetchPatientHistory,
  });

  if (isLoading) return <div className="text-content-primary dark:text-content-primary_dark">Loading patient history...</div>;
  if (isError) return <div className="text-red-500">Failed to load history. The API endpoint might be missing.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-content-primary dark:text-content-primary_dark">
        Patient History
      </h2>
      <p className="text-content-secondary dark:text-content-secondary_dark">
        A record of all completed appointments and their prescriptions.
      </p>

      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-content-secondary uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history && history.length > 0 ? (
                history.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-brand-light rounded-full text-brand">
                                <User size={16} />
                            </div>
                            <span className="font-medium text-content-primary">{item.patientId?.name || 'Unknown'}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-content-secondary">
                            <Calendar size={16} />
                            <span>{new Date(item.appointmentDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {/* --- UPDATED LINK HERE --- */}
                      {item.prescriptionId ? (
                          <Link 
                            href={`/doctor/history/view?id=${item.prescriptionId}`} 
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-brand bg-brand-light rounded-md hover:bg-blue-100 transition-colors"
                          >
                              <FileText size={16} /> View Prescription
                          </Link>
                      ) : (
                          <span className="text-gray-400 text-sm italic">No Prescription</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-10 text-content-secondary">
                    No completed appointments found in your history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}