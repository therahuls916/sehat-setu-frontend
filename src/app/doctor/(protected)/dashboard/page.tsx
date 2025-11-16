// Updated File: src/app/doctor/(protected)/dashboard/page.tsx
'use client';

import StatCard from "@/components/StatCard";
import { CalendarCheck, CalendarClock, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/api';

interface DashboardStats {
  todaysAppointments: number;
  pendingRequests: number;
  acceptedAppointments: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get('/api/doctor/stats');
  return data;
};

export default function DoctorDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <div className="text-gray-800 dark:text-dark-textPrimary">Loading dashboard stats...</div>;
  if (isError) return <div className="text-red-600 dark:text-red-400">Failed to load stats.</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary dark:text-dark-textPrimary">Dashboard</h1>
        <p className="mt-1 text-textSecondary dark:text-dark-textSecondary">
          Welcome back! Here is an overview of your schedule.
        </p>
      </div>

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