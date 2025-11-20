'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Edit, Save, XCircle, CheckCircle, PackagePlus, PackageSearch } from 'lucide-react';

// --- DATA STRUCTURES & TYPES ---
interface StockItem {
  _id: string;
  medicineName: string;
  quantity: number;
  price?: number;
}

// --- API FUNCTIONS ---
const fetchStock = async (): Promise<StockItem[]> => {
  const { data } = await apiClient.get<StockItem[]>('/api/pharmacy/stock');
  return data;
};
const addStockItem = async (newItem: Omit<StockItem, '_id'>) => {
  const { data } = await apiClient.post('/api/pharmacy/stock', newItem);
  return data;
};
const updateStockItem = async (updatedItem: Partial<StockItem> & { _id: string }) => {
  const { data } = await apiClient.put(`/api/pharmacy/stock/${updatedItem._id}`, updatedItem);
  return data;
};
const deleteStockItem = async (id: string) => {
  await apiClient.delete(`/api/pharmacy/stock/${id}`);
};

// --- MAIN COMPONENT ---
export default function ManageStockPage() {
  const queryClient = useQueryClient();
  
  const [newItem, setNewItem] = useState({ medicineName: '', quantity: 0 });
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [tempQuantity, setTempQuantity] = useState(0);

  const { data: stock, isLoading, isError } = useQuery({ queryKey: ['stockItems'], queryFn: fetchStock });

  const addMutation = useMutation({
    mutationFn: addStockItem,
    onSuccess: () => {
      toast.success('Medicine added to stock!');
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacyDashboardStats'] });
      setNewItem({ medicineName: '', quantity: 0 });
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to add item.')
  });

  const updateMutation = useMutation({
    mutationFn: updateStockItem,
    onSuccess: () => {
      toast.success('Stock updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['stockItems'] });
      queryClient.invalidateQueries({ queryKey: ['pharmacyDashboardStats'] });
      setEditingRowId(null);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update item.')
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStockItem,
    onSuccess: () => {
        toast.success('Item deleted successfully!');
        queryClient.invalidateQueries({ queryKey: ['stockItems'] });
        queryClient.invalidateQueries({ queryKey: ['pharmacyDashboardStats'] });
    },
    onError: () => toast.error('Failed to delete item.')
  });

  // --- FULL HANDLER FUNCTIONS ---
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.medicineName) return toast.error('Medicine name is required.');
    addMutation.mutate(newItem);
  };
  
  const handleStartEditing = (item: StockItem) => {
    setEditingRowId(item._id);
    setTempQuantity(item.quantity);
  };
  
  const handleCancelEditing = () => setEditingRowId(null);
  
  const handleQuantityChange = (amount: number) => {
    setTempQuantity(prev => Math.max(0, prev + amount));
  };

  const handleSaveQuantity = () => {
    if (editingRowId === null) return;
    updateMutation.mutate({ _id: editingRowId, quantity: tempQuantity });
  };

  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
        deleteMutation.mutate(id);
    }
  };

  if (isLoading) return <div className="text-content-primary dark:text-content-primary_dark">Loading stock...</div>;
  if (isError) return <div className="text-red-500">Failed to load stock data.</div>;

  const cardStyles = "bg-card p-6 rounded-lg shadow-sm";
  const inputStyles = "w-full p-2.5 bg-[#2d3748] dark:bg-[#374151] rounded-md border border-transparent focus:outline-none focus:ring-2 focus:ring-brand text-white placeholder:text-gray-400";
  const labelStyles = "block text-sm font-medium text-content-primary mb-1.5";
  const adjustButtonStyles = "px-2 py-1 text-sm font-semibold text-content-primary bg-gray-100 rounded-md hover:bg-gray-200 transition-colors";
  const cardTitleStyles = "text-lg font-semibold text-content-primary mb-4";

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-content-primary dark:text-content-primary_dark">Manage Stock</h2>
      
      <div className={cardStyles}>
        <h3 className={`${cardTitleStyles} flex items-center gap-2`}>
            <PackagePlus size={20} /> Add New Medicine
        </h3>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className={labelStyles}>Medicine Name</label>
            <input type="text" value={newItem.medicineName} onChange={e => setNewItem({ ...newItem, medicineName: e.target.value })} className={inputStyles} required />
          </div>
          <div>
            <label className={labelStyles}>Quantity</label>
            <input type="number" min="0" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} className={inputStyles} required />
          </div>
          <div>
            <button type="submit" disabled={addMutation.isPending} className="w-full flex items-center justify-center px-4 py-2.5 bg-brand text-white font-semibold rounded-md shadow-sm hover:bg-brand-hover disabled:bg-gray-500">
              <PlusCircle size={20} className="mr-2" /> {addMutation.isPending ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      <div className={cardStyles}>
         <h3 className={`${cardTitleStyles} flex items-center gap-2`}>
            <PackageSearch size={20} /> Current Inventory
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Medicine Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-content-secondary uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stock?.map((item) => (
                <tr key={item._id} className={editingRowId === item._id ? "bg-brand-light" : "hover:bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-content-primary">{item.medicineName}</td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-content-secondary">
                    {editingRowId === item._id ? (
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => handleQuantityChange(-10)} className={adjustButtonStyles}>-10</button>
                        <button type="button" onClick={() => handleQuantityChange(-1)} className={adjustButtonStyles}>-1</button>
                        <span className="font-bold text-lg text-brand w-12 text-center">{tempQuantity}</span>
                        <button type="button" onClick={() => handleQuantityChange(1)} className={adjustButtonStyles}>+1</button>
                        <button type="button" onClick={() => handleQuantityChange(10)} className={adjustButtonStyles}>+10</button>
                      </div>
                    ) : (
                      <span className={`font-semibold ${item.quantity === 0 ? 'text-red-500' : 'text-content-primary'}`}>{item.quantity}</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-4">
                      {editingRowId === item._id ? (
                        <>
                          <button type="button" onClick={handleSaveQuantity} disabled={updateMutation.isPending} className="text-green-600 hover:text-green-700" title="Save"><CheckCircle size={20} /></button>
                          <button type="button" onClick={handleCancelEditing} className="text-gray-500 hover:text-gray-700" title="Cancel"><XCircle size={20} /></button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => handleStartEditing(item)} className="text-brand hover:text-brand-hover" title="Adjust Quantity"><Edit size={18} /></button>
                          <button type="button" onClick={() => handleDelete(item._id)} disabled={deleteMutation.isPending} className="text-red-500 hover:text-red-700" title="Delete"><Trash2 size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {stock?.length === 0 && (
                <tr><td colSpan={3} className="text-center py-10 text-content-secondary">Your inventory is empty.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}