'use client';

import StatCard from "@/components/StatCard";
import { CalendarCheck, CalendarClock, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/api';

// --- DATA STRUCTURE & API FUNCTION ---

interface DashboardStats {
  todaysAppointments: number;
  pendingRequests: number;
  acceptedAppointments: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Added explicit type for type safety
  const { data } = await apiClient.get<DashboardStats>('/api/doctor/stats');
  return data;
};

// --- MAIN COMPONENT ---

export default function DoctorDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  // --- LOADING / ERROR STATES (Updated with new text colors) ---
  if (isLoading) {
    return <div className="text-content-primary dark:text-content-primary_dark">Loading dashboard stats...</div>;
  }
  if (isError) {
    return <div className="text-red-500">Failed to load stats. Please try again.</div>;
  }

  return (
    // The main container is a simple div.
    <div>
      {/* --- PAGE HEADER (Updated with new text colors) --- */}
      {/* The main 'Dashboard' title is now in the shared Header component. */}
      {/* This is the secondary header as seen in the screenshot. */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-content-primary dark:text-content-primary_dark">
          Dashboard
        </h2>
        <p className="mt-1 text-content-secondary dark:text-content-secondary_dark">
          Welcome back! Here is an overview of your schedule.
        </p>
      </div>

      {/* --- STAT CARD GRID --- */}
      {/* This grid will now display our re-styled, high-contrast StatCards. */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Today's Appointments"
          value={stats?.todaysAppointments.toString() || '0'}
          icon={CalendarCheck}
          color="blue"
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests.toString() || '0'}
          icon={CalendarClock}
          color="amber"
        />
        <StatCard
          title="Accepted Appointments"
          value={stats?.acceptedAppointments.toString() || '0'}
          icon={UserCheck}
          color="green"
        />
      </div>
    </div>
  );
}