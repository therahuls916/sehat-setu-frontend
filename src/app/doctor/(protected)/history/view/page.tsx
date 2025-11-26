// src/app/doctor/(protected)/history/view/page.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import {
    ArrowLeft,
    User,
    FileText,
    Store,
    Download,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- TYPES ---
interface Medicine {
    name: string;
    dosage: string;
    frequency?: string;
    duration: string;
    quantity: number;
}

interface PrescriptionDetails {
    _id: string;
    patientId: {
        name: string;
        gender: string;
        dateOfBirth: string;
        phone: string;
    };
    pharmacyId: {
        name: string;
        address: string;
    };
    medicines: Medicine[];
    notes?: string;
    status: string;
    createdAt: string;
}

// --- API FUNCTION ---
const fetchPrescriptionDetails = async (id: string): Promise<PrescriptionDetails> => {
    const { data } = await apiClient.get<PrescriptionDetails>(`/api/doctor/prescriptions/${id}`);
    return data;
};

// --- HELPER TO DOWNLOAD PDF ---
const handleDownload = async (id: string) => {
    try {
        const response = await apiClient.get(`/api/doctor/prescriptions/${id}/download`, {
            responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `prescription-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch (error) {
        toast.error("Failed to download prescription.");
    }
};

export default function ViewPrescriptionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prescriptionId = searchParams.get('id');

    const { data: prescription, isLoading, isError } = useQuery({
        queryKey: ['prescription', prescriptionId],
        queryFn: () => fetchPrescriptionDetails(prescriptionId!),
        enabled: !!prescriptionId,
    });

    if (!prescriptionId) return <div className="p-8">Invalid Request. ID missing.</div>;
    if (isLoading) return <div className="p-8 text-content-primary">Loading details...</div>;
    if (isError) return <div className="p-8 text-red-500">Error loading prescription.</div>;

    if (!prescription) return null;

    // Calculate Age
    const age = prescription.patientId.dateOfBirth ?
        new Date().getFullYear() - new Date(prescription.patientId.dateOfBirth).getFullYear() : 'N/A';

    const cardStyles = "bg-card p-6 rounded-lg shadow-sm border border-border";
    const sectionTitle = "text-sm font-semibold text-content-secondary uppercase tracking-wider mb-3";

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-8">
            {/* Header / Back Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-content-secondary hover:text-brand transition-colors"
                >
                    <ArrowLeft size={20} /> Back to History
                </button>

                <button
                    onClick={() => handleDownload(prescription._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors shadow-sm"
                >
                    <Download size={18} /> Download PDF
                </button>
            </div>

            {/* Status Banner */}
            <div className={`flex items-center justify-between p-4 rounded-lg border ${
                prescription.status === 'dispensed' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                prescription.status === 'ready_for_pickup' ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
            }`}>
                <span className="font-semibold flex items-center gap-2">
                    Status: {prescription.status.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className="text-sm flex items-center gap-1 opacity-90">
                    <Clock size={16} /> Created: {new Date(prescription.createdAt).toLocaleDateString()}
                </span>
            </div>

            {/* Patient & Pharmacy Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Info */}
                <div className={cardStyles}>
                    <h3 className={sectionTitle}><User size={16} className="inline mr-2 mb-1" /> Patient Details</h3>
                    <div className="space-y-3">
                        <p className="text-2xl font-bold text-content-primary">{prescription.patientId.name}</p>
                        <div className="flex gap-6 text-sm text-content-secondary font-medium">
                            <span>Age: {age}</span>
                            <span>Gender: {prescription.patientId.gender || 'N/A'}</span>
                        </div>
                        <p className="text-sm text-content-secondary">{prescription.patientId.phone}</p>
                    </div>
                </div>

                {/* Pharmacy Info */}
                <div className={cardStyles}>
                    <h3 className={sectionTitle}><Store size={16} className="inline mr-2 mb-1" /> Dispensing Pharmacy</h3>
                    <div className="space-y-3">
                        <p className="text-2xl font-bold text-content-primary">{prescription.pharmacyId.name}</p>
                        <p className="text-sm text-content-secondary leading-relaxed">{prescription.pharmacyId.address}</p>
                    </div>
                </div>
            </div>

            {/* Medicine List with Scroll - FIXED STYLING */}
            <div className={cardStyles}>
                <h3 className={sectionTitle}><FileText size={16} className="inline mr-2 mb-1"/> Rx - Medicines</h3>
                
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 mt-4 max-h-96 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        {/* Fixed Header Contrast */}
                        <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold sticky top-0 z-10 shadow-sm"> 
                            <tr>
                                <th className="px-4 py-3">Medicine Name</th>
                                <th className="px-4 py-3">Dosage</th>
                                <th className="px-4 py-3">Duration</th>
                                <th className="px-4 py-3 text-right">Qty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                            {prescription.medicines.map((med, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{med.name}</td>
                                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{med.dosage}</td>
                                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{med.duration}</td>
                                    <td className="px-4 py-4 text-right font-bold text-gray-900 dark:text-white">{med.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Diagnosis / Notes */}
            {prescription.notes && (
                <div className={cardStyles}>
                    <h3 className={sectionTitle}>Clinical Notes / Diagnosis</h3>
                    <p className="text-content-primary bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-border/50 leading-relaxed whitespace-pre-wrap">
                        {prescription.notes}
                    </p>
                </div>
            )}
        </div>
    );
}