'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query'; // <--- 1. Import React Query
import apiClient from '@/utils/api';
import { Upload, FileText, Check, Plus, Trash2, ScanLine, Loader2, AlertTriangle, PackageSearch } from 'lucide-react';
import toast from 'react-hot-toast';

// --- TYPES ---
interface MedicineItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number;
}

interface StockItem {
  _id: string;
  medicineName: string;
  quantity: number;
}

// --- FETCHER FUNCTION ---
const fetchStock = async (): Promise<StockItem[]> => {
  const { data } = await apiClient.get<StockItem[]>('/api/pharmacy/stock');
  return data;
};

export default function DigitizePrescriptionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- 2. FETCH STOCK FOR AUTOCOMPLETE ---
  const { data: stockItems } = useQuery({
    queryKey: ['pharmacyStock'],
    queryFn: fetchStock,
    staleTime: 1000 * 60 * 5 // Cache for 5 mins
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    const toastId = toast.loading("AI is reading the prescription...");

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data } = await apiClient.post('/api/ai/digitize', formData);
      
      if (Array.isArray(data)) {
        setMedicines(data);
        toast.success("Medicines extracted successfully!", { id: toastId });
      } else {
        throw new Error("Invalid data format");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to read prescription. Please try a clearer image.", { id: toastId });
    } finally {
      setIsScanning(false);
    }
  };

  const handleProcessOrder = async () => {
    if (medicines.length === 0) return;

    setIsProcessing(true);
    const toastId = toast.loading("Processing sale & updating inventory...");

    try {
      const { data } = await apiClient.post('/api/pharmacy/process-offline-order', {
        medicines: medicines
      });

      const soldCount = data.details.filter((d: any) => d.status === 'Sold').length;
      const outOfStockCount = data.details.filter((d: any) => d.status !== 'Sold').length;

      if (outOfStockCount === 0) {
        toast.success(`Sale Complete! ${soldCount} items deducted from stock.`, { id: toastId });
      } else {
        toast((t) => (
          <span>
            <b>Partial Success:</b> Sold {soldCount} items.<br/>
            <span className="text-red-500">{outOfStockCount} items not found/out of stock.</span>
          </span>
        ), { id: toastId, duration: 5000, icon: '⚠️' });
      }
      
      // Reset Form
      setMedicines([]);
      setPreviewUrl(null);
      setSelectedFile(null);

    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transaction failed", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const updateMedicine = (index: number, field: keyof MedicineItem, value: string | number) => {
    const updated = [...medicines];
    // @ts-ignore
    updated[index] = { ...updated[index], [field]: value };
    setMedicines(updated);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const addEmptyRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', frequency: '', duration: '', quantity: 1 }]);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      
      {/* --- 3. HIDDEN DATALIST FOR AUTOCOMPLETE --- */}
      {/* This allows the inputs below to show suggestions based on actual stock */}
      <datalist id="stock-suggestions">
        {stockItems?.map((item) => (
            <option key={item._id} value={item.medicineName}>
                {item.medicineName} (Stock: {item.quantity})
            </option>
        ))}
      </datalist>

      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Prescription Digitizer</h1>
            <p className="text-gray-500 dark:text-gray-400">Upload a photo to auto-fill medicine details and process sales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Image Upload Section */}
        <div className="lg:col-span-1 space-y-4">
          <div 
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all h-80 bg-gray-50 dark:bg-[#1e293b] ${previewUrl ? 'border-teal-500' : 'border-gray-300 dark:border-gray-600'}`}
          >
            {previewUrl ? (
              <div className="relative w-full h-full group">
                <img src={previewUrl} alt="Prescription" className="w-full h-full object-contain rounded-lg" />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Upload size={16} />
                </button>
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} />
                </div>
                <p className="font-medium text-gray-700 dark:text-gray-300">Click to upload Prescription</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
              </div>
            )}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
          </div>

          <button 
            onClick={handleScan}
            disabled={!selectedFile || isScanning}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isScanning ? <Loader2 className="animate-spin" /> : <ScanLine />}
            {isScanning ? "Analyzing Image..." : "Scan & Extract Medicines"}
          </button>
        </div>

        {/* RIGHT: Data Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#111827]/50 rounded-t-xl">
            <h3 className="font-semibold text-gray-800 dark:text-white">Extracted Data</h3>
            <button onClick={addEmptyRow} className="text-sm text-teal-600 hover:underline flex items-center gap-1"><Plus size={14}/> Add Row</button>
          </div>

          <div className="flex-1 overflow-auto p-0 min-h-[300px]">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase text-xs font-semibold">
                    <tr>
                        <th className="px-4 py-3">Medicine Name</th>
                        <th className="px-4 py-3 w-24">Dosage</th>
                        <th className="px-4 py-3 w-32">Freq</th>
                        <th className="px-4 py-3 w-24">Duration</th>
                        <th className="px-4 py-3 w-20">Qty</th>
                        <th className="px-4 py-3 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {medicines.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-20 text-center text-gray-500 dark:text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                    <ScanLine size={32} className="opacity-20"/>
                                    <p>No medicines extracted yet. Upload an image and scan.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                    {medicines.map((med, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            {/* --- 4. CONNECT INPUT TO DATALIST --- */}
                            <td className="px-4 py-2">
                                <input 
                                    list="stock-suggestions" // <--- This enables the dropdown
                                    value={med.name} 
                                    onChange={(e) => updateMedicine(idx, 'name', e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 font-medium text-gray-900 dark:text-white placeholder-gray-400" 
                                    placeholder="Medicine Name"
                                    autoComplete="off"
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input 
                                    value={med.dosage} 
                                    onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-600 dark:text-gray-300" 
                                    placeholder="--"
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input 
                                    value={med.frequency} 
                                    onChange={(e) => updateMedicine(idx, 'frequency', e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-600 dark:text-gray-300" 
                                    placeholder="--"
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input 
                                    value={med.duration} 
                                    onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-600 dark:text-gray-300" 
                                    placeholder="--"
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input 
                                    type="number"
                                    value={med.quantity} 
                                    onChange={(e) => updateMedicine(idx, 'quantity', parseInt(e.target.value) || 0)}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-center font-bold text-teal-600 bg-teal-50 dark:bg-teal-900/20 rounded" 
                                />
                            </td>
                            <td className="px-4 py-2 text-center">
                                <button onClick={() => removeMedicine(idx)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-[#111827]/30 rounded-b-xl">
             <div className="text-xs text-gray-500 flex items-center gap-2">
                <PackageSearch size={14} className="text-blue-500" />
                Start typing to see stock matches.
             </div>
             <button 
                onClick={handleProcessOrder} 
                className="px-6 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                disabled={medicines.length === 0 || isProcessing}
             >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {isProcessing ? "Processing..." : "Process Order"}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}