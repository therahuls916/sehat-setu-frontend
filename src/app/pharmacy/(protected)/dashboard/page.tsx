'use client';

import StatCard from "@/components/StatCard";
import { Package, FileWarning, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import Link from "next/link";

// --- DATA STRUCTURE & API FUNCTION ---

interface DashboardStats {
  totalMedicines: number;
  pendingPrescriptions: number;
  outOfStock: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  // Added explicit type for type safety
  const { data } = await apiClient.get<DashboardStats>('/api/pharmacy/stats');
  return data;
};

// --- MAIN COMPONENT ---

export default function PharmacyDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['pharmacyDashboardStats'],
    queryFn: fetchDashboardStats,
     refetchInterval: 5000,
  });

  // --- LOADING / ERROR STATES (Updated with new text colors) ---
  if (isLoading) {
    return <div className="text-content-primary dark:text-content-primary_dark">Loading dashboard stats...</div>;
  }
  if (isError) {
    return <div className="text-red-500">Failed to load stats. Please ensure you have created a pharmacy profile.</div>;
  }

  return (
    <div>
      {/* --- PAGE HEADER (Updated with new text colors and hierarchy) --- */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-content-primary dark:text-content-primary_dark">
          Dashboard
        </h2>
        <p className="mt-1 text-content-secondary dark:text-content-secondary_dark">
          Welcome! Here is an overview of your pharmacy's activity.
        </p>
      </div>

      {/* --- STAT CARD GRID (No changes needed, will auto-update) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/pharmacy/manage-stock">
          <StatCard
            title="Total Medicines in Stock"
            value={stats?.totalMedicines.toString() || '0'}
            icon={Package}
            color="blue"
          />
        </Link>
        <StatCard
          title="Pending Prescriptions"
          value={stats?.pendingPrescriptions.toString() || '0'}
          icon={FileWarning}
          color="amber"
        />
        <StatCard
          title="Out of Stock Alerts"
          value={stats?.outOfStock.toString() || '0'}
          icon={AlertTriangle}
          color="green"
        />
      </div>
    </div>
  );
}