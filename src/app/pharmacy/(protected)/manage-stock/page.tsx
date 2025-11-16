// src/app/pharmacy/(protected)/manage-stock/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/utils/api';
import toast from 'react-hot-toast';
import { PlusCircle, Trash2, Edit, Save, XCircle, CheckCircle } from 'lucide-react';

// --- DATA STRUCTURES & TYPES ---
interface StockItem {
  _id: string;
  medicineName: string;
  quantity: number;
  price?: number;
}

// --- API FUNCTIONS ---
const fetchStock = async (): Promise<StockItem[]> => {
  const { data } = await apiClient.get('/api/pharmacy/stock');
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

export default function ManageStockPage() {
  const queryClient = useQueryClient();
  
  // --- STATE MANAGEMENT ---
  const [newItem, setNewItem] = useState({ medicineName: '', quantity: 0 });
  const [editingRowId, setEditingRowId] = useState<string | null>(null); // To track which row is in "adjust" mode
  const [tempQuantity, setTempQuantity] = useState(0); // To hold the quantity while adjusting

  // --- QUERIES & MUTATIONS ---
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
      setEditingRowId(null); // Exit "adjust" mode on success
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update item.')
  });

  const deleteMutation = useMutation({ mutationFn: deleteStockItem });

  // --- HANDLER FUNCTIONS ---
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.medicineName) return toast.error('Medicine name is required.');
    addMutation.mutate(newItem);
  };
  
  const handleStartEditing = (item: StockItem) => {
    setEditingRowId(item._id);
    setTempQuantity(item.quantity);
  };
  
  const handleCancelEditing = () => {
    setEditingRowId(null);
  };
  
  const handleQuantityChange = (amount: number) => {
    setTempQuantity(prev => Math.max(0, prev + amount)); // Prevent negative stock
  };

  const handleSaveQuantity = () => {
    if (editingRowId === null) return;
    updateMutation.mutate({ _id: editingRowId, quantity: tempQuantity });
  };

  const handleDelete = (id: string) => {
    toast.promise(
      deleteMutation.mutateAsync(id),
      {
        loading: 'Deleting item...',
        success: () => {
          queryClient.invalidateQueries({ queryKey: ['stockItems'] });
          queryClient.invalidateQueries({ queryKey: ['pharmacyDashboardStats'] });
          return 'Item deleted successfully!';
        },
        error: 'Failed to delete item.',
      }
    );
  };

  if (isLoading) return <div className="text-center p-10">Loading stock...</div>;
  if (isError) return <div className="text-center p-10 text-red-600">Failed to load stock data.</div>;

  const inputStyles = "w-full rounded-lg border-gray-300 bg-gray-50 py-2 shadow-sm transition-shadow duration-200 focus:border-l-4 focus:border-green-500 focus:ring-0 focus:shadow-md focus:shadow-green-500/20";
  const adjustButtonStyles = "px-2 py-1 text-sm font-bold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300";

  return (
    <div className="space-y-8">
      {/* ADD NEW ITEM CARD */}
      <div className="rounded-xl border bg-white/80 p-6 shadow-lg backdrop-blur-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Medicine</h2>
        <form onSubmit={handleAddItem} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-700">Medicine Name</label>
            <input type="text" value={newItem.medicineName} onChange={e => setNewItem({ ...newItem, medicineName: e.target.value })} className={inputStyles} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Quantity</label>
            <input type="number" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })} className={inputStyles} required />
          </div>
          <div>
            <button type="submit" disabled={addMutation.isPending} className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-gray-400 transition-all duration-200 hover:scale-105">
              <PlusCircle size={20} className="mr-2" /> {addMutation.isPending ? 'Adding...' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      {/* STOCK TABLE CARD */}
      <div className="rounded-xl border bg-white/80 p-6 shadow-lg backdrop-blur-lg overflow-x-auto">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Current Inventory</h2>
        <table className="w-full">
          <thead className="bg-gray-50/70">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Medicine Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {stock?.map((item) => (
              <tr key={item._id} className={editingRowId === item._id ? "bg-green-50/50" : "hover:bg-gray-50/70"}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.medicineName}</td>
                
                {/* --- The New Interactive Quantity Cell --- */}
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {editingRowId === item._id ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleQuantityChange(-10)} className={adjustButtonStyles}>-10</button>
                      <button onClick={() => handleQuantityChange(-5)} className={adjustButtonStyles}>-5</button>
                      <button onClick={() => handleQuantityChange(-1)} className={adjustButtonStyles}>-</button>
                      <span className="font-bold text-lg text-green-700 w-12 text-center">{tempQuantity}</span>
                      <button onClick={() => handleQuantityChange(1)} className={adjustButtonStyles}>+</button>
                      <button onClick={() => handleQuantityChange(5)} className={adjustButtonStyles}>+5</button>
                      <button onClick={() => handleQuantityChange(10)} className={adjustButtonStyles}>+10</button>
                    </div>
                  ) : (
                    <span>{item.quantity}</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end space-x-4">
                    {editingRowId === item._id ? (
                      <>
                        <button onClick={handleSaveQuantity} disabled={updateMutation.isPending} className="text-green-600 hover:text-green-800" title="Save">
                          <CheckCircle size={20} />
                        </button>
                        <button onClick={handleCancelEditing} className="text-gray-500 hover:text-gray-700" title="Cancel">
                          <XCircle size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleStartEditing(item)} className="text-blue-600 hover:text-blue-800" title="Adjust Quantity">
                          <Edit size={18} />
                        </button>
                        <button onClick={() => handleDelete(item._id)} disabled={deleteMutation.isPending && deleteMutation.variables === item._id} className="text-red-600 hover:text-red-800" title="Delete">
                          <Trash2 size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {stock?.length === 0 && (
              <tr><td colSpan={3} className="text-center py-10 text-gray-500">Your inventory is empty. Add a medicine to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}