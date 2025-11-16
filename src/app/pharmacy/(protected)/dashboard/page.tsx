// src/app/pharmacy/(protected)/dashboard/page.tsx
'use client';

import StatCard from "@/components/StatCard";
import { Package, FileWarning, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import Link from "next/link";

interface DashboardStats {
  totalMedicines: number;
  pendingPrescriptions: number;
  outOfStock: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const { data } = await apiClient.get('/api/pharmacy/stats');
  return data;
};

export default function PharmacyDashboardPage() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['pharmacyDashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <div>Loading dashboard stats...</div>;
  if (isError) return <div>Failed to load stats. Please ensure you have created a pharmacy profile.</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-textPrimary">Dashboard</h1>
        <p className="mt-1 text-textSecondary">
          Welcome! Here is an overview of your pharmacy's activity.
        </p>
      </div>

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
          color="green" // Using green, but could be red if you prefer
        />
      </div>
    </div>
  );
}